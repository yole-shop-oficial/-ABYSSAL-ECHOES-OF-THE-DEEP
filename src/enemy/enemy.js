// Enemy combat instance with AI behavior (sections 39-40)
import { createRNG, pick } from '../core/rng.js';

export class Enemy {
  constructor(def, level, seed) {
    this.def = def;
    this.id = def.id;
    this.name = def.name;
    this.level = level;
    this.isBoss = !!def.isBoss;
    this.tags = def.tags;
    this.color = def.color;
    this.base = { ...def.base };
    const lvlScale = 1 + (level - 1) * 0.25;
    this.maxHp = Math.max(20, Math.floor(this.base.hp * lvlScale));
    this.hp = this.maxHp;
    this.atk = this.base.atk + level * 2;
    this.defStat = this.base.def + level;
    this.spd = this.base.spd;
    this.behavior = def.behavior;
    this.phases = def.phases || 1;
    this.phase = 1;
    this.effects = []; // {type, duration, tick, power}
    this.tickTimer = 0;
    this.actTimer = this.initialAct();
    this.rng = createRNG(seed || ((Math.random() * 1e9) | 0));
    this.isDead = false;
    this.lastAction = '';
  }

  initialAct() {
    // faster enemies act sooner
    return Math.max(1.0, 3.0 - this.spd * 0.05);
  }

  takeDamage(dmg, crit = false) {
    let final = Math.max(1, Math.floor(dmg));
    if (crit) final = Math.floor(final * 1.5);
    this.hp -= final;
    if (this.hp <= 0) { this.hp = 0; this.isDead = true; }
    // phase transitions for boss
    if (this.isBoss && this.phases > 1) {
      const p = Math.max(1, Math.ceil((this.hp / this.maxHp) * this.phases));
      if (p !== this.phase) { this.phase = p; this.actTimer = 0.8; this.lastAction = 'FASE ' + p; }
    }
    return final;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  addEffect(type, duration, power) {
    const existing = this.effects.find(e => e.type === type);
    if (existing) { existing.duration = Math.max(existing.duration, duration); existing.power = power; }
    else this.effects.push({ type, duration, tick: 0, power });
  }

  tick(dt) {
    this.tickTimer -= dt;
    this.actTimer -= dt;
    if (this.tickTimer <= 0) {
      this.tickTimer = 1;
      for (const e of [...this.effects]) {
        e.tick++;
        // damage over time effects
        if (['POISON','BURN','BLEED'].includes(e.type)) {
          this.hp = Math.max(0, this.hp - e.power);
          if (this.hp <= 0) this.isDead = true;
        }
        e.duration -= 1;
      }
      this.effects = this.effects.filter(e => e.duration > 0);
    }
    return this.canAct();
  }

  canAct() { return this.actTimer <= 0; }

  // Return the enemy's action as { type, power, message }
  chooseAction() {
    const frozen = this.effects.find(e => e.type === 'FROZEN' || e.type === 'PARALYSIS');
    if (frozen) { this.actTimer = this.initialAct(); this.lastAction = 'INCAPACITADO'; return { type: 'skip', message: this.name + ' está incapacitado.' }; }
    this.actTimer = this.initialAct() * (this.effects.find(e => e.type === 'SLOW') ? 1.5 : 1);
    const r = this.rng();
    if (this.behavior === 'BOSS') {
      this.lastAction = 'Ataque del Abismo';
      return { type: 'attack', power: 1.3, message: this.name + ' desata su furia abisal.' };
    }
    if (this.behavior === 'TANK') {
      this.lastAction = 'Golpe Pesado';
      return { type: 'attack', power: 0.8, message: this.name + ' golpea lentamente.' };
    }
    if (this.behavior === 'HUNTER' && r < 0.3) {
      this.lastAction = 'Emboscada';
      return { type: 'attack', power: 1.4, message: this.name + ' embosca desde las sombras.' };
    }
    if (r < 0.2) { this.lastAction = 'Embate'; return { type: 'attack', power: 1.1, message: this.name + ' se abalanza.' }; }
    this.lastAction = 'Golpe';
    return { type: 'attack', power: 1.0, message: this.name + ' ataca.' };
  }
}
