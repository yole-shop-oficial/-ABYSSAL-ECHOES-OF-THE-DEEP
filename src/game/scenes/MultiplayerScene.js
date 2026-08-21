/**
 * MultiplayerScene — Hub de multijugador local
 * Crear sala, unirse por QR / código / auto-descubrimiento
 */
import Phaser from 'phaser';
import { AbyssalUI } from '../../ui/AbyssalUI.js';

export class MultiplayerScene extends Phaser.Scene {
  constructor() { super({ key: 'MultiplayerScene' }); }

  create() {
    const { width: w, height: h } = this.scale;
    this.cameras.main.setBackgroundColor('#040812');
    this.cameras.main.fadeIn(300, 4, 8, 18);
    AbyssalUI.drawBg(this, w, h);
    AbyssalUI.drawTopBar(this, w, 'MULTIJUGADOR LOCAL', 'SIN INTERNET — WI-FI DIRECTO');
    this._drawOptions(w, h);
    this._drawFooter(w, h);
  }

  _drawOptions(w, h) {
    const options = [
      { label: 'CREAR SALA',          desc: 'Genera un código y espera aliados',         key: 'host',  color: 0x00c8ff },
      { label: 'UNIRSE POR CÓDIGO',   desc: 'Introduce el código de sala',                key: 'join',  color: 0x7b2fff },
      { label: 'ESCANEAR QR',         desc: 'Apunta la cámara al código QR del anfitrión', key: 'qr',   color: 0x00ffb2 },
      { label: 'AUTO-DESCUBRIMIENTO', desc: 'Busca salas en la red local automáticamente', key: 'auto', color: 0xffd166 }
    ];

    const btnW = Math.min(300, w - 40);
    options.forEach((opt, i) => {
      const by = 90 + i * 86;
      const hexColor = '#' + opt.color.toString(16).padStart(6, '0');

      const card = this.add.graphics();
      card.fillStyle(0x060c1c, 0.97);
      card.fillRoundedRect(w / 2 - btnW / 2, by, btnW, 72, 12);
      card.lineStyle(1.5, opt.color, 0.5);
      card.strokeRoundedRect(w / 2 - btnW / 2, by, btnW, 72, 12);

      // Acento lateral
      const bar = this.add.graphics();
      bar.fillStyle(opt.color, 0.8);
      bar.fillRect(w / 2 - btnW / 2, by + 12, 3, 48);

      this.add.text(w / 2 - btnW / 2 + 18, by + 20, opt.label, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '13px', fontStyle: 'bold',
        color: hexColor, resolution: 2
      });
      this.add.text(w / 2 - btnW / 2 + 18, by + 42, opt.desc, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '10px',
        color: '#3a4a65', wordWrap: { width: btnW - 28 }, resolution: 2
      });

      const zone = this.add.zone(w / 2, by + 36, btnW, 72).setInteractive({ useHandCursor: true });
      zone.on('pointerover', () => { card.clear(); card.fillStyle(opt.color, 0.1); card.fillRoundedRect(w / 2 - btnW / 2, by, btnW, 72, 12); card.lineStyle(2, opt.color, 1); card.strokeRoundedRect(w / 2 - btnW / 2, by, btnW, 72, 12); });
      zone.on('pointerout',  () => { card.clear(); card.fillStyle(0x060c1c, 0.97); card.fillRoundedRect(w / 2 - btnW / 2, by, btnW, 72, 12); card.lineStyle(1.5, opt.color, 0.5); card.strokeRoundedRect(w / 2 - btnW / 2, by, btnW, 72, 12); });
      zone.on('pointerdown', () => { if (navigator.vibrate) navigator.vibrate(30); this._onAction(opt.key, w, h); });
    });
  }

  _onAction(key, w, h) {
    if (key === 'host') {
      const code = this._genCode();
      AbyssalUI.notify(this, w, h, `SALA CREADA: ${code}\nEspera a que otros escaneen el código.`, '#00c8ff', 3500);
    } else if (key === 'join') {
      AbyssalUI.notify(this, w, h, 'PRÓXIMAMENTE — Introduce el código de sala', '#7b2fff', 2500);
    } else {
      AbyssalUI.notify(this, w, h, 'PRÓXIMAMENTE — Función en desarrollo', '#ffd166', 2000);
    }
  }

  _genCode() {
    const chars = 'ABCDEFHJKLMNPQRTUVWXY0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code.slice(0, 2) + '-' + code.slice(2);
  }

  _drawFooter(w, h) {
    const g = this.add.graphics();
    g.fillStyle(0x040812, 0.97);
    g.fillRect(0, h - 60, w, 60);
    g.lineStyle(1, 0x1a2a4a, 0.6);
    g.lineBetween(0, h - 60, w, h - 60);
    AbyssalUI.drawButton(this, w / 2, h - 32, 160, 40, 'VOLVER AL MAPA', 0x5a6a85, () => {
      this.cameras.main.fadeOut(250, 4, 8, 18);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('WorldMapScene'));
    });
  }
}
