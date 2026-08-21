/**
 * DungeonScene — Exploración de mazmorras (tiles + visual novel)
 * Habitaciones, enemigos, loot, puzzles, NPC, boss
 */
import Phaser from 'phaser';
import { DungeonGenerator } from '../../dungeon/DungeonGenerator.js';
import { globalBus } from '../../utils/EventBus.js';

export class DungeonScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DungeonScene' });
    this.dungeon = null;
    this.currentRoomIdx = 0;
    this.currentRoom = null;
  }

  create() {
    const { width: w, height: h } = this.scale;
    this.cameras.main.setBackgroundColor('#04080f');
    this.cameras.main.fadeIn(500, 0, 0, 0);

    this.player = this.registry.get('player');
    const rift = this.registry.get('currentRift') || { rank: 'D', type: 'NORMAL' };

    // Generar mazmorra
    const worldSeed = 'ABYSSAL_WORLD_V1';
    const dungSeed = `RIFT_${rift.rank}_${Date.now()}`;
    const generator = new DungeonGenerator(worldSeed, dungSeed, 'crypt', 1, 1);
    this.dungeon = generator.generate();
    this.currentRoom = this.dungeon.rooms[0];

    this._buildUI(w, h);
    this._renderRoom(this.currentRoom, w, h);
  }

  _buildUI(w, h) {
    // Mini-mapa superior
    this._buildMinimap(w, h);

    // Barra inferior de acciones
    this._buildActionBar(w, h);

    // Panel de narrativa
    this._buildNarrativePanel(w, h);
  }

  _buildMinimap(w, h) {
    const mmW = 100, mmH = 60, mmX = w - mmW - 8, mmY = 64;
    const bg = this.add.graphics();
    bg.fillStyle(0x040812, 0.9);
    bg.fillRoundedRect(mmX, mmY, mmW, mmH, 6);
    bg.lineStyle(1, 0x1a2a4a, 0.8);
    bg.strokeRoundedRect(mmX, mmY, mmW, mmH, 6);

    this.add.text(mmX + mmW / 2, mmY + 6, 'PLANTA', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '7px',
      color: 'rgba(0,200,255,0.5)', letterSpacing: 2, resolution: 2
    }).setOrigin(0.5);

    // Renderizar habitaciones en minimap
    const rooms = this.dungeon?.rooms || [];
    const cols = 5;
    const cellW = (mmW - 16) / cols;
    const cellH = (mmH - 20) / Math.ceil(rooms.length / cols);

    rooms.forEach((r, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const rx = mmX + 8 + col * cellW;
      const ry = mmY + 16 + row * cellH;

      const rg = this.add.graphics();
      const isCurrentRoom = i === this.currentRoomIdx;
      const colors = { combat: 0xff3a6e, rest: 0x00b894, treasure: 0xffd166, boss: 0x7b2fff, puzzle: 0x00c8ff };
      const col2 = colors[r.type] || 0x5a6a85;
      rg.fillStyle(col2, isCurrentRoom ? 1 : r.cleared ? 0.4 : 0.2);
      rg.fillRect(rx, ry, cellW - 2, cellH - 2);
      if (isCurrentRoom) {
        rg.lineStyle(1, 0xffffff, 0.9);
        rg.strokeRect(rx, ry, cellW - 2, cellH - 2);
      }
    });
  }

  _buildActionBar(w, h) {
    const barH = 72;
    const bg = this.add.graphics();
    bg.fillStyle(0x040812, 0.95);
    bg.fillRect(0, h - barH, w, barH);
    bg.lineStyle(1, 0x1a2a4a, 0.8);
    bg.lineBetween(0, h - barH, w, h - barH);

    const actions = [
      { label: 'AVANZAR',   key: 'advance' },
      { label: 'COMBATIR',  key: 'fight' },
      { label: 'INVENTARIO',key: 'inv' },
      { label: 'SALIR',     key: 'exit' }
    ];

    const aw = w / actions.length;
    actions.forEach((a, i) => {
      const cx = aw * i + aw / 2;
      const cy = h - barH / 2;

      const bg2 = this.add.graphics();
      bg2.lineStyle(1, 0x1a2a4a, 0.5);
      bg2.lineBetween(aw * i, h - barH, aw * i, h);

      this.add.text(cx, cy, a.label, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '10px', fontStyle: 'bold',
        color: '#7b8fa0', letterSpacing: 1, resolution: 2
      }).setOrigin(0.5);

      const zone = this.add.zone(cx, cy, aw - 4, barH - 4).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => this._onAction(a.key));
    });
  }

  _buildNarrativePanel(w, h) {
    const panelH = 80;
    this.narrativePanel = this.add.graphics();
    this.narrativePanel.fillStyle(0x060c1c, 0.88);
    this.narrativePanel.fillRect(0, h - 72 - panelH, w, panelH);
    this.narrativePanel.lineStyle(1, 0x00c8ff, 0.1);
    this.narrativePanel.lineBetween(0, h - 72 - panelH, w, h - 72 - panelH);

    this.narrativeText = this.add.text(14, h - 72 - panelH + 10, '', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '12px',
      color: '#c8d8f0', wordWrap: { width: w - 28 }, lineSpacing: 5, resolution: 2
    });
  }

  _renderRoom(room, w, h) {
    if (this._roomContainer) this._roomContainer.destroy();
    this._roomContainer = this.add.container(0, 0);

    const midY = (h - 152) / 2 + 64; // entre hud y action bar

    // Fondo de habitación
    const roomBg = this.add.graphics();
    const bgColors = { combat: [0x08040c, 0x120418], rest: [0x040c08, 0x081408], treasure: [0x0c0a04, 0x181408], boss: [0x0a0418, 0x180424] };
    const [c1, c2] = bgColors[room.type] || [0x04080c, 0x08101c];
    roomBg.fillStyle(c1, 1);
    roomBg.fillRect(0, 64, w, h - 64 - 152);

    // Tiles de suelo
    const tileG = this.add.graphics();
    this._drawDungeonTiles(tileG, w, h, room.type);

    // Tipo de habitación
    const typeLabels = { combat: 'ZONA DE COMBATE', rest: 'ZONA DE DESCANSO', treasure: 'COFRE DE RECOMPENSAS', boss: 'JEFE DE BRECHA', puzzle: 'SALA DE ENIGMAS', secret: 'HABITACIÓN SECRETA', npc: 'ENCUENTRO' };
    this.add.text(w / 2, 72, typeLabels[room.type] || 'HABITACIÓN', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '10px', fontStyle: 'bold',
      color: 'rgba(0,200,255,0.5)', letterSpacing: 4, resolution: 2
    }).setOrigin(0.5);

    // Indicador de piso
    this.add.text(14, 72, `PISO ${this.dungeon.floor}`, {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '9px',
      color: 'rgba(123,47,255,0.6)', letterSpacing: 2, resolution: 2
    });

    // Contenido de habitación
    this._renderRoomContent(room, w, h, midY);

    // Texto narrativo
    const narratives = {
      combat: 'El ambiente se tensa. Presencias hostiles detectadas.',
      rest: 'Un raro respiro en las profundidades. Aquí el eco es más tenue.',
      treasure: 'Algo brilla en la oscuridad. Un cofre marcado con runas antiguas.',
      boss: 'El aire vibra. Una presencia inmensa espera al fondo.',
      puzzle: 'Marcas antiguas cubren las paredes. Algo aquí espera una respuesta.',
      secret: 'Una grieta en la pared. Nadie más ha estado aquí.',
      npc: 'No estás solo en este lugar. Algo... o alguien... te observa.'
    };
    this._setNarrative(narratives[room.type] || 'Las profundidades continúan...');

    this._roomContainer.add([roomBg, tileG]);
  }

  _drawDungeonTiles(g, w, h, type) {
    const tileColors = { combat: 0x0a0518, rest: 0x05100a, treasure: 0x100d04, boss: 0x100418 };
    const base = tileColors[type] || 0x060b14;
    const tileSize = 40;

    for (let tx = 0; tx < w; tx += tileSize) {
      for (let ty = 64; ty < h - 152; ty += tileSize) {
        if ((tx / tileSize + ty / tileSize) % 2 === 0) {
          g.fillStyle(base, 0.5);
          g.fillRect(tx, ty, tileSize - 1, tileSize - 1);
        }
        // Borde de tile
        g.lineStyle(0.5, 0x1a2a4a, 0.15);
        g.strokeRect(tx, ty, tileSize, tileSize);
      }
    }
  }

  _renderRoomContent(room, w, h, midY) {
    if (room.type === 'combat' || room.type === 'elite') {
      // Mostrar enemigos como iconos con vida
      room.enemies?.forEach((e, i) => {
        const ex = w / 2 + (i - (room.enemies.length - 1) / 2) * 90;
        const ey = midY;
        this._drawEnemy(ex, ey, e, i);
      });
    } else if (room.type === 'rest') {
      this._drawRestPoint(w / 2, midY);
    } else if (room.type === 'treasure') {
      this._drawChest(w / 2, midY, room.loot);
    } else if (room.type === 'boss') {
      this._drawBoss(w / 2, midY, room.enemies?.[0]);
    }
  }

  _drawEnemy(x, y, enemy, index) {
    const g = this.add.graphics();
    // Silueta de enemigo
    g.fillStyle(0xff3a6e, 0.15);
    g.fillCircle(x, y - 10, 22);
    g.lineStyle(1.5, 0xff3a6e, 0.6);
    g.strokeCircle(x, y - 10, 22);

    // Forma del cuerpo del enemigo
    g.fillStyle(0x1a0808, 0.9);
    g.fillEllipse(x, y - 10, 30, 35);
    g.lineStyle(1, 0xff3a6e, 0.5);
    g.strokeEllipse(x, y - 10, 30, 35);

    // Ojos
    g.fillStyle(0xff3a6e, 1);
    g.fillCircle(x - 6, y - 14, 3);
    g.fillCircle(x + 6, y - 14, 3);
    g.fillStyle(0x040812, 1);
    g.fillCircle(x - 6, y - 14, 1.5);
    g.fillCircle(x + 6, y - 14, 1.5);

    // Barra de vida
    const hpW = 50, hpH = 5;
    const hpBg = this.add.graphics();
    hpBg.fillStyle(0x1a0808, 1); hpBg.fillRect(x - hpW / 2, y + 20, hpW, hpH);
    hpBg.fillStyle(0xd63031, 0.9); hpBg.fillRect(x - hpW / 2, y + 20, hpW * (enemy.currentHP / enemy.hp), hpH);

    this.add.text(x, y + 34, (enemy.id || 'enemigo').replace(/_/g, ' ').toUpperCase(), {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '8px',
      color: '#ff3a6e', resolution: 2
    }).setOrigin(0.5);

    // Animación flotante
    this.tweens.add({ targets: g, y: g.y - 5, duration: 1200 + index * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  _drawRestPoint(x, y) {
    const g = this.add.graphics();
    g.fillStyle(0x00b894, 0.15);
    g.fillCircle(x, y, 30);
    g.lineStyle(2, 0x00b894, 0.6);
    g.strokeCircle(x, y, 30);
    // Cruz de curación
    g.lineStyle(3, 0x00b894, 0.8);
    g.lineBetween(x, y - 15, x, y + 15);
    g.lineBetween(x - 15, y, x + 15, y);

    this.add.text(x, y + 45, 'PUNTO DE DESCANSO', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '9px',
      color: '#00b894', letterSpacing: 2, resolution: 2
    }).setOrigin(0.5);
  }

  _drawChest(x, y, loot) {
    const g = this.add.graphics();
    const colors = { COMMON: 0x5a6a85, UNCOMMON: 0x00b894, RARE: 0x0984e3, EPIC: 0x7b2fff, LEGENDARY: 0xffd166 };
    const col = colors[loot?.rarity] || 0x5a6a85;
    g.fillStyle(col, 0.2);
    g.fillCircle(x, y, 25);
    g.fillStyle(0x1a1200, 0.95);
    g.fillRoundedRect(x - 20, y - 14, 40, 28, 4);
    g.lineStyle(2, col, 0.8);
    g.strokeRoundedRect(x - 20, y - 14, 40, 28, 4);
    g.lineStyle(1.5, col, 0.6);
    g.lineBetween(x - 20, y - 2, x + 20, y - 2);
    // Cerradura
    g.fillStyle(col, 0.8);
    g.fillCircle(x, y + 6, 4);

    this.add.text(x, y + 30, loot?.rarity || 'COFRE', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '9px', fontStyle: 'bold',
      color: '#' + col.toString(16).padStart(6, '0'), resolution: 2
    }).setOrigin(0.5);

    // Glow animado
    this.tweens.add({ targets: g, alpha: { from: 0.7, to: 1 }, duration: 900, yoyo: true, repeat: -1 });
  }

  _drawBoss(x, y, boss) {
    if (!boss) return;
    const g = this.add.graphics();
    // Aura del boss
    g.fillStyle(0x7b2fff, 0.08);
    g.fillCircle(x, y, 55);
    g.lineStyle(1, 0x7b2fff, 0.3);
    g.strokeCircle(x, y, 55);

    // Cuerpo del boss (más grande)
    g.fillStyle(0x0d0418, 0.95);
    g.fillEllipse(x, y - 5, 60, 70);
    g.lineStyle(2, 0x7b2fff, 0.7);
    g.strokeEllipse(x, y - 5, 60, 70);

    // Ojos del boss
    g.fillStyle(0xff3a6e, 1);
    g.fillCircle(x - 10, y - 10, 6);
    g.fillCircle(x + 10, y - 10, 6);
    g.fillStyle(0x040812, 1);
    g.fillCircle(x - 10, y - 10, 3);
    g.fillCircle(x + 10, y - 10, 3);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(x - 8, y - 12, 1.5);
    g.fillCircle(x + 12, y - 12, 1.5);

    // Barra de vida boss
    const bossHpW = 180, bossHpH = 8;
    const hpG = this.add.graphics();
    hpG.fillStyle(0x1a0408, 1); hpG.fillRoundedRect(x - bossHpW / 2, y + 50, bossHpW, bossHpH, 3);
    hpG.fillStyle(0xff3a6e, 0.9);
    hpG.fillRoundedRect(x - bossHpW / 2, y + 50, bossHpW, bossHpH, 3);

    this.add.text(x, y + 68, boss.name?.toUpperCase() || 'JEFE ABISAL', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '11px', fontStyle: 'bold',
      color: '#7b2fff', letterSpacing: 3, resolution: 2
    }).setOrigin(0.5);

    this.add.text(x, y + 84, `FASES: ${boss.phases || 1} — RANGO: ${boss.tier || 1}`, {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '9px',
      color: 'rgba(123,47,255,0.6)', resolution: 2
    }).setOrigin(0.5);

    // Pulso de aura
    this.tweens.add({ targets: g, alpha: { from: 0.8, to: 1 }, scaleX: { from: 0.97, to: 1.03 }, scaleY: { from: 0.97, to: 1.03 }, duration: 1500, yoyo: true, repeat: -1 });
  }

  _setNarrative(text) {
    if (!this.narrativeText) return;
    this.narrativeText.setText('');
    const chars = text.split('');
    let i = 0;
    this.time.addEvent({
      delay: 20,
      callback: () => { if (i < chars.length) { this.narrativeText.setText(this.narrativeText.text + chars[i]); i++; } },
      repeat: chars.length - 1
    });
  }

  _onAction(key) {
    if (navigator.vibrate) navigator.vibrate(20);
    const { width: w, height: h } = this.scale;
    switch (key) {
      case 'advance':
        this._advanceRoom(w, h);
        break;
      case 'fight':
        this.registry.set('combatRoom', this.currentRoom);
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

  _advanceRoom(w, h) {
    if (this.currentRoomIdx < this.dungeon.rooms.length - 1) {
      this.dungeon.rooms[this.currentRoomIdx].cleared = true;
      this.currentRoomIdx++;
      this.currentRoom = this.dungeon.rooms[this.currentRoomIdx];
      this.cameras.main.flash(300, 0, 0, 0);
      this.time.delayedCall(150, () => this._renderRoom(this.currentRoom, w, h));
      this._buildMinimap(w, h);
    } else {
      this._setNarrative('Has llegado al fondo de esta Brecha. La victoria es tuya.');
    }
  }
}
