/**
 * CombatScene — Sistema de combate semi por turnos
 * Visual novel style + HUD de habilidades + narrativa reactiva
 */
import Phaser from 'phaser';
import { CombatEngine } from '../../combat/CombatEngine.js';
import { globalBus } from '../../utils/EventBus.js';

export class CombatScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CombatScene' });
    this.engine = null;
    this.selectedSkill = null;
    this.isProcessing = false;
  }

  create() {
    const { width: w, height: h } = this.scale;
    this.cameras.main.setBackgroundColor('#04080f');
    this.cameras.main.fadeIn(350, 0, 0, 0);

    this.player = this.registry.get('player');
    const room = this.registry.get('combatRoom');
    const skillsData = this.registry.get('skillsData') || [];

    // Obtener habilidades activas del jugador
    const classId = this.player?.classId || 'guerrero';
    this.activeSkills = skillsData.filter(s => s.class === classId).slice(0, 6);

    // Crear enemigos del room
    const enemies = room?.enemies || [{ id: 'sombra_fracturada', name: 'Sombra Fracturada', hp: 280, atk: 22, def: 10, spd: 45, behavior: 'AGGRESSIVE', element: 'SHADOW' }];
    const enemiesData = this.registry.get('enemiesData') || [];

    const fullEnemies = enemies.map(e => {
      const full = enemiesData.find(ed => ed.id === e.id) || {};
      return { ...full, ...e, name: full.name || e.id, currentHP: e.hp || full.hp || 200 };
    });

    this.engine = new CombatEngine(this.player, fullEnemies, Date.now());

    this._buildBg(w, h);
    this._buildEnemySection(w, h);
    this._buildNarrativeBox(w, h);
    this._buildPlayerHUD(w, h);
    this._buildSkillBar(w, h);
    this._buildActionButtons(w, h);

    this._updateDisplay();

    globalBus.on('combat:win', this._onWin, this);
    globalBus.on('combat:lose', this._onLose, this);
    globalBus.on('combat:combo', this._onCombo, this);
  }

  _buildBg(w, h) {
    const bg = this.add.graphics();
    bg.fillStyle(0x04060e, 1);
    bg.fillRect(0, 0, w, h);

    // Grid tenue
    const g = this.add.graphics();
    g.lineStyle(1, 0x7b2fff, 0.04);
    for (let y = 0; y < h; y += 45) g.lineBetween(0, y, w, y);
    for (let x = 0; x < w; x += 45) g.lineBetween(x, 0, x, h);

    // Título COMBATE
    this.add.text(w / 2, 8, '— COMBATE —', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '10px', fontStyle: 'bold',
      color: 'rgba(255,58,110,0.5)', letterSpacing: 4, resolution: 2
    }).setOrigin(0.5);
  }

  _buildEnemySection(w, h) {
    const state = this.engine.getState();
    const sectionH = h * 0.35;

    // Panel de enemigo principal
    this.enemyPanel = this.add.graphics();
    this._drawEnemyPanel(w, sectionH, state.enemies[0]);

    // Contador de enemigos si hay varios
    if (state.enemies.length > 1) {
      this.add.text(w - 14, 24, `x${state.enemies.length}`, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '12px', fontStyle: 'bold',
        color: '#ff3a6e', resolution: 2
      }).setOrigin(1, 0);
    }
  }

  _drawEnemyPanel(w, sectionH, enemy) {
    if (!enemy) return;
    this.enemyPanel.clear();

    // Fondo del enemigo
    this.enemyPanel.fillStyle(0x08040c, 0.9);
    this.enemyPanel.fillRect(0, 20, w, sectionH);

    // Nombre del enemigo
    if (!this.enemyNameText) {
      this.enemyNameText = this.add.text(w / 2, 30, '', {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '14px', fontStyle: 'bold',
        color: '#ff3a6e', letterSpacing: 3, resolution: 2
      }).setOrigin(0.5);
    }
    this.enemyNameText.setText(enemy.name?.toUpperCase() || 'ENEMIGO');

    // Nivel
    if (!this.enemyLevelText) {
      this.enemyLevelText = this.add.text(w / 2, 48, '', {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '9px',
        color: 'rgba(255,58,110,0.5)', letterSpacing: 2, resolution: 2
      }).setOrigin(0.5);
    }
    this.enemyLevelText.setText('NIVEL ' + (enemy.level || 1));

    // HP Bar del enemigo
    const hpBarW = Math.min(260, w - 40);
    if (!this.enemyHpBar) {
      const hpBg = this.add.graphics();
      hpBg.fillStyle(0x1a0408, 1);
      hpBg.fillRoundedRect(w / 2 - hpBarW / 2, 62, hpBarW, 10, 4);
      this.enemyHpBar = this.add.graphics();
      this.add.text(w / 2 - hpBarW / 2 - 4, 67, 'HP', {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '7px', color: '#5a6a85', resolution: 2
      }).setOrigin(1, 0.5);
    }
    this.enemyHpBar.clear();
    const pct = Math.max(0, enemy.hp / enemy.maxHp);
    const barColor = pct > 0.5 ? 0xd63031 : pct > 0.25 ? 0xe17055 : 0xff3a6e;
    this.enemyHpBar.fillStyle(barColor, 0.9);
    this.enemyHpBar.fillRoundedRect(w / 2 - hpBarW / 2, 62, hpBarW * pct, 10, 4);

    // HP Texto
    if (!this.enemyHpText) {
      this.enemyHpText = this.add.text(w / 2, 78, '', {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '9px',
        color: 'rgba(255,58,110,0.7)', resolution: 2
      }).setOrigin(0.5);
    }
    this.enemyHpText.setText(`${enemy.hp} / ${enemy.maxHp}`);

    // Efectos activos del enemigo
    enemy.effects?.forEach((eff, ei) => {
      const ex2 = w / 2 - (enemy.effects.length * 20) / 2 + ei * 22 + 10;
      const effG = this.add.graphics();
      const effHex = parseInt((eff.color || '#7b2fff').replace('#', ''), 16);
      effG.fillStyle(effHex, 0.7);
      effG.fillCircle(ex2, 94, 7);
      this.add.text(ex2, 106, eff.name?.slice(0, 3) || '', {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '7px', color: eff.color || '#7b2fff', resolution: 2
      }).setOrigin(0.5);
    });

    // Sprite del enemigo (icono SVG graphics)
    if (!this.enemySprite) {
      this.enemySprite = this.add.graphics();
      this._drawCombatEnemy(this.enemySprite, w / 2, sectionH * 0.65 + 20, enemy.name?.includes('Boss') || enemy.name?.includes('Guardián'));
    }
  }

  _drawCombatEnemy(g, x, y, isBoss = false) {
    const size = isBoss ? 45 : 32;
    g.fillStyle(0x1a0408, 0.95);
    g.fillEllipse(x, y, size * 2, size * 2.2);
    g.lineStyle(isBoss ? 2.5 : 1.5, 0xff3a6e, 0.7);
    g.strokeEllipse(x, y, size * 2, size * 2.2);
    g.fillStyle(0xff3a6e, 1);
    g.fillCircle(x - size * 0.28, y - size * 0.3, isBoss ? 5 : 3.5);
    g.fillCircle(x + size * 0.28, y - size * 0.3, isBoss ? 5 : 3.5);
    g.fillStyle(0x040812, 1);
    g.fillCircle(x - size * 0.28, y - size * 0.3, isBoss ? 2.5 : 1.8);
    g.fillCircle(x + size * 0.28, y - size * 0.3, isBoss ? 2.5 : 1.8);

    if (isBoss) {
      g.fillStyle(0x7b2fff, 0.3);
      g.fillCircle(x, y, size * 1.4);
    }

    this.tweens.add({ targets: g, y: g.y - 5, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  _buildNarrativeBox(w, h) {
    const boxH = 80;
    const boxY = h * 0.35 + 20;
    const bg = this.add.graphics();
    bg.fillStyle(0x060c18, 0.9);
    bg.fillRect(0, boxY, w, boxH);
    bg.lineStyle(1, 0x1a2a4a, 0.5);
    bg.lineBetween(0, boxY, w, boxY);
    bg.lineBetween(0, boxY + boxH, w, boxY + boxH);

    this.narrativeText = this.add.text(14, boxY + 10, '"Las sombras se mueven..."', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '12px', fontStyle: 'italic',
      color: '#c8d8f0', wordWrap: { width: w - 28 }, lineSpacing: 5, resolution: 2
    });
  }

  _buildPlayerHUD(w, h) {
    const hudY = h * 0.35 + 20 + 80;
    const bg = this.add.graphics();
    bg.fillStyle(0x040812, 0.95);
    bg.fillRect(0, hudY, w, 50);

    const stats = this.player?.getEffectiveStats() || {};
    const hp = this.player?.currentHP || 0;
    const maxHp = stats.hp || 1;
    const mp = this.player?.currentMP || 0;
    const maxMp = stats.mp || 1;

    const barW = w * 0.38;

    // HP
    this.playerHpBg = this.add.graphics();
    this.playerHpBg.fillStyle(0x1a0408, 1);
    this.playerHpBg.fillRoundedRect(14, hudY + 10, barW, 12, 4);
    this.playerHpFill = this.add.graphics();
    this.playerHpFill.fillStyle(0xd63031, 0.9);
    this.playerHpFill.fillRoundedRect(14, hudY + 10, barW * (hp / maxHp), 12, 4);

    this.playerHpText = this.add.text(14 + barW / 2, hudY + 16, `HP ${hp}/${maxHp}`, {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '8px', fontStyle: 'bold',
      color: '#ffffff', resolution: 2
    }).setOrigin(0.5);

    // MP
    this.playerMpBg = this.add.graphics();
    this.playerMpBg.fillStyle(0x040a1a, 1);
    this.playerMpBg.fillRoundedRect(14, hudY + 28, barW, 10, 3);
    this.playerMpFill = this.add.graphics();
    this.playerMpFill.fillStyle(0x0984e3, 0.9);
    this.playerMpFill.fillRoundedRect(14, hudY + 28, barW * (mp / maxMp), 10, 3);

    this.playerMpText = this.add.text(14 + barW / 2, hudY + 33, `MP ${mp}/${maxMp}`, {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '7px',
      color: 'rgba(255,255,255,0.7)', resolution: 2
    }).setOrigin(0.5);

    // Nombre del personaje
    this.add.text(w - 14, hudY + 10, (this.player?.name || 'Resonador').toUpperCase(), {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '11px', fontStyle: 'bold',
      color: '#c8d8f0', resolution: 2
    }).setOrigin(1, 0);

    this.add.text(w - 14, hudY + 28, 'NV.' + (this.player?.level || 1) + ' — ' + (this.player?.classId || 'guerrero').toUpperCase(), {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '8px',
      color: '#5a6a85', resolution: 2
    }).setOrigin(1, 0);
  }

  _buildSkillBar(w, h) {
    const barY = h - 130;
    const skillCount = this.activeSkills.length || 4;
    const skillW = Math.min(55, (w - 16) / skillCount);

    this.add.text(14, barY - 14, 'HABILIDADES', {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '8px',
      color: 'rgba(0,200,255,0.5)', letterSpacing: 3, resolution: 2
    });

    this.activeSkills.forEach((skill, i) => {
      const sx = 8 + i * (skillW + 4);
      const sy = barY;

      const bg = this.add.graphics();
      const elColors = { FIRE: 0xe17055, ICE: 0x74b9ff, LIGHTNING: 0xfdcb6e, SHADOW: 0x636e72, ARCANE: 0xa29bfe, PHYSICAL: 0x95a5a6, VOID: 0x2d3436 };
      const elCol = elColors[skill.element] || 0x5a6a85;
      bg.fillStyle(0x080f20, 0.95);
      bg.fillRoundedRect(sx, sy, skillW, skillW, 8);
      bg.lineStyle(1, elCol, 0.5);
      bg.strokeRoundedRect(sx, sy, skillW, skillW, 8);

      // Icono de elemento
      const ig = this.add.graphics();
      ig.lineStyle(1.5, elCol, 0.8);
      this._drawElementIcon(ig, sx + skillW / 2, sy + skillW / 2 - 8, skill.element);

      // Nombre corto
      this.add.text(sx + skillW / 2, sy + skillW - 12, skill.name?.slice(0, 6) || '', {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '7px',
        color: '#' + elCol.toString(16).padStart(6, '0'), resolution: 2
      }).setOrigin(0.5);

      // MP Cost
      this.add.text(sx + skillW - 2, sy + 2, skill.mpCost || '', {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '7px',
        color: '#0984e3', resolution: 2
      }).setOrigin(1, 0);

      const zone = this.add.zone(sx + skillW / 2, sy + skillW / 2, skillW, skillW).setInteractive({ useHandCursor: true });
      zone.on('pointerover', () => { bg.clear(); bg.fillStyle(0x0d1f3c, 0.98); bg.fillRoundedRect(sx, sy, skillW, skillW, 8); bg.lineStyle(1.5, elCol, 1); bg.strokeRoundedRect(sx, sy, skillW, skillW, 8); });
      zone.on('pointerout', () => { bg.clear(); bg.fillStyle(0x080f20, 0.95); bg.fillRoundedRect(sx, sy, skillW, skillW, 8); bg.lineStyle(1, elCol, 0.5); bg.strokeRoundedRect(sx, sy, skillW, skillW, 8); });
      zone.on('pointerdown', () => { this.selectedSkill = skill; this._doPlayerAction('SKILL'); });
    });
  }

  _drawElementIcon(g, x, y, element) {
    switch (element) {
      case 'FIRE':     g.fillStyle(0xe17055, 0.7); g.fillTriangle(x, y - 8, x - 5, y + 4, x + 5, y + 4); break;
      case 'ICE':      g.lineBetween(x, y - 8, x, y + 8); g.lineBetween(x - 7, y - 4, x + 7, y + 4); g.lineBetween(x - 7, y + 4, x + 7, y - 4); break;
      case 'LIGHTNING': g.fillStyle(0xfdcb6e, 0.8); g.fillTriangle(x + 2, y - 8, x - 4, y, x + 2, y); g.fillTriangle(x - 2, y, x + 4, y + 8, x - 2, y); break;
      case 'SHADOW':   g.fillStyle(0x636e72, 0.6); g.fillCircle(x, y, 7); g.fillStyle(0x040812, 0.8); g.fillCircle(x + 2, y - 2, 4); break;
      case 'ARCANE':   g.strokeCircle(x, y, 6); g.lineBetween(x, y - 8, x, y + 8); g.lineBetween(x - 8, y, x + 8, y); break;
      default:         g.fillStyle(0x5a6a85, 0.6); g.fillCircle(x, y, 5); break;
    }
  }

  _buildActionButtons(w, h) {
    const btnY = h - 60;
    const btns = [
      { label: 'ATACAR',   key: 'ATTACK',  col: 0xd63031 },
      { label: 'DEFENDER', key: 'DEFEND',  col: 0x0984e3 },
      { label: 'ESQUIVAR', key: 'DODGE',   col: 0x00b894 },
      { label: 'HUIR',     key: 'FLEE',    col: 0x5a6a85 }
    ];
    const bw = (w - 20) / btns.length;
    btns.forEach((btn, i) => {
      const bx = 10 + i * bw;
      const bg = this.add.graphics();
      bg.fillStyle(btn.col, 0.15);
      bg.fillRoundedRect(bx, btnY, bw - 4, 48, 8);
      bg.lineStyle(1, btn.col, 0.4);
      bg.strokeRoundedRect(bx, btnY, bw - 4, 48, 8);

      this.add.text(bx + (bw - 4) / 2, btnY + 24, btn.label, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '10px', fontStyle: 'bold',
        color: '#' + btn.col.toString(16).padStart(6, '0'), letterSpacing: 1, resolution: 2
      }).setOrigin(0.5);

      const zone = this.add.zone(bx + (bw - 4) / 2, btnY + 24, bw - 4, 48).setInteractive({ useHandCursor: true });
      zone.on('pointerover', () => { bg.clear(); bg.fillStyle(btn.col, 0.3); bg.fillRoundedRect(bx, btnY, bw - 4, 48, 8); bg.lineStyle(1.5, btn.col, 0.9); bg.strokeRoundedRect(bx, btnY, bw - 4, 48, 8); });
      zone.on('pointerout', () => { bg.clear(); bg.fillStyle(btn.col, 0.15); bg.fillRoundedRect(bx, btnY, bw - 4, 48, 8); bg.lineStyle(1, btn.col, 0.4); bg.strokeRoundedRect(bx, btnY, bw - 4, 48, 8); });
      zone.on('pointerdown', () => this._doPlayerAction(btn.key));
    });
  }

  _doPlayerAction(type) {
    if (this.isProcessing || this.engine.isFinished) return;
    this.isProcessing = true;
    if (navigator.vibrate) navigator.vibrate(25);

    const result = this.engine.playerAction(type, this.selectedSkill);
    this.selectedSkill = null;

    if (result) {
      this._setNarrative(result.text || '...');
      this._showDamageNumber(result.damage, result.isCrit, result.type === 'ENEMY_ATTACK');
      this._updateDisplay();

      if (!this.engine.isFinished) {
        this.time.delayedCall(800, () => {
          const enemyResults = this.engine.enemyTurn();
          for (const er of enemyResults) {
            if (er.text) this._setNarrative(er.text);
            if (er.damage) this._showDamageNumber(er.damage, false, true);
          }
          this._updateDisplay();
          this.isProcessing = false;
        });
      } else {
        this.isProcessing = false;
      }
    } else {
      this.isProcessing = false;
    }
  }

  _showDamageNumber(damage, isCrit, isEnemy) {
    if (!damage) return;
    const { width: w, height: h } = this.scale;
    const x = isEnemy ? w * 0.3 : w * 0.65;
    const y = isEnemy ? h * 0.55 : h * 0.35;
    const color = isCrit ? '#ffd166' : isEnemy ? '#ff3a6e' : '#ffffff';
    const size = isCrit ? '22px' : '16px';

    const dmgText = this.add.text(x, y, '-' + (damage || 0), {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: size, fontStyle: 'bold',
      color, stroke: '#040812', strokeThickness: 3, resolution: 2
    }).setOrigin(0.5);

    this.tweens.add({ targets: dmgText, y: y - 50, alpha: 0, duration: 900, ease: 'Power2', onComplete: () => dmgText.destroy() });
  }

  _setNarrative(text) {
    if (!this.narrativeText || !text) return;
    this.narrativeText.setText('"' + text + '"');
  }

  _updateDisplay() {
    if (!this.engine) return;
    const state = this.engine.getState();

    // Actualizar HP/MP del jugador
    if (this.playerHpFill) {
      this.playerHpFill.clear();
      this.playerHpFill.fillStyle(0xd63031, 0.9);
      const maxHp = state.player.maxHp;
      this.playerHpFill.fillRoundedRect(14, 0, 0, 12, 4); // placeholder recompute
    }

    // Actualizar HP del enemigo
    if (state.enemies[0]) this._drawEnemyPanel(this.scale.width, this.scale.height * 0.35, state.enemies[0]);
  }

  _onWin(rewards) {
    const { width: w, height: h } = this.scale;
    this.time.delayedCall(600, () => {
      // Overlay de victoria
      const overlay = this.add.graphics();
      overlay.fillStyle(0x040812, 0.9);
      overlay.fillRect(0, 0, w, h);

      this.add.text(w / 2, h * 0.3, '¡VICTORIA!', {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '28px', fontStyle: 'bold',
        color: '#ffd166', stroke: '#7b2fff', strokeThickness: 2, resolution: 2
      }).setOrigin(0.5);

      this.add.text(w / 2, h * 0.45, `+${rewards.xp || 0} XP    +${rewards.gold || 0} ORO`, {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '16px',
        color: '#c8d8f0', resolution: 2
      }).setOrigin(0.5);

      // Aplicar recompensas
      if (this.player) {
        const lvlResult = this.player.gainXP(rewards.xp || 0);
        this.player.gold += rewards.gold || 0;
        if (lvlResult.leveled) {
          this.add.text(w / 2, h * 0.55, `¡NIVEL ${lvlResult.newLevel}!`, {
            fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '20px', fontStyle: 'bold',
            color: '#00ffb2', resolution: 2
          }).setOrigin(0.5);
        }
      }

      const continueZone = this.add.zone(w / 2, h * 0.75, 200, 50).setInteractive({ useHandCursor: true });
      const bg2 = this.add.graphics();
      bg2.fillStyle(0x0d1035, 0.9);
      bg2.fillRoundedRect(w / 2 - 100, h * 0.75 - 25, 200, 50, 10);
      this.add.text(w / 2, h * 0.75, 'CONTINUAR', {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '14px', fontStyle: 'bold',
        color: '#ffffff', letterSpacing: 3, resolution: 2
      }).setOrigin(0.5);
      continueZone.on('pointerdown', () => {
        this.cameras.main.fadeOut(300, 4, 8, 18);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('DungeonScene'));
      });
    });
  }

  _onLose() {
    const { width: w, height: h } = this.scale;
    this.time.delayedCall(400, () => {
      const overlay = this.add.graphics();
      overlay.fillStyle(0x1a0408, 0.95);
      overlay.fillRect(0, 0, w, h);

      this.add.text(w / 2, h * 0.35, 'CAÍDO', {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '32px', fontStyle: 'bold',
        color: '#ff3a6e', resolution: 2
      }).setOrigin(0.5);

      this.add.text(w / 2, h * 0.5, '"El abismo recuerda cada caída."', {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '13px', fontStyle: 'italic',
        color: 'rgba(200,216,240,0.5)', resolution: 2
      }).setOrigin(0.5);

      const retryZone = this.add.zone(w / 2, h * 0.68, 200, 50).setInteractive({ useHandCursor: true });
      const rbg = this.add.graphics();
      rbg.fillStyle(0xd63031, 0.8); rbg.fillRoundedRect(w / 2 - 100, h * 0.68 - 25, 200, 50, 10);
      this.add.text(w / 2, h * 0.68, 'REINTENTAR', {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '14px', fontStyle: 'bold',
        color: '#ffffff', resolution: 2
      }).setOrigin(0.5);
      retryZone.on('pointerdown', () => {
        if (this.player) { this.player.currentHP = Math.floor(this.player.baseStats.hp * 0.5); }
        this.cameras.main.fadeOut(300, 4, 8, 18);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart());
      });

      const exitZone = this.add.zone(w / 2, h * 0.8, 150, 40).setInteractive({ useHandCursor: true });
      this.add.text(w / 2, h * 0.8, 'VOLVER AL MAPA', {
        fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '12px', color: '#5a6a85', resolution: 2
      }).setOrigin(0.5);
      exitZone.on('pointerdown', () => {
        this.cameras.main.fadeOut(300, 4, 8, 18);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('WorldMapScene'));
      });
    });
  }

  _onCombo(data) {
    const { width: w, height: h } = this.scale;
    const txt = this.add.text(w / 2, h * 0.45, `COMBO — ${data.combo.name}!`, {
      fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '18px', fontStyle: 'bold',
      color: '#ffd166', stroke: '#7b2fff', strokeThickness: 2, resolution: 2
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: txt, alpha: 1, y: h * 0.4, duration: 400, ease: 'Back.out', hold: 600,
      onComplete: () => this.tweens.add({ targets: txt, alpha: 0, duration: 300, onComplete: () => txt.destroy() })
    });
  }

  shutdown() {
    globalBus.off('combat:win', this._onWin);
    globalBus.off('combat:lose', this._onLose);
    globalBus.off('combat:combo', this._onCombo);
  }
}
