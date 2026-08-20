// Bootstrap: attach to DOM and boot the game
import { Game } from './core/game.js';
import { unlock } from './audio/audio.js';

const app = document.getElementById('app');
const game = new Game(app);
window.game = game; // expose for debugging

// unlock audio on first interaction
const once = () => { unlock(); };
window.addEventListener('pointerdown', once, { once: true });
window.addEventListener('keydown', once, { once: true });

// register service worker (offline-first, section 110-111)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((e) => console.warn('SW', e));
  });
}

game.boot();
