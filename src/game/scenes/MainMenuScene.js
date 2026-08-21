/**
 * MainMenuScene — Menú principal del juego
 * Estética visual novel + dark fantasy. Sin emojis — iconos SVG propios.
 */
import Phaser from 'phaser';
import { globalBus } from '../../utils/EventBus.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MainMenuScene' }); }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#040812');

    this._drawBackground(width, height);
    this._drawLogo(width, height);
    this._drawParticles(width, height);
    this._drawMenuButtons(width, height);
    this._drawVersion(width, height);
    this._drawConnectionStatus(width, height);
    this._animateIn();
  }

  _drawBackground(w, h) {
    // Fondo degradado profundo
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x040812, 0x040812, 0x070d22, 0x070d22, 1);
    bg.fillRect(0, 0, w, h);

    // Líneas horizontales decorativas (grid de abismo)
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x00c8ff, 0.04);
    for (let y = 0; y < h; y += 40) {
      grid.lineBetween(0, y, w, y);
    }
    grid.lineStyle(1, 0x7b2fff, 0.04);
    for (let x = 0; x < w; x += 40) {
      grid.lineBetween(x, 0, x, h);
    }

    // Brillo central (rift glow)
    const glow = this.add.graphics();
    glow.fillStyle(0x7b2fff, 0.06);
    glow.fillCircle(w / 2, h * 0.35, Math.min(w, h) * 0.5);
    glow.fillStyle(0x00c8ff, 0.04);
    glow.fillCircle(w / 2, h * 0.35, Math.min(w, h) * 0.3);
  }

  _drawLogo(w, h) {
    const logoY = h * 0.18;

    // Rift icon SVG como graphics
    this._drawRiftIcon(w / 2, logoY - 10, 50);

    // Título
    this.titleText = this.add.text(w / 2, logoY + 60, 'ABYSSAL ECHOES', {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: Math.min(32, w * 0.07) + 'px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#00c8ff',
      strokeThickness: 1,
      resolution: 2
    }).setOrigin(0.5).setAlpha(0);

    this.subtitleText = this.add.text(w / 2, logoY + 100, 'OF THE DEEP', {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: Math.min(14, w * 0.03) + 'px',
      fontStyle: 'bold',
      color: '#7b2fff',
      letterSpacing: 8,
      resolution: 2
    }).setOrigin(0.5).setAlpha(0);

    this.taglineText = this.add.text(w / 2, logoY + 130, 'Las Brechas han abierto el mundo', {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: Math.min(12, w * 0.025) + 'px',
      color: 'rgba(200,216,240,0.5)',
      resolution: 2
    }).setOrigin(0.5).setAlpha(0);
  }

  _drawRiftIcon(x, y, size) {
    const g = this.add.graphics();
    // Eye/Rift shape
    g.lineStyle(2.5, 0x00c8ff, 0.9);
    g.beginPath();
    g.moveTo(x - size, y);
    g.quadraticBezierTo(x - size * 0.3, y - size * 0.7, x, y);
    g.quadraticBezierTo(x + size * 0.3, y + size * 0.7, x + size, y);
    g.strokePath();

    g.lineStyle(2.5, 0xff3a6e, 0.7);
    g.beginPath();
    g.moveTo(x - size, y);
    g.quadraticBezierTo(x - size * 0.3, y + size * 0.7, x, y);
    g.quadraticBezierTo(x + size * 0.3, y - size * 0.7, x + size, y);
    g.strokePath();

    // Pupil
    g.fillStyle(0x7b2fff, 0.8);
    g.fillCircle(x, y, size * 0.18);
    g.fillStyle(0x040812, 1);
    g.fillCircle(x, y, size * 0.09);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(x - size * 0.05, y - size * 0.05, size * 0.04);

    // Glow dots
    g.fillStyle(0x00c8ff, 0.9);
    g.fillCircle(x - size, y, 3);
    g.fillCircle(x + size, y, 3);
    g.fillStyle(0x7b2fff, 0.7);
    g.fillCircle(x, y - size * 0.7, 2);

    // Animación de parpadeo
    this.tweens.add({ targets: g, alpha: { from: 0.7, to: 1 }, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    return g;
  }

  _drawParticles(w, h) {
    // Partículas flotantes de abismo (puntos de luz)
    const particles = this.add.graphics();
    this._particles = [];

    for (let i = 0; i < 30; i++) {
      const px = Math.random() * w;
      const py = Math.random() * h;
      const size = Math.random() * 2 + 0.5;
      const color = [0x00c8ff, 0x7b2fff, 0xff3a6e][Math.floor(Math.random() * 3)];
      const dot = this.add.graphics();
      dot.fillStyle(color, Math.random() * 0.5 + 0.2);
      dot.fillCircle(0, 0, size);
      dot.setPosition(px, py);
      this._particles.push(dot);

      this.tweens.add({
        targets: dot,
        y: py - (20 + Math.random() * 60),
        alpha: { from: dot.alpha, to: 0 },
        duration: 2000 + Math.random() * 3000,
        repeat: -1,
        yoyo: false,
        delay: Math.random() * 3000,
        onRepeat: () => {
          dot.setPosition(Math.random() * w, h + 10);
          dot.setAlpha(Math.random() * 0.5 + 0.2);
        }
      });
    }
  }

  _drawMenuButtons(w, h) {
    const startY = h * 0.45;
    const btnW = Math.min(280, w * 0.75);
    const btnH = 50;
    const gap = 14;

    const buttons = [
      { label: 'NUEVA AVENTURA', key: 'new_game', primary: true },
      { label: 'CONTINUAR', key: 'continue', primary: false },
      { label: 'MODO LIBRE — PROYECCIÓN', key: 'free_mode', primary: false },
      { label: 'MULTIJUGADOR LOCAL', key: 'multiplayer', primary: false },
      { label: 'AJUSTES', key: 'settings', primary: false }
    ];

    this._menuButtons = [];

    buttons.forEach((btn, i) => {
      const bx = w / 2;
      const by = startY + i * (btnH + gap);

      // Contenedor
      const container = this.add.container(bx, by).setAlpha(0);

      // Fondo del botón
      const bg = this.add.graphics();
      if (btn.primary) {
        bg.fillGradientStyle(0x7b2fff, 0x00c8ff, 0x7b2fff, 0x00c8ff, 0.9);
      } else {
        bg.fillStyle(0x080f20, 0.92);
      }
      bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10);

      // Borde
      const border = this.add.graphics();
      border.lineStyle(1, btn.primary ? 0x00c8ff : 0x1a2a4a, 0.8);
      border.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10);

      // Texto
      const label = this.add.text(0, 0, btn.label, {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: btn.primary ? '15px' : '13px',
        fontStyle: 'bold',
        color: btn.primary ? '#ffffff' : '#c8d8f0',
        letterSpacing: btn.primary ? 3 : 1,
        resolution: 2
      }).setOrigin(0.5);

      // Indicador lateral (barra de acento)
      const accent = this.add.graphics();
      accent.fillStyle(btn.primary ? 0xffd166 : 0x7b2fff, btn.primary ? 1 : 0.6);
      accent.fillRect(-btnW / 2, -btnH / 2 + 8, 3, btnH - 16);

      container.add([bg, border, accent, label]);

      // Zona interactiva
      const zone = this.add.zone(bx, by, btnW, btnH).setInteractive({ useHandCursor: true });

      zone.on('pointerover', () => {
        this.tweens.add({ targets: container, scaleX: 1.02, scaleY: 1.02, duration: 120 });
        border.clear();
        border.lineStyle(1.5, 0x00c8ff, 1);
        border.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10);
      });

      zone.on('pointerout', () => {
        this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 120 });
        border.clear();
        border.lineStyle(1, btn.primary ? 0x00c8ff : 0x1a2a4a, 0.8);
        border.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10);
      });

      zone.on('pointerdown', () => {
        this._onMenuClick(btn.key);
        if (navigator.vibrate) navigator.vibrate(30);
      });

      this._menuButtons.push({ container, zone });
    });
  }

  _drawVersion(w, h) {
    this.versionText = this.add.text(w / 2, h - 24, 'v1.0.0 — Los Resonadores', {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: '10px',
      color: 'rgba(90,106,133,0.6)',
      resolution: 2
    }).setOrigin(0.5).setAlpha(0);
  }

  _drawConnectionStatus(w, h) {
    const isOnline = navigator.onLine;
    const color = isOnline ? '#00ffb2' : '#ff3a6e';
    const label = isOnline ? 'EN LÍNEA' : 'SIN CONEXIÓN — MODO OFFLINE ACTIVO';
    this.connStatus = this.add.text(w / 2, h - 44, label, {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: '10px',
      color,
      resolution: 2
    }).setOrigin(0.5).setAlpha(0);

    window.addEventListener('online', () => { this.connStatus?.setText('EN LÍNEA').setColor('#00ffb2'); });
    window.addEventListener('offline', () => { this.connStatus?.setText('SIN CONEXIÓN — MODO OFFLINE ACTIVO').setColor('#ff3a6e'); });
  }

  _animateIn() {
    // Cascada de aparición
    this.tweens.add({ targets: [this.titleText, this.subtitleText, this.taglineText], alpha: 1, duration: 800, delay: 200, ease: 'Power2' });

    this._menuButtons.forEach(({ container }, i) => {
      this.tweens.add({ targets: container, alpha: 1, x: { from: container.x - 30, to: container.x }, duration: 500, delay: 500 + i * 100, ease: 'Back.out' });
    });

    this.tweens.add({ targets: [this.versionText, this.connStatus], alpha: 1, duration: 600, delay: 1200 });
  }

  _onMenuClick(key) {
    this.cameras.main.fadeOut(300, 4, 8, 18);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      switch (key) {
        case 'new_game':    this.scene.start('CharacterCreateScene'); break;
        case 'continue':    this._loadAndContinue(); break;
        case 'free_mode':   this.scene.start('FreeModeScene'); break;
        case 'multiplayer': this.scene.start('MultiplayerScene'); break;
        case 'settings':    this.scene.start('SettingsScene'); break;
      }
    });
  }

  _loadAndContinue() {
    // Si no hay save, va a creación de personaje
    const storage = this.registry.get('storage');
    if (storage) {
      storage.loadPlayer().then(data => {
        if (data) {
          this.registry.set('playerData', data);
          this.scene.start('WorldMapScene');
        } else {
          this.scene.start('CharacterCreateScene');
        }
      });
    } else {
      this.scene.start('CharacterCreateScene');
    }
  }

  update() {
    // Efecto drift de partículas — ya gestionado por tweens
  }
}
