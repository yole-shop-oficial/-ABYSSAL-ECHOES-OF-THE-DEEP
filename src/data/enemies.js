// Enemy families (section 39) and behaviors (section 40)
export const ENEMIES = [
  { id: 'sombras', name: 'Sombra', family: 'SPIRIT', behavior: 'HUNTER', level: 1,
    base: { hp: 60, atk: 10, def: 4, spd: 12 }, tags: ['SHADOW'], color: '#5a4a8a', reward: 25, xp: 20 },
  { id: 'bestia', name: 'Bestia Salvaje', family: 'BEAST', behavior: 'AGGRESSIVE', level: 2,
    base: { hp: 80, atk: 13, def: 6, spd: 10 }, tags: ['EARTH'], color: '#7a5a3c', reward: 30, xp: 25 },
  { id: 'golem', name: 'Gólem de Ruinas', family: 'CONSTRUCT', behavior: 'TANK', level: 4,
    base: { hp: 140, atk: 15, def: 16, spd: 3 }, tags: ['EARTH'], color: '#6b5a48', reward: 55, xp: 40 },
  { id: 'demonio', name: 'Demonio Menor', family: 'DEMON', behavior: 'AGGRESSIVE', level: 5,
    base: { hp: 110, atk: 18, def: 8, spd: 11 }, tags: ['FIRE'], color: '#a13c2a', reward: 60, xp: 45 },
  { id: 'no_muerto', name: 'No Muerto', family: 'UNDEAD', behavior: 'DEFENSIVE', level: 3,
    base: { hp: 95, atk: 12, def: 9, spd: 6 }, tags: ['SHADOW','BLOOD'], color: '#5c7a5a', reward: 45, xp: 32 },
  { id: 'guardian', name: 'Guardián del Abismo', family: 'ANCIENT', behavior: 'BOSS', level: 8,
    base: { hp: 300, atk: 16, def: 12, spd: 7 }, tags: ['VOID','SHADOW'], color: '#2a1a4a', reward: 400, xp: 220, isBoss: true,
    phases: 3 }
];

export function enemyByLevel(level, rng, pool) {
  const list = pool || ENEMIES.filter(e => !e.isBoss);
  const candidates = list.filter(e => Math.abs(e.level - level) <= 3);
  const use = candidates.length ? candidates : list;
  return use[Math.floor(rng() * use.length)];
}
