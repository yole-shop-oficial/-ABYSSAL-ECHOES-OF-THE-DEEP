// NPC / Misiones básico — Fase 2 (defaults: texto simple, misiones básicas)
export class NPC {
  constructor(id, name, zone, dialogue = []) {
    this.id = id;
    this.name = name;
    this.zone = zone;
    this.dialogue = dialogue; // array de strings
    this.mission = null; // { id, desc, progress, complete, reward }
  }
  interact() {
    return this.dialogue[0] || `Saludo de ${this.name}.`;
  }
  assignMission(m) {
    this.mission = { ...m, status: 'active', progress: 0 };
  }
  completeMission() {
    if (this.mission) this.mission.status = 'complete';
    return this.mission ? this.mission.reward : null;
  }
}

export const NPC_POOL = [
  new NPC('npc_01', 'El Guarda del Abismo', 'Abismo', ['Bienvenido a las profundidades.', '¿Buscas una misión?']),
  new NPC('npc_02', 'La Forjadora', 'Cripta', ['Materiales de crafteo disponibles.', 'Trae fragmentos abisales.'])
];
