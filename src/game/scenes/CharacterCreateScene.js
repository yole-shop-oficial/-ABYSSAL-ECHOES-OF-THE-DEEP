/**
 * CharacterCreateScene — Creación de personaje
 * Selección de nombre, clase, género, apariencia. Visual novel style.
 */
import Phaser from 'phaser';
import { PlayerState } from '../../player/PlayerState.js';

export class CharacterCreateScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterCreateScene' });
    this.selectedClass = 0;
    this.selectedGender = 'custom';
    this.playerName = 'Resonador';
    this.step = 0; // 0=name, 1=class, 2=gender, 3=confirm
  }

  create() {
    const { width: w, height: h } = this.scale;
    this.cameras.main.setBackgroundColor('#040812');
    this.cameras.main.fadeIn(400);

    this.classesData = this.registry.get('classesData') || [];

    this._drawBg(w, h);
    this._drawHeader(w, h);
    this._buildStep(w, h);
  }

  _drawBg(w, h) {
    const bg = this.add.graphics();
    bg.fillStyle(0x040812, 1);
    bg.fillRect(0, 0, w, h);

    // Líneas decorativas
    const deco = this.add.graphics();
    deco.lineStyle(1, 0x7b2fff, 0.06);
    for (let y = 0; y < h; y += 50) deco.lineBetween(0, y, w, y);
  }

  _drawHeader(w, h) {
    // Barra superior con título
    const hbar = this.add.graphics();
    hbar.fillStyle(0x080f20, 0.95);
    hbar.fillRect(0, 0, w, 56);
    hbar.lineStyle(1, 0x00c8ff, 0.2);
    hbar.lineBetween(0, 56, w, 56);

    this.add.text(w / 2, 28, 'CREAR RESONADOR', {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: '13px', fontStyle: 'bold',
      color: '#00c8ff', letterSpacing: 4, resolution: 2
    }).setOrigin(0.5);

    // Botón volver
    const backZone = this.add.zone(28, 28, 48, 48).setInteractive({ useHandCursor: true });
    const backIcon = this.add.graphics();
    backIcon.lineStyle(1.8, 0x7b2fff, 0.8);
    backIcon.lineBetween(35, 28, 22, 28);
    backIcon.lineBetween(22, 28, 28, 22);
    backIcon.lineBetween(22, 28, 28, 34);
    backZone.on('pointerdown', () => {
      this.cameras.main.fadeOut(250, 4, 8, 18);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MainMenuScene'));
    });
  }

  _buildStep(w, h) {
    // Limpia contenido dinámico
    if (this._stepContainer) this._stepContainer.destroy();
    this._stepContainer = this.add.container(0, 0);

    const steps = ['NOMBRE', 'CLASE', 'GÉNERO', 'CONFIRMAR'];
    this._drawStepIndicator(w, steps);

    switch (this.step) {
      case 0: this._buildNameStep(w, h); break;
      case 1: this._buildClassStep(w, h); break;
      case 2: this._buildGenderStep(w, h); break;
      case 3: this._buildConfirmStep(w, h); break;
    }
  }

  _drawStepIndicator(w, steps) {
    const y = 74;
    const segW = w / steps.length;
    steps.forEach((s, i) => {
      const cx = segW * i + segW / 2;
      const active = i === this.step;
      const done = i < this.step;

      const circle = this.add.graphics();
      circle.fillStyle(active ? 0x00c8ff : done ? 0x7b2fff : 0x1a2a4a, active ? 1 : done ? 0.8 : 0.5);
      circle.fillCircle(cx, y, 8);

      this.add.text(cx, y + 16, s, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '8px',
        color: active ? '#00c8ff' : done ? '#7b2fff' : '#5a6a85',
        letterSpacing: 1, resolution: 2
      }).setOrigin(0.5);

      if (i < steps.length - 1) {
        const line = this.add.graphics();
        line.lineStyle(1, done ? 0x7b2fff : 0x1a2a4a, 0.6);
        line.lineBetween(cx + 8, y, cx + segW - 8, y);
      }
    });
  }

  _buildNameStep(w, h) {
    const cy = h * 0.4;
    this.add.text(w / 2, cy - 60, '¿Cómo te llama el abismo?', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '18px', fontStyle: 'bold',
      color: '#c8d8f0', resolution: 2
    }).setOrigin(0.5);

    this.add.text(w / 2, cy - 30, 'Este nombre resonará a través de todas las Brechas.', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '11px',
      color: 'rgba(200,216,240,0.5)', resolution: 2
    }).setOrigin(0.5);

    // Input HTML nativo
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Nombre de tu Resonador';
    input.value = this.playerName;
    input.maxLength = 20;
    Object.assign(input.style, {
      position: 'fixed',
      left: '50%', top: (cy / h * 100) + '%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(8,15,32,0.95)',
      border: '1px solid rgba(0,200,255,0.4)',
      borderRadius: '10px',
      color: '#c8d8f0',
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: '16px',
      padding: '12px 20px',
      width: Math.min(280, w * 0.75) + 'px',
      outline: 'none',
      textAlign: 'center',
      letterSpacing: '2px',
      zIndex: '50'
    });
    input.addEventListener('input', () => { this.playerName = input.value || 'Resonador'; });
    document.body.appendChild(input);
    input.focus();
    this._nameInput = input;

    this._drawNextButton(w, h, 'SIGUIENTE', () => {
      if (this._nameInput) { document.body.removeChild(this._nameInput); this._nameInput = null; }
      this.step = 1;
      this._buildStep(w, h);
    });
  }

  _buildClassStep(w, h) {
    this.add.text(w / 2, 105, 'ELIGE TU CLASE', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '16px', fontStyle: 'bold',
      color: '#c8d8f0', letterSpacing: 3, resolution: 2
    }).setOrigin(0.5);

    const cls = this.classesData[this.selectedClass] || this.classesData[0];
    if (!cls) return;

    const panelY = 140;
    const panelH = h - 240;

    // Panel de clase seleccionada
    const panel = this.add.graphics();
    panel.fillStyle(0x080f20, 0.95);
    panel.fillRoundedRect(16, panelY, w - 32, 120, 12);
    panel.lineStyle(1.5, 0x00c8ff, 0.5);
    panel.strokeRoundedRect(16, panelY, w - 32, 120, 12);

    // Color de clase
    const hex = parseInt(cls.colorHex.replace('#', ''), 16);
    const classGlow = this.add.graphics();
    classGlow.fillStyle(hex, 0.12);
    classGlow.fillRoundedRect(16, panelY, w - 32, 120, 12);

    this.add.text(w / 2, panelY + 20, cls.name.toUpperCase(), {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '18px', fontStyle: 'bold',
      color: cls.colorHex, letterSpacing: 3, resolution: 2
    }).setOrigin(0.5);

    this.add.text(w / 2, panelY + 44, cls.role, {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '10px',
      color: 'rgba(0,200,255,0.7)', letterSpacing: 4, resolution: 2
    }).setOrigin(0.5);

    this.add.text(w / 2, panelY + 66, cls.description, {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '11px',
      color: 'rgba(200,216,240,0.7)', wordWrap: { width: w - 64 }, align: 'center', resolution: 2
    }).setOrigin(0.5);

    // Stats bars
    const statsY = panelY + 98;
    const statKeys = [['hp', 'HP', 0xd63031], ['atk', 'ATK', 0xe17055], ['def', 'DEF', 0x0984e3], ['spd', 'VEL', 0x00b894]];
    const barW = (w - 64) / statKeys.length - 8;
    statKeys.forEach(([key, label, color], si) => {
      const bx = 24 + si * (barW + 8);
      const val = cls.baseStats[key] || 0;
      const maxVal = key === 'hp' ? 2000 : 150;
      const pct = Math.min(1, val / maxVal);

      const bg2 = this.add.graphics();
      bg2.fillStyle(0x0a1020, 1);
      bg2.fillRoundedRect(bx, statsY, barW, 10, 3);
      const fill = this.add.graphics();
      fill.fillStyle(color, 0.9);
      fill.fillRoundedRect(bx, statsY, barW * pct, 10, 3);
      this.add.text(bx + barW / 2, statsY - 8, label, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '8px',
        color: '#7b8fa0', resolution: 2
      }).setOrigin(0.5);
    });

    // Flechas de selección
    const arrowL = this.add.zone(30, panelY + 60, 44, 60).setInteractive({ useHandCursor: true });
    const arrowLG = this.add.graphics();
    arrowLG.lineStyle(2, 0x7b2fff, 0.8);
    arrowLG.lineBetween(36, panelY + 55, 22, panelY + 60);
    arrowLG.lineBetween(22, panelY + 60, 36, panelY + 65);
    arrowL.on('pointerdown', () => {
      this.selectedClass = (this.selectedClass - 1 + this.classesData.length) % this.classesData.length;
      this._buildStep(w, h);
    });

    const arrowR = this.add.zone(w - 30, panelY + 60, 44, 60).setInteractive({ useHandCursor: true });
    const arrowRG = this.add.graphics();
    arrowRG.lineStyle(2, 0x7b2fff, 0.8);
    arrowRG.lineBetween(w - 36, panelY + 55, w - 22, panelY + 60);
    arrowRG.lineBetween(w - 22, panelY + 60, w - 36, panelY + 65);
    arrowR.on('pointerdown', () => {
      this.selectedClass = (this.selectedClass + 1) % this.classesData.length;
      this._buildStep(w, h);
    });

    // Lista de clases
    const listY = panelY + 132;
    const colW = (w - 24) / 5;
    this.classesData.forEach((c, i) => {
      const cx = 12 + (i % 5) * colW + colW / 2;
      const cy2 = listY + Math.floor(i / 5) * 40 + 16;
      const active = i === this.selectedClass;
      const hex2 = parseInt(c.colorHex.replace('#', ''), 16);

      const dot = this.add.graphics();
      dot.fillStyle(hex2, active ? 1 : 0.3);
      dot.fillCircle(cx, cy2, active ? 5 : 3);

      const zone2 = this.add.zone(cx, cy2, colW, 36).setInteractive({ useHandCursor: true });
      this.add.text(cx, cy2 + 10, c.name, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '9px',
        color: active ? '#ffffff' : '#5a6a85', resolution: 2
      }).setOrigin(0.5);
      zone2.on('pointerdown', () => { this.selectedClass = i; this._buildStep(w, h); });
    });

    this._drawNextButton(w, h, 'SIGUIENTE', () => { this.step = 2; this._buildStep(w, h); });
    this._drawBackButton(w, h, () => { this.step = 0; this._buildStep(w, h); });
  }

  _buildGenderStep(w, h) {
    this.add.text(w / 2, 110, 'APARIENCIA', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '16px', fontStyle: 'bold',
      color: '#c8d8f0', letterSpacing: 3, resolution: 2
    }).setOrigin(0.5);

    this.add.text(w / 2, 132, 'Tu silueta en el mundo abisal', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '11px',
      color: 'rgba(200,216,240,0.4)', resolution: 2
    }).setOrigin(0.5);

    const options = [
      { id: 'masculine', label: 'MASCULINO' },
      { id: 'feminine', label: 'FEMENINO' },
      { id: 'custom', label: 'PERSONALIZADO' }
    ];

    const optW = Math.min(200, w * 0.55);
    options.forEach((opt, i) => {
      const oy = 180 + i * 72;
      const active = this.selectedGender === opt.id;

      const bg = this.add.graphics();
      bg.fillStyle(active ? 0x0d1f3c : 0x080f20, 0.95);
      bg.fillRoundedRect(w / 2 - optW / 2, oy, optW, 56, 10);
      bg.lineStyle(active ? 1.5 : 1, active ? 0x00c8ff : 0x1a2a4a, active ? 1 : 0.5);
      bg.strokeRoundedRect(w / 2 - optW / 2, oy, optW, 56, 10);

      // Silueta icono
      this._drawCharSilhouette(w / 2 - optW / 2 + 28, oy + 28, opt.id, active);

      this.add.text(w / 2 + 10, oy + 22, opt.label, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '12px', fontStyle: 'bold',
        color: active ? '#00c8ff' : '#7b8fa0', letterSpacing: 2, resolution: 2
      }).setOrigin(0);

      const zone = this.add.zone(w / 2, oy + 28, optW, 56).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => { this.selectedGender = opt.id; this._buildStep(w, h); });
    });

    this._drawNextButton(w, h, 'CONFIRMAR', () => { this.step = 3; this._buildStep(w, h); });
    this._drawBackButton(w, h, () => { this.step = 1; this._buildStep(w, h); });
  }

  _drawCharSilhouette(x, y, type, active) {
    const g = this.add.graphics();
    const color = active ? 0x00c8ff : 0x5a6a85;
    g.fillStyle(color, active ? 0.9 : 0.4);
    // Cabeza
    g.fillCircle(x, y - 12, 7);
    // Cuerpo
    if (type === 'feminine') {
      g.fillTriangle(x - 8, y - 5, x + 8, y - 5, x + 6, y + 12);
      g.fillTriangle(x - 8, y - 5, x - 6, y + 12, x + 6, y + 12);
    } else {
      g.fillRect(x - 8, y - 5, 16, 17);
    }
    // Piernas
    g.fillRect(x - 7, y + 12, 5, 10);
    g.fillRect(x + 2, y + 12, 5, 10);
  }

  _buildConfirmStep(w, h) {
    const cls = this.classesData[this.selectedClass] || {};
    const panelY = 100;

    this.add.text(w / 2, panelY, 'EL ABISMO TE LLAMA', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '14px', fontStyle: 'bold',
      color: '#7b2fff', letterSpacing: 4, resolution: 2
    }).setOrigin(0.5);

    const panel = this.add.graphics();
    panel.fillStyle(0x080f20, 0.95);
    panel.fillRoundedRect(20, panelY + 24, w - 40, 200, 12);
    panel.lineStyle(1, 0x7b2fff, 0.4);
    panel.strokeRoundedRect(20, panelY + 24, w - 40, 200, 12);

    const rows = [
      ['NOMBRE', this.playerName],
      ['CLASE', (cls.name || '').toUpperCase()],
      ['ROL', cls.role || ''],
      ['ELEMENTO', cls.element || ''],
      ['APARIENCIA', this.selectedGender.toUpperCase()],
      ['FACCIÓN', 'LOS RESONADORES']
    ];

    rows.forEach(([label, val], i) => {
      this.add.text(36, panelY + 44 + i * 28, label, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '10px',
        color: '#5a6a85', letterSpacing: 2, resolution: 2
      });
      this.add.text(w - 36, panelY + 44 + i * 28, val, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '11px', fontStyle: 'bold',
        color: '#c8d8f0', resolution: 2
      }).setOrigin(1, 0);
    });

    // Texto narrativo
    this.add.text(w / 2, panelY + 238, '"Las Brechas te han elegido. O tú las elegiste a ellas.\nEl resultado es el mismo."', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '11px', fontStyle: 'italic',
      color: 'rgba(200,216,240,0.4)', wordWrap: { width: w - 48 }, align: 'center', resolution: 2
    }).setOrigin(0.5);

    this._drawNextButton(w, h, 'COMENZAR AVENTURA', () => this._createAndStart());
    this._drawBackButton(w, h, () => { this.step = 2; this._buildStep(w, h); });
  }

  _drawNextButton(w, h, label, cb) {
    const by = h - 72;
    const btnW = Math.min(260, w * 0.72);
    const bg = this.add.graphics();
    bg.fillStyle(0x0d1035, 0.95);
    bg.fillRoundedRect(w / 2 - btnW / 2, by, btnW, 48, 10);

    this.add.text(w / 2, by + 24, label, {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '13px', fontStyle: 'bold',
      color: '#ffffff', letterSpacing: 3, resolution: 2
    }).setOrigin(0.5);

    const zone = this.add.zone(w / 2, by + 24, btnW, 48).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => { if (navigator.vibrate) navigator.vibrate(40); cb(); });
  }

  _drawBackButton(w, h, cb) {
    const by = h - 20;
    this.add.text(w / 2, by, 'ATRÁS', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '11px',
      color: '#5a6a85', resolution: 2
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', cb);
  }

  _createAndStart() {
    const cls = this.classesData[this.selectedClass] || {};
    const player = new PlayerState({
      name: this.playerName,
      classId: cls.id || 'guerrero',
      gender: this.selectedGender,
      baseStats: { ...cls.baseStats }
    });

    this.registry.set('player', player);

    // Guardar en storage
    const storage = this.registry.get('storage');
    if (storage) storage.savePlayer(player.serialize());

    // Flags iniciales
    if (storage) storage.setFlag('origin_chosen', true);

    this.cameras.main.fadeOut(500, 4, 8, 18);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('PrologueScene');
    });
  }

  shutdown() {
    if (this._nameInput) {
      document.body.removeChild(this._nameInput);
      this._nameInput = null;
    }
  }
}
