// Item base definitions for procedural loot (sections 82-84, 174-176)
export const ITEM_BASES = [
  { id: 'espada', name: 'Espada', slot: 'arma', type: 'weapon', stat: 'atk' },
  { id: 'escudo', name: 'Escudo', slot: 'armadura', type: 'shield', stat: 'def' },
  { id: 'armadura', name: 'Armadura', slot: 'armadura', type: 'armor', stat: 'def' },
  { id: 'anillo', name: 'Anillo', slot: 'anillo', type: 'accessory', stat: 'spd' },
  { id: 'amuleto', name: 'Amuleto', slot: 'amuleto', type: 'accessory', stat: 'mp' },
  { id: 'pocion', name: 'Poción de Vida', slot: 'consumible', type: 'consumable', stat: 'hp' }
];

// Affixes (section 176)
export const AFFIXES = [
  { name: 'de Fuerza', stat: 'atk', mod: 0.1 },
  { name: 'de Protección', stat: 'def', mod: 0.1 },
  { name: 'Crítico', stat: 'crit', mod: 2 },
  { name: 'de Fuego', stat: 'fire', mod: 0.15 },
  { name: 'de Maná', stat: 'mp', mod: 0.1 },
  { name: 'de Velocidad', stat: 'spd', mod: 0.1 },
  { name: 'de Drenaje', stat: 'lifesteal', mod: 0.04 }
];

// Consumable heal amounts
export const CONSUMABLES = {
  pocion: { heal: 40, name: 'Poción de Vida' }
};

// Fase 2: Materiales de crafting
export const CRAFT_MATERIALS = [
  { id: 'iron_shard', name: 'Fragmento de Hierro', type: 'material', rarity: 'common' },
  { id: 'abyssal_essence', name: 'Esencia Abisal', type: 'material', rarity: 'rare' },
  { id: 'crystal_soul', name: 'Cristal del Alma', type: 'material', rarity: 'epic' }
];
