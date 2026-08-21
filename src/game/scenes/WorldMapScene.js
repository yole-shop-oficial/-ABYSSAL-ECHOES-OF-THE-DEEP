/**
 * WorldMapScene — Mapa del mundo principal
 * Muestra: brechas, mazmorras, NPC, misiones, estado del jugador
 * Soporta: GPS (opcional), modo libre, tiles propios
 */
import Phaser from 'phaser';
import { globalBus } from '../../utils/EventBus.js';
import { SeededRandom } from '../../utils/SeededRandom.js';

const TIME_PERIODS = {
  dawn:  { hours: [5, 8],   label: 'AMANECER',    sky: [0x0a0d20, 0x1a0d0a], encounterMod: 'rare' },
  day:   { hours: [8, 17],  label: 'DÍA',         sky: [0x060d1a, 0x080d20], encounterMod: 'common' },
  dusk:  { hours: [17, 20], label: 'ATARDECER',   sky: [0x1a0808, 0x0d0514], encounterMod: 'special' },
  night: { hours: [20, 24], label: 'NOCHE',        sky: [0x040812, 0x06040e], encounterMod: 'dark' },
  deep_night: { hours: [0, 5], label: 'MADRUGADA', sky: [0x020408, 0x040208], encounterMod: 'extreme_rare' }
};

export class WorldMapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldMapScene' });
    this.worldSeed = 'ABYSSAL_WORLD_V1';
    this.mapRng = null;
    this.brechas = [];
    this.dungeons = [];
    this.playerPos = { x: 0, y: 0 };
    this.gpsEnabled = false;
    this.currentTime = null;
    this.mapOffsetX = 0;
    this.mapOffsetY = 0;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
  }

  create() {
    const { width: w, height: h } = this.scale;
    this.cameras.main.setBackgroundColor('#040812');
    this.cameras.main.fadeIn(500);

    this.player = this.registry.get('player');
    this.mapRng = new SeededRandom(this.worldSeed);
    this.currentTime = this._getTimePeriod();

    this._buildMap(w, h);
    this._buildHUD(w, h);
    this._buildNavBar(w, h);
    this._generateBrechas(w, h);
    this._startTimeSystem();
    this._initGPS(w, h);

    // Eventos globales
    globalBus.on('combat:win', this._onCombatWin, this);
  }

  _buildMap(w, h) {
    const tp = this.currentTime;
    const [c1, c2] = tp.sky;

    // Fondo de mapa
    this.mapBg = this.add.graphics();
    this.mapBg.fillGradientStyle(c1, c1, c2, c2, 1);
    this.mapBg.fillRect(0, 0, w, h);

    // Tiles / cuadrícula de mapa
    this.mapGrid = this.add.graphics();
    this._drawMapGrid(w, h);

    // Contenedor del mundo (se mueve para simular scroll)
    this.worldContainer = this.add.container(0, 0);

    // Zonas del mundo
    this._drawWorldZones(w, h);

    // Drag para mover el mapa
    this.input.on('pointerdown', (ptr) => {
      if (ptr.y > h - 80) return; // Evitar navbar
      this.isDragging = true;
      this.dragStart = { x: ptr.x - this.mapOffsetX, y: ptr.y - this.mapOffsetY };
    });

    this.input.on('pointermove', (ptr) => {
      if (!this.isDragging) return;
      this.mapOffsetX = ptr.x - this.dragStart.x;
      this.mapOffsetY = ptr.y - this.dragStart.y;
      this.worldContainer.setPosition(this.mapOffsetX, this.mapOffsetY);
    });

    this.input.on('pointerup', () => { this.isDragging = false; });
  }

  _drawMapGrid(w, h) {
    this.mapGrid.lineStyle(1, 0x00c8ff, 0.04);
    for (let x = 0; x < w + 200; x += 60) this.mapGrid.lineBetween(x, 0, x, h);
    for (let y = 0; y < h + 200; y += 60) this.mapGrid.lineBetween(0, y, w, y);
  }

  _drawWorldZones(w, h) {
    // Zonas del mundo con iconos y nombres
    const zones = [
      { x: w * 0.2, y: h * 0.25, name: 'DISTRITO NORTE', type: 'urban', color: 0x1a2a4a },
      { x: w * 0.7, y: h * 0.2, name: 'PARQUE SOMBRÍO', type: 'park', color: 0x0a1a0a },
      { x: w * 0.5, y: h * 0.5, name: 'CENTRO', type: 'plaza', color: 0x1a1a2a },
      { x: w * 0.15, y: h * 0.6, name: 'RUINAS ANTIGUAS', type: 'historic', color: 0x1a1200 },
      { x: w * 0.8, y: h * 0.65, name: 'ZONA INDUSTRIAL', type: 'industrial', color: 0x0d1520 },
      { x: w * 0.45, y: h * 0.8, name: 'ORILLA DEL ABISMO', type: 'water', color: 0x06101a }
    ];

    for (const z of zones) {
      const bg = this.add.graphics();
      bg.fillStyle(z.color, 0.7);
      bg.fillRoundedRect(z.x - 60, z.y - 20, 120, 40, 8);
      bg.lineStyle(1, 0x1a2a4a, 0.5);
      bg.strokeRoundedRect(z.x - 60, z.y - 20, 120, 40, 8);

      // Icono de zona
      this._drawZoneIcon(z.x - 40, z.y, z.type);

      this.add.text(z.x + 2, z.y, z.name, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '8px',
        color: 'rgba(200,216,240,0.6)', letterSpacing: 1, resolution: 2
      }).setOrigin(0.5);
    }
  }

  _drawZoneIcon(x, y, type) {
    const g = this.add.graphics();
    const colors = { urban: 0x00c8ff, park: 0x00b894, historic: 0xffd166, water: 0x0984e3, plaza: 0x7b2fff, industrial: 0x5d6d7e };
    const col = colors[type] || 0x5a6a85;
    g.fillStyle(col, 0.7);
    switch (type) {
      case 'urban':    g.fillRect(x - 4, y - 6, 8, 10); break;
      case 'park':     g.fillTriangle(x, y - 7, x - 5, y + 3, x + 5, y + 3); break;
      case 'historic': g.fillRect(x - 5, y - 4, 10, 8); g.fillStyle(0xffd166, 0.5); g.fillRect(x - 2, y - 7, 4, 5); break;
      case 'water':    g.fillEllipse(x, y, 12, 6); break;
      default:         g.fillCircle(x, y, 5); break;
    }
  }

  _generateBrechas(w, h) {
    const count = 5 + this.mapRng.int(0, 4);
    for (let i = 0; i < count; i++) {
      const bx = this.mapRng.float(40, w - 40);
      const by = this.mapRng.float(80, h - 120);
      const rank = ['F', 'E', 'D', 'C', 'B', 'A', 'S'][this.mapRng.int(0, 6)];
      const type = this.mapRng.pick(['NORMAL', 'RARE', 'INESTABLE', 'NEGRA', 'TEMPORAL']);

      const riftColors = { NORMAL: 0x7b2fff, RARE: 0x00c8ff, INESTABLE: 0xff3a6e, NEGRA: 0x1a0030, TEMPORAL: 0xffd166 };
      const col = riftColors[type] || 0x7b2fff;

      // Icono de brecha
      const g = this.add.graphics();
      this._drawRiftIcon(g, bx, by, 14, col);

      // Rango
      this.add.text(bx, by + 20, `BRECHA ${rank}`, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '8px', fontStyle: 'bold',
        color: '#' + col.toString(16).padStart(6, '0'), letterSpacing: 1, resolution: 2
      }).setOrigin(0.5);

      // Zona interactiva
      const zone = this.add.zone(bx, by, 60, 50).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => this._onRiftClick({ x: bx, y: by, rank, type, col }));

      // Animación de pulso
      this.tweens.add({ targets: g, alpha: { from: 0.6, to: 1 }, scaleX: { from: 0.95, to: 1.05 }, scaleY: { from: 0.95, to: 1.05 }, duration: 1200 + i * 200, yoyo: true, repeat: -1 });

      this.brechas.push({ x: bx, y: by, rank, type });
    }
  }

  _drawRiftIcon(g, x, y, size, color) {
    g.lineStyle(2, color, 0.9);
    g.beginPath();
    g.moveTo(x - size, y);
    // Curva superior
    const mid1x = x - size * 0.3, mid1y = y - size * 0.8;
    const mid2x = x + size * 0.3, mid2y = y + size * 0.8;
    g.lineTo(mid1x, mid1y);
    g.lineTo(x, y);
    g.lineTo(mid2x, mid2y);
    g.lineTo(x + size, y);
    g.strokePath();
    g.lineStyle(1, color, 0.4);
    g.beginPath();
    g.moveTo(x - size, y);
    g.lineTo(x - size * 0.3, y + size * 0.8);
    g.lineTo(x, y);
    g.lineTo(x + size * 0.3, y - size * 0.8);
    g.lineTo(x + size, y);
    g.strokePath();
    g.fillStyle(color, 0.7);
    g.fillCircle(x, y, 3);
  }

  _buildHUD(w, h) {
    // Barra superior HUD
    const hbar = this.add.graphics();
    hbar.fillStyle(0x040812, 0.92);
    hbar.fillRect(0, 0, w, 56);
    hbar.lineStyle(1, 0x00c8ff, 0.15);
    hbar.lineBetween(0, 56, w, 56);

    // Nombre del jugador
    const name = this.player?.name || 'Resonador';
    const cls = this.player?.classId || 'Guerrero';
    this.add.text(14, 10, name.toUpperCase(), {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '12px', fontStyle: 'bold',
      color: '#c8d8f0', resolution: 2
    });
    this.add.text(14, 28, cls.toUpperCase() + ' — NIVEL ' + (this.player?.level || 1), {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '9px',
      color: 'rgba(0,200,255,0.6)', letterSpacing: 2, resolution: 2
    });

    // HP bar
    const hp = this.player?.currentHP || 1000;
    const maxHp = this.player?.baseStats?.hp || 1000;
    this._drawMiniBar(w - 80, 14, 65, 7, hp / maxHp, 0xd63031, 'HP');

    // MP bar
    const mp = this.player?.currentMP || 300;
    const maxMp = this.player?.baseStats?.mp || 300;
    this._drawMiniBar(w - 80, 30, 65, 7, mp / maxMp, 0x0984e3, 'MP');

    // Hora / período
    this.timeLabel = this.add.text(w / 2, 28, this.currentTime.label, {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '9px',
      color: 'rgba(200,216,240,0.5)', letterSpacing: 3, resolution: 2
    }).setOrigin(0.5);

    // Modo de juego
    this.modeLabel = this.add.text(w / 2, 14, 'MAPA DEL MUNDO', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '8px', fontStyle: 'bold',
      color: '#7b2fff', letterSpacing: 2, resolution: 2
    }).setOrigin(0.5);
  }

  _drawMiniBar(x, y, bw, bh, pct, color, label) {
    const g = this.add.graphics();
    g.fillStyle(0x0a1020, 1); g.fillRoundedRect(x, y, bw, bh, 2);
    g.fillStyle(color, 0.9); g.fillRoundedRect(x, y, bw * pct, bh, 2);
    this.add.text(x - 2, y + bh / 2, label, {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '7px',
      color: '#5a6a85', resolution: 2
    }).setOrigin(1, 0.5);
  }

  _buildNavBar(w, h) {
    const navH = 74;
    const navBg = this.add.graphics();
    navBg.fillStyle(0x040812, 0.97);
    navBg.fillRect(0, h - navH, w, navH);
    navBg.lineStyle(1, 0x1a2a4a, 0.8);
    navBg.lineBetween(0, h - navH, w, h - navH);

    const navItems = [
      { label: 'MAPA',      key: 'map',    active: true },
      { label: 'AVENTURA',  key: 'story',  active: false },
      { label: 'PROYECCIÓN', key: 'free',  active: false },
      { label: 'PERSONAJE', key: 'char',   active: false },
      { label: 'COFRE',     key: 'inv',    active: false }
    ];

    const itemW = w / navItems.length;
    navItems.forEach((item, i) => {
      const cx = itemW * i + itemW / 2;
      const cy = h - navH / 2;

      // Icono (SVG-based graphics)
      this._drawNavIcon(cx, cy - 12, item.key, item.active);

      const txt = this.add.text(cx, cy + 14, item.label, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '8px', fontStyle: item.active ? 'bold' : 'normal',
        color: item.active ? '#00c8ff' : '#5a6a85', letterSpacing: 1, resolution: 2
      }).setOrigin(0.5);

      const zone = this.add.zone(cx, cy, itemW - 4, navH - 4).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => this._onNavClick(item.key));
    });
  }

  _drawNavIcon(x, y, key, active) {
    const g = this.add.graphics();
    const color = active ? 0x00c8ff : 0x5a6a85;
    const alpha = active ? 1 : 0.6;
    g.lineStyle(1.5, color, alpha);

    switch (key) {
      case 'map':
        g.strokeRect(x - 7, y - 6, 14, 12);
        g.lineBetween(x - 3, y - 6, x - 3, y + 6);
        g.lineBetween(x + 3, y - 6, x + 3, y + 6);
        break;
      case 'story':
        g.fillStyle(color, alpha * 0.3);
        g.fillStar(x, y, 5, 4, 8);
        g.strokePath();
        break;
      case 'free':
        g.strokeCircle(x, y, 7);
        g.strokeCircle(x, y, 3);
        g.lineBetween(x, y - 10, x, y - 7);
        break;
      case 'char':
        g.strokeCircle(x, y - 4, 4);
        g.strokeEllipse(x, y + 4, 12, 6);
        break;
      case 'inv':
        g.strokeRect(x - 7, y - 4, 14, 10);
        g.lineBetween(x - 4, y - 7, x - 4, y - 4);
        g.lineBetween(x + 4, y - 7, x + 4, y - 4);
        break;
    }
  }

  _onNavClick(key) {
    if (navigator.vibrate) navigator.vibrate(20);
    this.cameras.main.fadeOut(250, 4, 8, 18);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      switch (key) {
        case 'story': this.scene.start('PrologueScene'); break;
        case 'free':  this.scene.start('FreeModeScene'); break;
        case 'char':  this.scene.start('CharacterScene'); break;
        case 'inv':   this.scene.start('InventoryScene'); break;
        default: this.cameras.main.fadeIn(250); break; // ya estamos en mapa
      }
    });
  }

  _onRiftClick(rift) {
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
    this._showRiftModal(rift);
  }

  _showRiftModal(rift) {
    const { width: w, height: h } = this.scale;
    if (this._modal) { this._modal.destroy(); this._modal = null; }
    this._modal = this.add.container(0, 0);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, w, h);

    const mw = Math.min(300, w - 40);
    const mh = 220;
    const mx = (w - mw) / 2;
    const my = (h - mh) / 2;

    const mpanel = this.add.graphics();
    mpanel.fillStyle(0x060c1c, 0.98);
    mpanel.fillRoundedRect(mx, my, mw, mh, 14);
    mpanel.lineStyle(1.5, 0x7b2fff, 0.8);
    mpanel.strokeRoundedRect(mx, my, mw, mh, 14);
    mpanel.fillStyle(0x7b2fff, 0.05);
    mpanel.fillRoundedRect(mx, my, mw, mh, 14);

    this.add.text(w / 2, my + 24, 'BRECHA DETECTADA', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '11px', fontStyle: 'bold',
      color: '#7b2fff', letterSpacing: 4, resolution: 2
    }).setOrigin(0.5);

    const riftG = this.add.graphics();
    this._drawRiftIcon(riftG, w / 2, my + 70, 20, rift.col);

    this.add.text(w / 2, my + 98, `RANGO: ${rift.rank}`, {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '13px', fontStyle: 'bold',
      color: '#' + rift.col.toString(16).padStart(6, '0'), resolution: 2
    }).setOrigin(0.5);

    this.add.text(w / 2, my + 118, `TIPO: ${rift.type}`, {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '10px',
      color: 'rgba(200,216,240,0.6)', letterSpacing: 2, resolution: 2
    }).setOrigin(0.5);

    // Botón entrar
    const ebtn = this.add.graphics();
    ebtn.fillGradientStyle(0x7b2fff, 0x00c8ff, 0x7b2fff, 0x00c8ff, 1);
    ebtn.fillRoundedRect(mx + 20, my + mh - 60, mw - 40, 40, 8);
    this.add.text(w / 2, my + mh - 40, 'ENTRAR A LA BRECHA', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '12px', fontStyle: 'bold',
      color: '#ffffff', letterSpacing: 2, resolution: 2
    }).setOrigin(0.5);

    const enterZone = this.add.zone(w / 2, my + mh - 40, mw - 40, 40).setInteractive({ useHandCursor: true });
    enterZone.on('pointerdown', () => {
      this._modal?.destroy();
      this._enterRift(rift);
    });

    // Botón cerrar
    const closeZone = this.add.zone(mx + mw - 20, my + 16, 32, 32).setInteractive({ useHandCursor: true });
    this.add.text(mx + mw - 20, my + 16, 'X', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '13px',
      color: '#5a6a85', resolution: 2
    }).setOrigin(0.5);
    closeZone.on('pointerdown', () => { this._modal?.destroy(); this._modal = null; });

    this._modal.add([overlay, mpanel, riftG, ebtn, enterZone, closeZone]);
  }

  _enterRift(rift) {
    this.registry.set('currentRift', rift);
    this.cameras.main.fadeOut(400, 123, 47, 255);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('DungeonScene');
    });
  }

  _startTimeSystem() {
    // Actualiza la hora cada 60 segundos de juego
    this.timeTimer = this.time.addEvent({
      delay: 60000,
      callback: () => {
        this.currentTime = this._getTimePeriod();
        if (this.timeLabel) this.timeLabel.setText(this.currentTime.label);
      },
      repeat: -1
    });
  }

  _getTimePeriod() {
    const h = new Date().getHours();
    for (const [key, val] of Object.entries(TIME_PERIODS)) {
      const [start, end] = val.hours;
      if (end > 20) { // deep_night wraps around midnight
        if (h >= start || h < end % 24) return { key, ...val };
      } else {
        if (h >= start && h < end) return { key, ...val };
      }
    }
    return TIME_PERIODS.night;
  }

  _initGPS(w, h) {
    if (!navigator.geolocation) return;
    // GPS opcional
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.gpsEnabled = true;
        this._showGPSIndicator(w, h, true);
      },
      () => { this._showGPSIndicator(w, h, false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }

  _showGPSIndicator(w, h, active) {
    const g = this.add.graphics();
    g.fillStyle(active ? 0x00ffb2 : 0xff3a6e, 0.8);
    g.fillCircle(w - 12, 12, 4);
    this.add.text(w - 20, 12, active ? 'GPS' : 'GPS', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '7px',
      color: active ? '#00ffb2' : '#ff3a6e', resolution: 2
    }).setOrigin(1, 0.5);
  }

  _onCombatWin(rewards) {
    if (!this.player) return;
    const result = this.player.gainXP(rewards.xp || 0);
    this.player.gold += rewards.gold || 0;
    if (result.leveled) globalBus.emit('player:levelUp', { level: result.newLevel });
  }

  update(time, delta) {
    // Animación sutil del fondo
  }

  destroy() {
    globalBus.off('combat:win', this._onCombatWin);
  }
}
