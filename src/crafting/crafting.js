// Crafting / Fabricación básico — Fase 2 (defaults: recetas fijas)
import { ITEM_BASES } from '../data/items.js';

export const CRAFT_RECIPES = [
  { id: 'espada_abyssal', result: 'Espada Abisal', ingredients: [{ item: 'iron_shard', qty: 2 }, { item: 'abyssal_essence', qty: 1 }], levelReq: 3 },
  { id: 'armadura_fea', result: 'Armadura de la Cripta', ingredients: [{ item: 'crystal_soul', qty: 1 }, { item: 'iron_shard', qty: 3 }], levelReq: 5 }
];

export function craftItem(recipeId, inventory) {
  const r = CRAFT_RECIPES.find(x => x.id === recipeId);
  if (!r) return null;
  // Default simple check
  for (const ing of r.ingredients) {
    const found = inventory.filter(i => i.id === ing.item && i.qty >= ing.qty);
    if (!found.length) return { success: false, reason: 'faltan_materiales' };
  }
  return { success: true, result: r.result, ingredients: r.ingredients };
}

export function hasCraftingStation(playerFlags) {
  return !!(playerFlags && playerFlags.foundStation);
}
