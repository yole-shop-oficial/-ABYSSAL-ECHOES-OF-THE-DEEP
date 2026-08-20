// Service Worker — offline-first (sections 110-111, 185)
const CACHE = 'abyssal-v1';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './assets/vendor/three.min.js',
  './src/main.js',
  './src/core/game.js',
  './src/core/constants.js',
  './src/core/eventBus.js',
  './src/core/rng.js',
  './src/audio/audio.js',
  './src/storage/save.js',
  './src/gps/gps.js',
  './src/multiplayer/net.js',
  './src/render/renderer.js',
  './src/player/player.js',
  './src/player/progression.js',
  './src/data/classes.js',
  './src/data/skills.js',
  './src/data/enemies.js',
  './src/data/items.js',
  './src/data/dungeons.js',
  './src/data/lore.js',
  './src/world/map.js',
  './src/world/encounters.js',
  './src/dungeon/dungeonGenerator.js',
  './src/enemy/enemy.js',
  './src/combat/combat.js',
  './src/ui/ui.js',
  './src/ui/screens.js',
  './src/ui/worldUI.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (res && res.status === 200 && url.origin === location.origin) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
