// Core constants and global configuration for Abyssal Echoes of the Deep
export const GAME = {
  NAME: 'Abyssal Echoes of the Deep',
  SHORT: 'ABYSSAL',
  VERSION: '0.1.0',
  SAVE_KEY: 'abyssal_save_v1',
  THEME: {
    bg: '#05080f',
    panel: 'rgba(8,14,26,0.92)',
    panelBorder: '#1d3a5f',
    primary: '#4aa8ff',
    primaryGlow: 'rgba(74,168,255,0.55)',
    secondary: '#9a5cff',
    accent: '#39e6c8',
    danger: '#ff4d6d',
    gold: '#f2c14e',
    text: '#d7e6ff',
    dim: '#6b86ab'
  }
};

// Player state machine states
export const STATES = {
  BOOT: 'BOOT',
  LOADING: 'LOADING',
  MAIN_MENU: 'MAIN_MENU',
  CHARACTER_CREATION: 'CHARACTER_CREATION',
  PROFILE: 'PROFILE',
  MODE_SELECT: 'MODE_SELECT',
  FREE_MODE: 'FREE_MODE',
  WORLD_MODE: 'WORLD_MODE',
  DUNGEON: 'DUNGEON',
  BATTLE: 'BATTLE',
  REWARD: 'REWARD',
  MULTIPLAYER_LOBBY: 'MULTIPLAYER_LOBBY'
};

// World mode contexts
export const WORLD_MODES = {
  REAL: 'real',
  FREE: 'free',
  DUNGEON: 'dungeon'
};

// Combat action types
export const ACTION = {
  ATTACK: 'attack',
  SKILL: 'skill',
  DEFEND: 'defend',
  DODGE: 'dodge',
  ULTIMATE: 'ultimate'
};

// Elemental tags (combo system, section 36-37)
export const TAGS = [
  'FIRE', 'ICE', 'LIGHTNING', 'SHADOW', 'HOLY', 'PHYSICAL',
  'ARCANE', 'POISON', 'BLOOD', 'WIND', 'EARTH', 'VOID'
];

// Effect statuses (section 38)
export const EFFECTS = {
  POISON: { name: 'Veneno', color: '#7ee06a' },
  BURN: { name: 'Quemadura', color: '#ff7a3c' },
  BLEED: { name: 'Sangrado', color: '#ff4d4d' },
  FROZEN: { name: 'Congelación', color: '#6ad3ff' },
  PARALYSIS: { name: 'Parálisis', color: '#e6c13c' },
  SILENCE: { name: 'Silencio', color: '#9aa7c9' },
  CURSE: { name: 'Maldición', color: '#8b5cf6' },
  BLIND: { name: 'Ceguera', color: '#555f72' },
  WEAKNESS: { name: 'Debilidad', color: '#a3b0c6' },
  FRENZY: { name: 'Frenesí', color: '#ff6a88' },
  SLOW: { name: 'Lento', color: '#8fd0ff' },
  MARKED: { name: 'Marcado', color: '#ffd166' }
};

// Rarity tiers (section 84)
export const RARITY = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC', 'ANCIENT', 'UNKNOWN'];
export const RARITY_COLOR = {
  COMMON: '#9aa7b8', UNCOMMON: '#39e6a0', RARE: '#4aa8ff', EPIC: '#9a5cff',
  LEGENDARY: '#f2c14e', MYTHIC: '#ff6a88', ANCIENT: '#39e6c8', UNKNOWN: '#e6e9f5'
};

// Classes (section 31)
export const CLASSES = [
  'GUERRERO','CABALLERO','BERSERKER','MAGO','HECHICERO','ARQUERO','PICARO',
  'ASESINO','SACERDOTE','PALADIN','INVOCADOR','EXPLORADOR','MONJE','ARTIFICE','GUARDIAN'
];

// Encounters by real-world zone type (section 12)
export const ZONE_BIOME = {
  PARK: 'BOSQUE_DE_LAS_SOMBRAS',
  URBAN: 'ZONA_URBANA',
  WATER: 'CERCANIA_DEL_AGUA',
  HISTORIC: 'ZONA_HISTORICA',
  ISOLATED: 'ZONA_AISLADA',
  PLAZA: 'PUNTO_DE_REUNION'
};

// Local multiplayer defaults (sections 48-70)
export const MULTIPLAYER = {
  MAX_PLAYERS: 4,
  DEFAULT_RADIUS: 100,
  PING_INTERVAL: 2000,
  POSITION_INTERVAL: 200
};
