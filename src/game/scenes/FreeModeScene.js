/**
 * FreeModeScene — PROYECCIÓN / Modo Libre
 * El personaje puede explorar virtualmente desde casa.
 * Joystick virtual fijo, mapa procedural, encuentros.
 */
import Phaser from 'phaser';
import { SeededRandom } from '../../utils/SeededRandom.js';
import { globalBus } from '../../utils/EventBus.js';

export class FreeModeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FreeModeScene' });
    this.playerX = 400;
    this.playerY = 300;
    this.playerVelX = 0;
    this.playerVelY = 0;
    this.joystickActive = false;
    this.joystickCenter = { x: 0, y: 0 };
    this.joystickKnob = { x: 0, y: 0 };
    this.joystickRadius = 45;
    this.speed = 90;
    this.mapSeed = 'FREE_MODE_MAP_V1';
    this.rng = null;
    this.worldObjects = [];
    this.encounterCooldown = 0;
    this.virtualDistance = 0;
  }

  create() {
    const { width: w, height: h } = this.scale;
    this.cameras.main.setBackgroundColor('#040812');
    this.cameras.main.fadeIn(400);

    this.player = this.registry.get('player');
    this.rng = new SeededRandom(this.mapSeed);
    this.playerX = w / 2;
    this.playerY = h / 2;

    this._buildPrologue(w, h);
    this._buildMap(w, h);
    this._buildJoystick(w, h);
    this._buildHUD(w, h);
    this._spawnWorldObjects(w, h);
  }

  _buildPrologue(w, h) {
    // Overlay de proyección
    const overlay = this.add.graphics();
    overlay.fillStyle(0x7b2fff, 0.15);
    overlay.fillRect(0, 0, w, h);

    const txt = this.add.text(w / 2, h / 2, 'PROYECCIÓN ACTIVA', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '18px', fontStyle: 'bold',
      color: '#7b2fff', letterSpacing: 6, resolution: 2
    }).setOrigin(0.5);

    const sub = this.add.text(w / 2, h / 2 + 32, '"Tu conciencia atraviesa la Frontera.\nEl Reino aguarda."', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '12px', fontStyle: 'italic',
      color: 'rgba(200,216,240,0.6)', align: 'center', resolution: 2
    }).setOrigin(0.5);

    this.time.delayedCall(1800, () => {
      this.tweens.add({ targets: [overlay, txt, sub], alpha: 0, duration: 600, onComplete: () => { overlay.destroy(); txt.destroy(); sub.destroy(); } });
    });
  }

  _buildMap(w, h) {
    // Mapa procedural del Dominio de las Brechas
    this.mapLayer = this.add.graphics();
    this._generateTerrain(w, h);

    // El mundo se mueve con el jugador (scrolling)
    this.worldLayer = this.add.container(0, 0);
  }

  _generateTerrain(w, h) {
    // Tiles de terreno procedural
    const tileSize = 48;
    const cols = Math.ceil(w / tileSize) + 4;
    const rows = Math.ceil(h / tileSize) + 4;

    for (let c = -2; c < cols; c++) {
      for (let r = -2; r < rows; r++) {
        const tx = c * tileSize;
        const ty = r * tileSize;
        const v = this.rng.next();

        if (v < 0.05) {
          // Agua / vacío
          this.mapLayer.fillStyle(0x040d18, 0.9);
        } else if (v < 0.15) {
          // Roca
          this.mapLayer.fillStyle(0x0a0d18, 0.8);
        } else {
          // Suelo estándar del abismo
          this.mapLayer.fillStyle((c + r) % 2 === 0 ? 0x06080f : 0x080b14, 0.9);
        }
        this.mapLayer.fillRect(tx, ty, tileSize - 1, tileSize - 1);

        // Grid
        this.mapLayer.lineStyle(0.5, 0x1a2a4a, 0.08);
        this.mapLayer.strokeRect(tx, ty, tileSize, tileSize);
      }
    }
  }

  _spawnWorldObjects(w, h) {
    const count = 8;
    const types = ['rift', 'dungeon', 'npc', 'resource', 'mystery'];

    for (let i = 0; i < count; i++) {
      const ox = this.rng.float(60, w - 60);
      const oy = this.rng.float(100, h - 160);
      const type = this.rng.pick(types);

      const obj = this._createWorldObject(ox, oy, type, i);
      this.worldObjects.push({ x: ox, y: oy, type, obj, interacted: false });
    }

    // Spawn del jugador en el centro
    this._buildPlayerSprite(w, h);
  }

  _createWorldObject(x, y, type, idx) {
    const g = this.add.graphics();
    const colors = { rift: 0x7b2fff, dungeon: 0xd63031, npc: 0x00b894, resource: 0xffd166, mystery: 0x00c8ff };
    const col = colors[type] || 0x5a6a85;

    switch (type) {
      case 'rift':
        g.lineStyle(2, col, 0.8);
        g.beginPath();
        g.moveTo(x - 14, y); g.quadraticBezierTo(x - 4, y - 12, x, y);
        g.quadraticBezierTo(x + 4, y + 12, x + 14, y);
        g.strokePath();
        g.fillStyle(col, 0.7); g.fillCircle(x, y, 3);
        break;
      case 'dungeon':
        g.fillStyle(col, 0.2); g.fillRect(x - 12, y - 10, 24, 20);
        g.lineStyle(1.5, col, 0.7); g.strokeRect(x - 12, y - 10, 24, 20);
        g.lineStyle(1, col, 0.5); g.lineBetween(x - 5, y, x - 5, y + 10); g.lineBetween(x + 5, y, x + 5, y + 10);
        break;
      case 'npc':
        g.fillStyle(col, 0.8); g.fillCircle(x, y - 8, 6);
        g.fillStyle(col, 0.5); g.fillEllipse(x, y + 4, 14, 12);
        break;
      case 'resource':
        g.fillStyle(col, 0.7); g.fillStar(x, y, 5, 6, 12);
        break;
      case 'mystery':
        g.fillStyle(col, 0.15); g.fillCircle(x, y, 14);
        g.lineStyle(1.5, col, 0.6); g.strokeCircle(x, y, 14);
        g.lineStyle(1.5, col, 0.4); g.strokeCircle(x, y, 8);
        g.fillStyle(col, 0.8); g.fillCircle(x, y, 3);
        break;
    }

    this.add.text(x, y + 22, type.toUpperCase(), {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '7px',
      color: '#' + col.toString(16).padStart(6, '0'), resolution: 2
    }).setOrigin(0.5);

    // Pulso
    this.tweens.add({ targets: g, alpha: { from: 0.6, to: 1 }, duration: 900 + idx * 150, yoyo: true, repeat: -1 });
    return g;
  }

  _buildPlayerSprite(w, h) {
    this.playerSprite = this.add.graphics();
    this._drawPlayerAt(this.playerX, this.playerY);
    this.playerSprite.setDepth(10);
  }

  _drawPlayerAt(x, y) {
    this.playerSprite.clear();
    const col = 0x00c8ff;

    // Aura
    this.playerSprite.fillStyle(col, 0.08);
    this.playerSprite.fillCircle(x, y, 22);

    // Cuerpo
    this.playerSprite.fillStyle(0x0a1428, 0.95);
    this.playerSprite.fillEllipse(x, y, 22, 28);
    this.playerSprite.lineStyle(1.5, col, 0.8);
    this.playerSprite.strokeEllipse(x, y, 22, 28);

    // Cabeza
    this.playerSprite.fillStyle(0x0a1428, 0.95);
    this.playerSprite.fillCircle(x, y - 16, 8);
    this.playerSprite.lineStyle(1.5, col, 0.8);
    this.playerSprite.strokeCircle(x, y - 16, 8);

    // Ojos
    this.playerSprite.fillStyle(col, 0.9);
    this.playerSprite.fillCircle(x - 3, y - 17, 2);
    this.playerSprite.fillCircle(x + 3, y - 17, 2);

    // Indicador de dirección
    this.playerSprite.fillStyle(col, 0.6);
    this.playerSprite.fillTriangle(x, y - 28, x - 4, y - 22, x + 4, y - 22);
  }

  _buildJoystick(w, h) {
    const jx = 75;
    const jy = h - 90;
    this.joystickCenter = { x: jx, y: jy };

    // Base del joystick
    this.joyBase = this.add.graphics();
    this.joyBase.lineStyle(1.5, 0x00c8ff, 0.3);
    this.joyBase.strokeCircle(jx, jy, this.joystickRadius);
    this.joyBase.fillStyle(0x040812, 0.5);
    this.joyBase.fillCircle(jx, jy, this.joystickRadius);
    this.joyBase.setDepth(20);

    // Cruz del joystick
    this.joyBase.lineStyle(1, 0x00c8ff, 0.15);
    this.joyBase.lineBetween(jx, jy - this.joystickRadius, jx, jy + this.joystickRadius);
    this.joyBase.lineBetween(jx - this.joystickRadius, jy, jx + this.joystickRadius, jy);

    // Knob
    this.joyKnob = this.add.graphics();
    this.joyKnob.fillStyle(0x00c8ff, 0.6);
    this.joyKnob.fillCircle(0, 0, 20);
    this.joyKnob.lineStyle(1.5, 0x00c8ff, 0.9);
    this.joyKnob.strokeCircle(0, 0, 20);
    this.joyKnob.setPosition(jx, jy);
    this.joyKnob.setDepth(21);

    // Zona de interacción del joystick
    const joyZone = this.add.zone(jx, jy, this.joystickRadius * 2 + 20, this.joystickRadius * 2 + 20)
      .setInteractive()
      .setDepth(22);

    joyZone.on('pointerdown', (ptr) => { this.joystickActive = true; this._updateJoystick(ptr); });
    this.input.on('pointermove', (ptr) => { if (this.joystickActive) this._updateJoystick(ptr); });
    this.input.on('pointerup', () => { this.joystickActive = false; this._resetJoystick(); });
  }

  _updateJoystick(ptr) {
    const dx = ptr.x - this.joystickCenter.x;
    const dy = ptr.y - this.joystickCenter.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(dist, this.joystickRadius);
    const angle = Math.atan2(dy, dx);

    const kx = this.joystickCenter.x + Math.cos(angle) * clampedDist;
    const ky = this.joystickCenter.y + Math.sin(angle) * clampedDist;
    this.joyKnob.setPosition(kx, ky);

    const norm = clampedDist / this.joystickRadius;
    this.playerVelX = Math.cos(angle) * norm;
    this.playerVelY = Math.sin(angle) * norm;
  }

  _resetJoystick() {
    this.joyKnob.setPosition(this.joystickCenter.x, this.joystickCenter.y);
    this.playerVelX = 0;
    this.playerVelY = 0;
  }

  _buildHUD(w, h) {
    // Barra superior
    const topBar = this.add.graphics();
    topBar.fillStyle(0x040812, 0.92);
    topBar.fillRect(0, 0, w, 52);
    topBar.lineStyle(1, 0x7b2fff, 0.2);
    topBar.lineBetween(0, 52, w, 52);

    this.add.text(w / 2, 10, 'PROYECCIÓN', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '9px', fontStyle: 'bold',
      color: '#7b2fff', letterSpacing: 4, resolution: 2
    }).setOrigin(0.5);

    this.add.text(w / 2, 26, 'DOMINIO DE LAS BRECHAS', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '8px',
      color: 'rgba(200,216,240,0.4)', letterSpacing: 3, resolution: 2
    }).setOrigin(0.5);

    this.distLabel = this.add.text(w - 14, 14, 'DIST: 0m', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '9px',
      color: 'rgba(0,200,255,0.6)', resolution: 2
    }).setOrigin(1, 0);

    this.add.text(14, 14, (this.player?.name || 'Resonador').toUpperCase(), {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '10px', fontStyle: 'bold',
      color: '#c8d8f0', resolution: 2
    });

    // Botón de regreso
    const backBg = this.add.graphics();
    backBg.fillStyle(0x0d1428, 0.95);
    backBg.fillRoundedRect(w - 90, h - 52, 82, 38, 8);
    backBg.lineStyle(1, 0x1a2a4a, 0.8);
    backBg.strokeRoundedRect(w - 90, h - 52, 82, 38, 8);

    this.add.text(w - 49, h - 33, 'VOLVER', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '10px', fontStyle: 'bold',
      color: '#7b8fa0', resolution: 2
    }).setOrigin(0.5);

    const backZone = this.add.zone(w - 49, h - 33, 82, 38).setInteractive({ useHandCursor: true });
    backZone.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 4, 8, 18);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('WorldMapScene'));
    });

    topBar.setDepth(15);
  }

  _checkEncounters(x, y) {
    if (this.encounterCooldown > 0) return;
    for (const obj of this.worldObjects) {
      if (obj.interacted) continue;
      const dx = x - obj.x;
      const dy = y - obj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 30) {
        obj.interacted = true;
        this.encounterCooldown = 180;
        this._triggerObjectEvent(obj);
        break;
      }
    }
  }

  _triggerObjectEvent(obj) {
    const { width: w, height: h } = this.scale;
    if (navigator.vibrate) navigator.vibrate([40, 20, 40]);

    const messages = {
      rift: 'BRECHA DETECTADA — Energía resonante activa.',
      dungeon: '¡ENTRADA DE MAZMORRA! — ¿Entrar al Dominio?',
      npc: 'Una presencia se acerca. No parece hostil.',
      resource: 'Eco cristalizado encontrado. +15 Eco.',
      mystery: 'Algo extraño. El Eco resuena con fuerza aquí.'
    };

    const notif = this.add.text(w / 2, h * 0.75, messages[obj.type] || 'Evento detectado', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '12px',
      color: '#00c8ff', stroke: '#040812', strokeThickness: 3, wordWrap: { width: w - 40 }, align: 'center', resolution: 2
    }).setOrigin(0.5).setAlpha(0).setDepth(30);

    this.tweens.add({ targets: notif, alpha: 1, duration: 300, hold: 2000, onComplete: () => {
      this.tweens.add({ targets: notif, alpha: 0, duration: 400, onComplete: () => notif.destroy() });
    }});

    if (obj.type === 'dungeon') {
      this.time.delayedCall(400, () => {
        this.cameras.main.fadeOut(400, 4, 8, 18);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.registry.set('currentRift', { rank: 'D', type: 'FREE_MODE' });
          this.scene.start('DungeonScene');
        });
      });
    }

    if (obj.type === 'rift') {
      this.time.delayedCall(500, () => {
        this.cameras.main.fadeOut(400, 123, 47, 255);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.registry.set('currentRift', { rank: 'E', type: 'NORMAL' });
          this.scene.start('DungeonScene');
        });
      });
    }
  }

  update(time, delta) {
    if (!this.playerSprite) return;
    const dt = delta / 1000;

    // Mover jugador
    if (this.playerVelX !== 0 || this.playerVelY !== 0) {
      this.playerX += this.playerVelX * this.speed * dt;
      this.playerY += this.playerVelY * this.speed * dt;

      // Clamp en mapa
      const { width: w, height: h } = this.scale;
      this.playerX = Phaser.Math.Clamp(this.playerX, 20, w - 20);
      this.playerY = Phaser.Math.Clamp(this.playerY, 60, h - 130);

      this._drawPlayerAt(this.playerX, this.playerY);

      // Distancia virtual
      const moved = Math.sqrt(this.playerVelX * this.playerVelX + this.playerVelY * this.playerVelY) * this.speed * dt;
      this.virtualDistance += moved;
      if (this.player) this.player.virtualDistanceM = (this.player.virtualDistanceM || 0) + moved;
      if (this.distLabel) this.distLabel.setText('DIST: ' + Math.floor(this.virtualDistance) + 'm');

      // Check encuentros
      this._checkEncounters(this.playerX, this.playerY);
    }

    // Tick cooldowns
    if (this.encounterCooldown > 0) this.encounterCooldown--;
  }
}
