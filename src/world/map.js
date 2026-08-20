// Procedural overworld map model for Free Mode (section 20, 159)
import { createRNG, pick, pickWeighted } from '../core/rng.js';
import { getBiome } from '../data/dungeons.js';

export const TERRAIN = { PLAIN: 0, FOREST: 1, RUINS: 2, WATER: 3, TOWER: 4 };

export class MapModel {
  constructor(seed, size = 40) {
    this.seed = seed;
    this.size = size; // grid of size x size tiles
    this.rng = createRNG(seed);
    this.tiles = [];
    this.zones = [];      // spawn zones
    this.poi = [];        // points of interest
    this._generate();
  }

  _generate() {
    const rng = this.rng;
    // base terrain noise (simple value noise)
    const grid = [];
    for (let y = 0; y < this.size; y++) {
      grid[y] = [];
      for (let x = 0; x < this.size; x++) {
        const n = Math.sin(x * 0.35 + this.seed) + Math.cos(y * 0.29 + this.seed) + Math.sin((x + y) * 0.13);
        const v = Math.abs(n % 1.6);
        let terrain = TERRAIN.PLAIN;
        if (v > 1.35) terrain = TERRAIN.WATER;
        else if (v > 1.05) terrain = TERRAIN.FOREST;
        else if (v > 0.9) terrain = TERRAIN.RUINS;
        grid[y][x] = terrain;
      }
    }
    // centers: player spawn + points of interest
    const cx = Math.floor(this.size / 2);
    grid[cx][cx] = TERRAIN.PLAIN;
    // build zones (clusters)
    const zoneDefs = [
      { type: 'BOSQUE_DE_LAS_SOMBRAS', terrain: TERRAIN.FOREST, color: '#2c4a2c', level: 1, density: 0.5 },
      { type: 'ZONA_URBANA', terrain: TERRAIN.RUINS, color: '#4a4a5a', level: 2, density: 0.4 },
      { type: 'ZONA_AISLADA', terrain: TERRAIN.TOWER, color: '#2a2a3a', level: 3, density: 0.3 },
      { type: 'PUNTO_DE_REUNION', terrain: TERRAIN.PLAIN, color: '#3a4a3a', level: 1, density: 0.3 }
    ];
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const def = zoneDefs.find(z => z.terrain === grid[y][x]);
        if (def && rng() < def.density) {
          this.zones.push({ x, y, ...def });
        }
      }
    }
    // points of interest: a dungeon entrance + a breach + a village
    const poiTypes = [
      { type: 'mazmorra', biome: getBiome(pick(rng, ['cripta','castillo','templo','abismo'])), color: '#9a5cff' },
      { type: 'brecha', biome: getBiome('abismo'), color: '#ff6a88' },
      { type: 'aldea', biome: getBiome('ruinas'), color: '#f2c14e' }
    ];
    for (const p of poiTypes) {
      this.poi.push({
        type: p.type, biome: p.biome, color: p.color,
        x: 3 + Math.floor(rng() * (this.size - 6)),
        y: 3 + Math.floor(rng() * (this.size - 6))
      });
    }
    this.tiles = grid;
  }

  terrainAt(x, z) {
    const tx = Math.round(x + this.size / 2);
    const tz = Math.round(z + this.size / 2);
    if (tx < 0 || tz < 0 || tx >= this.size || tz >= this.size) return TERRAIN.WATER;
    return this.tiles[tz][tx];
  }

  biomeAt(x, z) {
    const t = this.terrainAt(x, z);
    switch (t) {
      case TERRAIN.FOREST: return 'BOSQUE_DE_LAS_SOMBRAS';
      case TERRAIN.RUINS: return 'ZONA_URBANA';
      case TERRAIN.TOWER: return 'ZONA_AISLADA';
      case TERRAIN.WATER: return 'CERCANIA_DEL_AGUA';
      default: return 'PUNTO_DE_REUNION';
    }
  }

  isWalkable(x, z) {
    const t = this.terrainAt(x, z);
    return t !== TERRAIN.WATER;
  }

  nearestPoi(x, z, type) {
    const list = type ? this.poi.filter(p => p.type === type) : this.poi;
    let best = null, bestD = Infinity;
    for (const p of list) {
      const d = Math.hypot(p.x - (x + this.size / 2), p.y - (z + this.size / 2));
      if (d < bestD) { bestD = d; best = p; }
    }
    return { ...best, distance: bestD };
  }
}

export function worldSeed(playerName) {
  return (Math.random() * 1e9) | 0;
}
