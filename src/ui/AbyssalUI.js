/**
 * AbyssalUI — Librería de componentes UI compartidos
 * Todos los métodos son estáticos y reciben la escena como parámetro
 * Garantiza consistencia visual en todo el juego
 */
export class AbyssalUI {

  /** Fondo oscuro estándar del juego */
  static drawBg(scene, w, h, tint = 0x040812) {
    const bg = scene.add.graphics();
    bg.fillStyle(tint, 1);
    bg.fillRect(0, 0, w, h);
    // Grid sutil
    const g = scene.add.graphics();
    g.lineStyle(1, 0x00c8ff, 0.03);
    for (let y = 0; y < h; y += 44) g.lineBetween(0, y, w, y);
    g.lineStyle(1, 0x7b2fff, 0.02);
    for (let x = 0; x < w; x += 44) g.lineBetween(x, 0, x, h);
    return bg;
  }

  /** Barra superior HUD estándar */
  static drawTopBar(scene, w, title, subtitle = '') {
    const bar = scene.add.graphics();
    bar.fillStyle(0x040812, 0.96);
    bar.fillRect(0, 0, w, 54);
    bar.lineStyle(1, 0x00c8ff, 0.18);
    bar.lineBetween(0, 54, w, 54);

    scene.add.text(w / 2, 18, title, {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: '12px', fontStyle: 'bold',
      color: '#00c8ff', letterSpacing: 3, resolution: 2
    }).setOrigin(0.5);

    if (subtitle) {
      scene.add.text(w / 2, 36, subtitle, {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '9px', color: '#5a6a85', letterSpacing: 2, resolution: 2
      }).setOrigin(0.5);
    }
  }

  /** Botón primario con icono y texto */
  static drawButton(scene, x, y, w, h, label, color = 0x00c8ff, cb = null) {
    const bg = scene.add.graphics();
    bg.fillStyle(0x080f20, 0.95);
    bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    bg.lineStyle(1.5, color, 0.7);
    bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);

    const txt = scene.add.text(x, y, label, {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: '13px', fontStyle: 'bold', color: '#ffffff', resolution: 2
    }).setOrigin(0.5);

    const zone = scene.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => { bg.clear(); bg.fillStyle(color, 0.2); bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8); bg.lineStyle(2, color, 1); bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8); });
    zone.on('pointerout',  () => { bg.clear(); bg.fillStyle(0x080f20, 0.95); bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8); bg.lineStyle(1.5, color, 0.7); bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8); });
    zone.on('pointerdown', () => { if (navigator.vibrate) navigator.vibrate(25); if (cb) cb(); });
    return { bg, txt, zone };
  }

  /** Mini barra de stat (HP, MP, XP...) */
  static drawStatBar(scene, x, y, w, h, pct, color, label = '') {
    const bg = scene.add.graphics();
    bg.fillStyle(0x0a1020, 1);
    bg.fillRoundedRect(x, y, w, h, Math.floor(h / 2));
    const fill = scene.add.graphics();
    fill.fillStyle(color, 0.92);
    fill.fillRoundedRect(x, y, Math.max(2, w * Math.min(1, Math.max(0, pct))), h, Math.floor(h / 2));
    if (label) {
      scene.add.text(x - 4, y + h / 2, label, {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '8px', color: '#5a6a85', resolution: 2
      }).setOrigin(1, 0.5);
    }
    return { bg, fill };
  }

  /** Panel card oscuro con borde */
  static drawCard(scene, x, y, w, h, borderColor = 0x1a2a4a, alpha = 0.95) {
    const g = scene.add.graphics();
    g.fillStyle(0x060c1c, alpha);
    g.fillRoundedRect(x, y, w, h, 10);
    g.lineStyle(1, borderColor, 0.7);
    g.strokeRoundedRect(x, y, w, h, 10);
    return g;
  }

  /** Icono de brecha dibujado con líneas */
  static drawRift(scene, cx, cy, size, color = 0x7b2fff) {
    const g = scene.add.graphics();
    g.lineStyle(2, color, 0.9);
    g.lineBetween(cx - size, cy, cx - size * 0.35, cy - size * 0.75);
    g.lineBetween(cx - size * 0.35, cy - size * 0.75, cx, cy);
    g.lineBetween(cx, cy, cx + size * 0.35, cy + size * 0.75);
    g.lineBetween(cx + size * 0.35, cy + size * 0.75, cx + size, cy);
    g.lineStyle(1.5, color, 0.4);
    g.lineBetween(cx - size, cy, cx - size * 0.35, cy + size * 0.75);
    g.lineBetween(cx - size * 0.35, cy + size * 0.75, cx, cy);
    g.lineBetween(cx, cy, cx + size * 0.35, cy - size * 0.75);
    g.lineBetween(cx + size * 0.35, cy - size * 0.75, cx + size, cy);
    g.fillStyle(color, 0.85);
    g.fillCircle(cx, cy, size * 0.14);
    g.fillStyle(0x040812, 1);
    g.fillCircle(cx, cy, size * 0.07);
    return g;
  }

  /** Texto con efecto typewriter */
  static typewrite(scene, textObj, text, speed = 22, onComplete = null) {
    textObj.setText('');
    const chars = text.split('');
    let i = 0;
    const timer = scene.time.addEvent({
      delay: speed,
      callback: () => {
        if (i < chars.length) {
          textObj.setText(textObj.text + chars[i++]);
        } else {
          if (onComplete) onComplete();
        }
      },
      repeat: chars.length - 1
    });
    return timer;
  }

  /** Notificación flotante */
  static notify(scene, w, h, text, color = '#00c8ff', duration = 2200) {
    const notif = scene.add.text(w / 2, h * 0.12, text, {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: '12px', fontStyle: 'bold',
      color, stroke: '#040812', strokeThickness: 3,
      wordWrap: { width: w - 40 }, align: 'center', resolution: 2
    }).setOrigin(0.5).setAlpha(0).setDepth(100);

    scene.tweens.add({
      targets: notif, alpha: 1, y: h * 0.10,
      duration: 300, ease: 'Back.out',
      hold: duration,
      onComplete: () => scene.tweens.add({ targets: notif, alpha: 0, duration: 300, onComplete: () => notif.destroy() })
    });
  }

  /** Número de daño flotante */
  static floatDamage(scene, x, y, value, isCrit = false, isHeal = false) {
    const col = isHeal ? '#00ffb2' : isCrit ? '#ffd166' : '#ff3a6e';
    const prefix = isHeal ? '+' : '-';
    const txt = scene.add.text(x, y, prefix + value, {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: isCrit ? '22px' : '16px',
      fontStyle: 'bold', color: col,
      stroke: '#040812', strokeThickness: 3, resolution: 2
    }).setOrigin(0.5).setDepth(50);

    scene.tweens.add({
      targets: txt, y: y - 55, alpha: 0,
      duration: 950, ease: 'Power2',
      onComplete: () => txt.destroy()
    });
  }

  /** Fade in de múltiples objetos en cascada */
  static fadeInCascade(scene, objects, baseDelay = 200, step = 100, duration = 400) {
    objects.forEach((obj, i) => {
      if (!obj) return;
      obj.setAlpha(0);
      scene.time.delayedCall(baseDelay + i * step, () => {
        scene.tweens.add({ targets: obj, alpha: 1, duration, ease: 'Power2' });
      });
    });
  }
}
