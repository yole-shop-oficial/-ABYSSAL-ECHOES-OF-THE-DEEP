// Skill definitions with tags (combo system, section 35-37)
export const SKILLS = [
  { id: 'slash', name: 'Golpe', type: 'phys', cost: 0, cd: 0.8, power: 1.0, tags: ['PHYSICAL'], desc: 'Ataque básico de filo.', icon: 'sword', color: '#d7e6ff' },
  { id: 'fireball', name: 'Bola de Fuego', type: 'cast', cost: 15, cd: 3, power: 1.6, tags: ['FIRE'], effects: ['BURN'], desc: 'Proyectil ardiente que quema.', icon: 'fire', color: '#ff7a3c' },
  { id: 'frost', name: 'Frialdad', type: 'cast', cost: 18, cd: 4, power: 1.3, tags: ['ICE'], effects: ['FROZEN','SLOW'], desc: 'Congela al enemigo.', icon: 'ice', color: '#6ad3ff' },
  { id: 'lightning', name: 'Rayo', type: 'cast', cost: 20, cd: 4, power: 1.8, tags: ['LIGHTNING'], effects: ['PARALYSIS'], desc: 'Descarga eléctrica letal.', icon: 'bolt', color: '#ffd166' },
  { id: 'shadowstrike', name: 'Golpe Sombrío', type: 'cast', cost: 16, cd: 3.5, power: 1.5, tags: ['SHADOW'], effects: ['BLIND'], desc: 'Ataca desde las sombras.', icon: 'shadow', color: '#7b2ff7' },
  { id: 'holy', name: 'Purificación', type: 'cast', cost: 20, cd: 5, power: 1.4, tags: ['HOLY'], effects: [], heal: 30, desc: 'Luz sagrada que hiere y sana.', icon: 'holy', color: '#ffe28a' },
  { id: 'poison', name: 'Veneno', type: 'cast', cost: 12, cd: 3, power: 0.7, tags: ['POISON'], effects: ['POISON'], desc: 'Envenena con el tiempo.', icon: 'poison', color: '#7ee06a' },
  { id: 'blood', name: 'Pacto de Sangre', type: 'cast', cost: 10, cd: 4, power: 1.7, tags: ['BLOOD'], effects: ['BLEED'], selfDamage: 5, desc: 'Hiere al enemigo y a ti mismo.', icon: 'blood', color: '#ff4d4d' },
  { id: 'wind', name: 'Ráfaga', type: 'cast', cost: 12, cd: 2.5, power: 1.1, tags: ['WIND'], effects: ['KNOCKBACK'], desc: 'Empuje de viento.', icon: 'wind', color: '#8fd0ff' },
  { id: 'earth', name: 'Martillo Terrestre', type: 'cast', cost: 16, cd: 4, power: 1.5, tags: ['EARTH'], effects: ['SLOW'], desc: 'Golpea con la tierra.', icon: 'earth', color: '#a0784c' },
  { id: 'arcane', name: 'Descarga Arcano', type: 'cast', cost: 22, cd: 5, power: 1.9, tags: ['ARCANE'], effects: ['SILENCE'], desc: 'Fuerza arcana pura.', icon: 'magic', color: '#9a5cff' },
  { id: 'defend', name: 'Defender', type: 'defend', cost: 0, cd: 1, power: 0, tags: ['PHYSICAL'], desc: 'Reduce el daño recibido.', icon: 'shield', color: '#4aa8ff' },
  { id: 'dodge', name: 'Esquivar', type: 'dodge', cost: 5, cd: 1.2, power: 0, tags: ['WIND'], desc: 'Esquiva el siguiente ataque.', icon: 'wind', color: '#39e6c8' },
  { id: 'ultimate', name: 'Despertar del Abismo', type: 'ultimate', cost: 0, cd: 20, power: 3.2, tags: ['VOID','SHADOW'], effects: ['CURSE'], desc: 'Libera todo tu poder.', icon: 'void', color: '#ff6a88' }
];

// Combo definitions (section 37) — modular, matched by tag sets
export const COMBOS = [
  { name: 'Tormenta Helada', tags: ['ICE','LIGHTNING'], power: 2.4, color: '#7ae8ff', desc: 'Prisión eléctrica congelada.' },
  { name: 'Tempestad Infernal', tags: ['FIRE','WIND'], power: 2.5, color: '#ff8c4a', desc: 'Fuego avivado por el viento.' },
  { name: 'Vínculo Abisal', tags: ['SHADOW','BLOOD'], power: 2.3, color: '#a55cff', desc: 'La sangre atada a la oscuridad.' },
  { name: 'Erupción Terrestre', tags: ['EARTH','FIRE'], power: 2.2, color: '#e07a4a', desc: 'La tierra arde desde dentro.' },
  { name: 'Ritual Sagrado', tags: ['HOLY','ARCANE'], power: 2.6, color: '#f4e28a', desc: 'El arcano bendecido.' },
  { name: 'Caída Venenosa', tags: ['POISON','BLOOD'], power: 2.1, color: '#9ae66a', desc: 'Veneno en la sangre.' }
];

export function findCombo(tags, lastTags) {
  // tags: active skill tags, lastTags: previous skill tags
  const combined = new Set([...tags, ...(lastTags || [])]);
  for (const combo of COMBOS) {
    if (combo.tags.every(t => combined.has(t)) && combo.tags.length >= 2) {
      return combo;
    }
  }
  return null;
}

export function getSkill(id) {
  return SKILLS.find(s => s.id === id);
}
