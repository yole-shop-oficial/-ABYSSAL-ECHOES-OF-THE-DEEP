/**
 * CombatScene — Combate semi por turnos CORREGIDO
 * Fix: HP/MP se actualizan correctamente, sin acumulación de Graphics,
 *      enemies con nombre completo, loot añadido al inventario real,
 *      habilidades cargadas desde el personaje (no hardcoded)
 */
import Phaser from 'phaser';
import { CombatEngine } from '../../combat/CombatEngine.js';
import { globalBus } from '../../utils/EventBus.js';

const EL_COLORS = {
  FIRE: 0xe17055, ICE: 0x74b9ff, LIGHTNING: 0xfdcb6e,
  SHADOW: 0x636e72, ARCANE: 0xa29bfe, PHYSICAL: 0x95a5a6,
  VOID: 0x6c5ce7, HOLY: 0xffeaa7, WIND: 0x55efc4,
  BLOOD: 0xd63031, EARTH: 0x00b894, POISON: 0x00cec9
};

export class CombatScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CombatScene' });
    this.engine        = null;
    this.selectedSkill = null;
    this.isProcessing  = false;

    // Referencias para update correcto (no recrear objetos)
    this._hudY         = 0;
    this._barW         = 0;
    this._maxHp        = 1;
    this._maxMp        = 1;
    this._hpBarFill    = null;
    this._mpBarFill    = null;
    this._hpLabel      = null;
    this._mpLabel      = null;
    this._enemyHpFill  = null;
    this._enemyHpLabel = null;
    this._enemyHpBg    = null;
    this._enemyHpBarW  = 0;
    this._enemyHpBgX   = 0;
    this._enemyHpBgY   = 62;
    this._effectsRow   = [];
    this._effectObjs   = [];
  }

  // ═══════════════════════════════════════════════════
  create() {
    const { width: w, height: h } = this.scale;
    this.cameras.main.setBackgroundColor('#04060e');
    this.cameras.main.fadeIn(350, 0, 0, 0);

    this.player      = this._safePlayer(this.registry.get('player'));
    const room       = this.registry.get('combatRoom');
    const skillsData = this.registry.get('skillsData') || [];
    const enemiesData= this.registry.get('enemiesData') || [];
    const classId    = this.player?.classId || 'guerrero';

    // ── HABILIDADES: primero las del personaje, luego fallback por clase ──
    let skills = [];
    if (this.player?.activeSkills?.length) {
      skills = this.player.activeSkills
        .map(id => skillsData.find(s => s.id === id))
        .filter(Boolean)
        .slice(0, 6);
    }
    if (!skills.length) {
      skills = skillsData.filter(s => s.class === classId).slice(0, 6);
    }
    // Siempre mínimo 1 habilidad básica
    if (!skills.length) {
      skills = [{ id:'ataque_basico', name:'Golpe', class: classId,
        type:'ATTACK', element:'PHYSICAL', mpCost:0, cooldown:0,
        damage:1.2, effects:[], tags:['PHYSICAL'], rarity:'COMMON',
        description:'Ataque básico.' }];
    }
    this.activeSkills = skills;

    // ── ENEMIES: merge datos completos ──
    const rawEnemies = room?.enemies?.length
      ? room.enemies
      : [{ id:'sombra_fracturada' }];

    const fullEnemies = rawEnemies.map(e => {
      const base = enemiesData.find(ed => ed.id === e.id) || {};
      const merged = { ...base, ...e };
      merged.name    = merged.name || merged.id?.replace(/_/g,' ') || 'Enemigo';
      merged.hp      = merged.hp  || base.hp  || 280;
      merged.atk     = merged.atk || base.atk || 22;
      merged.def     = merged.def || base.def || 10;
      merged.spd     = merged.spd || base.spd || 45;
      merged.behavior= merged.behavior || base.behavior || 'AGGRESSIVE';
      merged.element = merged.element  || base.element  || 'SHADOW';
      merged.maxHp   = merged.hp;
      return merged;
    });

    this.engine = new CombatEngine(this.player, fullEnemies, Date.now());

    // ── BUILD UI ──
    this._buildBg(w, h);
    this._buildEnemySection(w, h, fullEnemies[0]);
    this._buildNarrativeBox(w, h);
    this._buildPlayerHUD(w, h);
    this._buildSkillBar(w, h);
    this._buildActionButtons(w, h);
    this._buildCooldownRow(w, h);

    this._refreshPlayerBars();
    this._refreshEnemyBar(this.engine.getState().enemies[0]);

    // ── EVENTOS ──
    globalBus.on('combat:win',   this._onWin,   this);
    globalBus.on('combat:lose',  this._onLose,  this);
    globalBus.on('combat:combo', this._onCombo, this);
  }

  // ── Garantiza que el player siempre tiene métodos ─────────────
  _safePlayer(p) {
    if (!p) return null;
    if (typeof p.getEffectiveStats !== 'function') {
      p.getEffectiveStats = function() { return { ...this.baseStats }; };
      p.takeDamage  = function(n) { this.currentHP = Math.max(0, (this.currentHP||0)-n); return { damage:n, isDead: this.currentHP<=0 }; };
      p.useMana     = function(n) { if((this.currentMP||0)<n) return false; this.currentMP-=n; return true; };
      p.isAlive     = function()  { return (this.currentHP||0) > 0; };
      p.gainXP      = function(n) { this.xp=(this.xp||0)+n; return { leveled:false, newLevel:this.level||1 }; };
    }
    return p;
  }

  // ═══════════════════════════════════════════════════
  // BUILD: FONDO
  _buildBg(w, h) {
    const bg = this.add.graphics();
    bg.fillStyle(0x04060e, 1);
    bg.fillRect(0, 0, w, h);
    const g = this.add.graphics();
    g.lineStyle(1, 0x7b2fff, 0.04);
    for (let y=0; y<h; y+=45) g.lineBetween(0,y,w,y);
    for (let x=0; x<w; x+=45) g.lineBetween(x,0,x,h);
    this.add.text(w/2, 8, '— COMBATE —', {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'10px',
      fontStyle:'bold', color:'rgba(255,58,110,0.45)', letterSpacing:4, resolution:2
    }).setOrigin(0.5);
  }

  // ═══════════════════════════════════════════════════
  // BUILD: SECCIÓN ENEMIGO
  _buildEnemySection(w, h, enemy) {
    const sH = Math.floor(h * 0.34);

    // Fondo fijo
    const bg = this.add.graphics();
    bg.fillStyle(0x08040c, 0.9);
    bg.fillRect(0, 20, w, sH);

    // Nombre (texto, se actualiza)
    this._enemyNameTxt = this.add.text(w/2, 32, (enemy?.name||'ENEMIGO').toUpperCase(), {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'15px',
      fontStyle:'bold', color:'#ff3a6e', letterSpacing:3, resolution:2
    }).setOrigin(0.5);

    this._enemyLvlTxt = this.add.text(w/2, 50, 'NIVEL ' + (enemy?.level?.[0] || 1), {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'9px',
      color:'rgba(255,58,110,0.5)', letterSpacing:2, resolution:2
    }).setOrigin(0.5);

    // Barra HP enemigo — fondo fijo
    const hpBW = Math.min(260, w - 40);
    this._enemyHpBarW  = hpBW;
    this._enemyHpBgX   = w/2 - hpBW/2;
    this._enemyHpBgY   = 64;

    const hpBg = this.add.graphics();
    hpBg.fillStyle(0x1a0408, 1);
    hpBg.fillRoundedRect(this._enemyHpBgX, this._enemyHpBgY, hpBW, 10, 4);

    this.add.text(this._enemyHpBgX - 4, this._enemyHpBgY + 5, 'HP', {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'7px', color:'#5a6a85', resolution:2
    }).setOrigin(1, 0.5);

    // Barra fill SEPARADA para poder limpiar sola
    this._enemyHpFill = this.add.graphics();
    this._enemyHpLabel = this.add.text(w/2, this._enemyHpBgY + 20, '', {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'9px',
      color:'rgba(255,58,110,0.7)', resolution:2
    }).setOrigin(0.5);

    // Fila de efectos (textos reutilizables)
    this._effectsRow = [];
    for (let i=0; i<6; i++) {
      const eg = this.add.graphics();
      const et = this.add.text(0, this._enemyHpBgY + 36, '', {
        fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'7px', color:'#fff', resolution:2
      }).setOrigin(0.5).setVisible(false);
      this._effectsRow.push({ g: eg, t: et });
    }

    // Sprite del enemigo
    const isBoss = enemy?.tier >= 2;
    this._enemySprite = this.add.graphics();
    this._drawEnemySprite(this._enemySprite, w/2, sH * 0.68 + 20, isBoss);
    this.tweens.add({ targets: this._enemySprite, y:'-=6', duration:1300, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
  }

  _drawEnemySprite(g, x, y, isBoss) {
    const s = isBoss ? 44 : 30;
    if (isBoss) { g.fillStyle(0x7b2fff, 0.12); g.fillCircle(x, y, s*1.5); }
    g.fillStyle(0x1a0408, 0.95);
    g.fillEllipse(x, y, s*2, s*2.2);
    g.lineStyle(isBoss?2.5:1.5, 0xff3a6e, 0.75);
    g.strokeEllipse(x, y, s*2, s*2.2);
    // Ojos
    const ey = y - s*0.3;
    const ex = s*0.28;
    g.fillStyle(0xff3a6e, 1); g.fillCircle(x-ex, ey, isBoss?5.5:3.5); g.fillCircle(x+ex, ey, isBoss?5.5:3.5);
    g.fillStyle(0x040812, 1); g.fillCircle(x-ex, ey, isBoss?2.8:1.8); g.fillCircle(x+ex, ey, isBoss?2.8:1.8);
    g.fillStyle(0xffffff, 0.7); g.fillCircle(x-ex-1, ey-1, isBoss?1.5:1); g.fillCircle(x+ex-1, ey-1, isBoss?1.5:1);
  }

  // REFRESH: Barra HP enemigo — solo modifica la fill, nunca recrea ──
  _refreshEnemyBar(enemy) {
    if (!this._enemyHpFill || !enemy) return;
    const pct = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));
    const col = pct > 0.5 ? 0xd63031 : pct > 0.25 ? 0xe17055 : 0xff6b6b;
    this._enemyHpFill.clear();
    this._enemyHpFill.fillStyle(col, 0.9);
    if (pct > 0) this._enemyHpFill.fillRoundedRect(this._enemyHpBgX, this._enemyHpBgY, this._enemyHpBarW * pct, 10, 4);
    this._enemyHpLabel.setText(`${enemy.hp} / ${enemy.maxHp}`);

    // Efectos
    const efx = enemy.effects || [];
    this._effectsRow.forEach((row, i) => {
      if (i < efx.length) {
        const eff = efx[i];
        const col2 = parseInt((eff.color||'#7b2fff').replace('#',''), 16);
        row.g.clear();
        row.g.fillStyle(col2, 0.75);
        const ex = this._enemyHpBgX + i * 24 + 10;
        row.g.fillCircle(ex, this._enemyHpBgY + 26, 7);
        row.t.setText(eff.name?.slice(0,3)||'').setPosition(ex, this._enemyHpBgY + 38).setVisible(true);
      } else {
        row.g.clear(); row.t.setVisible(false);
      }
    });
  }

  // ═══════════════════════════════════════════════════
  // BUILD: CAJA NARRATIVA
  _buildNarrativeBox(w, h) {
    const boxY = Math.floor(h * 0.34) + 20;
    const boxH = 76;
    const bg = this.add.graphics();
    bg.fillStyle(0x060c18, 0.92);
    bg.fillRect(0, boxY, w, boxH);
    bg.lineStyle(1, 0x1a2a4a, 0.5);
    bg.lineBetween(0, boxY, w, boxY);
    bg.lineBetween(0, boxY+boxH, w, boxY+boxH);

    this._narrativeText = this.add.text(14, boxY + 10, '"Las sombras se mueven..."', {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'12px', fontStyle:'italic',
      color:'#c8d8f0', wordWrap:{ width: w-28 }, lineSpacing:4, resolution:2
    });

    // Indicador turno
    this._turnLabel = this.add.text(w-10, boxY+boxH-12, 'TURNO 1', {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'8px',
      color:'rgba(0,200,255,0.3)', resolution:2
    }).setOrigin(1,1);
  }

  // ═══════════════════════════════════════════════════
  // BUILD: HUD JUGADOR
  _buildPlayerHUD(w, h) {
    this._hudY = Math.floor(h * 0.34) + 20 + 76;
    const hudH = 52;
    const bg = this.add.graphics();
    bg.fillStyle(0x040812, 0.96);
    bg.fillRect(0, this._hudY, w, hudH);
    bg.lineStyle(1, 0x1a2a4a, 0.4);
    bg.lineBetween(0, this._hudY, w, this._hudY);
    bg.lineBetween(0, this._hudY+hudH, w, this._hudY+hudH);

    const stats  = this.player?.getEffectiveStats?.() || this.player?.baseStats || {};
    this._maxHp  = Math.max(1, stats.hp  || 1200);
    this._maxMp  = Math.max(1, stats.mp  || 300);
    this._barW   = Math.floor(w * 0.46);
    const bx     = 14;

    // HP fondo
    const hpBg = this.add.graphics();
    hpBg.fillStyle(0x1a0408, 1);
    hpBg.fillRoundedRect(bx, this._hudY + 8, this._barW, 14, 4);

    this.add.text(bx - 2, this._hudY + 15, 'HP', {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'8px', color:'#5a6a65', resolution:2
    }).setOrigin(1, 0.5);

    this._hpBarFill = this.add.graphics();
    this._hpLabel   = this.add.text(bx + this._barW/2, this._hudY + 15, '', {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'8px',
      fontStyle:'bold', color:'#ffffff', resolution:2
    }).setOrigin(0.5).setDepth(2);

    // MP fondo
    const mpBg = this.add.graphics();
    mpBg.fillStyle(0x040a1a, 1);
    mpBg.fillRoundedRect(bx, this._hudY + 28, this._barW, 10, 3);

    this.add.text(bx - 2, this._hudY + 33, 'MP', {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'8px', color:'#5a6a85', resolution:2
    }).setOrigin(1, 0.5);

    this._mpBarFill = this.add.graphics();
    this._mpLabel   = this.add.text(bx + this._barW/2, this._hudY + 33, '', {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'7px',
      color:'rgba(255,255,255,0.7)', resolution:2
    }).setOrigin(0.5).setDepth(2);

    // Info derecha
    this.add.text(w-12, this._hudY+10, (this.player?.name||'Resonador').toUpperCase(), {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'11px',
      fontStyle:'bold', color:'#c8d8f0', resolution:2
    }).setOrigin(1,0);

    this._playerLvlTxt = this.add.text(w-12, this._hudY+26, 'NV.'+(this.player?.level||1), {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'9px', color:'#5a6a85', resolution:2
    }).setOrigin(1,0);

    this.add.text(w-12, this._hudY+40, (this.player?.classId||'GUERRERO').toUpperCase(), {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'8px', color:'#7b2fff', resolution:2
    }).setOrigin(1,0);
  }

  // REFRESH: Barras HP/MP del jugador — limpia solo fill, no recrea fondo ──
  _refreshPlayerBars() {
    if (!this._hpBarFill || !this.player) return;
    const hp   = Math.max(0, this.player.currentHP || 0);
    const mp   = Math.max(0, this.player.currentMP || 0);
    const hpPct= Math.min(1, hp / this._maxHp);
    const mpPct= Math.min(1, mp / this._maxMp);
    const bx   = 14;

    // HP fill
    this._hpBarFill.clear();
    const hpCol = hpPct > 0.5 ? 0xd63031 : hpPct > 0.25 ? 0xe17055 : 0xff6b6b;
    this._hpBarFill.fillStyle(hpCol, 0.92);
    if (hpPct > 0) this._hpBarFill.fillRoundedRect(bx, this._hudY+8, this._barW * hpPct, 14, 4);
    this._hpLabel.setText(`${hp} / ${this._maxHp}`);

    // MP fill
    this._mpBarFill.clear();
    this._mpBarFill.fillStyle(0x0984e3, 0.9);
    if (mpPct > 0) this._mpBarFill.fillRoundedRect(bx, this._hudY+28, this._barW * mpPct, 10, 3);
    this._mpLabel.setText(`${mp} / ${this._maxMp}`);
  }

  // ═══════════════════════════════════════════════════
  // BUILD: BARRA DE HABILIDADES
  _buildSkillBar(w, h) {
    const barY     = h - 132;
    const count    = Math.max(1, this.activeSkills.length);
    const skillW   = Math.min(58, Math.floor((w - 16) / count) - 4);
    this._cooldownTexts = {};

    this.add.text(12, barY - 15, 'HABILIDADES', {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'8px',
      color:'rgba(0,200,255,0.4)', letterSpacing:3, resolution:2
    });

    this.activeSkills.forEach((skill, i) => {
      const sx = 8 + i * (skillW + 4);
      const sy = barY;
      const elCol = EL_COLORS[skill.element] || 0x5a6a85;

      const bg = this.add.graphics();
      bg.fillStyle(0x080f20, 0.95);
      bg.fillRoundedRect(sx, sy, skillW, skillW, 8);
      bg.lineStyle(1, elCol, 0.45);
      bg.strokeRoundedRect(sx, sy, skillW, skillW, 8);

      // Icono de elemento
      const ig = this.add.graphics();
      ig.lineStyle(1.5, elCol, 0.85);
      this._drawElementIcon(ig, sx + skillW/2, sy + skillW/2 - 10, skill.element);

      // Nombre truncado
      this.add.text(sx + skillW/2, sy + skillW - 13, (skill.name||'').slice(0,7), {
        fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'7px',
        color:'#' + elCol.toString(16).padStart(6,'0'), resolution:2
      }).setOrigin(0.5);

      // Coste MP
      if (skill.mpCost > 0) {
        this.add.text(sx + skillW - 2, sy + 2, skill.mpCost, {
          fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'7px',
          color:'#0984e3', resolution:2
        }).setOrigin(1,0);
      }

      // Cooldown overlay (se actualiza)
      this._cooldownTexts[skill.id] = this.add.text(sx + skillW/2, sy + skillW/2, '', {
        fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'14px',
        fontStyle:'bold', color:'#ffffff', resolution:2
      }).setOrigin(0.5).setDepth(5);

      const zone = this.add.zone(sx+skillW/2, sy+skillW/2, skillW, skillW)
        .setInteractive({ useHandCursor:true });
      zone.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(elCol, 0.18);
        bg.fillRoundedRect(sx, sy, skillW, skillW, 8);
        bg.lineStyle(1.5, elCol, 1);
        bg.strokeRoundedRect(sx, sy, skillW, skillW, 8);
        // Tooltip
        this._showSkillTooltip(skill, sx + skillW/2, sy - 4, w, h);
      });
      zone.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(0x080f20, 0.95);
        bg.fillRoundedRect(sx, sy, skillW, skillW, 8);
        bg.lineStyle(1, elCol, 0.45);
        bg.strokeRoundedRect(sx, sy, skillW, skillW, 8);
        if (this._tooltip) { this._tooltip.destroy(); this._tooltip = null; }
      });
      zone.on('pointerdown', () => {
        if (navigator.vibrate) navigator.vibrate(20);
        this.selectedSkill = skill;
        this._doPlayerAction('SKILL');
      });
    });
  }

  _showSkillTooltip(skill, x, y, w, h) {
    if (this._tooltip) this._tooltip.destroy();
    const txt = `${skill.name}\nMP: ${skill.mpCost}  CD: ${skill.cooldown}t\n${skill.description||''}`;
    const tipW = Math.min(180, w - 20);
    this._tooltip = this.add.text(
      Phaser.Math.Clamp(x, tipW/2+8, w - tipW/2 - 8),
      Math.max(50, y - 50), txt, {
        fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'9px',
        color:'#c8d8f0', backgroundColor:'rgba(6,12,28,0.97)',
        padding:{ x:8, y:6 }, wordWrap:{ width:tipW-16 },
        resolution:2
      }
    ).setOrigin(0.5, 1).setDepth(20);
  }

  _drawElementIcon(g, x, y, element) {
    switch (element) {
      case 'FIRE':
        g.fillStyle(0xe17055, 0.75);
        g.fillTriangle(x, y-8, x-5, y+5, x+5, y+5);
        break;
      case 'ICE':
        g.lineBetween(x, y-8, x, y+8);
        g.lineBetween(x-7, y-4, x+7, y+4);
        g.lineBetween(x-7, y+4, x+7, y-4);
        break;
      case 'LIGHTNING':
        g.fillStyle(0xfdcb6e, 0.85);
        g.fillTriangle(x+2, y-8, x-4, y, x+2, y);
        g.fillTriangle(x-2, y, x+4, y+8, x-2, y);
        break;
      case 'SHADOW':
        g.fillStyle(0x636e72, 0.65);
        g.fillCircle(x, y, 7);
        g.fillStyle(0x04060e, 0.9);
        g.fillCircle(x+2, y-2, 4);
        break;
      case 'ARCANE':
        g.strokeCircle(x, y, 6);
        g.lineBetween(x, y-9, x, y+9);
        g.lineBetween(x-9, y, x+9, y);
        break;
      case 'HOLY':
        g.lineBetween(x, y-9, x, y+9);
        g.lineBetween(x-7, y-4, x+7, y-4);
        break;
      case 'BLOOD':
        g.fillStyle(0xd63031, 0.8);
        g.fillTriangle(x, y-8, x-5, y+4, x+5, y+4);
        g.fillCircle(x, y+6, 3);
        break;
      case 'VOID':
        g.strokeCircle(x, y, 7);
        g.fillStyle(0x6c5ce7, 0.7);
        g.fillCircle(x, y, 3);
        break;
      default:
        g.fillStyle(0x5a6a85, 0.65);
        g.fillCircle(x, y, 6);
        break;
    }
  }

  // ═══════════════════════════════════════════════════
  // BUILD: COOLDOWN ROW VISUAL
  _buildCooldownRow(w, h) {
    // Ya creados en _buildSkillBar como _cooldownTexts
  }

  _refreshCooldowns() {
    if (!this._cooldownTexts || !this.engine) return;
    const cds = this.engine.playerCooldowns || {};
    for (const [id, txt] of Object.entries(this._cooldownTexts)) {
      const cd = cds[id] || 0;
      txt.setText(cd > 0 ? String(cd) : '');
    }
    if (this._turnLabel) this._turnLabel.setText('TURNO ' + (this.engine.turn + 1));
  }

  // ═══════════════════════════════════════════════════
  // BUILD: BOTONES DE ACCIÓN
  _buildActionButtons(w, h) {
    const btnY = h - 62;
    const btns = [
      { label:'ATACAR',   key:'ATTACK', col:0xd63031 },
      { label:'DEFENDER', key:'DEFEND', col:0x0984e3 },
      { label:'ESQUIVAR', key:'DODGE',  col:0x00b894 },
      { label:'HUIR',     key:'FLEE',   col:0x5a6a85 }
    ];
    const bw = Math.floor((w - 20) / btns.length);
    btns.forEach((btn, i) => {
      const bx = 10 + i * bw;
      const bg = this.add.graphics();
      bg.fillStyle(btn.col, 0.14);
      bg.fillRoundedRect(bx, btnY, bw-4, 50, 8);
      bg.lineStyle(1, btn.col, 0.4);
      bg.strokeRoundedRect(bx, btnY, bw-4, 50, 8);

      this.add.text(bx+(bw-4)/2, btnY+25, btn.label, {
        fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'10px',
        fontStyle:'bold', color:'#'+btn.col.toString(16).padStart(6,'0'),
        letterSpacing:1, resolution:2
      }).setOrigin(0.5);

      const zone = this.add.zone(bx+(bw-4)/2, btnY+25, bw-4, 50).setInteractive({ useHandCursor:true });
      zone.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(btn.col, 0.28); bg.fillRoundedRect(bx, btnY, bw-4, 50, 8);
        bg.lineStyle(1.5, btn.col, 0.9); bg.strokeRoundedRect(bx, btnY, bw-4, 50, 8);
      });
      zone.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(btn.col, 0.14); bg.fillRoundedRect(bx, btnY, bw-4, 50, 8);
        bg.lineStyle(1, btn.col, 0.4); bg.strokeRoundedRect(bx, btnY, bw-4, 50, 8);
      });
      zone.on('pointerdown', () => this._doPlayerAction(btn.key));
    });
  }

  // ═══════════════════════════════════════════════════
  // ACCIÓN DEL JUGADOR
  _doPlayerAction(type) {
    if (this.isProcessing || this.engine.isFinished) return;
    this.isProcessing = true;
    if (navigator.vibrate) navigator.vibrate(22);

    const result = this.engine.playerAction(type, this.selectedSkill);
    this.selectedSkill = null;

    if (!result) { this.isProcessing = false; return; }

    this._setNarrative(result.text || '...');
    if (result.damage) this._floatDamage(result.damage, result.isCrit, false);
    this._refreshPlayerBars();
    this._refreshEnemyBar(this.engine.getState().enemies[0]);
    this._refreshCooldowns();

    if (this.engine.isFinished) { this.isProcessing = false; return; }

    this.time.delayedCall(820, () => {
      const enemyResults = this.engine.enemyTurn();
      enemyResults.forEach(er => {
        if (er?.text)   this._setNarrative(er.text);
        if (er?.damage) this._floatDamage(er.damage, false, true);
      });
      this._refreshPlayerBars();
      this._refreshEnemyBar(this.engine.getState().enemies[0]);
      this._refreshCooldowns();
      this.isProcessing = false;
    });
  }

  _floatDamage(damage, isCrit, isEnemy) {
    if (!damage) return;
    const { width:w, height:h } = this.scale;
    const x = isEnemy ? w * 0.32 : w * 0.68;
    const y = isEnemy ? h * 0.54 : h * 0.36;
    const col  = isEnemy ? (isCrit ? '#ffd166' : '#ff6b6b') : (isCrit ? '#ffd166' : '#ffffff');
    const size = isCrit ? '22px' : '16px';
    const dmgTxt = this.add.text(x, y, (isEnemy ? '-' : '-') + damage, {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:size, fontStyle:'bold',
      color:col, stroke:'#04060e', strokeThickness:3, resolution:2
    }).setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets:dmgTxt, y:y-52, alpha:0, duration:950, ease:'Power2',
      onComplete: () => dmgTxt.destroy() });
  }

  _setNarrative(text) {
    if (!this._narrativeText || !text) return;
    this._narrativeText.setText('"' + text + '"');
  }

  // ═══════════════════════════════════════════════════
  // VICTORIA
  _onWin(rewards) {
    if (!this.scene.isActive('CombatScene')) return;
    const { width:w, height:h } = this.scale;
    this.isProcessing = true;

    this.time.delayedCall(500, () => {
      const ov = this.add.graphics();
      ov.fillStyle(0x040812, 0.92); ov.fillRect(0,0,w,h);

      // Título
      this.add.text(w/2, h*0.22, '¡VICTORIA!', {
        fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'30px', fontStyle:'bold',
        color:'#ffd166', stroke:'#7b2fff', strokeThickness:2, resolution:2
      }).setOrigin(0.5).setAlpha(0);

      const rewardsTxt = this.add.text(w/2, h*0.38,
        `+${rewards.xp||0} XP\n+${rewards.gold||0} ORO`, {
        fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'16px',
        color:'#c8d8f0', align:'center', lineSpacing:6, resolution:2
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({ targets:[ov], alpha:{ from:0, to:1 }, duration:350 });
      this.time.delayedCall(180, () => {
        this.tweens.add({ targets:[
          this.children.getAll().slice(-2)[0], // titulo
          rewardsTxt
        ], alpha:1, duration:450, ease:'Power2' });
      });

      // Aplicar recompensas
      if (this.player) {
        const lvl = this.player.gainXP(rewards.xp||0);
        this.player.gold = (this.player.gold||0) + (rewards.gold||0);

        // Loot real al inventario
        if (rewards.items?.length) {
          if (!this.player.inventoryItems) this.player.inventoryItems = [];
          rewards.items.forEach(id => {
            if (!this.player.inventoryItems.includes(id))
              this.player.inventoryItems.push(id);
          });
        }

        // Guardar
        const storage = this.registry.get('storage');
        if (storage?.savePlayer) storage.savePlayer(this.player.serialize?.() || this.player);

        if (lvl.leveled) {
          this.time.delayedCall(400, () => {
            this.add.text(w/2, h*0.54, `¡NIVEL ${lvl.newLevel}!`, {
              fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'22px', fontStyle:'bold',
              color:'#00ffb2', resolution:2
            }).setOrigin(0.5);
          });
        }

        // Loot display
        if (rewards.items?.length) {
          this.add.text(w/2, h*0.62,
            'Objetos: ' + rewards.items.slice(0,3).join(', '), {
            fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'10px',
            color:'#ffd166', wordWrap:{ width:w-40 }, align:'center', resolution:2
          }).setOrigin(0.5);
        }
      }

      // Botón continuar
      this.time.delayedCall(600, () => {
        const cBg = this.add.graphics();
        cBg.fillStyle(0x0d1f3c, 0.97); cBg.fillRoundedRect(w/2-110, h*0.78-26, 220, 52, 10);
        cBg.lineStyle(1.5, 0x00c8ff, 0.9); cBg.strokeRoundedRect(w/2-110, h*0.78-26, 220, 52, 10);
        this.add.text(w/2, h*0.78, 'CONTINUAR', {
          fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'14px',
          fontStyle:'bold', color:'#00c8ff', letterSpacing:3, resolution:2
        }).setOrigin(0.5);
        this.add.zone(w/2, h*0.78, 220, 52).setInteractive({ useHandCursor:true })
          .on('pointerdown', () => {
            this.cameras.main.fadeOut(280, 4,8,18);
            this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('DungeonScene'));
          });
      });
    });
  }

  // ═══════════════════════════════════════════════════
  // DERROTA
  _onLose() {
    if (!this.scene.isActive('CombatScene')) return;
    const { width:w, height:h } = this.scale;
    this.isProcessing = true;

    this.cameras.main.flash(300, 100, 0, 0);
    this.time.delayedCall(350, () => {
      const ov = this.add.graphics();
      ov.fillStyle(0x1a0408, 0.96); ov.fillRect(0,0,w,h);

      this.add.text(w/2, h*0.3, 'CAÍDO', {
        fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'34px',
        fontStyle:'bold', color:'#ff3a6e', resolution:2
      }).setOrigin(0.5);

      this.add.text(w/2, h*0.46, '"El abismo recuerda cada caída."', {
        fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'13px',
        fontStyle:'italic', color:'rgba(200,216,240,0.45)', resolution:2
      }).setOrigin(0.5);

      // Reintentar
      const rb = this.add.graphics();
      rb.fillStyle(0xd63031, 0.85); rb.fillRoundedRect(w/2-100, h*0.6-24, 200, 48, 10);
      this.add.text(w/2, h*0.6, 'REINTENTAR', {
        fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'14px',
        fontStyle:'bold', color:'#ffffff', resolution:2
      }).setOrigin(0.5);
      this.add.zone(w/2, h*0.6, 200, 48).setInteractive({ useHandCursor:true })
        .on('pointerdown', () => {
          if (this.player) this.player.currentHP = Math.floor((this.player.baseStats?.hp||1200) * 0.5);
          this.cameras.main.fadeOut(280,4,8,18);
          this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart());
        });

      // Volver al mapa
      this.add.text(w/2, h*0.75, 'VOLVER AL MAPA', {
        fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'12px', color:'#5a6a85', resolution:2
      }).setOrigin(0.5).setInteractive({ useHandCursor:true })
        .on('pointerdown', () => {
          this.cameras.main.fadeOut(280,4,8,18);
          this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('WorldMapScene'));
        });
    });
  }

  // ═══════════════════════════════════════════════════
  // COMBO ELEMENTAL
  _onCombo(data) {
    if (!this.scene.isActive('CombatScene')) return;
    const { width:w, height:h } = this.scale;
    const txt = this.add.text(w/2, h*0.46, `COMBO — ${data.combo?.name||'ELEMENTAL'}!`, {
      fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:'19px', fontStyle:'bold',
      color:'#ffd166', stroke:'#7b2fff', strokeThickness:2, resolution:2
    }).setOrigin(0.5).setAlpha(0).setDepth(20);

    this.tweens.add({
      targets:txt, alpha:1, y:h*0.41,
      duration:380, ease:'Back.out', hold:700,
      onComplete: () => this.tweens.add({ targets:txt, alpha:0, duration:320, onComplete: () => txt.destroy() })
    });
  }

  // ═══════════════════════════════════════════════════
  shutdown() {
    globalBus.off('combat:win',   this._onWin,   this);
    globalBus.off('combat:lose',  this._onLose,  this);
    globalBus.off('combat:combo', this._onCombo, this);
    if (this._tooltip) this._tooltip.destroy();
  }
}
