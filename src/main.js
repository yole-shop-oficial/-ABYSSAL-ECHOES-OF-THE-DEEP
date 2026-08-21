/**
 * ABYSSAL ECHOES OF THE DEEP
 * main.js — Punto de entrada del juego
 * Inicializa Phaser, Storage, EventBus y arranca el juego
 */
import Phaser from 'phaser';
import { BootScene } from './game/scenes/BootScene.js';
import { LoadingScene } from './game/scenes/LoadingScene.js';
import { MainMenuScene } from './game/scenes/MainMenuScene.js';
import { CharacterCreateScene } from './game/scenes/CharacterCreateScene.js';
import { PrologueScene } from './game/scenes/PrologueScene.js';
import { WorldMapScene } from './game/scenes/WorldMapScene.js';
import { DungeonScene } from './game/scenes/DungeonScene.js';
import { CombatScene } from './game/scenes/CombatScene.js';
import { FreeModeScene } from './game/scenes/FreeModeScene.js';
import { GameStorage } from './storage/GameStorage.js';
import { globalBus } from './utils/EventBus.js';

// ── INICIALIZAR STORAGE ─────────────────────────────────
const storage = new GameStorage();

storage.init().then(() => {
  console.log('[ABYSSAL] Storage IndexedDB inicializado');
  startGame(storage);
}).catch((err) => {
  console.warn('[ABYSSAL] IndexedDB no disponible, usando memoria:', err);
  startGame(null);
});

function startGame(storage) {
  const bar = document.getElementById('loadBar');
  const status = document.getElementById('loadStatus');
  if (bar) bar.style.width = '20%';
  if (status) status.textContent = 'Inicializando motor del abismo...';

  // Detectar tamaño de viewport real (mobile-safe)
  const gameWidth = window.innerWidth;
  const gameHeight = window.innerHeight;

  const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: gameWidth,
    height: gameHeight,
    backgroundColor: '#040812',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: '100%',
      height: '100%'
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
      transparent: false
    },
    input: {
      touch: true,
      mouse: true,
      activePointers: 4 // Multi-touch
    },
    fps: {
      target: 60,
      forceSetTimeOut: false,
      smoothStep: true
    },
    scene: [
      BootScene,
      LoadingScene,
      MainMenuScene,
      CharacterCreateScene,
      PrologueScene,
      WorldMapScene,
      DungeonScene,
      CombatScene,
      FreeModeScene
    ]
  };

  const game = new Phaser.Game(config);

  // Compartir storage con todas las escenas vía registry
  game.events.on('ready', () => {
    game.registry.set('storage', storage);
    game.registry.set('eventBus', globalBus);
    if (bar) bar.style.width = '40%';
    if (status) status.textContent = 'Motor iniciado. Cargando el abismo...';
  });

  // Manejo de visibilidad (pausa en background)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      game.scene.scenes.forEach(s => { if (s.scene.isActive()) s.scene.pause(); });
    } else {
      game.scene.scenes.forEach(s => { if (s.scene.isPaused()) s.scene.resume(); });
    }
  });

  // Prevenir scroll en móvil
  document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // Resize handler
  window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
  });

  // PWA install prompt
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    globalBus.emit('pwa:installAvailable', { prompt: deferredPrompt });
  });

  window.addEventListener('appinstalled', () => {
    globalBus.emit('pwa:installed', {});
    console.log('[ABYSSAL] PWA instalada correctamente');
  });

  // Offline detection
  window.addEventListener('online', () => { globalBus.emit('network:online', {}); });
  window.addEventListener('offline', () => { globalBus.emit('network:offline', {}); });

  // Expose para debug
  if (import.meta.env.DEV) {
    window.ABYSSAL = { game, storage, globalBus };
    console.log('[ABYSSAL] Modo desarrollo. window.ABYSSAL disponible.');
  }

  return game;
}
