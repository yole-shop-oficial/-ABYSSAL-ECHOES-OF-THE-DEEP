// Player entity: stats, level, position, combat state
import { getClass } from '../data/classes.js';
import { getSkill } from '../data/skills.js';
import { uid } from '../core/rng.js';

export class Player {
  constructor() {
    this.id = uid('p_');
    this.name = 'Aventurero';
    this.classId = 'GUERRERO';
    this.level = 1;
    this.xp = 0;
    this.xpNext = 100;
    this.baseStats = { hp: 100, mp: 40, atk: 15, def: 10, spd: 10, crit: 8 };
    this.inventory = [];
    this.equipment = {};   // slot -> item
    this.skillIds = ['slash', 'fireball', 'defend', 'ultimate'];
    this.titles = [];
    this.discoveries = { region: 0, brechas: 0, mazmorras: 0, jefes: 0, secretos: 0 };
    this.stats = {
      realDistance: 0,
      virtualDistance: 0,
      encounters: 0,
      dungeonsCleared: 0,
      bossesDefeated: 0
    };
    this.mode = 'free';
    this.flags = {};       // world flags (section 76)
    // combat
    this.hp = this.baseStats.hp;
    this.mp = this.baseStats.mp;
    this.isDead = false;
    // position (world coords)
    this.x = 0; this.z = 0; this.rotation = 0;
  }

  get class() { return getClass(this.classId); }

  applyClass() {
    const c = this.class;
    this.baseStats = { ...c.base };
    this.hp = this.maxHp;
    this.mp = this.maxMp;
    // assign default skills by archetype
    if (c.base.atk >= c.base.mp) {
      this.skillIds = ['slash', 'fireball', 'defend', 'ultimate'];
    } else {
      this.skillIds = ['slash', 'arcane', 'defend', 'ultimate'];
    }
  }

  get effectiveStats() {
    const s = { ...this.baseStats };
    const lvl = this.level - 1;
    s.hp = Math.floor(this.baseStats.hp + lvl * 12);
    s.mp = Math.floor(this.baseStats.mp + lvl * 5);
    s.atk = Math.floor(this.baseStats.atk + lvl * 2);
    s.def = Math.floor(this.baseStats.def + lvl * 1.5);
    for (const slot in this.equipment) {
      const item = this.equipment[slot];
      if (!item) continue;
      if (item.stats) {
        for (const k in item.stats) {
          if (s[k] !== undefined) s[k] += item.stats[k];
        }
      }
    }
    return s;
  }

  get maxHp() { return this.effectiveStats.hp; }
  get maxMp() { return this.effectiveStats.mp; }
  get atk() { return this.effectiveStats.atk; }
  get def() { return this.effectiveStats.def; }

  get skills() {
    return this.skillIds.map(id => getSkill(id)).filter(Boolean);
  }

  addXp(amount) {
    this.xp += amount;
    let leveled = false;
    while (this.xp >= this.xpNext) {
      this.xp -= this.xpNext;
      this.level += 1;
      this.xpNext = Math.floor(100 * Math.pow(1.25, this.level - 1));
      leveled = true;
    }
    this.hp = Math.min(this.maxHp, this.hp);
    this.mp = Math.min(this.maxMp, this.mp);
    return leveled;
  }

  addItem(item) {
    item.id = uid('it_');
    this.inventory.push(item);
  }

  addTitle(title) {
    if (!this.titles.includes(title)) this.titles.push(title);
  }

  takeDamage(dmg) {
    this.hp = Math.max(0, this.hp - dmg);
    if (this.hp <= 0) this.isDead = true;
    return dmg;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  toJSON() {
    return {
      name: this.name, classId: this.classId, level: this.level, xp: this.xp,
      xpNext: this.xpNext, inventory: this.inventory, equipment: this.equipment,
      skillIds: this.skillIds, titles: this.titles, discoveries: this.discoveries,
      stats: this.stats, flags: this.flags, mode: this.mode, id: this.id
    };
  }

  static fromJSON(d) {
    const p = new Player();
    Object.assign(p, d);
    p.baseStats = getClass(p.classId).base;
    p.hp = p.maxHp; p.mp = p.maxMp; p.isDead = false;
    return p;
  }
}
