/**
 * CharacterScene — Pantalla de personaje: stats, clase, progresión, título
 */
import Phaser from 'phaser';
import { AbyssalUI } from '../../ui/AbyssalUI.js';

export class CharacterScene extends Phaser.Scene {
  constructor() { super({ key: 'CharacterScene' }); }

  create() {
    const { width: w, height: h } = this.scale;
    this.cameras.main.setBackgroundColor('#040812');
    this.cameras.main.fadeIn(300, 4, 8, 18);
    this.player = this.registry.get('player');
    AbyssalUI.drawBg(this, w, h);
    AbyssalUI.drawTopBar(this, w, 'RESONADOR', 'PERFIL Y PROGRESIÓN');
    this._drawCharInfo(w, h);
    this._drawStats(w, h);
    this._drawProgression(w, h);
    this._drawNavBar(w, h);
  }

  _drawCharInfo(w, h) {
    const p = this.player;
    const classesData = this.registry.get('classesData') || [];
    const cls = classesData.find(c => c.id === p?.classId) || {};
    const hexNum = parseInt((cls.colorHex || '#7b2fff').replace('#', ''), 16);

    AbyssalUI.drawCard(this, 12, 62, w - 24, 110, hexNum);

    // Avatar de clase
    const avatar = this.add.graphics();
    avatar.fillStyle(hexNum, 0.15);
    avatar.fillCircle(50, 117, 28);
    avatar.lineStyle(2, hexNum, 0.7);
    avatar.strokeCircle(50, 117, 28);
    // Silueta
    avatar.fillStyle(hexNum, 0.6);
    avatar.fillCircle(50, 105, 8);
    avatar.fillRect(42, 113, 16, 18);

    this.add.text(90, 72, (p?.name || 'Resonador').toUpperCase(), {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '16px', fontStyle: 'bold',
      color: '#ffffff', resolution: 2
    });
    this.add.text(90, 94, (cls.name || 'Clase').toUpperCase() + ' · NIVEL ' + (p?.level || 1), {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '10px',
      color: cls.colorHex || '#7b2fff', letterSpacing: 2, resolution: 2
    });
    this.add.text(90, 112, (p?.titleId || 'Sin título'), {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '9px',
      color: '#ffd166', resolution: 2
    });
    this.add.text(90, 128, 'FACCIÓN: LOS RESONADORES', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '8px',
      color: '#3a4a65', letterSpacing: 2, resolution: 2
    });

    // XP bar
    const xpPct = (p?.xp || 0) / (p?.xpToNext || 100);
    AbyssalUI.drawStatBar(this, 90, 148, w - 110, 6, xpPct, 0x7b2fff);
    this.add.text(90, 158, `XP: ${p?.xp || 0} / ${p?.xpToNext || 100}`, {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '8px', color: '#5a6a85', resolution: 2
    });
  }

  _drawStats(w, h) {
    AbyssalUI.drawCard(this, 12, 185, w - 24, 170, 0x1a2a4a);
    this.add.text(24, 196, 'ATRIBUTOS', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '9px',
      color: '#3a4a65', letterSpacing: 3, resolution: 2
    });

    const p = this.player;
    const stats = p?.getEffectiveStats?.() || p?.baseStats || {};
    const rows = [
      ['HP',        stats.hp   || 0, 0xd63031],
      ['MP',        stats.mp   || 0, 0x0984e3],
      ['ATAQUE',    stats.atk  || 0, 0xe17055],
      ['DEFENSA',   stats.def  || 0, 0x2980b9],
      ['VELOCIDAD', stats.spd  || 0, 0x00b894],
      ['CRÍTICO',   (stats.crit || 0) + '%', 0xffd166]
    ];
    const colW = (w - 32) / 2;
    rows.forEach(([label, val, col], i) => {
      const col_ = i % 2, row_ = Math.floor(i / 2);
      const rx = 24 + col_ * colW, ry = 214 + row_ * 40;
      this.add.text(rx, ry, label, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '9px', color: '#3a4a65', resolution: 2
      });
      this.add.text(rx, ry + 16, String(val), {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '14px', fontStyle: 'bold',
        color: '#' + col.toString(16).padStart(6, '0'), resolution: 2
      });
    });
  }

  _drawProgression(w, h) {
    const p = this.player;
    AbyssalUI.drawCard(this, 12, 368, w - 24, 100, 0x1a2a4a);
    this.add.text(24, 378, 'ESTADÍSTICAS DE EXPLORACIÓN', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '9px',
      color: '#3a4a65', letterSpacing: 2, resolution: 2
    });
    const stats = [
      ['Brechas', p?.brechesFound || 0],
      ['Mazmorras', p?.dungeonsCleared || 0],
      ['Jefes', p?.bossesDefeated || 0],
      ['Oro', p?.gold || 0]
    ];
    const cW = (w - 32) / stats.length;
    stats.forEach(([lbl, val], i) => {
      const sx = 24 + i * cW;
      this.add.text(sx, 400, String(val), {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '18px', fontStyle: 'bold',
        color: '#c8d8f0', resolution: 2
      });
      this.add.text(sx, 422, lbl, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '8px', color: '#3a4a65', resolution: 2
      });
    });
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
