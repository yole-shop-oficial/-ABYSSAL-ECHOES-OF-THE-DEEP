// Procedural dungeon floor generation (sections 42-44)
import { createRNG, randomInt, pick, pickWeighted } from '../core/rng.js';
import { ROOM_POOL } from '../data/dungeons.js';
import { ENEMIES } from '../data/enemies.js';

export class Dungeon {
  constructor(seed, depth, biome) {
    this.seed = seed;
    this.depth = depth;
    this.biome = biome;
    this.rng = createRNG(seed);
    this.size = 14;
    this.rooms = []; // {x,y,type,enemy?,loot?}
    this._generate();
  }

  _generate() {
    const rng = this.rng;
    // grid of rooms
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (rng() < 0.45) continue;
        const type = pickWeighted(rng, ROOM_POOL.map(t => ({ value: t, weight: t === 'encounter' ? 4 : t === 'treasure' ? 2 : 1.2 })));
        const room = { x, y, type, visited: false, cleared: false };
        if (type === 'encounter') {
          const lvl = this.depth + randomInt(rng, 0, 2);
          const pool = ENEMIES.filter(e => !e.isBoss);
          room.enemy = pool[Math.floor(rng() * pool.length)];
        }
        this.rooms.push(room);
      }
    }
    // entrance at player start, boss at deepest
    this.entrance = this.rooms[0];
    this.bossRoom = this._farthestFrom(this.entrance);
  }

  _farthestFrom(origin) {
    let best = this.rooms[0], bd = -1;
    for (const r of this.rooms) {
      const d = Math.abs(r.x - origin.x) + Math.abs(r.y - origin.y);
      if (d > bd) { bd = d; best = r; }
    }
    best.type = 'boss';
    return best;
  }

  neighbor(room, dir) {
    const target = { x: room.x + dir[0], y: room.y + dir[1] };
    return this.rooms.find(r => r.x === target.x && r.y === target.y) || null;
  }

  roomAt(x, z) {
    const rx = Math.round(x + this.size / 2);
    const rz = Math.round(z + this.size / 2);
    return this.rooms.find(r => r.x === rx && r.y === rz);
  }

  static new(seed, depth, biome) {
    return new Dungeon(seed, depth, biome);
  }
}
