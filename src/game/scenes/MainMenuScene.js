/**
 * MainMenuScene — Menú principal robusto
 * Sin fillGradientStyle (usa colores sólidos), sin container.x bugs,
 * sin emojis — todo iconos SVG propios dibujados con graphics
 */
import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MainMenuScene' }); }

  create() {
    const { width: w, height: h } = this.scale;
    this.cameras.main.setBackgroundColor('#040812');
    this.cameras.main.fadeIn(500, 4, 8, 18);

    this._drawBackground(w, h);
    this._drawRiftIcon(w / 2, h * 0.18, 36);
    this._drawTitle(w, h);
    this._drawParticles(w, h);
    this._drawMenuButtons(w, h);
    this._drawFooter(w, h);
  }

  // ─── FONDO ──────────────────────────────────────────────────────
  _drawBackground(w, h) {
    const bg = this.add.graphics();
    bg.fillStyle(0x040812, 1);
    bg.fillRect(0, 0, w, h);

    // Grid sutil
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x00c8ff, 0.035);
    for (let y = 0; y < h; y += 44) grid.lineBetween(0, y, w, y);
    grid.lineStyle(1, 0x7b2fff, 0.025);
    for (let x = 0; x < w; x += 44) grid.lineBetween(x, 0, x, h);

    // Glow central
    const glow = this.add.graphics();
    glow.fillStyle(0x7b2fff, 0.07);
    glow.fillCircle(w / 2, h * 0.3, w * 0.55);
    glow.fillStyle(0x00c8ff, 0.04);
    glow.fillCircle(w / 2, h * 0.3, w * 0.3);
  }

  // ─── RIFT ICON (ojo/brecha) ────────────────────────────────────
  _drawRiftIcon(cx, cy, size) {
    const g = this.add.graphics();

    // Aura exterior
    g.lineStyle(1, 0x7b2fff, 0.3);
    g.strokeCircle(cx, cy, size * 1.5);

    // Forma de brecha (líneas en zigzag simulando curva)
    g.lineStyle(2.5, 0x00c8ff, 0.9);
    g.lineBetween(cx - size, cy, cx - size * 0.35, cy - size * 0.7);
    g.lineBetween(cx - size * 0.35, cy - size * 0.7, cx, cy);
    g.lineBetween(cx, cy, cx + size * 0.35, cy + size * 0.7);
    g.lineBetween(cx + size * 0.35, cy + size * 0.7, cx + size, cy);

    // Forma de brecha inversa
    g.lineStyle(2, 0xff3a6e, 0.6);
    g.lineBetween(cx - size, cy, cx - size * 0.35, cy + size * 0.7);
    g.lineBetween(cx - size * 0.35, cy + size * 0.7, cx, cy);
    g.lineBetween(cx, cy, cx + size * 0.35, cy - size * 0.7);
    g.lineBetween(cx + size * 0.35, cy - size * 0.7, cx + size, cy);

    // Pupila
    g.fillStyle(0x7b2fff, 0.9);
    g.fillCircle(cx, cy, size * 0.22);
    g.fillStyle(0x040812, 1);
    g.fillCircle(cx, cy, size * 0.11);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(cx - size * 0.06, cy - size * 0.06, size * 0.05);

    // Puntos laterales
    g.fillStyle(0x00c8ff, 1);
    g.fillCircle(cx - size, cy, 3.5);
    g.fillCircle(cx + size, cy, 3.5);
    g.fillStyle(0xff3a6e, 0.8);
    g.fillCircle(cx, cy - size * 0.85, 2.5);
    g.fillCircle(cx, cy + size * 0.85, 2.5);

    // Pulso de animación
    this.tweens.add({
      targets: g,
      alpha: { from: 0.75, to: 1 },
      scaleX: { from: 0.97, to: 1.03 },
      scaleY: { from: 0.97, to: 1.03 },
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    return g;
  }

  // ─── TÍTULO ─────────────────────────────────────────────────────
  _drawTitle(w, h) {
    const ty = h * 0.18 + 52;

    this.add.text(w / 2, ty, 'ABYSSAL ECHOES', {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: Math.min(28, w * 0.065) + 'px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#00c8ff',
      strokeThickness: 1,
      resolution: 2
    }).setOrigin(0.5).setAlpha(0).setName('title_main');

    this.add.text(w / 2, ty + 36, 'OF THE DEEP', {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: Math.min(12, w * 0.028) + 'px',
      fontStyle: 'bold',
      color: '#7b2fff',
      resolution: 2
    }).setOrigin(0.5).setAlpha(0).setName('title_sub');

    this.add.text(w / 2, ty + 58, 'Las Brechas han abierto el mundo', {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: Math.min(11, w * 0.026) + 'px',
      color: '#5a6a85',
      resolution: 2
    }).setOrigin(0.5).setAlpha(0).setName('title_tag');

    // Fade in suave
    this.time.delayedCall(200, () => {
      ['title_main', 'title_sub', 'title_tag'].forEach((name, i) => {
        const obj = this.children.getByName(name);
        if (obj) this.tweens.add({ targets: obj, alpha: 1, duration: 700, delay: i * 120, ease: 'Power2' });
      });
    });
  }

  // ─── PARTÍCULAS FLOTANTES ───────────────────────────────────────
  _drawParticles(w, h) {
    const colors = [0x00c8ff, 0x7b2fff, 0xff3a6e];
    for (let i = 0; i < 25; i++) {
      const px = Phaser.Math.Between(0, w);
      const py = Phaser.Math.Between(0, h);
      const sz = Phaser.Math.FloatBetween(0.8, 2.5);
      const col = colors[i % 3];
      const dot = this.add.graphics();
      dot.fillStyle(col, Phaser.Math.FloatBetween(0.15, 0.45));
      dot.fillCircle(0, 0, sz);
      dot.setPosition(px, py);

      this.tweens.add({
        targets: dot,
        y: py - Phaser.Math.Between(30, 90),
        alpha: 0,
        duration: Phaser.Math.Between(2500, 5000),
        delay: Phaser.Math.Between(0, 3000),
        repeat: -1,
        onRepeat: () => {
          dot.setPosition(Phaser.Math.Between(0, w), h + 10);
          dot.setAlpha(Phaser.Math.FloatBetween(0.15, 0.45));
        }
      });
    }
  }

  // ─── BOTONES DE MENÚ ────────────────────────────────────────────
  _drawMenuButtons(w, h) {
    const btnW  = Math.min(290, w * 0.78);
    const btnH  = 52;
    const gap   = 10;
    const startY = h * 0.44;
    const cx = w / 2;

    const items = [
      { label: 'NUEVA AVENTURA',        key: 'new_game',    accent: 0x00c8ff, primary: true },
      { label: 'CONTINUAR',             key: 'continue',    accent: 0x7b2fff, primary: false },
      { label: 'PROYECCIÓN — MODO LIBRE',key: 'free_mode',  accent: 0x00ffb2, primary: false },
      { label: 'MULTIJUGADOR LOCAL',    key: 'multiplayer', accent: 0xff3a6e, primary: false },
      { label: 'AJUSTES',               key: 'settings',    accent: 0x5a6a85, primary: false }
    ];

    items.forEach((item, i) => {
      const by = startY + i * (btnH + gap);
      this._makeButton(cx, by, btnW, btnH, item, i);
    });
  }

  _makeButton(cx, by, btnW, btnH, item, idx) {
    const x0 = cx - btnW / 2;

    // Fondo
    const bg = this.add.graphics();
    bg.fillStyle(item.primary ? 0x0d1f3c : 0x080f20, item.primary ? 0.98 : 0.92);
    bg.fillRoundedRect(x0, by, btnW, btnH, 10);

    // Borde
    const border = this.add.graphics();
    border.lineStyle(item.primary ? 1.5 : 1, item.accent, item.primary ? 0.9 : 0.35);
    border.strokeRoundedRect(x0, by, btnW, btnH, 10);

    // Barra de acento lateral
    const bar = this.add.graphics();
    bar.fillStyle(item.accent, item.primary ? 0.9 : 0.5);
    bar.fillRect(x0, by + 10, 3, btnH - 20);

    // Icono de la acción (dibujado con graphics)
    this._drawBtnIcon(x0 + 22, by + btnH / 2, item.key, item.accent);

    // Texto
    const txt = this.add.text(x0 + 38, by + btnH / 2, item.label, {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: item.primary ? '14px' : '12px',
      fontStyle: item.primary ? 'bold' : 'normal',
      color: item.primary ? '#ffffff' : '#c8d8f0',
      resolution: 2
    }).setOrigin(0, 0.5);

    // Flecha derecha
    const arrow = this.add.graphics();
    arrow.lineStyle(1.5, item.accent, item.primary ? 0.8 : 0.4);
    arrow.lineBetween(cx + btnW / 2 - 18, by + btnH / 2 - 5, cx + btnW / 2 - 10, by + btnH / 2);
    arrow.lineBetween(cx + btnW / 2 - 10, by + btnH / 2, cx + btnW / 2 - 18, by + btnH / 2 + 5);

    // Zona interactiva
    const zone = this.add.zone(cx, by + btnH / 2, btnW, btnH).setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(item.primary ? 0x112540 : 0x0d1428, 1);
      bg.fillRoundedRect(cx - btnW / 2, by, btnW, btnH, 10);
      border.clear();
      border.lineStyle(1.5, item.accent, 1);
      border.strokeRoundedRect(cx - btnW / 2, by, btnW, btnH, 10);
      txt.setColor('#ffffff');
    });

    zone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(item.primary ? 0x0d1f3c : 0x080f20, item.primary ? 0.98 : 0.92);
      bg.fillRoundedRect(cx - btnW / 2, by, btnW, btnH, 10);
      border.clear();
      border.lineStyle(item.primary ? 1.5 : 1, item.accent, item.primary ? 0.9 : 0.35);
      border.strokeRoundedRect(cx - btnW / 2, by, btnW, btnH, 10);
      txt.setColor(item.primary ? '#ffffff' : '#c8d8f0');
    });

    zone.on('pointerdown', () => {
      if (navigator.vibrate) navigator.vibrate(30);
      this._onMenuClick(item.key);
    });

    // Entrada animada en cascada
    const targets = [bg, border, bar, txt, arrow];
    targets.forEach(t => t.setAlpha(0));
    this.time.delayedCall(300 + idx * 90, () => {
      this.tweens.add({
        targets,
        alpha: 1,
        duration: 350,
        ease: 'Power2'
      });
    });
  }

  _drawBtnIcon(x, y, key, color) {
    const g = this.add.graphics();
    g.lineStyle(1.4, color, 0.75);
    switch (key) {
      case 'new_game':
        // Espada
        g.lineBetween(x - 5, y + 6, x + 5, y - 6);
        g.lineBetween(x - 3, y - 3, x + 3, y - 3);
        g.fillStyle(color, 0.6); g.fillCircle(x + 5, y - 6, 2);
        break;
      case 'continue':
        // Play triangle
        g.fillStyle(color, 0.7);
        g.fillTriangle(x - 4, y - 6, x - 4, y + 6, x + 6, y);
        break;
      case 'free_mode':
        // Ojo / proyección
        g.strokeEllipse(x, y, 14, 8);
        g.fillStyle(color, 0.8); g.fillCircle(x, y, 2.5);
        break;
      case 'multiplayer':
        // Dos personas
        g.strokeCircle(x - 3, y - 3, 3);
        g.strokeEllipse(x - 3, y + 4, 8, 5);
        g.strokeCircle(x + 3, y - 3, 3);
        break;
      case 'settings':
        // Engranaje simplificado
        g.strokeCircle(x, y, 4);
        g.lineBetween(x, y - 7, x, y - 4);
        g.lineBetween(x, y + 4, x, y + 7);
        g.lineBetween(x - 7, y, x - 4, y);
        g.lineBetween(x + 4, y, x + 7, y);
        break;
    }
  }

  // ─── FOOTER ─────────────────────────────────────────────────────
  _drawFooter(w, h) {
    const isOnline = navigator.onLine;

    this.add.text(w / 2, h - 32, 'v1.0.0  —  Los Resonadores', {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: '9px', color: '#2a3a55', resolution: 2
    }).setOrigin(0.5);

    const connDot = this.add.graphics();
    connDot.fillStyle(isOnline ? 0x00ffb2 : 0xff3a6e, 0.9);
    connDot.fillCircle(14, h - 15, 3.5);

    this.add.text(22, h - 15, isOnline ? 'EN LÍNEA' : 'MODO OFFLINE', {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: '9px', color: isOnline ? '#00ffb2' : '#ff3a6e', resolution: 2
    }).setOrigin(0, 0.5);

    window.addEventListener('online',  () => { connDot.clear(); connDot.fillStyle(0x00ffb2, 0.9); connDot.fillCircle(14, h - 15, 3.5); });
    window.addEventListener('offline', () => { connDot.clear(); connDot.fillStyle(0xff3a6e, 0.9); connDot.fillCircle(14, h - 15, 3.5); });
  }

  // ─── NAVEGACIÓN ─────────────────────────────────────────────────
  _onMenuClick(key) {
    this.cameras.main.fadeOut(280, 4, 8, 18);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      switch (key) {
        case 'new_game':    this.scene.start('CharacterCreateScene'); break;
        case 'continue':    this._loadAndContinue(); break;
        case 'free_mode':   this.scene.start('FreeModeScene'); break;
        case 'multiplayer': this.scene.start('MultiplayerScene'); break;
        case 'settings':    this.cameras.main.fadeIn(280); break;
        default:            this.cameras.main.fadeIn(280); break;
      }
    });
  }

  _loadAndContinue() {
    const storage = this.registry.get('storage');
    if (storage) {
      storage.loadPlayer().then(data => {
        if (data) {
          this.registry.set('playerData', data);
          this.scene.start('WorldMapScene');
        } else {
          this.scene.start('CharacterCreateScene');
        }
      }).catch(() => {
        this.scene.start('CharacterCreateScene');
      });
    } else {
      this.scene.start('CharacterCreateScene');
    }
  }
}
