/**
 * CombatEngine — Motor de combate semi por turnos
 * Gestiona: turno del jugador, IA enemiga, efectos, combos elementales, ultimates
 */
import { SeededRandom } from '../utils/SeededRandom.js';
import { globalBus } from '../utils/EventBus.js';

const ELEMENT_COMBOS = {
  'ICE+LIGHTNING': { id: 'storm_frozen', name: 'Tormenta Helada', bonusMult: 1.5, effect: 'FREEZE+PARALYZE' },
  'FIRE+WIND':     { id: 'infernal_tempest', name: 'Tempestad Infernal', bonusMult: 1.6, effect: 'BURN+BLIND' },
  'SHADOW+BLOOD':  { id: 'abyssal_binding', name: 'Atadura Abisal', bonusMult: 1.4, effect: 'CURSE+BLEED' },
  'LIGHTNING+WATER': { id: 'conductor', name: 'Conductor', bonusMult: 1.45, effect: 'PARALYZE' },
  'FIRE+ICE':      { id: 'steam_burst', name: 'Explosión de Vapor', bonusMult: 1.3, effect: 'BLIND' },
  'VOID+SHADOW':   { id: 'null_field', name: 'Campo Nulo', bonusMult: 1.7, effect: 'SILENCE+CURSE' },
  'HOLY+SHADOW':   { id: 'judgement', name: 'Juicio', bonusMult: 2.0, effect: 'PURGE_ALL' }
};

const STATUS_EFFECTS = {
  BURN:     { id: 'BURN', name: 'Quemadura', damagePerTurn: 0.05, duration: 3, color: '#ff6b35' },
  FREEZE:   { id: 'FREEZE', name: 'Congelación', skipTurn: true, duration: 2, color: '#74b9ff' },
  PARALYZE: { id: 'PARALYZE', name: 'Parálisis', skipChance: 0.5, duration: 2, color: '#fdcb6e' },
  POISON:   { id: 'POISON', name: 'Veneno', damagePerTurn: 0.08, duration: 4, color: '#55efc4' },
  BLEED:    { id: 'BLEED', name: 'Sangrado', damagePerTurn: 0.06, duration: 3, color: '#d63031' },
  SILENCE:  { id: 'SILENCE', name: 'Silencio', blockSkills: true, duration: 2, color: '#636e72' },
  CURSE:    { id: 'CURSE', name: 'Maldición', atkMod: 0.7, defMod: 0.7, duration: 3, color: '#6c5ce7' },
  BLIND:    { id: 'BLIND', name: 'Ceguera', hitChance: 0.5, duration: 2, color: '#b2bec3' },
  FRENZY:   { id: 'FRENZY', name: 'Frenesí', atkMod: 1.5, defMod: 0.5, duration: 5, color: '#e17055' }
};

export class CombatEngine {
  constructor(player, enemies, seed = null) {
    this.player = player;
    this.enemies = enemies.map((e, i) => ({ ...e, uid: `e_${i}`, currentHP: e.hp, currentMp: e.mp || 0, effects: [], cooldowns: {} }));
    this.rng = new SeededRandom(seed || Date.now());
    this.turn = 0;
    this.phase = 'PLAYER'; // PLAYER | ENEMY | EFFECT_RESOLVE
    this.log = [];
    this.lastUsedElement = null;
    this.comboWindow = 2; // turns para combo
    this.lastComboTurn = -999;
    this.isFinished = false;
    this.result = null; // WIN | LOSE | FLEE
    this.playerEffects = [];
    this.playerCooldowns = {};
  }

  // ── ACCIÓN DEL JUGADOR ──────────────────────────────
  playerAction(type, skillData = null, targetId = null) {
    if (this.phase !== 'PLAYER' || this.isFinished) return null;
    const target = targetId ? this.enemies.find(e => e.uid === targetId) : this.enemies.find(e => e.currentHP > 0);
    if (!target) return null;

    let result = null;

    switch (type) {
      case 'ATTACK':     result = this._basicAttack(target); break;
      case 'SKILL':      result = this._useSkill(skillData, target); break;
      case 'DEFEND':     result = this._defend(); break;
      case 'DODGE':      result = this._prepareDodge(); break;
      case 'ULTIMATE':   result = this._useUltimate(skillData, target); break;
      case 'FLEE':       result = this._tryFlee(); break;
    }

    if (result) {
      this.log.push(result);
      globalBus.emit('combat:playerAction', { result, turn: this.turn });
      this._checkCombo(result);
      this._advanceTurn();
    }
    return result;
  }

  _basicAttack(target) {
    const stats = this.player.getEffectiveStats();
    const isCrit = this.rng.chance(stats.crit / 100);
    let dmg = Math.floor(stats.atk * (0.9 + this.rng.float(0, 0.2)));
    if (isCrit) dmg = Math.floor(dmg * 1.8);
    dmg = this._applyDefense(dmg, target.def || 10);
    target.currentHP = Math.max(0, target.currentHP - dmg);
    this.lastUsedElement = 'PHYSICAL';
    return { type: 'ATTACK', actor: 'player', target: target.uid, damage: dmg, isCrit, element: 'PHYSICAL', text: this._attackText(target.name, dmg, isCrit) };
  }

  _useSkill(skill, target) {
    if (!skill) return null;
    if (this.playerCooldowns[skill.id] > 0) return { type: 'COOLDOWN', text: `${skill.name} aún no está lista.` };
    if (!this.player.useMana(skill.mpCost)) return { type: 'NO_MANA', text: 'No tienes suficiente maná.' };

    const stats = this.player.getEffectiveStats();
    const baseDmg = Math.floor(stats.atk * (skill.damage || 1));
    const isCrit = this.rng.chance((stats.crit + 5) / 100);
    let dmg = isCrit ? Math.floor(baseDmg * 1.8) : baseDmg;
    dmg = this._applyDefense(dmg, target.def || 10);

    // Aplicar efectos
    if (skill.effects && skill.effects.length) {
      for (const eff of skill.effects) this._applyEffect(target, eff);
    }

    target.currentHP = Math.max(0, target.currentHP - dmg);
    this.playerCooldowns[skill.id] = skill.cooldown;
    this.lastUsedElement = skill.element;
    this.lastComboTurn = this.turn;

    return { type: 'SKILL', actor: 'player', target: target.uid, skill: skill.id, damage: dmg, isCrit, element: skill.element, text: this._skillText(skill.name, target.name, dmg, isCrit) };
  }

  _useUltimate(skill, target) {
    if (!skill || !skill.tags?.includes('ULTIMATE')) return null;
    return this._useSkill(skill, target);
  }

  _defend() {
    this.player._defending = true;
    return { type: 'DEFEND', actor: 'player', text: 'Adoptas postura defensiva. El daño recibido se reduce a la mitad.' };
  }

  _prepareDodge() {
    this.player._dodging = true;
    return { type: 'DODGE', actor: 'player', text: 'Te preparas para esquivar. El próximo ataque fallará.' };
  }

  _tryFlee() {
    const chance = 0.5 + (this.player.getEffectiveStats().spd / 300);
    if (this.rng.chance(chance)) {
      this.isFinished = true;
      this.result = 'FLEE';
      return { type: 'FLEE_SUCCESS', text: 'Logras escapar de la batalla.' };
    }
    return { type: 'FLEE_FAIL', text: 'Intentas huir pero los enemigos te cortan el paso.' };
  }

  // ── TURNO ENEMIGO ──────────────────────────────
  enemyTurn() {
    if (this.phase !== 'ENEMY' || this.isFinished) return [];
    const results = [];

    for (const enemy of this.enemies.filter(e => e.currentHP > 0)) {
      const action = this._decideEnemyAction(enemy);
      const result = this._executeEnemyAction(enemy, action);
      if (result) results.push(result);
    }

    this._resolveEffects();
    this._tickCooldowns();
    this.phase = 'PLAYER';
    this.turn++;

    // Verificar fin de combate
    this._checkFinished();
    return results;
  }

  _decideEnemyAction(enemy) {
    const behavior = enemy.behavior || 'AGGRESSIVE';
    const hpPct = enemy.currentHP / enemy.hp;

    switch (behavior) {
      case 'AGGRESSIVE': return 'ATTACK';
      case 'DEFENSIVE':  return hpPct < 0.4 ? 'DEFEND' : 'ATTACK';
      case 'RANGED':     return 'SKILL';
      case 'COWARD':     return hpPct < 0.3 ? 'FLEE' : 'ATTACK';
      default:           return 'ATTACK';
    }
  }

  _executeEnemyAction(enemy, action) {
    if (action === 'ATTACK') {
      const dmg0 = Math.floor(enemy.atk * (0.85 + this.rng.float(0, 0.3)));
      let dmg = this._applyDefense(dmg0, this.player.getEffectiveStats().def);

      // Dodge
      if (this.player._dodging) {
        this.player._dodging = false;
        return { type: 'DODGE_SUCCESS', actor: enemy.uid, text: `${enemy.name} ataca — te esquivas ágilmente.` };
      }
      // Defend
      if (this.player._defending) {
        dmg = Math.floor(dmg * 0.5);
        this.player._defending = false;
      }

      const res = this.player.takeDamage(dmg);
      return { type: 'ENEMY_ATTACK', actor: enemy.uid, damage: res.damage, text: this._enemyAttackText(enemy.name, res.damage), isDead: res.isDead };
    }
    return null;
  }

  // ── UTILIDADES ──────────────────────────────
  _applyDefense(dmg, def) {
    return Math.max(1, Math.floor(dmg * (100 / (100 + def))));
  }

  _applyEffect(target, effectStr) {
    const [effectId] = effectStr.split('_');
    const template = STATUS_EFFECTS[effectId];
    if (!template) return;
    if (!target.effects) target.effects = [];
    const existing = target.effects.find(e => e.id === effectId);
    if (existing) { existing.duration = Math.max(existing.duration, template.duration); }
    else { target.effects.push({ ...template }); }
  }

  _resolveEffects() {
    // Efectos sobre enemigos
    for (const enemy of this.enemies.filter(e => e.currentHP > 0)) {
      if (!enemy.effects) continue;
      for (const eff of [...enemy.effects]) {
        if (eff.damagePerTurn) {
          const dmg = Math.floor(enemy.hp * eff.damagePerTurn);
          enemy.currentHP = Math.max(0, enemy.currentHP - dmg);
          this.log.push({ type: 'EFFECT_DMG', target: enemy.uid, effect: eff.id, damage: dmg, text: `${enemy.name} sufre ${dmg} de daño por ${eff.name}.` });
        }
        eff.duration--;
      }
      enemy.effects = enemy.effects.filter(e => e.duration > 0);
    }
  }

  _tickCooldowns() {
    for (const key of Object.keys(this.playerCooldowns)) {
      if (this.playerCooldowns[key] > 0) this.playerCooldowns[key]--;
    }
  }

  _checkCombo(result) {
    if (!result.element || result.element === 'PHYSICAL') return;
    if (this.lastUsedElement && this.lastUsedElement !== result.element && this.turn - this.lastComboTurn <= this.comboWindow) {
      const key = [this.lastUsedElement, result.element].sort().join('+');
      const combo = ELEMENT_COMBOS[key];
      if (combo) {
        globalBus.emit('combat:combo', { combo, turn: this.turn });
        this.log.push({ type: 'COMBO', combo: combo.id, name: combo.name, text: `COMBINACION ELEMENTAL — ${combo.name}!` });
      }
    }
  }

  _checkFinished() {
    const allEnemiesDead = this.enemies.every(e => e.currentHP <= 0);
    if (allEnemiesDead) { this.isFinished = true; this.result = 'WIN'; globalBus.emit('combat:win', this._calcRewards()); }
    else if (!this.player.isAlive()) { this.isFinished = true; this.result = 'LOSE'; globalBus.emit('combat:lose', {}); }
  }

  _advanceTurn() {
    this.phase = 'ENEMY';
  }

  _calcRewards() {
    const totalXP = this.enemies.reduce((a, e) => a + (e.xpReward?.[0] || 30), 0);
    const totalGold = this.enemies.reduce((a, e) => a + this.rng.int(10, 40), 0);
    const lootItems = [];
    for (const enemy of this.enemies) {
      if (!enemy.lootTable) continue;
      for (const itemId of enemy.lootTable) {
        if (this.rng.chance(0.3)) lootItems.push(itemId);
      }
    }
    return { xp: totalXP, gold: totalGold, items: lootItems };
  }

  // ── TEXTOS NARRATIVOS ──────────────────────────
  _attackText(enemyName, dmg, crit) {
    const crits = crit ? ['¡CRÍTICO! Tu golpe destroza defensas.', '¡Impacto crítico! El dolor se refleja en sus ojos.', '¡IMPACTO DEVASTADOR!'] : null;
    const normals = [
      `Tu espada hiere a ${enemyName} por ${dmg}.`,
      `Golpeas a ${enemyName} con precisión — ${dmg} de daño.`,
      `${enemyName} retrocede bajo tu ataque. ${dmg} de daño.`
    ];
    const pool = crit ? crits : normals;
    return pool[this.rng.int(0, pool.length - 1)];
  }

  _skillText(skillName, enemyName, dmg, crit) {
    return crit
      ? `¡${skillName} — IMPACTO CRÍTICO sobre ${enemyName}! ${dmg} de daño elemental.`
      : `${skillName} golpea a ${enemyName} por ${dmg} de daño.`;
  }

  _enemyAttackText(enemyName, dmg) {
    const pool = [
      `${enemyName} te golpea sin piedad. Recibes ${dmg} de daño.`,
      `${enemyName} lanza un ataque brutal — ${dmg} de daño.`,
      `El golpe de ${enemyName} te sacude. ${dmg} de daño.`
    ];
    return pool[this.rng.int(0, pool.length - 1)];
  }

  getState() {
    return {
      turn: this.turn, phase: this.phase, isFinished: this.isFinished, result: this.result,
      player: { hp: this.player.currentHP, maxHp: this.player.getEffectiveStats().hp, mp: this.player.currentMP, maxMp: this.player.getEffectiveStats().mp, effects: this.playerEffects },
      enemies: this.enemies.map(e => ({ uid: e.uid, name: e.name, hp: e.currentHP, maxHp: e.hp, effects: e.effects || [], level: e.level?.[0] || 1 })),
      cooldowns: this.playerCooldowns,
      lastLog: this.log.slice(-5)
    };
  }
}
