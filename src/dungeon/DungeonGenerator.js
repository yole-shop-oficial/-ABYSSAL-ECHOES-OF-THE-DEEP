/**
 * DungeonGenerator — Generador procedural de mazmorras
 * Produce layout de habitaciones, enemigos, loot, boss y eventos usando seeds
 */
import { SeededRandom } from '../utils/SeededRandom.js';

const ROOM_TYPES = ['combat', 'elite', 'treasure', 'rest', 'event', 'puzzle', 'secret', 'npc', 'trap'];
const BIOME_POOLS = {
  crypt:    { enemies: ['sombra_fracturada', 'espectro_dormido', 'no_muerto_elite'], bg: 'bg_crypt', accent: '#6c5ce7' },
  cave:     { enemies: ['bestia_abisal', 'constructo_antiguo'], bg: 'bg_cave', accent: '#55efc4' },
  ruins:    { enemies: ['espectro_dormido', 'constructo_antiguo', 'entidad_desconocida'], bg: 'bg_ruins', accent: '#fdcb6e' },
  tower:    { enemies: ['demonio_menor', 'no_muerto_elite'], bg: 'bg_tower', accent: '#e17055' },
  void:     { enemies: ['entidad_desconocida', 'demonio_menor'], bg: 'bg_void', accent: '#a29bfe' }
};

const BOSS_POOL = [
  { id: 'guardian_abisal', name: 'Guardián Abisal', tier: 1, hp: 3200, atk: 95, def: 60, phases: 2, loot: 'EPIC' },
  { id: 'rey_fracturado', name: 'Rey Fracturado', tier: 2, hp: 5500, atk: 140, def: 80, phases: 3, loot: 'LEGENDARY' },
  { id: 'eco_primordial', name: 'Eco Primordial', tier: 3, hp: 8800, atk: 190, def: 110, phases: 4, loot: 'MYTHIC' },
  { id: 'voz_del_vacio', name: 'La Voz del Vacío', tier: 4, hp: 14000, atk: 240, def: 140, phases: 5, loot: 'ANCIENT' }
];

export class DungeonGenerator {
  constructor(worldSeed, dungeonSeed, biome = 'crypt', difficulty = 1, floor = 1) {
    this.worldSeed = worldSeed;
    this.dungeonSeed = dungeonSeed;
    this.biome = biome;
    this.difficulty = difficulty;
    this.floor = floor;
    this.rng = new SeededRandom(`${worldSeed}_${dungeonSeed}_${floor}`);
  }

  generate() {
    const biomeData = BIOME_POOLS[this.biome] || BIOME_POOLS.crypt;
    const roomCount = this._calcRoomCount();
    const rooms = this._generateRooms(roomCount, biomeData);
    const boss = this._selectBoss();
    const layout = this._generateLayout(rooms);

    return {
      id: `${this.dungeonSeed}_f${this.floor}`,
      biome: this.biome,
      floor: this.floor,
      difficulty: this.difficulty,
      rooms,
      boss,
      layout,
      bg: biomeData.bg,
      accent: biomeData.accent,
      seed: `${this.worldSeed}_${this.dungeonSeed}_${this.floor}`,
      lootSeed: this.rng.int(100000, 999999),
      eventSeed: this.rng.int(100000, 999999)
    };
  }

  _calcRoomCount() {
    const base = 5 + Math.floor(this.floor / 3);
    return Math.min(base + this.rng.int(0, 4), 20);
  }

  _generateRooms(count, biomeData) {
    const rooms = [];
    // Entrada siempre es de combate
    rooms.push(this._makeRoom('combat', 0, biomeData));

    for (let i = 1; i < count - 1; i++) {
      const type = this._pickRoomType(i, count);
      rooms.push(this._makeRoom(type, i, biomeData));
    }

    // Última habitación es el boss
    rooms.push(this._makeBossRoom(count - 1, biomeData));
    return rooms;
  }

  _pickRoomType(index, total) {
    const roll = this.rng.next();
    // Sala de descanso cada 4-5 habitaciones
    if (index % 4 === 0 && roll < 0.7) return 'rest';
    if (roll < 0.02) return 'secret';
    if (roll < 0.08) return 'puzzle';
    if (roll < 0.14) return 'trap';
    if (roll < 0.22) return 'treasure';
    if (roll < 0.28) return 'npc';
    if (roll < 0.35) return 'event';
    if (roll < 0.42 && index > total * 0.5) return 'elite';
    return 'combat';
  }

  _makeRoom(type, index, biomeData) {
    const enemies = type === 'combat' || type === 'elite'
      ? this._spawnEnemies(type, biomeData.enemies)
      : [];

    return {
      id: `room_${index}`,
      type,
      index,
      enemies,
      cleared: false,
      hasSecret: type === 'secret' || this.rng.chance(0.08),
      loot: type === 'treasure' || type === 'secret' ? this._genLoot() : null,
      trap: type === 'trap' ? this._genTrap() : null,
      event: type === 'event' ? this._genEvent() : null,
      npc: type === 'npc' ? this._genNPC() : null,
      exits: []
    };
  }

  _makeBossRoom(index, biomeData) {
    const boss = this._selectBoss();
    return { id: `room_boss`, type: 'boss', index, enemies: [boss], cleared: false, loot: this._genBossLoot(boss), exits: [] };
  }

  _spawnEnemies(type, enemyPool) {
    const count = type === 'elite' ? 1 : this.rng.int(1, 3);
    const enemies = [];
    for (let i = 0; i < count; i++) {
      const base = this.rng.pick(enemyPool);
      const diffMult = 1 + (this.difficulty - 1) * 0.2 + (this.floor - 1) * 0.05;
      enemies.push({
        id: base,
        hp: Math.floor((300 + this.floor * 30) * diffMult),
        atk: Math.floor((25 + this.floor * 3) * diffMult),
        def: Math.floor((10 + this.floor * 2) * diffMult),
        isElite: type === 'elite'
      });
    }
    return enemies;
  }

  _selectBoss() {
    const tier = Math.min(Math.floor((this.floor - 1) / 10), BOSS_POOL.length - 1);
    const boss = { ...BOSS_POOL[tier] };
    const diffMult = 1 + (this.difficulty - 1) * 0.3 + (this.floor - 1) * 0.04;
    boss.hp = Math.floor(boss.hp * diffMult);
    boss.atk = Math.floor(boss.atk * diffMult);
    return boss;
  }

  _genLoot() {
    const rarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC'];
    const weights =  [0.5,     0.3,        0.15,  0.05];
    return { rarity: this._weightedPick(rarities, weights), count: this.rng.int(1, 3) };
  }

  _genBossLoot(boss) {
    return { rarity: boss.loot, count: this.rng.int(2, 4), guaranteed: true };
  }

  _genTrap() {
    const traps = ['SPIKE_PIT', 'POISON_GAS', 'ARCANE_BURST', 'CRUSHING_CEILING', 'ALARM'];
    return { type: this.rng.pick(traps), damage: Math.floor((50 + this.floor * 10) * this.difficulty), avoidable: this.rng.chance(0.6) };
  }

  _genEvent() {
    const events = ['ECHO_FRAGMENT', 'WANDERER_NPC', 'MYSTERIOUS_PORTAL', 'ANCIENT_INSCRIPTION', 'TRAPPED_SPIRIT'];
    return { type: this.rng.pick(events) };
  }

  _genNPC() {
    const npcs = ['merchant', 'trapped_resonator', 'echo_spirit', 'ancient_guide', 'rival'];
    return { type: this.rng.pick(npcs) };
  }

  _generateLayout(rooms) {
    // Genera un grafo simple lineal con bifurcaciones ocasionales
    const layout = { nodes: [], edges: [] };
    for (const room of rooms) {
      layout.nodes.push({ id: room.id, type: room.type, x: room.index * 120, y: 0 });
      if (room.index > 0) {
        layout.edges.push({ from: `room_${room.index - 1}`, to: room.id });
      }
    }
    return layout;
  }

  _weightedPick(items, weights) {
    const r = this.rng.next();
    let acc = 0;
    for (let i = 0; i < items.length; i++) {
      acc += weights[i];
      if (r <= acc) return items[i];
    }
    return items[items.length - 1];
  }
}
