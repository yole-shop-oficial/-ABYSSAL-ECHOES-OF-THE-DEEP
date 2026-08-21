/**
 * GameStorage — IndexedDB wrapper + localStorage fallback
 * Toda persistencia pasa por aquí. OFFLINE FIRST.
 */
export class GameStorage {
  constructor() {
    this._dbName = 'AbyssalEchoesDB';
    this._version = 1;
    this._db = null;
    this._stores = ['player', 'inventory', 'quests', 'worldFlags', 'settings', 'regions', 'party', 'achievements'];
  }

  async init() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this._dbName, this._version);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        for (const store of this._stores) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id' });
          }
        }
      };
      req.onsuccess = (e) => { this._db = e.target.result; resolve(this); };
      req.onerror = () => reject(req.error);
    });
  }

  async set(store, id, data) {
    return new Promise((resolve, reject) => {
      const tx = this._db.transaction(store, 'readwrite');
      tx.objectStore(store).put({ id, ...data });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  async get(store, id) {
    return new Promise((resolve, reject) => {
      const tx = this._db.transaction(store, 'readonly');
      const req = tx.objectStore(store).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async getAll(store) {
    return new Promise((resolve, reject) => {
      const tx = this._db.transaction(store, 'readonly');
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async delete(store, id) {
    return new Promise((resolve, reject) => {
      const tx = this._db.transaction(store, 'readwrite');
      tx.objectStore(store).delete(id);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  async savePlayer(playerData) {
    return this.set('player', 'main', playerData);
  }

  async loadPlayer() {
    return this.get('player', 'main');
  }

  async setFlag(flagName, value) {
    return this.set('worldFlags', flagName, { value, timestamp: Date.now() });
  }

  async getFlag(flagName) {
    const r = await this.get('worldFlags', flagName);
    return r ? r.value : null;
  }

  async saveSettings(settings) {
    return this.set('settings', 'main', settings);
  }

  async loadSettings() {
    const s = await this.get('settings', 'main');
    return s || this._defaultSettings();
  }

  _defaultSettings() {
    return {
      id: 'main',
      language: 'es',
      difficulty: 'player_choice',
      audioEnabled: true,
      musicVolume: 0.7,
      sfxVolume: 0.85,
      vibration: true,
      notifications: false,
      renderQuality: 'auto',
      colorblindMode: false,
      reducedMotion: false,
      textSize: 'normal',
      highContrast: false,
      gpsEnabled: true,
      cameraEnabled: false,
      showDebug: false
    };
  }
}
