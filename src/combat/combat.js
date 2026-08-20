// Combat controller (sections 28-30, 36-38): real-time action with cooldowns, combos, effects
import { bus } from '../core/eventBus.js';
import { createRNG } from '../core/rng.js';
import { findCombo } from '../data/skills.js';
import { Enemy } from '../enemy/enemy.js';
import { generateLoot } from '../player/progression.js';

export class Combat {
  constructor(player, enemyDef, options = {}) {
    this.player = player;
    this.enemy = new Enemy(enemyDef, options.level || player.level, options.seed);
    this.rng = createRNG(options.seed || ((Math.random() * 1e9) | 0));
    this.dungeon = options.dungeon || null;
    this.active = true;
    this.cooldowns = {}; // skillId -> remaining
    this.lastTags = [];
    this.playerEffects = [];
    this.guarding = false;
    this.evading = false;
    this.comboCount = 0;
    this.ultimateCharge = 0;
    this.log = [];
    this.onEnd = options.onEnd || null;
  }

  get playerDead() { return this.player.isDead; }
  get enemyDead() { return this.enemy.isDead; }

  // cast a skill by id
  cast(skillId) {
    if (!this.active) return;
    const skill = this.player.skills.find(s => s.id === skillId);
    if (!skill) return;
    if ((this.cooldowns[skillId] || 0) > 0) return;
    if (this.player.mp < skill.cost) { this._log('No tienes suficiente maná.'); return; }

    if (skill.type === 'defend') { this.guarding = true; this._log('Te preparas para defender.'); this.cooldowns[skillId] = skill.cd; return; }
    if (skill.type === 'dodge') { this.evading = true; this._log('Intentas esquivar.'); this.cooldowns[skillId] = skill.cd; return; }

    // consume resource
    this.player.mp = Math.max(0, this.player.mp - skill.cost);

    // combo check
    let combo = null;
    if (skill.tags && skill.tags.length) {
      combo = findCombo(skill.tags, this.lastTags);
    }
    this.lastTags = skill.tags || this.lastTags;

    let power = skill.power || 1;
    let label = skill.name;
    if (combo) {
      power = combo.power;
      label = combo.name;
      this.comboCount++;
      this.ultimateCharge += 0.3;
      this._log('✦ COMBO: ' + combo.desc, 'combo');
    }

    // damage
    let dmg = this.player.atk * power;
    const critChance = this.player.effectiveStats.crit / 100;
    const crit = this.rng() < critChance;
    const dealt = this.enemy.takeDamage(dmg, crit);
    this._log(`${label} inflige ${dealt} de daño${crit ? ' ¡CRÍTICO!' : ''}.`);

    // apply effects
    if (skill.effects) {
      for (const e of skill.effects) {
        this.enemy.addEffect(e, 3, Math.max(2, Math.floor(this.player.atk * 0.15)));
      }
    }
    if (skill.heal) this.player.heal(skill.heal);
    if (skill.selfDamage) this.player.takeDamage(skill.selfDamage);

    this.ultimateCharge = Math.min(1, this.ultimateCharge + 0.12);
    this.cooldowns[skillId] = skill.cd;

    if (this.enemyDead) this._finish(true);
  }

  castUltimate() {
    if (this.ultimateCharge < 1) { this._log('La energía del Abismo no está llena.'); return; }
    const dmg = this.player.atk * 3.2;
    const dealt = this.enemy.takeDamage(dmg, true);
    this.enemy.addEffect('CURSE', 4, 3);
    this.ultimateCharge = 0;
    this._log('⚡ DESPERTAR DEL ABISMO: ' + dealt + ' de daño masivo!', 'ultimate');
    if (this.enemyDead) this._finish(true);
  }

  // enemy turn — call from update loop when enemy.canAct()
  enemyTurn() {
    if (!this.active) return;
    const action = this.enemy.chooseAction();
    if (action.type === 'skip') { this._log(action.message); return; }
    const base = this.enemy.atk * action.power;
    let dmg = base;
    if (this.evading) { dmg = 0; this._log('Esquivas el ataque!', 'dodge'); }
    else if (this.guarding) { dmg = Math.floor(dmg * 0.4); this._log('Bloqueas, recibes ' + dmg + ' de daño.'); }
    else dmg = Math.floor(dmg);
    if (dmg > 0) {
      this.player.takeDamage(dmg);
      this._log(action.message + ' Recibes ' + dmg + ' de daño.');
    }
    this.guarding = false;
    this.evading = false;
    if (this.playerDead) this._finish(false);
  }

  // per-frame tick (dt in seconds)
  update(dt) {
    if (!this.active) return;
    for (const id in this.cooldowns) {
      if (this.cooldowns[id] > 0) this.cooldowns[id] = Math.max(0, this.cooldowns[id] - dt);
    }
    const acted = this.enemy.tick(dt);
    if (acted) this.enemyTurn();
    // player DOT from enemy effects? (not applied to player in this version)
    bus.emit('combat:update', this.snapshot());
  }

  snapshot() {
    return {
      playerHp: this.player.hp, playerMaxHp: this.player.maxHp,
      playerMp: this.player.mp, playerMaxMp: this.player.maxMp,
      enemyHp: this.enemy.hp, enemyMaxHp: this.enemy.maxHp,
      enemyName: this.enemy.name, enemyLevel: this.enemy.level,
      enemyEffects: this.enemy.effects.map(e => e.type),
      cooldowns: { ...this.cooldowns }, ultimate: this.ultimateCharge,
      phase: this.enemy.phase, phases: this.enemy.phases, active: this.active,
      log: this.log
    };
  }

  _log(msg, kind = 'normal') {
    this.log.push({ msg, kind });
    bus.emit('combat:log', { msg, kind });
  }

  _finish(win) {
    this.active = false;
    if (win) {
      this.player.addXp(this.enemy.def.xp || 20);
      this.player.stats.encounters++;
      if (this.enemy.isBoss) { this.player.stats.bossesDefeated++; this.player.discoveries.jefes++; }
      const loot = generateLoot(this.player.level, this.rng, this.enemy.isBoss ? 2 : 1);
      loot.forEach(it => this.player.addItem(it));
      this._log('Victoria! Has ganado ' + (this.enemy.def.xp || 20) + ' XP.');
      if (this.onEnd) this.onEnd({ win: true, loot });
    } else {
      this._log('Has sido derrotado...');
      if (this.onEnd) this.onEnd({ win: false, loot: [] });
    }
    bus.emit('combat:end', { win, enemy: this.enemy, player: this.player });
  }
}
