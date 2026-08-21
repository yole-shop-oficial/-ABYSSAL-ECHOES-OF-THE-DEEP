/**
 * PlayerState — Estado completo del personaje del jugador
 * Centraliza todos los datos: stats, equipo, habilidades, nivel, progreso
 */
export class PlayerState {
  constructor(data = {}) {
    this.id = data.id || this._generateId();
    this.name = data.name || 'Resonador';
    this.classId = data.classId || 'guerrero';
    this.gender = data.gender || 'custom';
    this.appearance = data.appearance || {};

    // Progresión
    this.level = data.level || 1;
    this.xp = data.xp || 0;
    this.xpToNext = data.xpToNext || this._calcXPToNext(1);
    this.prestigeLevel = data.prestigeLevel || 0;
    this.titleId = data.titleId || null;

    // Stats base (modificados por nivel + equipo + runas)
    this.baseStats = data.baseStats || {
      hp: 1200, mp: 300, atk: 80, def: 55, spd: 70, crit: 15, stamina: 100
    };
    this.currentHP = data.currentHP ?? this.baseStats.hp;
    this.currentMP = data.currentMP ?? this.baseStats.mp;
    this.currentStamina = data.currentStamina ?? this.baseStats.stamina;

    // Equipo slots
    this.equipment = data.equipment || {
      weapon: null, armor: null, helmet: null,
      gloves: null, boots: null, amulet: null,
      ring: null, relic: null
    };

    // Habilidades activas (hasta 6 + 2 ultimates)
    this.activeSkills = data.activeSkills || [];
    this.unlockedSkills = data.unlockedSkills || [];

    // Recursos del juego
    this.gold = data.gold || 0;
    this.echoShards = data.echoShards || 0; // moneda premium (sin P2W)

    // Exploración
    this.realDistanceM = data.realDistanceM || 0;
    this.virtualDistanceM = data.virtualDistanceM || 0;
    this.brechesFound = data.brechesFound || 0;
    this.dungeonsCleared = data.dungeonsCleared || 0;
    this.bossesDefeated = data.bossesDefeated || 0;

    // Flags y estado
    this.worldMode = data.worldMode || 'FREE_MODE'; // REAL_WORLD | FREE_MODE | DUNGEON | BATTLE
    this.currentLocation = data.currentLocation || null;
    this.partyId = data.partyId || null;
    this.factionReputation = data.factionReputation || {};
    this.titles = data.titles || [];
    this.createdAt = data.createdAt || Date.now();
    this.lastSaved = data.lastSaved || Date.now();
  }

  _generateId() {
    return 'player_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  _calcXPToNext(level) {
    return Math.floor(100 * Math.pow(1.15, level - 1));
  }

  gainXP(amount) {
    this.xp += amount;
    const results = { leveled: false, newLevel: this.level };
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level++;
      this.xpToNext = this._calcXPToNext(this.level);
      this._applyLevelUp();
      results.leveled = true;
      results.newLevel = this.level;
    }
    return results;
  }

  _applyLevelUp() {
    // Escala de stats por nivel
    this.baseStats.hp = Math.floor(this.baseStats.hp * 1.08);
    this.baseStats.mp = Math.floor(this.baseStats.mp * 1.06);
    this.baseStats.atk = Math.floor(this.baseStats.atk * 1.05);
    this.baseStats.def = Math.floor(this.baseStats.def * 1.04);
    // Restaurar HP/MP al subir nivel
    this.currentHP = this.baseStats.hp;
    this.currentMP = this.baseStats.mp;
  }

  getEffectiveStats() {
    // Stats base + bonificaciones de equipo
    const stats = { ...this.baseStats };
    for (const slot of Object.values(this.equipment)) {
      if (slot && slot.stats) {
        for (const [k, v] of Object.entries(slot.stats)) {
          stats[k] = (stats[k] || 0) + v;
        }
      }
    }
    return stats;
  }

  takeDamage(amount) {
    const actual = Math.max(0, amount - Math.floor(this.getEffectiveStats().def * 0.3));
    this.currentHP = Math.max(0, this.currentHP - actual);
    return { damage: actual, isDead: this.currentHP <= 0 };
  }

  heal(amount) {
    const maxHP = this.getEffectiveStats().hp;
    const before = this.currentHP;
    this.currentHP = Math.min(maxHP, this.currentHP + amount);
    return this.currentHP - before;
  }

  useMana(amount) {
    if (this.currentMP < amount) return false;
    this.currentMP -= amount;
    return true;
  }

  isAlive() { return this.currentHP > 0; }

  hpPercent() { return this.currentHP / this.getEffectiveStats().hp; }

  mpPercent() { return this.currentMP / this.getEffectiveStats().mp; }

  serialize() {
    return {
      id: this.id, name: this.name, classId: this.classId,
      gender: this.gender, appearance: this.appearance,
      level: this.level, xp: this.xp, xpToNext: this.xpToNext,
      prestigeLevel: this.prestigeLevel, titleId: this.titleId,
      baseStats: this.baseStats,
      currentHP: this.currentHP, currentMP: this.currentMP, currentStamina: this.currentStamina,
      equipment: this.equipment, activeSkills: this.activeSkills, unlockedSkills: this.unlockedSkills,
      gold: this.gold, echoShards: this.echoShards,
      realDistanceM: this.realDistanceM, virtualDistanceM: this.virtualDistanceM,
      brechesFound: this.brechesFound, dungeonsCleared: this.dungeonsCleared,
      bossesDefeated: this.bossesDefeated,
      worldMode: this.worldMode, currentLocation: this.currentLocation,
      partyId: this.partyId, factionReputation: this.factionReputation,
      titles: this.titles, createdAt: this.createdAt, lastSaved: Date.now()
    };
  }
}
