// Dungeon biomes and theme definitions (section 41)
export const DUNGEON_BIOMES = [
  { id: 'cripta', name: 'Cripta Olvidada', tile: '#3a3f4a', wall: '#2a2f38', accent: '#9a5cff',
    rooms: ['sala de los sellos','cámara funeraria','pasillo de huesos'], boss: 'guardian' },
  { id: 'castillo', name: 'Castillo Roto', tile: '#4a4438', wall: '#332e26', accent: '#e0a13c',
    rooms: ['gran salón','torre derruida','mazmorra de los señores'], boss: 'guardian' },
  { id: 'cueva', name: 'Cueva Resonante', tile: '#3c3f42', wall: '#2b2d30', accent: '#39e6c8',
    rooms: ['grieta profunda','caverna de ecos','nido de bestias'], boss: 'guardian' },
  { id: 'templo', name: 'Templo Sumergido', tile: '#2a3a44', wall: '#1d2a33', accent: '#6ad3ff',
    rooms: ['santuario','piscina de sombras','cripta de los sumos'], boss: 'guardian' },
  { id: 'ruinas', name: 'Ruinas del Bosque', tile: '#3a4438', wall: '#2a332a', accent: '#7ee06a',
    rooms: ['claro enloquecido','monolito','recinto de hierba'], boss: 'guardian' },
  { id: 'abismo', name: 'Dimensión Rota', tile: '#1a1028', wall: '#0d0820', accent: '#ff6a88',
    rooms: ['grieta del vacío','salón distorsionado','corazón de la brecha'], boss: 'guardian' }
];

export function getBiome(id) {
  return DUNGEON_BIOMES.find(b => b.id === id) || DUNGEON_BIOMES[0];
}

// Room pools for procedural generation (section 42)
export const ROOM_POOL = ['encounter','encounter','treasure','elite','event','trap','boss'];

// World seeds (section 119)
export const SEED_KEYS = ['WORLD','REGION','DUNGEON','EVENT','ENCOUNTER'];
