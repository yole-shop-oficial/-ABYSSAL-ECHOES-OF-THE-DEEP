// Save manager: localStorage with versioning (sections 117, 187)
import { GAME } from '../core/constants.js';
import { Player } from '../player/player.js';

export function saveGame(player) {
  try {
    const payload = { version: GAME.VERSION, savedAt: Date.now(), player: player.toJSON() };
    localStorage.setItem(GAME.SAVE_KEY, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.error('save failed', e);
    return false;
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(GAME.SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data.player) return null;
    return Player.fromJSON(data.player);
  } catch (e) {
    console.error('load failed', e);
    return null;
  }
}

export function hasSave() {
  return !!localStorage.getItem(GAME.SAVE_KEY);
}

export function deleteSave() {
  localStorage.removeItem(GAME.SAVE_KEY);
}

export function exportSave() {
  const raw = localStorage.getItem(GAME.SAVE_KEY);
  if (!raw) return null;
  const blob = new Blob([raw], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `abyssal_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importSave(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.player) return reject(new Error('formato inválido'));
        const p = Player.fromJSON(data.player);
        localStorage.setItem(GAME.SAVE_KEY, JSON.stringify(data));
        resolve(p);
      } catch (e) { reject(e); }
    };
    reader.readAsText(file);
  });
}
