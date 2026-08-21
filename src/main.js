/**
 * ABYSSAL ECHOES OF THE DEEP — main.js
 * Punto de entrada. Registra todas las escenas.
 */
import Phaser from 'phaser';
import { BootScene }            from './game/scenes/BootScene.js';
import { LoadingScene }         from './game/scenes/LoadingScene.js';
import { MainMenuScene }        from './game/scenes/MainMenuScene.js';
import { CharacterCreateScene } from './game/scenes/CharacterCreateScene.js';
import { PrologueScene }        from './game/scenes/PrologueScene.js';
import { WorldMapScene }        from './game/scenes/WorldMapScene.js';
import { DungeonScene }         from './game/scenes/DungeonScene.js';
import { CombatScene }          from './game/scenes/CombatScene.js';
import { FreeModeScene }        from './game/scenes/FreeModeScene.js';
import { InventoryScene }       from './game/scenes/InventoryScene.js';
import { CharacterScene }       from './game/scenes/CharacterScene.js';
import { MultiplayerScene }     from './game/scenes/MultiplayerScene.js';
import { GameStorage }          from './storage/GameStorage.js';
import { globalBus }            from './utils/EventBus.js';

// ── STORAGE ─────────────────────────────────────────────────────────
const storage = new GameStorage();
storage.init()
  .then(() => { console.log('[ABYSSAL] IndexedDB OK'); startGame(storage); })
  .catch(() => { console.warn('[ABYSSAL] IndexedDB no disponible'); startGame(null); });

function startGame(storage) {
  const W = window.innerWidth;
  const H = window.innerHeight;

  const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#040812',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: '100%', height: '100%'
    },
    render: { antialias: true, roundPixels: false },
    input: { touch: true, mouse: true, activePointers: 4 },
    fps: { target: 60, smoothStep: true },
    scene: [
      BootScene, LoadingScene, MainMenuScene,
      CharacterCreateScene, PrologueScene,
      WorldMapScene, DungeonScene, CombatScene,
      FreeModeScene, InventoryScene,
      CharacterScene, MultiplayerScene
    ]
  };

  const game = new Phaser.Game(config);

  game.events.on('ready', () => {
    game.registry.set('storage', storage);
    game.registry.set('eventBus', globalBus);
  });

  // Pause / resume por visibilidad
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) game.scene.scenes.forEach(s => { try { if (s.scene.isActive()) s.scene.pause(); } catch(e){} });
    else                 game.scene.scenes.forEach(s => { try { if (s.scene.isPaused()) s.scene.resume(); } catch(e){} });
  });

  // Prevenir scroll táctil
  document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  document.addEventListener('contextmenu', e => e.preventDefault());

  // Resize
  window.addEventListener('resize', () => game.scale.resize(window.innerWidth, window.innerHeight));

  // PWA
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); globalBus.emit('pwa:installAvailable', { prompt: e }); });

  // Debug
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    window.ABYSSAL = { game, storage, globalBus };
  }

  return game;
}
