// Encounter Engine (sections 11, 13-16, 147)
import { createRNG, pick } from '../core/rng.js';
import { ENEMIES, enemyByLevel } from '../data/enemies.js';
import { TERRAIN } from './map.js';

// Day-cycle rarity modifier (section 14)
export function hourOfDay() {
  return new Date().getHours();
}

export function dayPhase(hour) {
  if (hour >= 6 && hour < 17) return 'DIA';
  if (hour >= 17 && hour < 20) return 'ATARDECER';
  if (hour >= 20 || hour < 4) return 'NOCHE';
  return 'MADRUGADA';
}

const PHASE_MULT = { DIA: 1, ATARDECER: 1.4, NOCHE: 1.9, MADRUGADA: 2.6 };

export class EncounterEngine {
  constructor(player, rng) {
    this.player = player;
    this.rng = rng || createRNG((Math.random() * 1e9) | 0);
  }

  // Decide whether an encounter triggers given movement distance and zone
  rollEncounter(distance, biome) {
    const phase = dayPhase(hourOfDay());
    const mult = PHASE_MULT[phase];
    const density = this._density(biome);
    const chance = Math.min(0.9, (distance * 0.02) * mult * density);
    return this.rng() < chance;
  }

  _density(biome) {
    const zone = this.player.flags.regionDensity || 1;
    const map = {
      'ZONA_AISLADA': 1.8, 'CERCANIA_DEL_AGUA': 1.3, 'BOSQUE_DE_LAS_SOMBRAS': 1.2,
      'ZONA_URBANA': 1.0, 'PUNTO_DE_REUNION': 0.6
    };
    return (map[biome] || 1) * zone;
  }

  spawnEnemy(biome) {
    const level = Math.max(1, this.player.level + Math.floor(this.rng() * 3) - 1);
    return enemyByLevel(level, this.rng, this._pool(biome));
  }

  _pool(biome) {
    const map = {
      'BOSQUE_DE_LAS_SOMBRAS': ['bestia','sombras'],
      'ZONA_URBANA': ['sombras','no_muerto','demonio'],
      'CERCANIA_DEL_AGUA': ['bestia','demonio'],
      'ZONA_AISLADA': ['golem','demonio'],
      'PUNTO_DE_REUNION': ['bestia','sombras']
    };
    return map[biome] ? ENEMIES.filter(e => map[biome].includes(e.id)) : undefined;
  }
}
