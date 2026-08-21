/**
 * LoadingScene — Carga de datos JSON con manejo robusto de errores
 * Si falla cualquier carga, continúa con datos por defecto
 */
import Phaser from 'phaser';

const TIPS = [
  'Las Brechas no son accidentes. Son puertas.',
  'Los Resonadores son los únicos que pueden escuchar el Eco.',
  'Cada Brecha tiene su propio mundo interior. Ninguno es igual.',
  'El poder de PROYECCIÓN es innato en todos los Resonadores.',
  'Las profundidades ocultan verdades que no puedes imaginar.',
  'No toda entidad en una Brecha es tu enemiga.',
  'Los combos elementales pueden cambiar el curso de una batalla.',
  'Un Resonador nunca enfrenta el abismo solo si puede evitarlo.'
];

// Datos mínimos embebidos como fallback (por si fallan las rutas)
const FALLBACK_CLASSES = [
  { id:'guerrero', name:'Guerrero', role:'DPS/TANK', element:'PHYSICAL', colorHex:'#c0392b', description:'Maestro del combate físico.', baseStats:{hp:1400,mp:180,atk:85,def:70,spd:60,crit:12,stamina:100}, evolution:['guardian','champion'], iconId:'class_guerrero' },
  { id:'mago', name:'Mago', role:'DPS/CONTROL', element:'ARCANE', colorHex:'#8e44ad', description:'Dobla las leyes del universo con su voluntad.', baseStats:{hp:900,mp:600,atk:130,def:35,spd:65,crit:18,stamina:70}, evolution:['archmage','void_scholar'], iconId:'class_mago' },
  { id:'arquero', name:'Arquero', role:'DPS/RANGER', element:'WIND', colorHex:'#27ae60', description:'Precisión letal desde la distancia.', baseStats:{hp:1050,mp:220,atk:110,def:42,spd:90,crit:30,stamina:85}, evolution:['hawk_striker','storm_ranger'], iconId:'class_arquero' },
  { id:'sacerdote', name:'Sacerdote', role:'HEALER', element:'HOLY', colorHex:'#f39c12', description:'Canal de la luz en las profundidades.', baseStats:{hp:1100,mp:550,atk:55,def:60,spd:55,crit:10,stamina:80}, evolution:['bishop','seraph_vessel'], iconId:'class_sacerdote' },
  { id:'berserker', name:'Berserker', role:'DPS', element:'BLOOD', colorHex:'#e74c3c', description:'La ira es su poder.', baseStats:{hp:1500,mp:100,atk:120,def:45,spd:75,crit:22,stamina:90}, evolution:['blood_reaver','chaos_incarnate'], iconId:'class_berserker' },
  { id:'picaro', name:'Pícaro', role:'ASSASSIN', element:'SHADOW', colorHex:'#2c3e50', description:'Las sombras son su hogar.', baseStats:{hp:1000,mp:280,atk:105,def:38,spd:100,crit:38,stamina:80}, evolution:['shadow_blade','phantom_strike'], iconId:'class_picaro' },
  { id:'caballero', name:'Caballero', role:'TANK', element:'HOLY', colorHex:'#2980b9', description:'Protector inquebrantable.', baseStats:{hp:1700,mp:200,atk:65,def:110,spd:45,crit:8,stamina:120}, evolution:['paladin','divine_sentinel'], iconId:'class_caballero' },
  { id:'hechicero', name:'Hechicero', role:'DPS', element:'SHADOW', colorHex:'#6c3483', description:'Maneja fuerzas oscuras que otros temen nombrar.', baseStats:{hp:850,mp:700,atk:145,def:28,spd:70,crit:25,stamina:65}, evolution:['dark_conduit','herald_of_ruin'], iconId:'class_hechicero' },
  { id:'paladin', name:'Paladín', role:'TANK/SUPPORT', element:'HOLY', colorHex:'#f1c40f', description:'Guerrero sagrado.', baseStats:{hp:1550,mp:350,atk:80,def:90,spd:50,crit:12,stamina:110}, evolution:['holy_avenger','celestial_warden'], iconId:'class_paladin' },
  { id:'invocador', name:'Invocador', role:'SUPPORT/DPS', element:'ARCANE', colorHex:'#1abc9c', description:'Convoca entidades del abismo.', baseStats:{hp:1050,mp:480,atk:75,def:50,spd:58,crit:14,stamina:75}, evolution:['rift_caller','void_sovereign'], iconId:'class_invocador' },
  { id:'explorador', name:'Explorador', role:'RANGER', element:'EARTH', colorHex:'#2ecc71', description:'El primero en cruzar toda brecha desconocida.', baseStats:{hp:1200,mp:250,atk:88,def:55,spd:88,crit:20,stamina:100}, evolution:['pathfinder','world_walker'], iconId:'class_explorador' },
  { id:'monje', name:'Monje', role:'DPS/CONTROL', element:'WIND', colorHex:'#e67e22', description:'El cuerpo es el arma.', baseStats:{hp:1300,mp:320,atk:98,def:58,spd:95,crit:28,stamina:95}, evolution:['iron_fist','tempest_sage'], iconId:'class_monje' },
  { id:'artifice', name:'Artífice', role:'DPS/SUPPORT', element:'ARCANE', colorHex:'#95a5a6', description:'Forja tecnología y magia en armas nunca vistas.', baseStats:{hp:1150,mp:400,atk:95,def:62,spd:65,crit:16,stamina:80}, evolution:['engineer','omega_forge'], iconId:'class_artifice' },
  { id:'asesino', name:'Asesino', role:'ASSASSIN', element:'VOID', colorHex:'#1c2833', description:'Un golpe. Un muerto.', baseStats:{hp:950,mp:300,atk:125,def:30,spd:115,crit:45,stamina:75}, evolution:['voidwalker','eternal_silence'], iconId:'class_asesino' },
  { id:'guardian', name:'Guardián', role:'TANK', element:'EARTH', colorHex:'#5d6d7e', description:'Nacido para proteger.', baseStats:{hp:2000,mp:220,atk:60,def:130,spd:40,crit:6,stamina:140}, evolution:['fortress','immortal_bastion'], iconId:'class_guardian' }
];

const FALLBACK_ENEMIES = [
  { id:'sombra_fracturada', name:'Sombra Fracturada', family:'ABYSSAL', tier:1, hp:280, atk:22, def:10, spd:45, element:'SHADOW', behavior:'AGGRESSIVE', lootTable:['materia_oscura'], xpReward:[18,30] },
  { id:'bestia_abisal', name:'Bestia Abisal', family:'BEAST', tier:1, hp:420, atk:35, def:18, spd:60, element:'PHYSICAL', behavior:'AGGRESSIVE', lootTable:['garra_bestia'], xpReward:[28,45] },
  { id:'espectro_dormido', name:'Espectro Dormido', family:'SPIRIT', tier:2, hp:350, atk:48, def:8, spd:55, element:'ARCANE', behavior:'RANGED', lootTable:['esencia_espectral'], xpReward:[38,60] },
  { id:'demonio_menor', name:'Demonio Menor', family:'DEMON', tier:2, hp:680, atk:72, def:35, spd:50, element:'FIRE', behavior:'AGGRESSIVE', lootTable:['nucleo_demoniaco'], xpReward:[70,110] }
];

const FALLBACK_SKILLS = [
  { id:'golpe_brutal', name:'Golpe Brutal', class:'guerrero', type:'ATTACK', element:'PHYSICAL', mpCost:15, cooldown:1, damage:1.4, effects:[], tags:['PHYSICAL'], rarity:'COMMON', description:'Un golpe directo que rompe cualquier guardia.' },
  { id:'torbellino', name:'Torbellino', class:'guerrero', type:'AOE', element:'PHYSICAL', mpCost:50, cooldown:5, damage:1.8, effects:[], tags:['PHYSICAL','AOE'], rarity:'RARE', description:'Gira destruyendo todo lo que rodea.' },
  { id:'grito_guerra', name:'Grito de Guerra', class:'guerrero', type:'BUFF', element:'PHYSICAL', mpCost:30, cooldown:4, damage:0, effects:['ATK_UP_20'], tags:['BUFF'], rarity:'UNCOMMON', description:'Eleva el ataque.' },
  { id:'bola_fuego', name:'Bola de Fuego Abisal', class:'mago', type:'ATTACK', element:'FIRE', mpCost:45, cooldown:2, damage:2.1, effects:['BURN_2'], tags:['FIRE'], rarity:'UNCOMMON', description:'Esfera de fuego imbuida con energía de Brecha.' },
  { id:'rayo_vacio', name:'Rayo del Vacío', class:'mago', type:'ATTACK', element:'LIGHTNING', mpCost:60, cooldown:3, damage:2.6, effects:['PARALYZE_1'], tags:['LIGHTNING'], rarity:'RARE', description:'Un rayo forjado en el vacío.' },
  { id:'tormenta_hielo', name:'Tormenta de Hielo', class:'mago', type:'AOE', element:'ICE', mpCost:80, cooldown:6, damage:1.9, effects:['FREEZE_2'], tags:['ICE','AOE'], rarity:'EPIC', description:'Congela el campo de batalla.' },
  { id:'golpe_sombra', name:'Golpe de Sombra', class:'picaro', type:'ATTACK', element:'SHADOW', mpCost:20, cooldown:1, damage:1.6, effects:['BLIND_1'], tags:['SHADOW'], rarity:'COMMON', description:'Materializa la sombra en un puñetazo cegador.' },
  { id:'sanacion_mayor', name:'Sanación Mayor', class:'sacerdote', type:'HEAL', element:'HOLY', mpCost:55, cooldown:3, damage:0, effects:['HEAL_400'], tags:['HOLY','HEAL'], rarity:'UNCOMMON', description:'Restaura la vitalidad con luz sagrada.' },
  { id:'furia_berserker', name:'Furia del Berserker', class:'berserker', type:'ULTIMATE', element:'BLOOD', mpCost:120, cooldown:12, damage:5.0, effects:['FRENZY_5'], tags:['BLOOD','ULTIMATE'], rarity:'LEGENDARY', description:'Estado de frenesí total.' },
  { id:'eco_del_abismo', name:'Eco del Abismo', class:'hechicero', type:'ATTACK', element:'VOID', mpCost:90, cooldown:7, damage:3.2, effects:['CURSE_3'], tags:['VOID'], rarity:'EPIC', description:'El sonido del abismo hecho arma.' },
  { id:'ejecucion', name:'Ejecución', class:'asesino', type:'ATTACK', element:'VOID', mpCost:70, cooldown:8, damage:4.5, effects:['EXECUTE'], tags:['VOID','EXECUTE'], rarity:'EPIC', description:'Golpe definitivo al objetivo débil.' },
  { id:'flecha_rapida', name:'Flecha Rápida', class:'arquero', type:'ATTACK', element:'WIND', mpCost:18, cooldown:1, damage:1.3, effects:[], tags:['WIND','RANGED'], rarity:'COMMON', description:'Disparo veloz de alta precisión.' }
];

const FALLBACK_STORY = {
  prologue: {
    id:'prologue', title:'El Primer Eco',
    chapters:[{
      id:'p_01', title:'La Noche que el Mundo Cambió',
      scenes:[
        { id:'s_001', type:'narration', text:'No hubo advertencia. No hubo señal. El cielo simplemente se abrió.', mood:'dark', bg:'bg_city_night' },
        { id:'s_002', type:'narration', text:'En cuestión de horas, las grietas comenzaron a aparecer en cada ciudad del mundo. Las llamaron Brechas. Lo que salió de ellas no tenía nombre.', mood:'dark', bg:'bg_rift_opening' },
        { id:'s_003', type:'narration', text:'Algunos murieron. Otros huyeron. Un pequeño grupo descubrió algo inesperado: ellos podían resonar con las Brechas. Podían entrar.', mood:'tense', bg:'bg_city_night' },
        { id:'s_004', type:'narration', text:'Los llamaron Los Resonadores. Tú eres uno de ellos.', mood:'revelation', bg:'bg_resonator_emblem' },
        { id:'s_005', type:'choice', text:'¿Recuerdas el momento en que sentiste el Eco por primera vez?', choices:[
          { id:'c_001_a', text:'Fue en un sueño. Oí algo que me llamaba desde abajo.', flag:'origin_dream', effect:'arcane_affinity' },
          { id:'c_001_b', text:'Fue durante el Primer Evento. Lo vi con mis propios ojos.', flag:'origin_witness', effect:'perception_bonus' },
          { id:'c_001_c', text:'No lo recuerdo. Solo sé que puedo hacerlo.', flag:'origin_unknown', effect:'mystery_path' }
        ]},
        { id:'s_006', type:'dialogue', speaker:'Eira', speakerRole:'Comandante de los Resonadores', text:'Llevas días cerca de las Brechas sin morir. Eso no es casualidad. Ven conmigo.', mood:'neutral', bg:'bg_command_post' },
        { id:'s_007', type:'dialogue', speaker:'Eira', text:'Los Resonadores necesitan gente que pueda entrar y salir. El mundo de fuera está cediendo. Lo que sea que envía estas cosas... está ganando terreno.', mood:'tense', bg:'bg_command_post' },
        { id:'s_008', type:'narration', text:'Ella no te pidió que dijeras sí. Sabía que ya lo habías decidido.', mood:'dark', bg:'bg_command_post' }
      ]
    }]
  }
};

export class LoadingScene extends Phaser.Scene {
  constructor() { super({ key: 'LoadingScene' }); }

  preload() {
    const bar = document.getElementById('loadBar');
    const status = document.getElementById('loadStatus');

    // Mostrar tip al usuario mientras carga
    if (status) {
      const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
      setTimeout(() => { if (status) status.textContent = `"${tip}"`; }, 600);
    }

    // Listener de progreso
    this.load.on('progress', (v) => {
      if (bar) bar.style.width = Math.round(v * 100) + '%';
    });

    this.load.on('fileprogress', (file) => {
      if (status) status.textContent = 'Cargando ' + file.key + '...';
    });

    // Cargar JSONs con URL absoluta y manejo de error
    this.load.json('classes', '/assets/data/classes.json');
    this.load.json('enemies', '/assets/data/enemies.json');
    this.load.json('skills',  '/assets/data/skills.json');
    this.load.json('items',   '/assets/data/items.json');
    this.load.json('story',   '/assets/data/story.json');

    // Si falla algún archivo, usar fallback (no bloquear)
    this.load.on('loaderror', (file) => {
      console.warn('[ABYSSAL] No se pudo cargar:', file.src, '— usando datos por defecto');
    });
  }

  create() {
    const bar = document.getElementById('loadBar');
    const status = document.getElementById('loadStatus');
    if (bar) bar.style.width = '100%';
    if (status) status.textContent = 'Preparando el abismo...';

    // Usar JSON cargado o fallback si está vacío/null
    const classes = this.cache.json.get('classes') || FALLBACK_CLASSES;
    const enemies = this.cache.json.get('enemies') || FALLBACK_ENEMIES;
    const skills  = this.cache.json.get('skills')  || FALLBACK_SKILLS;
    const items   = this.cache.json.get('items')   || [];
    const story   = this.cache.json.get('story')   || FALLBACK_STORY;

    this.registry.set('classesData', classes.length ? classes : FALLBACK_CLASSES);
    this.registry.set('enemiesData', enemies.length ? enemies : FALLBACK_ENEMIES);
    this.registry.set('skillsData',  skills.length  ? skills  : FALLBACK_SKILLS);
    this.registry.set('itemsData',   items);
    this.registry.set('storyData',   story);

    // Ocultar loading screen HTML con fade
    const loadScreen = document.getElementById('loading-screen');
    if (loadScreen) {
      loadScreen.style.transition = 'opacity 0.5s ease';
      loadScreen.style.opacity = '0';
      setTimeout(() => { loadScreen.classList.add('hidden'); }, 550);
    }

    this.time.delayedCall(600, () => {
      this.scene.start('MainMenuScene');
    });
  }
}
