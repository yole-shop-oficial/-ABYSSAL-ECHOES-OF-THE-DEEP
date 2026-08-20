// Progression helpers: titles, thresholds, power calculation (sections 34, 90)
import { RARITY } from '../core/constants.js';
import { createRNG, pick } from '../core/rng.js';

export function powerTotal(player) {
  const s = player.effectiveStats;
  let p = player.level * 10;
  p += s.atk + s.def + s.spd + s.crit;
  p += player.skillIds.length * 5;
  p += player.titles.length * 3;
  p += player.inventory.filter(i => i.rarity).reduce((a, i) => a + (RARITY.indexOf(i.rarity) || 1), 0);
  return p;
}

export function titleFor(player) {
  if (player.stats.bossesDefeated >= 1) return 'Destructor de Reyes';
  if (player.discoveries.brechas >= 1) return 'Superviviente de la Primera Brecha';
  if (player.stats.dungeonsCleared >= 1) return 'Explorador de Ruinas';
  return 'Aprendiz del Abismo';
}

export function earnTitles(player) {
  const t = titleFor(player);
  if (t && !player.titles.includes(t)) player.titles.push(t);
}

export function generateLoot(level, rng, count) {
  const r = rng || createRNG(Math.floor(Math.random() * 1e9));
  const items = [];
  for (let i = 0; i < (count || 1); i++) {
    const roll = r();
    let rarity = 'COMMON';
    if (roll > 0.985) rarity = 'LEGENDARY';
    else if (roll > 0.96) rarity = 'EPIC';
    else if (roll > 0.9) rarity = 'RARE';
    else if (roll > 0.7) rarity = 'UNCOMMON';
    const bases = ['espada','anillo','amuleto','pocion'];
    const baseId = pick(r, bases);
    items.push(buildItem(baseId, rarity, level, r));
  }
  return items;
}

export function buildItem(baseId, rarity, level, rng) {
  const map = {
    espada: { name: 'Espada', slot: 'arma', stat: 'atk', base: 4 },
    anillo: { name: 'Anillo', slot: 'anillo', stat: 'spd', base: 2 },
    amuleto: { name: 'Amuleto', slot: 'amuleto', stat: 'mp', base: 6 },
    pocion: { name: 'Poción de Vida', slot: 'consumible', stat: 'hp', base: 30 }
  };
  const b = map[baseId];
  const tier = RARITY.indexOf(rarity);
  const value = Math.floor((b.base + level * 1.5) * (1 + tier * 0.25));
  const stats = { [b.stat]: value };
  // add a random affix for non-common
  if (tier >= 1 && b.slot !== 'consumible') {
    const affixes = ['atk','def','crit','spd','mp'];
    const a = affixes[Math.floor(rng() * affixes.length)];
    stats[a] = (stats[a] || 0) + Math.floor(value * 0.4);
  }
  return {
    baseId, name: `${rarity === 'COMMON' ? '' : rarity + ' '}${b.name}`.trim(),
    slot: b.slot, rarity, level, stats
  };
}

export function applyConsumable(player, item) {
  if (item.slot === 'consumible') {
    player.heal(item.stats.hp || 30);
    const i = player.inventory.indexOf(item);
    if (i !== -1) player.inventory.splice(i, 1);
    return true;
  }
  return false;
}

export function equipItem(player, item) {
  if (!item.slot || item.slot === 'consumible') return false;
  player.equipment[item.slot] = item;
  return true;
}
