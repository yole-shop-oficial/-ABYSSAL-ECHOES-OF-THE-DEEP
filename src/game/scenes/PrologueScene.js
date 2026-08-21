/**
 * PrologueScene — Historia introductoria estilo visual novel
 * Narración cinematográfica + decisiones que afectan la historia
 */
import Phaser from 'phaser';
import { globalBus } from '../../utils/EventBus.js';

const BG_COLORS = {
  bg_city_night:     [0x04080f, 0x080d1a],
  bg_rift_opening:   [0x0a041a, 0x200540],
  bg_resonator_emblem: [0x040812, 0x0a0d25],
  bg_command_post:   [0x080c18, 0x0e1428],
  bg_dungeon_entry:  [0x060408, 0x120810]
};

export class PrologueScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PrologueScene' });
    this.sceneIndex = 0;
    this.scenes = [];
    this.isAnimating = false;
    this.typewriter = null;
    this.worldFlags = {};
  }

  create() {
    const { width: w, height: h } = this.scale;
    this.cameras.main.setBackgroundColor('#040812');
    this.cameras.main.fadeIn(600);

    const storyData = this.registry.get('storyData') || {};
    this.scenes = this._flattenScenes(storyData.prologue?.chapters || []);
    this.player = this.registry.get('player');

    this._buildUI(w, h);
    this._showScene(this.sceneIndex, w, h);

    // Tap/click avanza
    this.input.on('pointerdown', (ptr) => {
      if (ptr.y > h * 0.75) this._advance(w, h);
    });
  }

  _flattenScenes(chapters) {
    const all = [];
    for (const ch of chapters) {
      for (const s of ch.scenes || []) all.push(s);
    }
    return all;
  }

  _buildUI(w, h) {
    // Fondo de escena
    this.bgGraphic = this.add.graphics();
    this._setBg('bg_city_night', w, h);

    // Película grain overlay
    this.grainOverlay = this.add.graphics();
    this.grainOverlay.fillStyle(0x000000, 0.12);
    this.grainOverlay.fillRect(0, 0, w, h);

    // Barras cinematográficas (letterbox)
    this.topBar = this.add.graphics();
    this.topBar.fillStyle(0x000000, 0.85);
    this.topBar.fillRect(0, 0, w, h * 0.1);
    this.botBar = this.add.graphics();
    this.botBar.fillStyle(0x000000, 0.85);
    this.botBar.fillRect(0, h * 0.9, w, h * 0.1);

    // Panel de diálogo
    const panelH = h * 0.3;
    this.dialogPanel = this.add.graphics();
    this.dialogPanel.fillStyle(0x040812, 0.88);
    this.dialogPanel.fillRect(0, h - panelH, w, panelH);
    this.dialogPanel.lineStyle(1, 0x00c8ff, 0.15);
    this.dialogPanel.lineBetween(0, h - panelH, w, h - panelH);

    // Speaker name
    this.speakerText = this.add.text(20, h - panelH + 14, '', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '11px', fontStyle: 'bold',
      color: '#00c8ff', letterSpacing: 3, resolution: 2
    });

    // Separador speaker
    this.speakerLine = this.add.graphics();
    this.speakerLine.lineStyle(1, 0x00c8ff, 0.3);
    this.speakerLine.lineBetween(20, h - panelH + 30, w - 20, h - panelH + 30);

    // Texto de narrativa/diálogo
    this.dialogText = this.add.text(20, h - panelH + 40, '', {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: Math.min(14, w * 0.034) + 'px',
      color: '#c8d8f0',
      wordWrap: { width: w - 40 },
      lineSpacing: 6,
      resolution: 2
    });

    // Indicador de avance
    this.continueIndicator = this.add.graphics();
    this.continueIndicator.fillStyle(0x00c8ff, 0.7);
    this.continueIndicator.fillTriangle(w - 20, h - 18, w - 10, h - 10, w - 30, h - 10);
    this.tweens.add({ targets: this.continueIndicator, alpha: { from: 0.3, to: 1 }, duration: 700, yoyo: true, repeat: -1 });

    // Contenedor de opciones (para choices)
    this.choicesContainer = this.add.container(0, 0);

    // HUD minimal superior
    this._buildTopHUD(w, h);
  }

  _buildTopHUD(w, h) {
    // Nombre del juego en esquina
    this.add.text(12, 10, 'ABYSSAL ECHOES', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '8px', fontStyle: 'bold',
      color: 'rgba(0,200,255,0.4)', letterSpacing: 2, resolution: 2
    });

    // Capítulo
    this.chapterLabel = this.add.text(w - 12, 10, 'PRÓLOGO', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '8px',
      color: 'rgba(123,47,255,0.5)', letterSpacing: 2, resolution: 2
    }).setOrigin(1, 0);

    // Botón skip
    const skipZone = this.add.zone(w - 12, h * 0.1 + 8, 60, 20).setInteractive({ useHandCursor: true });
    this.add.text(w - 12, h * 0.1 + 8, 'SALTAR >', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '9px',
      color: 'rgba(90,106,133,0.5)', resolution: 2
    }).setOrigin(1, 0.5);
    skipZone.on('pointerdown', () => this._skipToGame());
  }

  _setBg(bgKey, w, h) {
    const [c1, c2] = BG_COLORS[bgKey] || [0x040812, 0x070d22];
    this.bgGraphic.clear();
    this.bgGraphic.fillGradientStyle(c1, c1, c2, c2, 1);
    this.bgGraphic.fillRect(0, 0, w, h);

    // Partícula/efecto según escena
    if (bgKey === 'bg_rift_opening') {
      this.bgGraphic.fillStyle(0x7b2fff, 0.06);
      this.bgGraphic.fillCircle(w / 2, h * 0.4, w * 0.4);
      this.bgGraphic.fillStyle(0x00c8ff, 0.04);
      this.bgGraphic.fillCircle(w / 2, h * 0.4, w * 0.25);
    }
  }

  _showScene(idx, w, h) {
    if (idx >= this.scenes.length) { this._skipToGame(); return; }
    const scene = this.scenes[idx];

    // Cambio de fondo con fade
    if (scene.bg) {
      this.cameras.main.flash(200, 0, 0, 0, false);
      this.time.delayedCall(100, () => this._setBg(scene.bg, w, h));
    }

    // Limpiar opciones previas
    this.choicesContainer.removeAll(true);
    this.continueIndicator.setVisible(true);

    if (scene.type === 'narration') {
      this.speakerText.setText('');
      this.speakerLine.setVisible(false);
      this._typewrite(scene.text);
    } else if (scene.type === 'dialogue') {
      this.speakerText.setText((scene.speaker || '').toUpperCase() + (scene.speakerRole ? ' — ' + scene.speakerRole : ''));
      this.speakerLine.setVisible(true);
      this._typewrite(scene.text);
    } else if (scene.type === 'choice') {
      this.speakerText.setText('');
      this.speakerLine.setVisible(false);
      this.dialogText.setText(scene.text);
      this._showChoices(scene.choices, w, h);
      this.continueIndicator.setVisible(false);
    } else if (scene.type === 'event') {
      this._skipToGame(); // Pasa a la escena de juego
    }
  }

  _typewrite(text) {
    this.dialogText.setText('');
    this.isAnimating = true;
    const chars = text.split('');
    let i = 0;
    if (this.typewriterTimer) this.typewriterTimer.remove();
    this.typewriterTimer = this.time.addEvent({
      delay: 22,
      callback: () => {
        if (i < chars.length) {
          this.dialogText.setText(this.dialogText.text + chars[i]);
          i++;
        } else {
          this.isAnimating = false;
        }
      },
      repeat: chars.length - 1
    });
  }

  _showChoices(choices, w, h) {
    if (!choices) return;
    const panelH = h * 0.3;
    const startY = h - panelH + 50;
    const choiceW = w - 32;

    choices.forEach((c, i) => {
      const cy = startY + i * 52;
      const bg = this.add.graphics();
      bg.fillStyle(0x0a1428, 0.95);
      bg.fillRoundedRect(16, cy, choiceW, 44, 8);
      bg.lineStyle(1, 0x7b2fff, 0.5);
      bg.strokeRoundedRect(16, cy, choiceW, 44, 8);

      const txt = this.add.text(w / 2, cy + 22, c.text, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '11px',
        color: '#c8d8f0', wordWrap: { width: choiceW - 24 }, align: 'center', resolution: 2
      }).setOrigin(0.5);

      const zone = this.add.zone(w / 2, cy + 22, choiceW, 44).setInteractive({ useHandCursor: true });
      zone.on('pointerover', () => { bg.clear(); bg.fillStyle(0x0d1f3c, 0.98); bg.fillRoundedRect(16, cy, choiceW, 44, 8); bg.lineStyle(1.5, 0x00c8ff, 1); bg.strokeRoundedRect(16, cy, choiceW, 44, 8); });
      zone.on('pointerout', () => { bg.clear(); bg.fillStyle(0x0a1428, 0.95); bg.fillRoundedRect(16, cy, choiceW, 44, 8); bg.lineStyle(1, 0x7b2fff, 0.5); bg.strokeRoundedRect(16, cy, choiceW, 44, 8); });
      zone.on('pointerdown', () => {
        if (navigator.vibrate) navigator.vibrate(30);
        this._onChoiceSelected(c);
      });

      this.choicesContainer.add([bg, txt, zone]);
    });
  }

  _onChoiceSelected(choice) {
    this.worldFlags[choice.flag] = true;
    if (this.registry.get('storage')) {
      this.registry.get('storage').setFlag(choice.flag, true);
    }
    globalBus.emit('story:choice', { choice, flags: this.worldFlags });
    this.sceneIndex++;
    const { width: w, height: h } = this.scale;
    this._showScene(this.sceneIndex, w, h);
  }

  _advance(w, h) {
    if (this.isAnimating) {
      // Completar texto al instante
      if (this.typewriterTimer) this.typewriterTimer.remove();
      const scene = this.scenes[this.sceneIndex];
      if (scene) this.dialogText.setText(scene.text || '');
      this.isAnimating = false;
      return;
    }
    this.sceneIndex++;
    this._showScene(this.sceneIndex, w, h);
  }

  _skipToGame() {
    this.cameras.main.fadeOut(500, 4, 8, 18);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('WorldMapScene');
    });
  }
}
