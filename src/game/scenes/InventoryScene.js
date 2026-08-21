/**
 * InventoryScene — Inventario completo del jugador
 */
import Phaser from 'phaser';
import { AbyssalUI } from '../../ui/AbyssalUI.js';

export class InventoryScene extends Phaser.Scene {
  constructor() { super({ key: 'InventoryScene' }); }

  create() {
    const { width: w, height: h } = this.scale;
    this.cameras.main.setBackgroundColor('#040812');
    this.cameras.main.fadeIn(300, 4, 8, 18);
    this.player = this.registry.get('player');
    if (this.player && typeof this.player.getEffectiveStats !== 'function') {
      this.player.getEffectiveStats = function() { return { ...this.baseStats }; };
    }
    AbyssalUI.drawBg(this, w, h);
    AbyssalUI.drawTopBar(this, w, 'INVENTARIO', 'EQUIPO Y OBJETOS');
    this._drawEquipSlots(w, h);
    this._drawItemList(w, h);
    this._drawNavBar(w, h);
  }

  _drawEquipSlots(w, h) {
    const slots = ['Arma','Armadura','Casco','Guantes','Botas','Amuleto','Anillo','Reliquia'];
    const cols = 4, slotS = Math.min(60, (w - 32) / cols);
    const startX = (w - cols * slotS - (cols - 1) * 8) / 2;
    const startY = 70;

    this.add.text(16, startY, 'EQUIPO EQUIPADO', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '9px',
      color: '#3a4a65', letterSpacing: 3, resolution: 2
    });

    slots.forEach((slot, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const sx = startX + col * (slotS + 8), sy = startY + 18 + row * (slotS + 24);
      const g = this.add.graphics();
      g.fillStyle(0x060c1c, 0.95);
      g.fillRoundedRect(sx, sy, slotS, slotS, 8);
      g.lineStyle(1, 0x1a2a4a, 0.7);
      g.strokeRoundedRect(sx, sy, slotS, slotS, 8);
      // Slot vacío
      g.lineStyle(1, 0x1a2a4a, 0.3);
      g.lineBetween(sx + 10, sy + slotS / 2, sx + slotS - 10, sy + slotS / 2);
      g.lineBetween(sx + slotS / 2, sy + 10, sx + slotS / 2, sy + slotS - 10);
      this.add.text(sx + slotS / 2, sy + slotS + 8, slot, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '7px',
        color: '#2a3a55', resolution: 2
      }).setOrigin(0.5);
    });
  }

  _drawItemList(w, h) {
    const listY = 240;
    const listH = h - listY - 80;
    AbyssalUI.drawCard(this, 12, listY, w - 24, listH);

    this.add.text(24, listY + 10, 'MOCHILA', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '9px',
      color: '#3a4a65', letterSpacing: 3, resolution: 2
    });

    this.add.text(w / 2, listY + listH / 2, 'Inventario vacío.\nExplora Brechas para encontrar objetos.', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '12px', fontStyle: 'italic',
      color: '#2a3a55', align: 'center', resolution: 2
    }).setOrigin(0.5);
  }

  _drawNavBar(w, h) {
    const g = this.add.graphics();
    g.fillStyle(0x040812, 0.97);
    g.fillRect(0, h - 60, w, 60);
    g.lineStyle(1, 0x1a2a4a, 0.6);
    g.lineBetween(0, h - 60, w, h - 60);
    AbyssalUI.drawButton(this, w / 2, h - 32, 160, 40, 'VOLVER AL MAPA', 0x7b2fff, () => {
      this.cameras.main.fadeOut(250, 4, 8, 18);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('WorldMapScene'));
    });
  }
}
