/**
 * DungeonScene — Exploración de mazmorras CORREGIDA
 * Fix: enemies con stats completos, habitaciones especiales con UI real,
 *      minimap correcto, loot mostrado, NPC con diálogos, trampas evitables
 */
import Phaser from 'phaser';
import { DungeonGenerator } from '../../dungeon/DungeonGenerator.js';
import { AbyssalUI } from '../../ui/AbyssalUI.js';
import { globalBus } from '../../utils/EventBus.js';

const BIOME_NAMES = {
  crypt:'CRIPTA DEL ECO', cave:'CAVERNA ABISAL',
  ruins:'RUINAS ANTIGUAS', tower:'TORRE DEL VACÍO', void:'DIMENSIÓN FRACTURADA'
};

const ROOM_LABELS = {
  combat:'ZONA DE COMBATE', elite:'ÉLITE — PELIGRO ALTO',
  rest:'PUNTO DE DESCANSO', treasure:'COFRE DE RECOMPENSAS',
  boss:'JEFE DE BRECHA', puzzle:'SALA DE ENIGMAS',
  secret:'HABITACIÓN SECRETA', npc:'ENCUENTRO', trap:'TRAMPA DETECTADA', event:'EVENTO'
};

const ROOM_COLORS = {
  combat:0xff3a6e, elite:0xff6b35, rest:0x00b894,
  treasure:0xffd166, boss:0x7b2fff, puzzle:0x00c8ff,
  secret:0xa29bfe, npc:0x55efc4, trap:0xe17055, event:0xfdcb6e
};

export class DungeonScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DungeonScene' });
    this.dungeon      = null;
    this.currentRoomIdx = 0;
    this.currentRoom    = null;
    this._roomObjs      = []; // objetos dinámicos de la habitación actual
  }

  create() {
    const { width:w, height:h } = this.scale;
    this.cameras.main.setBackgroundColor('#04060e');
    this.cameras.main.fadeIn(450, 0, 0, 0);

    this.player = this._safePlayer(this.registry.get('player'));
    const rift  = this.registry.get('currentRift') || { rank:'D', type:'NORMAL' };

    const biomes   = ['crypt','cave','ruins','tower','void'];
    const biomeIdx = ['F','E','D','C','B','A','S'].indexOf(rift.rank || 'D');
    const biome    = biomes[Math.max(0, Math.min(biomeIdx, biomes.length-1))];
    const diff     = Math.max(1, biomeIdx + 1);

    const gen = new DungeonGenerator('ABYSSAL_WORLD_V1', `RIFT_${Date.now()}`, biome, diff, 1);
    this.dungeon     = gen.generate();
    this.currentRoom = this.dungeon.rooms[0];
    this.currentRoomIdx = 0;

    this._buildStaticUI(w, h);
    this._renderRoom(w, h);
    this._buildActionBar(w, h);

    globalBus.on('combat:win', this._onCombatWin, this);
  }

  _safePlayer(p) {
    if (!p) return null;
    if (typeof p.getEffectiveStats !== 'function') {
      p.getEffectiveStats = () => ({ ...p.baseStats });
      p.gainXP = (n) => { p.xp=(p.xp||0)+n; return { leveled:false, newLevel:p.level||1 }; };
    }
    return p;
  }

  // ── UI ESTÁTICA (no se redibuja entre habitaciones) ──────────────
  _buildStaticUI(w, h) {
    // Header
    const hbar = this.add.graphics();
    hbar.fillStyle(0x040812, 0.97); hbar.fillRect(0,0,w,54);
    hbar.lineStyle(1, 0x7b2fff, 0.2); hbar.lineBetween(0,54,w,54);

    this._dungeonLabel = this.add.text(w/2, 14, BIOME_NAMES[this.dungeon?.biome]||'BRECHA', {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'11px', fontStyle:'bold',
      color:'#7b2fff', letterSpacing:4, resolution:2
    }).setOrigin(0.5);

    this._floorLabel = this.add.text(w/2, 32, `PISO ${this.dungeon?.floor||1}`, {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'9px',
      color:'rgba(123,47,255,0.5)', letterSpacing:3, resolution:2
    }).setOrigin(0.5);

    // Mini HP/MP barra arriba
    const p = this.player;
    const stats = p?.getEffectiveStats?.() || p?.baseStats || {};
    const hpPct = Math.min(1, (p?.currentHP||0) / Math.max(1, stats.hp||1));
    const mpPct = Math.min(1, (p?.currentMP||0) / Math.max(1, stats.mp||1));
    const barW  = Math.min(100, w*0.28);
    const bx    = w - barW - 8;
    const hpBg  = this.add.graphics();
    hpBg.fillStyle(0x1a0408,1); hpBg.fillRoundedRect(bx, 8, barW, 8, 3);
    this._topHpFill = this.add.graphics();
    this._topHpFill.fillStyle(0xd63031,0.9); this._topHpFill.fillRoundedRect(bx, 8, barW*hpPct, 8, 3);
    const mpBg = this.add.graphics();
    mpBg.fillStyle(0x040a1a,1); mpBg.fillRoundedRect(bx, 20, barW, 6, 3);
    this._topMpFill = this.add.graphics();
    this._topMpFill.fillStyle(0x0984e3,0.9); this._topMpFill.fillRoundedRect(bx, 20, barW*mpPct, 6, 3);
    this.add.text(bx-2, 12, 'HP', { fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'7px', color:'#5a6a65', resolution:2 }).setOrigin(1,0.5);
    this._topHpLabel = this.add.text(bx+barW+2, 12, `${p?.currentHP||0}`, { fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'7px', color:'#5a6a65', resolution:2 });
    this.add.text(bx-2, 23, 'MP', { fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'7px', color:'#5a6a65', resolution:2 }).setOrigin(1,0.5);

    // Minimap permanente
    this._buildMinimap(w, h);
  }

  _buildMinimap(w, h) {
    const mw=108, mh=62, mx=w-mw-8, my=58;
    const mbg = this.add.graphics();
    mbg.fillStyle(0x040812, 0.95); mbg.fillRoundedRect(mx,my,mw,mh,6);
    mbg.lineStyle(1, 0x1a2a4a, 0.8); mbg.strokeRoundedRect(mx,my,mw,mh,6);
    this.add.text(mx+mw/2, my+7, 'PLANTA', {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'7px',
      color:'rgba(0,200,255,0.4)', letterSpacing:2, resolution:2
    }).setOrigin(0.5);

    const rooms = this.dungeon?.rooms || [];
    const cols  = 5;
    const cw    = (mw-14)/cols;
    const ch    = (mh-18)/Math.max(1, Math.ceil(rooms.length/cols));

    this._minimapCells = [];
    rooms.forEach((r,i) => {
      const col=i%cols, row=Math.floor(i/cols);
      const rx = mx+7+col*cw, ry = my+14+row*ch;
      const g = this.add.graphics();
      this._minimapCells.push({ g, id:r.id, type:r.type, rx, ry, cw:cw-2, ch:ch-2 });
      this._drawMinimapCell(g, rx, ry, cw-2, ch-2, r.type, i===this.currentRoomIdx, r.cleared);
    });
  }

  _drawMinimapCell(g, x, y, cw, ch, type, isCurrent, cleared) {
    g.clear();
    const col = ROOM_COLORS[type] || 0x5a6a85;
    g.fillStyle(col, isCurrent ? 1 : cleared ? 0.35 : 0.18);
    g.fillRect(x, y, cw, ch);
    if (isCurrent) { g.lineStyle(1.2, 0xffffff, 0.9); g.strokeRect(x,y,cw,ch); }
  }

  _refreshMinimap() {
    this._minimapCells?.forEach((cell, i) => {
      const r = this.dungeon.rooms[i];
      this._drawMinimapCell(cell.g, cell.rx, cell.ry, cell.cw, cell.ch,
        cell.type, i===this.currentRoomIdx, r?.cleared||false);
    });
  }

  // ── RENDERIZA LA HABITACIÓN ACTUAL ───────────────────────────────
  _roomCleanup() {
    this._roomObjs.forEach(o => { try { o.destroy(); } catch(e){} });
    this._roomObjs = [];
  }

  _addR(obj) { this._roomObjs.push(obj); return obj; }

  _renderRoom(w, h) {
    this._roomCleanup();
    const room = this.currentRoom;
    const areaY  = 54;
    const areaH  = h - areaY - 76; // espacio entre header y action bar
    const midY   = areaY + areaH/2;

    // Fondo de habitación
    const col = parseInt('0x0' + (ROOM_COLORS[room.type]||0x060810).toString(16).slice(1), 16);
    const bg = this.add.graphics();
    bg.fillStyle(0x04060e, 1); bg.fillRect(0, areaY, w, areaH);
    this._addR(bg);

    // Tiles
    this._addR(this._drawTiles(w, areaY, areaH, room.type));

    // Tipo de habitación — label
    const lbl = this._addR(this.add.text(w/2, areaY+14, ROOM_LABELS[room.type]||'HABITACIÓN', {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'10px', fontStyle:'bold',
      color:'#'+((ROOM_COLORS[room.type]||0x5a6a85)).toString(16).padStart(6,'0'),
      letterSpacing:3, resolution:2
    }).setOrigin(0.5).setAlpha(0));
    this.tweens.add({ targets:lbl, alpha:1, duration:300 });

    // Contenido específico por tipo
    switch (room.type) {
      case 'combat':
      case 'elite':   this._renderCombatRoom(room, w, midY); break;
      case 'rest':    this._renderRestRoom(room, w, midY); break;
      case 'treasure':this._renderTreasureRoom(room, w, midY); break;
      case 'boss':    this._renderBossRoom(room, w, midY); break;
      case 'puzzle':  this._renderPuzzleRoom(room, w, midY); break;
      case 'trap':    this._renderTrapRoom(room, w, midY); break;
      case 'npc':     this._renderNPCRoom(room, w, midY); break;
      case 'secret':  this._renderSecretRoom(room, w, midY); break;
      default:        this._renderEventRoom(room, w, midY); break;
    }

    // Narrativa
    this._setNarrative(this._getRoomNarrative(room));
  }

  _drawTiles(w, startY, areaH, type) {
    const g   = this.add.graphics();
    const sz  = 44;
    const darkCols = { combat:0x09030e, boss:0x0a0318, trap:0x0a0603, elite:0x0a0408 };
    const base = darkCols[type] || 0x05070c;
    for (let tx=0; tx<w; tx+=sz) {
      for (let ty=startY; ty<startY+areaH; ty+=sz) {
        if ((Math.floor(tx/sz)+Math.floor(ty/sz))%2===0) {
          g.fillStyle(base, 0.55); g.fillRect(tx,ty,sz-1,sz-1);
        }
        g.lineStyle(0.5, 0x1a2a4a, 0.1); g.strokeRect(tx,ty,sz,sz);
      }
    }
    return g;
  }

  // ── HABITACIONES ─────────────────────────────────────────────────

  _renderCombatRoom(room, w, midY) {
    const enemies = room.enemies || [];
    if (!enemies.length) { this._setNarrative('La habitación está vacía.'); return; }

    const enemiesData = this.registry.get('enemiesData') || [];
    enemies.forEach((e,i) => {
      const base  = enemiesData.find(ed=>ed.id===e.id)||{};
      const name  = (base.name || e.id?.replace(/_/g,' ') || 'Enemigo').toUpperCase();
      const ex    = w/2 + (i - (enemies.length-1)/2) * 95;
      const ey    = midY;
      const isEl  = room.type === 'elite';

      const g = this.add.graphics();
      if (isEl) { g.fillStyle(0xff6b35, 0.1); g.fillCircle(ex, ey, 35); }
      g.fillStyle(isEl ? 0x1a0605 : 0x1a0408, 0.95);
      g.fillEllipse(ex, ey-10, isEl?62:52, isEl?72:64);
      g.lineStyle(isEl?2:1.5, isEl?0xff6b35:0xff3a6e, 0.75);
      g.strokeEllipse(ex, ey-10, isEl?62:52, isEl?72:64);
      // Ojos
      g.fillStyle(isEl?0xff6b35:0xff3a6e, 1);
      g.fillCircle(ex-9, ey-16, isEl?5:3.5); g.fillCircle(ex+9, ey-16, isEl?5:3.5);
      g.fillStyle(0x04060e, 1);
      g.fillCircle(ex-9, ey-16, isEl?2.5:1.8); g.fillCircle(ex+9, ey-16, isEl?2.5:1.8);
      this._addR(g);
      if (isEl) { this._addR(this.add.text(ex, ey-50, '★ ÉLITE', { fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'8px', fontStyle:'bold', color:'#ff6b35', resolution:2 }).setOrigin(0.5)); }

      // HP bar
      const hpW = 58;
      const hpBg = this.add.graphics();
      hpBg.fillStyle(0x1a0408,1); hpBg.fillRoundedRect(ex-hpW/2, ey+22, hpW, 6, 2);
      hpBg.fillStyle(isEl?0xff6b35:0xd63031,0.9); hpBg.fillRoundedRect(ex-hpW/2, ey+22, hpW*(e.hp/Math.max(1,e.hp)), 6, 2);
      this._addR(hpBg);

      this._addR(this.add.text(ex, ey+36, name.slice(0,14), {
        fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'8px',
        color: isEl?'#ff6b35':'#ff3a6e', resolution:2
      }).setOrigin(0.5));

      this.tweens.add({ targets:g, y:`-=${5+i*2}`, duration:1200+i*200, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
    });
  }

  _renderRestRoom(room, w, midY) {
    // Círculo de descanso
    const g = this.add.graphics();
    g.fillStyle(0x00b894, 0.1); g.fillCircle(w/2, midY, 42);
    g.lineStyle(2, 0x00b894, 0.6); g.strokeCircle(w/2, midY, 42);
    g.lineStyle(3, 0x00b894, 0.85); g.lineBetween(w/2, midY-22, w/2, midY+22);
    g.lineBetween(w/2-22, midY, w/2+22, midY);
    this._addR(g);

    if (!room.cleared) {
      this._addR(this.add.text(w/2, midY+60, 'Descansa y recupera HP y MP', {
        fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'11px', color:'#00b894', resolution:2
      }).setOrigin(0.5));

      const zone = this.add.zone(w/2, midY, 90, 90).setInteractive({ useHandCursor:true });
      zone.on('pointerdown', () => {
        if (!this.player) return;
        const stats = this.player.getEffectiveStats?.() || this.player.baseStats || {};
        const healHp = Math.floor((stats.hp||1200) * 0.35);
        const healMp = Math.floor((stats.mp||300) * 0.4);
        this.player.currentHP = Math.min(stats.hp||1200, (this.player.currentHP||0)+healHp);
        this.player.currentMP = Math.min(stats.mp||300,  (this.player.currentMP||0)+healMp);
        room.cleared = true;
        this._updateTopBars();
        AbyssalUI.notify(this, this.scale.width, this.scale.height,
          `Descansaste. +${healHp} HP  +${healMp} MP`, '#00b894');
        zone.destroy();
      });
      this._addR(zone);
    } else {
      this._addR(this.add.text(w/2, midY+60, 'Ya descansaste aquí.', {
        fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'11px', color:'#3a4a65', resolution:2
      }).setOrigin(0.5));
    }
  }

  _renderTreasureRoom(room, w, midY) {
    const loot = room.loot || { rarity:'COMMON', count:1 };
    const rarityColors = { COMMON:0x95a5a6, UNCOMMON:0x00b894, RARE:0x0984e3,
      EPIC:0x7b2fff, LEGENDARY:0xffd166, MYTHIC:0xe84393, ANCIENT:0xff6348 };
    const col = rarityColors[loot.rarity] || 0x95a5a6;

    const g = this.add.graphics();
    g.fillStyle(col, 0.15); g.fillCircle(w/2, midY, 32);
    g.fillStyle(0x1a1200, 0.97); g.fillRoundedRect(w/2-24, midY-16, 48, 34, 5);
    g.lineStyle(2, col, 0.9); g.strokeRoundedRect(w/2-24, midY-16, 48, 34, 5);
    g.lineStyle(1.5, col, 0.6); g.lineBetween(w/2-24, midY-4, w/2+24, midY-4);
    g.fillStyle(col, 0.85); g.fillCircle(w/2, midY+8, 5);
    this._addR(g);
    this.tweens.add({ targets:g, alpha:{from:0.7,to:1}, duration:800, yoyo:true, repeat:-1 });

    this._addR(this.add.text(w/2, midY+40, loot.rarity + ' · ' + loot.count + ' obj.', {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'11px', fontStyle:'bold',
      color:'#'+col.toString(16).padStart(6,'0'), resolution:2
    }).setOrigin(0.5));

    if (!room.cleared) {
      const zone = this.add.zone(w/2, midY, 56, 56).setInteractive({ useHandCursor:true });
      zone.on('pointerdown', () => {
        if (!this.player) return;
        room.cleared = true;
        if (!this.player.inventoryItems) this.player.inventoryItems = [];
        for (let i=0; i<(loot.count||1); i++) this.player.inventoryItems.push('loot_'+loot.rarity.toLowerCase());
        AbyssalUI.notify(this, this.scale.width, this.scale.height,
          `¡${loot.count} objeto${loot.count>1?'s':''} ${loot.rarity} obtenido!`, '#'+col.toString(16).padStart(6,'0'));
        zone.destroy(); g.setAlpha(0.3);
      });
      this._addR(zone);
    }
  }

  _renderBossRoom(room, w, midY) {
    const boss = room.enemies?.[0] || { name:'Guardián Abisal', hp:3200, tier:1, phases:2 };
    const g = this.add.graphics();
    g.fillStyle(0x7b2fff, 0.08); g.fillCircle(w/2, midY-5, 68);
    g.lineStyle(1, 0x7b2fff, 0.3); g.strokeCircle(w/2, midY-5, 68);
    g.fillStyle(0x0d0418, 0.97); g.fillEllipse(w/2, midY-5, 80, 92);
    g.lineStyle(2.5, 0x7b2fff, 0.8); g.strokeEllipse(w/2, midY-5, 80, 92);
    // Ojos boss
    g.fillStyle(0xff3a6e, 1); g.fillCircle(w/2-13, midY-16, 7); g.fillCircle(w/2+13, midY-16, 7);
    g.fillStyle(0x04060e, 1); g.fillCircle(w/2-13, midY-16, 3.5); g.fillCircle(w/2+13, midY-16, 3.5);
    g.fillStyle(0xffffff, 0.7); g.fillCircle(w/2-11, midY-18, 1.8); g.fillCircle(w/2+15, midY-18, 1.8);
    this._addR(g);
    this.tweens.add({ targets:g, scaleX:{from:0.97,to:1.03}, scaleY:{from:0.97,to:1.03}, duration:1500, yoyo:true, repeat:-1 });

    // HP bar boss
    const bW = Math.min(220, w-50);
    const bBg = this.add.graphics();
    bBg.fillStyle(0x1a0408,1); bBg.fillRoundedRect(w/2-bW/2, midY+56, bW, 10, 4);
    bBg.fillStyle(0x7b2fff,0.9); bBg.fillRoundedRect(w/2-bW/2, midY+56, bW, 10, 4);
    this._addR(bBg);

    this._addR(this.add.text(w/2, midY+76, (boss.name||'JEFE').toUpperCase(), {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'13px',
      fontStyle:'bold', color:'#7b2fff', letterSpacing:3, resolution:2
    }).setOrigin(0.5));

    this._addR(this.add.text(w/2, midY+96, `FASES: ${boss.phases||2}  ·  RANGO: ${boss.tier||1}`, {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'9px',
      color:'rgba(123,47,255,0.6)', resolution:2
    }).setOrigin(0.5));
  }

  _renderPuzzleRoom(room, w, midY) {
    // 4 runas en cuadrado — tocar en orden correcto
    const runes = ['◈','◉','◊','⬡'];
    const order = room.puzzleOrder || [0,2,1,3];
    let solved = 0;
    const circles = [];

    runes.forEach((r,i) => {
      const angle = (i/4) * Math.PI*2 - Math.PI/2;
      const rx = w/2 + Math.cos(angle)*55;
      const ry = midY + Math.sin(angle)*50;
      const g = this.add.graphics();
      g.fillStyle(0x00c8ff, 0.14); g.fillCircle(rx, ry, 22);
      g.lineStyle(1.5, 0x00c8ff, 0.55); g.strokeCircle(rx, ry, 22);
      this._addR(g);
      const t = this.add.text(rx, ry, r, {
        fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'18px', color:'#00c8ff', resolution:2
      }).setOrigin(0.5);
      this._addR(t);
      circles.push({ g, t, idx:i });
      const z = this.add.zone(rx, ry, 44, 44).setInteractive({ useHandCursor:true });
      z.on('pointerdown', () => {
        if (room.cleared) return;
        if (i === order[solved]) {
          solved++;
          g.clear(); g.fillStyle(0x00c8ff, 0.5); g.fillCircle(rx,ry,22);
          if (solved === order.length) {
            room.cleared = true;
            AbyssalUI.notify(this, this.scale.width, this.scale.height,
              '¡Enigma resuelto! La mazmorra responde.', '#00c8ff');
            if (!this.player.inventoryItems) this.player.inventoryItems = [];
            this.player.inventoryItems.push('eco_menor');
          }
        } else {
          solved = 0;
          circles.forEach(c => { c.g.clear(); c.g.fillStyle(0x00c8ff,0.14); c.g.fillCircle(0,0,22); });
          this.cameras.main.flash(200, 255, 0, 0, false);
        }
      });
      this._addR(z);
    });

    this._addR(this.add.text(w/2, midY-75, room.cleared ? 'Enigma resuelto.' : 'Activa las runas en el orden correcto.', {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'11px',
      color: room.cleared ? '#3a4a65' : '#00c8ff', resolution:2
    }).setOrigin(0.5));
  }

  _renderTrapRoom(room, w, midY) {
    const trap = room.trap || { type:'SPIKE_PIT', damage:80, avoidable:true };
    const trapNames = { SPIKE_PIT:'Foso de Pinchos', POISON_GAS:'Gas Venenoso',
      ARCANE_BURST:'Explosión Arcana', CRUSHING_CEILING:'Techo Aplastante', ALARM:'Trampa de Alarma' };
    const g = this.add.graphics();
    g.fillStyle(0xe17055, 0.12); g.fillCircle(w/2, midY, 40);
    g.lineStyle(2, 0xe17055, 0.7); g.strokeCircle(w/2, midY, 40);
    // Pinchos
    for (let a=0; a<8; a++) {
      const ang = (a/8)*Math.PI*2;
      const r1=28, r2=40;
      g.lineStyle(2, 0xe17055, 0.8);
      g.lineBetween(w/2+Math.cos(ang)*r1, midY+Math.sin(ang)*r1,
                    w/2+Math.cos(ang)*r2, midY+Math.sin(ang)*r2);
    }
    this._addR(g);

    this._addR(this.add.text(w/2, midY+55, trapNames[trap.type]||'TRAMPA', {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'12px', fontStyle:'bold',
      color:'#e17055', resolution:2
    }).setOrigin(0.5));

    this._addR(this.add.text(w/2, midY+74, `Daño: ${trap.damage}`, {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'10px', color:'#ff3a6e', resolution:2
    }).setOrigin(0.5));

    if (!room.cleared && trap.avoidable) {
      this._addR(this.add.text(w/2, midY-60, 'Puedes intentar esquivarla (60% éxito)', {
        fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'10px', color:'#ffd166', resolution:2
      }).setOrigin(0.5));
    }
  }

  _renderNPCRoom(room, w, midY) {
    const npcTypes = {
      merchant:      { name:'Mercader Errante', color:0xffd166, text:'"Tengo objetos que rara vez llegan al mundo exterior..."' },
      trapped_resonator:{ name:'Resonador Atrapado', color:0x00c8ff, text:'"¡Gracias a los dioses! Estuve atrapado aquí días..."' },
      echo_spirit:   { name:'Espíritu del Eco', color:0xa29bfe, text:'"Resueno desde antes del primer Fracturamiento..."' },
      ancient_guide:  { name:'Guía Ancestral', color:0x00b894, text:'"Conozco todos los pisos. Deja que te ayude."' },
      rival:         { name:'Resonador Rival', color:0xe17055, text:'"Tú... ¿también llegaste hasta aquí? Impressive."' }
    };
    const npcKey = room.npc?.type || 'echo_spirit';
    const npc = npcTypes[npcKey] || npcTypes.echo_spirit;

    // Silueta NPC
    const g = this.add.graphics();
    const col = npc.color;
    g.fillStyle(col, 0.15); g.fillCircle(w/2, midY-20, 30);
    g.fillStyle(0x060c1c, 0.95); g.fillCircle(w/2, midY-34, 12);
    g.lineStyle(1.5, col, 0.7); g.strokeCircle(w/2, midY-34, 12);
    g.fillRect(w/2-12, midY-22, 24, 28);
    g.lineStyle(1.5, col, 0.7); g.strokeRect(w/2-12, midY-22, 24, 28);
    this._addR(g);
    this.tweens.add({ targets:g, y:`-=5`, duration:1400, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });

    this._addR(this.add.text(w/2, midY+20, npc.name.toUpperCase(), {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'11px', fontStyle:'bold',
      color:'#'+col.toString(16).padStart(6,'0'), resolution:2
    }).setOrigin(0.5));

    this._addR(this.add.text(w/2, midY+40, npc.text, {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'10px', fontStyle:'italic',
      color:'rgba(200,216,240,0.7)', wordWrap:{ width:w-50 }, align:'center', resolution:2
    }).setOrigin(0.5));
  }

  _renderSecretRoom(room, w, midY) {
    const g = this.add.graphics();
    g.fillStyle(0xa29bfe, 0.1); g.fillCircle(w/2, midY, 50);
    g.lineStyle(1.5, 0xa29bfe, 0.4); g.strokeCircle(w/2, midY, 50);
    g.lineStyle(1, 0xa29bfe, 0.25); g.strokeCircle(w/2, midY, 34);
    g.fillStyle(0xa29bfe, 0.8); g.fillCircle(w/2, midY, 8);
    this._addR(g);
    this.tweens.add({ targets:g, alpha:{from:0.5,to:1}, duration:1600, yoyo:true, repeat:-1 });
    this._addR(this.add.text(w/2, midY+64, '¡Habitación secreta!', {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'13px', fontStyle:'bold',
      color:'#a29bfe', resolution:2
    }).setOrigin(0.5));
    this._addR(this.add.text(w/2, midY+82, 'Loot garantizado + bonus de eco.', {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'10px', color:'rgba(162,155,254,0.6)', resolution:2
    }).setOrigin(0.5));

    if (!room.cleared) {
      const zone = this.add.zone(w/2, midY, 80, 80).setInteractive({ useHandCursor:true });
      zone.on('pointerdown', () => {
        room.cleared = true;
        if (!this.player.inventoryItems) this.player.inventoryItems = [];
        this.player.inventoryItems.push('reliquias_secretas');
        AbyssalUI.notify(this, this.scale.width, this.scale.height, '¡Reliquia secreta obtenida!', '#a29bfe');
        zone.destroy();
      });
      this._addR(zone);
    }
  }

  _renderEventRoom(room, w, midY) {
    const events = {
      ECHO_FRAGMENT:       { text:'"Un fragmento de eco cristalizado pulsa aquí."', color:0xa29bfe, reward:'eco_menor' },
      WANDERER_NPC:        { text:'"Un viajero perdido. Lleva días aquí."', color:0x55efc4, reward:null },
      MYSTERIOUS_PORTAL:   { text:'"Una Brecha secundaria. ¿A dónde lleva?"', color:0x7b2fff, reward:null },
      ANCIENT_INSCRIPTION: { text:'"Runas que datan de antes del Primer Fracturamiento."', color:0xffd166, reward:'loot_uncommon' },
      TRAPPED_SPIRIT:      { text:'"Un espíritu atrapado entre dimensiones te pide ayuda."', color:0x74b9ff, reward:'esencia_espectral' }
    };
    const ev = events[room.event?.type] || events.ECHO_FRAGMENT;
    const g = this.add.graphics();
    g.fillStyle(ev.color, 0.12); g.fillCircle(w/2, midY, 38);
    g.lineStyle(1.5, ev.color, 0.5); g.strokeCircle(w/2, midY, 38);
    g.fillStyle(ev.color, 0.7); g.fillCircle(w/2, midY, 10);
    this._addR(g);
    this.tweens.add({ targets:g, alpha:{from:0.5,to:1}, scaleX:{from:0.96,to:1.04}, scaleY:{from:0.96,to:1.04}, duration:1300, yoyo:true, repeat:-1 });
    this._addR(this.add.text(w/2, midY+55, ev.text, {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'10px', fontStyle:'italic',
      color:'rgba(200,216,240,0.65)', wordWrap:{ width:w-50 }, align:'center', resolution:2
    }).setOrigin(0.5));
    if (ev.reward && !room.cleared) {
      const zone = this.add.zone(w/2, midY, 80, 80).setInteractive({ useHandCursor:true });
      zone.on('pointerdown', () => {
        room.cleared = true;
        if (!this.player.inventoryItems) this.player.inventoryItems = [];
        this.player.inventoryItems.push(ev.reward);
        AbyssalUI.notify(this, this.scale.width, this.scale.height, 'Evento completado. Objeto obtenido.', '#'+ev.color.toString(16).padStart(6,'0'));
        zone.destroy();
      });
      this._addR(zone);
    }
  }

  // ── NARRATIVA ────────────────────────────────────────────────────
  _getRoomNarrative(room) {
    const narratives = {
      combat:  'Presencias hostiles. El aire vibra con energía oscura. Prepárate.',
      elite:   'Una criatura de élite bloquea el paso. Mucho más peligrosa que las demás.',
      rest:    'Un respiro en las profundidades. Aquí el eco es más tenue. Descansa.',
      treasure:'Algo brilla en la oscuridad. Un cofre sellado con runas antiguas te espera.',
      boss:    'El ambiente se congela. Una presencia inmensa aguarda al frente. Es el guardián.',
      puzzle:  'Marcas antiguas en las paredes. Alguien dejó aquí un acertijo sin resolver.',
      secret:  'Una grieta en la realidad. Nadie más ha estado en este lugar hasta hoy.',
      npc:     'No estás solo. Una presencia te observa. No parece hostil... todavía.',
      trap:    'El suelo cruje de forma sospechosa. Hay algo aquí que no es natural.',
      event:   'Una anomalía detectada. Las leyes del espacio aquí son distintas.'
    };
    return narratives[room.type] || 'La mazmorra continúa hacia las profundidades.';
  }

  _setNarrative(text) {
    if (this._narText) this._narText.destroy();
    const { width:w, height:h } = this.scale;
    const narY = h - 76 - 56;
    this._narText = this.add.text(14, narY + 6, text, {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'11px', fontStyle:'italic',
      color:'rgba(200,216,240,0.7)', wordWrap:{ width:w-28 }, resolution:2
    });
  }

  // ── BARRA DE ACCIONES ────────────────────────────────────────────
  _buildActionBar(w, h) {
    const barH = 76;
    const barY = h - barH;
    const bg = this.add.graphics();
    bg.fillStyle(0x040812, 0.97); bg.fillRect(0, barY, w, barH);
    bg.lineStyle(1, 0x1a2a4a, 0.7); bg.lineBetween(0, barY, w, barY);

    // Panel narrativa (justo sobre la action bar)
    const narBg = this.add.graphics();
    narBg.fillStyle(0x060c1c, 0.88); narBg.fillRect(0, barY-56, w, 56);
    narBg.lineStyle(1, 0x1a2a4a, 0.4); narBg.lineBetween(0, barY-56, w, barY-56);

    const actions = [
      { label:'AVANZAR',    key:'advance', color:0x00c8ff },
      { label:'COMBATIR',   key:'fight',   color:0xff3a6e },
      { label:'INVENTARIO', key:'inv',     color:0xffd166 },
      { label:'SALIR',      key:'exit',    color:0x5a6a85 }
    ];
    const aw = Math.floor(w / actions.length);
    actions.forEach((a,i) => {
      const ax = i*aw + aw/2;
      const ay = barY + barH/2;
      const g  = this.add.graphics();
      if (i<actions.length-1) { g.lineStyle(1, 0x1a2a4a, 0.4); g.lineBetween((i+1)*aw, barY+10, (i+1)*aw, h-10); }
      this.add.text(ax, ay, a.label, {
        fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'10px', fontStyle:'bold',
        color:'#'+a.color.toString(16).padStart(6,'0'), letterSpacing:1, resolution:2
      }).setOrigin(0.5);
      const z = this.add.zone(ax, ay, aw-4, barH-4).setInteractive({ useHandCursor:true });
      z.on('pointerover', () => { g.clear(); g.fillStyle(a.color, 0.08); g.fillRect(i*aw, barY, aw, barH); });
      z.on('pointerout',  () => { g.clear(); });
      z.on('pointerdown', () => { if (navigator.vibrate) navigator.vibrate(18); this._onAction(a.key); });
    });
  }

  _onAction(key) {
    const { width:w, height:h } = this.scale;
    const room = this.currentRoom;

    switch (key) {
      case 'advance':
        if (room.type === 'combat' || room.type === 'elite') {
          if (!room.cleared) { AbyssalUI.notify(this, w, h, 'Derrota a los enemigos primero.', '#ff3a6e'); return; }
        }
        if (room.type === 'trap' && !room.cleared) {
          this._handleTrap(room, w, h); return;
        }
        this._goNextRoom(w, h);
        break;
      case 'fight':
        if (!room.enemies?.length) { AbyssalUI.notify(this, w, h, 'No hay enemigos aquí.', '#5a6a85'); return; }
        this.registry.set('combatRoom', room);
        this.cameras.main.fadeOut(300, 4, 8, 18);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('CombatScene'));
        break;
      case 'inv':
        this.cameras.main.fadeOut(250, 4, 8, 18);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('InventoryScene'));
        break;
      case 'exit':
        this.cameras.main.fadeOut(300, 4, 8, 18);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('WorldMapScene'));
        break;
    }
  }

  _handleTrap(room, w, h) {
    const trap = room.trap || { damage:80, avoidable:true };
    const success = Math.random() < 0.6;
    if (success) {
      room.cleared = true;
      AbyssalUI.notify(this, w, h, '¡Esquivaste la trampa!', '#00b894');
    } else {
      if (this.player) this.player.currentHP = Math.max(1, (this.player.currentHP||100) - trap.damage);
      this._updateTopBars();
      room.cleared = true;
      AbyssalUI.notify(this, w, h, `La trampa te alcanzó. -${trap.damage} HP`, '#ff3a6e');
    }
  }

  _goNextRoom(w, h) {
    this.dungeon.rooms[this.currentRoomIdx].cleared = true;
    if (this.currentRoomIdx >= this.dungeon.rooms.length - 1) {
      AbyssalUI.notify(this, w, h, 'Has llegado al fondo. ¡Victoria!', '#ffd166');
      if (this.player) {
        this.player.dungeonsCleared = (this.player.dungeonsCleared||0)+1;
        const storage = this.registry.get('storage');
        if (storage?.savePlayer) storage.savePlayer(this.player.serialize?.() || this.player);
      }
      this.time.delayedCall(1800, () => {
        this.cameras.main.fadeOut(400, 4, 8, 18);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('WorldMapScene'));
      });
      return;
    }
    this.currentRoomIdx++;
    this.currentRoom = this.dungeon.rooms[this.currentRoomIdx];
    this._refreshMinimap();
    this.cameras.main.flash(250, 0, 0, 0);
    this.time.delayedCall(140, () => this._renderRoom(w, h));
  }

  _updateTopBars() {
    if (!this.player || !this._topHpFill) return;
    const stats = this.player.getEffectiveStats?.() || this.player.baseStats || {};
    const hpPct = Math.min(1, (this.player.currentHP||0) / Math.max(1, stats.hp||1));
    const barW  = Math.min(100, this.scale.width*0.28);
    const bx    = this.scale.width - barW - 8;
    this._topHpFill.clear();
    this._topHpFill.fillStyle(0xd63031, 0.9);
    if (hpPct > 0) this._topHpFill.fillRoundedRect(bx, 8, barW*hpPct, 8, 3);
    if (this._topHpLabel) this._topHpLabel.setText(`${this.player.currentHP||0}`);
  }

  _onCombatWin(rewards) {
    const room = this.currentRoom;
    if (room) room.cleared = true;
    this._refreshMinimap();
    if (this.player) {
      this.player.bossesDefeated = (this.player.bossesDefeated||0) + (room?.type==='boss'?1:0);
      this._updateTopBars();
    }
  }

  shutdown() {
    globalBus.off('combat:win', this._onCombatWin, this);
    this._roomCleanup();
  }
}
