/**
 * CharacterCreateScene — Creación de personaje completa y robusta
 * Usa AbyssalUI, limpia correctamente entre pasos, sin bugs de objetos fantasma
 */
import Phaser from 'phaser';
import { PlayerState } from '../../player/PlayerState.js';
import { AbyssalUI } from '../../ui/AbyssalUI.js';

export class CharacterCreateScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterCreateScene' });
    this.step = 0;
    this.selectedClass = 0;
    this.selectedGender = 'custom';
    this.playerName = '';
    this._dynamicObjects = [];
    this._nameInput = null;
  }

  create() {
    const { width: w, height: h } = this.scale;
    this.cameras.main.setBackgroundColor('#040812');
    this.cameras.main.fadeIn(400, 4, 8, 18);
    this.classesData = this.registry.get('classesData') || [];

    AbyssalUI.drawBg(this, w, h);
    this._drawStaticHeader(w, h);
    this._renderStep(w, h);
  }

  // ── HEADER ESTÁTICO (nunca se redibuja) ──────────────────────────
  _drawStaticHeader(w, h) {
    const bar = this.add.graphics();
    bar.fillStyle(0x040812, 0.97);
    bar.fillRect(0, 0, w, 56);
    bar.lineStyle(1, 0x7b2fff, 0.25);
    bar.lineBetween(0, 56, w, 56);

    this.add.text(w / 2, 18, 'CREAR RESONADOR', {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: '11px', fontStyle: 'bold',
      color: '#7b2fff', letterSpacing: 5, resolution: 2
    }).setOrigin(0.5);

    // Botón volver
    const back = this.add.text(18, 18, '< ATRÁS', {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: '10px', color: '#5a6a85', resolution: 2
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    back.on('pointerover', () => back.setColor('#00c8ff'));
    back.on('pointerout',  () => back.setColor('#5a6a85'));
    back.on('pointerdown', () => {
      this._cleanup();
      this.cameras.main.fadeOut(250, 4, 8, 18);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MainMenuScene'));
    });
  }

  // ── LIMPIA TODOS LOS OBJETOS DINÁMICOS ──────────────────────────
  _cleanup() {
    for (const obj of this._dynamicObjects) {
      if (obj && obj.destroy) obj.destroy();
    }
    this._dynamicObjects = [];
    if (this._nameInput) {
      try { document.body.removeChild(this._nameInput); } catch(e){}
      this._nameInput = null;
    }
  }

  // ── ADD DINÁMICO (registra para cleanup) ───────────────────────
  _add(obj) {
    this._dynamicObjects.push(obj);
    return obj;
  }

  // ── RENDER PASO ACTUAL ──────────────────────────────────────────
  _renderStep(w, h) {
    this._cleanup();
    this._drawStepBar(w, h);
    switch (this.step) {
      case 0: this._stepName(w, h); break;
      case 1: this._stepClass(w, h); break;
      case 2: this._stepGender(w, h); break;
      case 3: this._stepConfirm(w, h); break;
    }
  }

  _drawStepBar(w, h) {
    const labels = ['NOMBRE', 'CLASE', 'APARIENCIA', 'CONFIRMAR'];
    const y = 72;
    const seg = w / labels.length;
    labels.forEach((lbl, i) => {
      const cx = seg * i + seg / 2;
      const active = i === this.step, done = i < this.step;
      const dot = this.add.graphics();
      dot.fillStyle(active ? 0x00c8ff : done ? 0x7b2fff : 0x1a2a4a, 1);
      dot.fillCircle(cx, y, active ? 7 : 5);
      this._add(dot);
      const ltext = this.add.text(cx, y + 14, lbl, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '8px',
        color: active ? '#00c8ff' : done ? '#7b2fff' : '#2a3a55', resolution: 2
      }).setOrigin(0.5);
      this._add(ltext);
      if (i < labels.length - 1) {
        const ln = this.add.graphics();
        ln.lineStyle(1, done ? 0x7b2fff : 0x1a2a4a, 0.6);
        ln.lineBetween(cx + 8, y, cx + seg - 8, y);
        this._add(ln);
      }
    });
  }

  // ─── PASO 0: NOMBRE ──────────────────────────────────────────────
  _stepName(w, h) {
    const cy = h * 0.42;

    const t1 = this.add.text(w / 2, cy - 70, '¿Cómo te llama el abismo?', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '18px', fontStyle: 'bold',
      color: '#c8d8f0', resolution: 2
    }).setOrigin(0.5).setAlpha(0);
    this._add(t1);
    this.tweens.add({ targets: t1, alpha: 1, duration: 400 });

    const t2 = this.add.text(w / 2, cy - 42, 'Este nombre resonará a través de todas las Brechas.', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '11px',
      color: '#3a4a65', resolution: 2
    }).setOrigin(0.5).setAlpha(0);
    this._add(t2);
    this.tweens.add({ targets: t2, alpha: 1, duration: 400, delay: 100 });

    // Input HTML nativo
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 20;
    input.value = this.playerName;
    input.placeholder = 'Tu nombre de Resonador';
    Object.assign(input.style, {
      position: 'fixed', left: '50%', top: (cy / h * 100) + '%',
      transform: 'translate(-50%,-50%)',
      width: Math.min(280, w * 0.78) + 'px',
      background: 'rgba(6,12,28,0.98)', border: '1px solid rgba(0,200,255,0.4)',
      borderRadius: '10px', color: '#c8d8f0', outline: 'none',
      fontFamily: 'Segoe UI,system-ui,sans-serif', fontSize: '17px',
      padding: '12px 18px', textAlign: 'center', letterSpacing: '2px',
      zIndex: '50', boxShadow: '0 0 20px rgba(0,200,255,0.1)'
    });
    input.addEventListener('focus', () => { input.style.borderColor = 'rgba(0,200,255,0.8)'; });
    input.addEventListener('blur',  () => { input.style.borderColor = 'rgba(0,200,255,0.4)'; });
    input.addEventListener('input', () => { this.playerName = input.value.trim(); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this._nextStep(w, h); });
    document.body.appendChild(input);
    this._nameInput = input;
    setTimeout(() => input.focus(), 200);

    this._drawNav(w, h, null, () => {
      const name = input.value.trim();
      if (!name) { AbyssalUI.notify(this, w, h, 'Escribe un nombre para tu Resonador', '#ff3a6e'); return; }
      this.playerName = name;
      this._nextStep(w, h);
    }, 'SIGUIENTE');
  }

  // ─── PASO 1: CLASE ───────────────────────────────────────────────
  _stepClass(w, h) {
    const cls = this.classesData[this.selectedClass] || {};
    const panelY = 100;
    const panelH = 160;
    const pW = w - 32;

    // Panel clase activa
    const hexNum = parseInt((cls.colorHex || '#7b2fff').replace('#',''), 16);

    const card = this.add.graphics();
    card.fillStyle(0x060c1c, 0.97);
    card.fillRoundedRect(16, panelY, pW, panelH, 12);
    card.lineStyle(1.5, hexNum, 0.7);
    card.strokeRoundedRect(16, panelY, pW, panelH, 12);
    this._add(card);

    const glow = this.add.graphics();
    glow.fillStyle(hexNum, 0.08);
    glow.fillRoundedRect(16, panelY, pW, panelH, 12);
    this._add(glow);

    // Icono de clase
    this._drawClassIcon(28, panelY + panelH / 2, cls, hexNum);

    // Info
    const nameT = this.add.text(70, panelY + 22, (cls.name || '').toUpperCase(), {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '17px', fontStyle: 'bold',
      color: cls.colorHex || '#7b2fff', resolution: 2
    });
    this._add(nameT);

    const roleT = this.add.text(70, panelY + 44, (cls.role || ''), {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '9px',
      color: '#00c8ff', letterSpacing: 3, resolution: 2
    });
    this._add(roleT);

    const descT = this.add.text(16, panelY + 68, cls.description || '', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '11px',
      color: '#7b8fa0', wordWrap: { width: pW - 10 }, resolution: 2
    });
    this._add(descT);

    // Barras de stats
    const stats = [
      ['HP',  (cls.baseStats?.hp  || 0) / 2000, 0xd63031],
      ['ATK', (cls.baseStats?.atk || 0) / 150,  0xe17055],
      ['DEF', (cls.baseStats?.def || 0) / 150,  0x0984e3],
      ['VEL', (cls.baseStats?.spd || 0) / 120,  0x00b894]
    ];
    const barW = (pW - 20) / stats.length - 8;
    stats.forEach(([lbl, pct, col], si) => {
      const bx = 24 + si * (barW + 8);
      const by = panelY + panelH - 28;
      const barBg = this.add.graphics();
      barBg.fillStyle(0x0a1020, 1); barBg.fillRoundedRect(bx, by, barW, 8, 3);
      this._add(barBg);
      const barFill = this.add.graphics();
      barFill.fillStyle(col, 0.9); barFill.fillRoundedRect(bx, by, barW * Math.min(1, pct), 8, 3);
      this._add(barFill);
      const lt = this.add.text(bx + barW / 2, by - 9, lbl, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '8px', color: '#3a4a65', resolution: 2
      }).setOrigin(0.5);
      this._add(lt);
    });

    // Flechas prev/next
    this._drawArrow(w, h, panelY + panelH / 2, true,  () => { this.selectedClass = (this.selectedClass - 1 + this.classesData.length) % this.classesData.length; this._renderStep(w, h); });
    this._drawArrow(w, h, panelY + panelH / 2, false, () => { this.selectedClass = (this.selectedClass + 1) % this.classesData.length; this._renderStep(w, h); });

    // Grid de clases
    const gridY = panelY + panelH + 14;
    const cols = 5;
    const cW = (w - 20) / cols;
    this.classesData.forEach((c, i) => {
      const gx = 10 + (i % cols) * cW + cW / 2;
      const gy = gridY + Math.floor(i / cols) * 38 + 18;
      const active = i === this.selectedClass;
      const ch = parseInt((c.colorHex || '#5a6a85').replace('#',''), 16);
      const dot = this.add.graphics();
      dot.fillStyle(ch, active ? 1 : 0.25);
      dot.fillCircle(gx, gy - 6, active ? 5 : 3);
      this._add(dot);
      const ct = this.add.text(gx, gy + 7, c.name || '', {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '8px',
        color: active ? '#ffffff' : '#3a4a65', resolution: 2
      }).setOrigin(0.5);
      this._add(ct);
      const z = this.add.zone(gx, gy, cW - 2, 36).setInteractive({ useHandCursor: true });
      z.on('pointerdown', () => { this.selectedClass = i; this._renderStep(w, h); });
      this._add(z);
    });

    this._drawNav(w, h, () => { this.step = 0; this._renderStep(w, h); }, () => { this.step = 2; this._renderStep(w, h); });
  }

  _drawClassIcon(x, y, cls, hexNum) {
    const g = this.add.graphics();
    g.fillStyle(hexNum, 0.15);
    g.fillCircle(x, y, 16);
    g.lineStyle(1.5, hexNum, 0.7);
    g.strokeCircle(x, y, 16);
    // Símbolo por rol
    const role = (cls.role || '').toLowerCase();
    g.lineStyle(2, hexNum, 0.9);
    if (role.includes('tank')) { g.fillStyle(hexNum, 0.7); g.fillTriangle(x, y - 10, x - 8, y + 6, x + 8, y + 6); }
    else if (role.includes('heal')) { g.lineBetween(x, y - 8, x, y + 8); g.lineBetween(x - 8, y, x + 8, y); }
    else if (role.includes('assassin') || role.includes('dps')) { g.lineBetween(x - 7, y + 7, x + 7, y - 7); g.fillStyle(hexNum, 0.7); g.fillCircle(x + 7, y - 7, 3); }
    else { g.strokeCircle(x, y, 8); g.fillStyle(hexNum, 0.6); g.fillCircle(x, y, 4); }
    this._add(g);
  }

  _drawArrow(w, h, cy, isLeft, cb) {
    const ax = isLeft ? 18 : w - 18;
    const g = this.add.graphics();
    g.lineStyle(2, 0x7b2fff, 0.8);
    if (isLeft) { g.lineBetween(ax + 6, cy - 8, ax - 2, cy); g.lineBetween(ax - 2, cy, ax + 6, cy + 8); }
    else         { g.lineBetween(ax - 6, cy - 8, ax + 2, cy); g.lineBetween(ax + 2, cy, ax - 6, cy + 8); }
    this._add(g);
    const z = this.add.zone(ax, cy, 32, 40).setInteractive({ useHandCursor: true });
    z.on('pointerdown', cb);
    this._add(z);
  }

  // ─── PASO 2: GÉNERO / APARIENCIA ────────────────────────────────
  _stepGender(w, h) {
    const t = this.add.text(w / 2, 100, 'APARIENCIA', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '15px', fontStyle: 'bold',
      color: '#c8d8f0', letterSpacing: 4, resolution: 2
    }).setOrigin(0.5).setAlpha(0);
    this._add(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 350 });

    const sub = this.add.text(w / 2, 120, 'Tu silueta en el mundo abisal', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '10px',
      color: '#3a4a65', resolution: 2
    }).setOrigin(0.5);
    this._add(sub);

    const options = [
      { id: 'masculine', label: 'MASCULINO',     desc: 'Silueta de guerrero' },
      { id: 'feminine',  label: 'FEMENINO',       desc: 'Silueta de cazadora' },
      { id: 'custom',    label: 'SIN DEFINIR',    desc: 'Solo el poder importa' }
    ];

    const optW = Math.min(260, w * 0.8);
    options.forEach((opt, i) => {
      const oy = 150 + i * 75;
      const active = this.selectedGender === opt.id;

      const card = this.add.graphics();
      card.fillStyle(active ? 0x0d1f3c : 0x060c1c, 0.97);
      card.fillRoundedRect(w / 2 - optW / 2, oy, optW, 60, 10);
      card.lineStyle(active ? 1.5 : 1, active ? 0x00c8ff : 0x1a2a4a, active ? 1 : 0.4);
      card.strokeRoundedRect(w / 2 - optW / 2, oy, optW, 60, 10);
      this._add(card);

      // Silueta
      this._drawSilhouette(this.add.graphics(), w / 2 - optW / 2 + 30, oy + 30, opt.id, active);

      const lt = this.add.text(w / 2 - optW / 2 + 55, oy + 18, opt.label, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '13px', fontStyle: 'bold',
        color: active ? '#00c8ff' : '#7b8fa0', resolution: 2
      });
      this._add(lt);

      const ld = this.add.text(w / 2 - optW / 2 + 55, oy + 38, opt.desc, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '10px',
        color: active ? '#7b8fa0' : '#2a3a55', resolution: 2
      });
      this._add(ld);

      const z = this.add.zone(w / 2, oy + 30, optW, 60).setInteractive({ useHandCursor: true });
      z.on('pointerdown', () => { this.selectedGender = opt.id; this._renderStep(w, h); });
      this._add(z);
    });

    this._drawNav(w, h, () => { this.step = 1; this._renderStep(w, h); }, () => { this.step = 3; this._renderStep(w, h); });
  }

  _drawSilhouette(g, x, y, type, active) {
    const col = active ? 0x00c8ff : 0x3a4a65;
    const alpha = active ? 0.9 : 0.4;
    g.fillStyle(col, alpha);
    g.fillCircle(x, y - 12, 7);
    if (type === 'feminine') {
      g.fillTriangle(x - 8, y - 5, x + 8, y - 5, x + 6, y + 14);
      g.fillTriangle(x - 8, y - 5, x - 6, y + 14, x + 6, y + 14);
    } else if (type === 'masculine') {
      g.fillRect(x - 9, y - 5, 18, 18);
    } else {
      g.fillCircle(x, y + 5, 11);
    }
    g.fillRect(x - 7, y + (type === 'feminine' ? 12 : 13), 5, 10);
    g.fillRect(x + 2, y + (type === 'feminine' ? 12 : 13), 5, 10);
    this._add(g);
  }

  // ─── PASO 3: CONFIRMAR ───────────────────────────────────────────
  _stepConfirm(w, h) {
    const cls = this.classesData[this.selectedClass] || {};
    const hexNum = parseInt((cls.colorHex || '#7b2fff').replace('#',''), 16);

    const header = this.add.text(w / 2, 100, 'EL ABISMO TE RECONOCE', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '13px', fontStyle: 'bold',
      color: '#7b2fff', letterSpacing: 4, resolution: 2
    }).setOrigin(0.5).setAlpha(0);
    this._add(header);
    this.tweens.add({ targets: header, alpha: 1, duration: 500 });

    const card = this.add.graphics();
    card.fillStyle(0x060c1c, 0.97);
    card.fillRoundedRect(18, 118, w - 36, 210, 12);
    card.lineStyle(1.5, hexNum, 0.5);
    card.strokeRoundedRect(18, 118, w - 36, 210, 12);
    this._add(card);

    const rows = [
      ['NOMBRE',    this.playerName || 'Resonador',                ''],
      ['CLASE',     (cls.name || '').toUpperCase(),                 cls.colorHex || '#7b2fff'],
      ['ROL',       cls.role || '',                                 '#7b8fa0'],
      ['ELEMENTO',  cls.element || '',                              '#00c8ff'],
      ['APARIENCIA',this.selectedGender.toUpperCase(),              '#7b8fa0'],
      ['FACCIÓN',   'LOS RESONADORES',                              '#ffd166']
    ];

    rows.forEach(([label, val, col], i) => {
      const ry = 132 + i * 30;
      const lt = this.add.text(32, ry, label, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '9px',
        color: '#3a4a65', letterSpacing: 2, resolution: 2
      });
      this._add(lt);
      const vt = this.add.text(w - 32, ry, val, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '11px', fontStyle: 'bold',
        color: col || '#c8d8f0', resolution: 2
      }).setOrigin(1, 0);
      this._add(vt);
      // Separador
      const sep = this.add.graphics();
      sep.lineStyle(1, 0x1a2a4a, 0.4);
      sep.lineBetween(28, ry + 20, w - 28, ry + 20);
      this._add(sep);
    });

    const quote = this.add.text(w / 2, 340, '"Las Brechas te han elegido.\nO tú las elegiste a ellas.\nEl resultado es el mismo."', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '11px', fontStyle: 'italic',
      color: '#2a3a55', align: 'center', resolution: 2
    }).setOrigin(0.5).setAlpha(0);
    this._add(quote);
    this.tweens.add({ targets: quote, alpha: 1, duration: 600, delay: 300 });

    this._drawNav(w, h,
      () => { this.step = 2; this._renderStep(w, h); },
      () => this._createCharacter(w, h),
      'COMENZAR AVENTURA', 0x00ffb2
    );
  }

  // ─── NAVEGACIÓN ─────────────────────────────────────────────────
  _nextStep(w, h) { this.step++; this._renderStep(w, h); }

  _drawNav(w, h, backCb, nextCb, nextLabel = 'SIGUIENTE', nextColor = 0x00c8ff) {
    const btnW = Math.min(240, w * 0.7);
    const by   = h - 68;

    // Botón siguiente
    const nbg = this.add.graphics();
    nbg.fillStyle(0x060c1c, 0.97);
    nbg.fillRoundedRect(w / 2 - btnW / 2, by, btnW, 48, 10);
    nbg.lineStyle(1.5, nextColor, 0.8);
    nbg.strokeRoundedRect(w / 2 - btnW / 2, by, btnW, 48, 10);
    this._add(nbg);

    const nt = this.add.text(w / 2, by + 24, nextLabel, {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '13px', fontStyle: 'bold',
      color: '#' + nextColor.toString(16).padStart(6, '0'), letterSpacing: 3, resolution: 2
    }).setOrigin(0.5);
    this._add(nt);

    const nz = this.add.zone(w / 2, by + 24, btnW, 48).setInteractive({ useHandCursor: true });
    nz.on('pointerover', () => { nbg.clear(); nbg.fillStyle(nextColor, 0.15); nbg.fillRoundedRect(w / 2 - btnW / 2, by, btnW, 48, 10); nbg.lineStyle(2, nextColor, 1); nbg.strokeRoundedRect(w / 2 - btnW / 2, by, btnW, 48, 10); });
    nz.on('pointerout',  () => { nbg.clear(); nbg.fillStyle(0x060c1c, 0.97); nbg.fillRoundedRect(w / 2 - btnW / 2, by, btnW, 48, 10); nbg.lineStyle(1.5, nextColor, 0.8); nbg.strokeRoundedRect(w / 2 - btnW / 2, by, btnW, 48, 10); });
    nz.on('pointerdown', () => { if (navigator.vibrate) navigator.vibrate(30); if (nextCb) nextCb(); });
    this._add(nz);

    if (backCb) {
      const bt = this.add.text(w / 2, h - 16, 'ATRÁS', {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '10px', color: '#3a4a65', resolution: 2
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      bt.on('pointerover', () => bt.setColor('#7b8fa0'));
      bt.on('pointerout',  () => bt.setColor('#3a4a65'));
      bt.on('pointerdown', () => { if (navigator.vibrate) navigator.vibrate(15); backCb(); });
      this._add(bt);
    }
  }

  // ─── CREAR PERSONAJE Y ARRANCAR ─────────────────────────────────
  _createCharacter(w, h) {
    const cls = this.classesData[this.selectedClass] || {};
    const skillsData = this.registry.get('skillsData') || [];

    // Asignar habilidades iniciales según la clase (máximo 6)
    const startSkills = skillsData
      .filter(s => s.class === (cls.id || 'guerrero'))
      .slice(0, 6)
      .map(s => s.id);

    const player = new PlayerState({
      name: this.playerName || 'Resonador',
      classId: cls.id || 'guerrero',
      gender: this.selectedGender,
      baseStats: { ...(cls.baseStats || {}) },
      activeSkills: startSkills,
      unlockedSkills: startSkills
    });

    this.registry.set('player', player);
    const storage = this.registry.get('storage');
    if (storage) {
      storage.savePlayer(player.serialize());
      storage.setFlag('game_started', true);
    }

    this._cleanup();
    this.cameras.main.fadeOut(500, 4, 8, 18);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('PrologueScene'));
  }

  shutdown() { this._cleanup(); }
}
