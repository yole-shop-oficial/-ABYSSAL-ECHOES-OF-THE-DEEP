// Main Game controller: state routing, render loop, world, combat, multiplayer
import { GAME, STATES } from './constants.js';
import { bus } from './eventBus.js';
import { Player } from '../player/player.js';
import { MapModel, worldSeed } from '../world/map.js';
import { EncounterEngine, dayPhase, hourOfDay } from '../world/encounters.js';
import { Dungeon } from '../dungeon/dungeonGenerator.js';
import { ENEMIES } from '../data/enemies.js';
import { Combat } from '../combat/combat.js';
import { GpsService } from '../gps/gps.js';
import { NetHost, drawQR } from '../multiplayer/net.js';
import { createRenderer, buildWorld, makePlayerMesh, makeEnemyMesh, clearGroup } from '../render/renderer.js';
import { saveGame, loadGame, hasSave, deleteSave, exportSave } from '../storage/save.js';
import { showScreen, clear, toast, btn, el, modal } from '../ui/ui.js';
import * as ui from '../ui/screens.js';
import * as worldUI from '../ui/worldUI.js';
import { sfx } from '../audio/audio.js';
import { generateLoot } from '../player/progression.js';

export class Game {
  constructor(app) {
    this.app = app;
    this.state = STATES.BOOT;
    this.player = null;
    this.map = null;
    this.engine = new EncounterEngine(null);
    this.gps = new GpsService();
    this.net = new NetHost({});
    this.freeSeed = (Math.random() * 1e9) | 0;
    this.tileSize = 3;
    this.joy = { x: 0, y: 0 };
    this.combat = null;
    this.currentDungeon = null;
    this.movementDistance = 0;
    this.accumulatedMove = 0;
    this._keys = {};
  }

  boot() {
    this._setupInput();
    this.render = createRenderer(this.app);
    this.worldGroup = new THREE.Group();
    this.enemyGroup = new THREE.Group();
    this.playerMesh = makePlayerMesh(0x4aa8ff);
    this.playerMesh.visible = false;
    this.render.scene.add(this.worldGroup);
    this.render.scene.add(this.enemyGroup);
    this.render.scene.add(this.playerMesh);
    bus.on('combat:update', (s) => worldUI.updateCombatHUD(this, s));
    // Fase 2 redesign: carga rápida + modo libre directo (sin menú de modos ni carga doble)
    setTimeout(() => this.startFreeMode(), 2200);
    this._loop();
  }

  _setupInput() {
    window.addEventListener('keydown', (e) => this._keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', (e) => this._keys[e.key.toLowerCase()] = false);
  }

  // ---------- SCREEN FLOW ----------
  showLoading(onDone) {
    this.state = STATES.LOADING;
    ui.screenLoading(this, onDone);
  }

  showMainMenu() {
    this.state = STATES.MAIN_MENU;
    ui.screenMainMenu(this);
  }

  showCharacterCreation(existing) {
    this.state = STATES.CHARACTER_CREATION;
    ui.screenCharacterCreation(this, existing);
  }

  showModeSelect() {
    this.state = STATES.MODE_SELECT;
    ui.screenModeSelect(this);
  }

  showInventory() {
    ui.screenInventory(this);
  }

  showProfile() {
    ui.screenProfile(this);
  }

  showSettings() {
    ui.screenSettings(this);
  }

  showMultiplayer() {
    ui.screenMultiplayer(this);
  }

  showBreachIntro() {
    ui.screenBreach(this);
  }

  // ---------- WORLD MODES ----------
  startFreeMode() {
    const ld = document.getElementById("load-screen"); if (ld) { ld.style.opacity = "0"; setTimeout(() => ld.remove(), 1500); }
    this.state = STATES.FREE_MODE;
    this.player.mode = 'free';
    this.map = new MapModel(this.freeSeed);
    this.engine = new EncounterEngine(this.player);
    buildWorld(this.worldGroup, this.map, this.tileSize);
    this.player.x = 0; this.player.z = 0;
    this.movementDistance = 0;
    this.accumulatedMove = 0;
    this.playerMesh.visible = true;
    // Fase 2 rediseño: luz para que no sea negro total + mensaje inicial
    const THREE = window.THREE || globalThis.THREE;
    const amb = new THREE.AmbientLight(0x223344, 0.8);
    this.render.scene.add(amb);
    const dir = new THREE.DirectionalLight(0x4aa8ff, 1.0);
    dir.position.set(10, 20, 10);
    this.render.scene.add(dir);
    this.render.setClearColor(0x030814);
    worldUI.screenFreeMode(this);
    toast('🌀 Proyección activa. Explora el Reino de las Brechas.');
  }

  startWorldMode() {
    this.state = STATES.WORLD_MODE;
    this.player.mode = 'real';
    this.map = new MapModel((Math.random() * 1e9) | 0);
    this.engine = new EncounterEngine(this.player);
    buildWorld(this.worldGroup, this.map, this.tileSize);
    this.playerMesh.visible = true;
    worldUI.screenWorldMode(this);
    toast('🌍 Mundo Real. Camina por tu ciudad.');
  }

  enterDungeon(biome, seed) {
    this.state = STATES.DUNGEON;
    this.currentDungeon = Dungeon.new(seed, 1, biome);
    worldUI.screenDungeon(this);
    toast('Entras en: ' + biome.name);
  }

  enterBreach(biome) {
    sfx.breach();
    this.state = STATES.DUNGEON;
    this.currentDungeon = Dungeon.new((Math.random() * 1e9) | 0, 1, biome);
    this.player.discoveries.brechas++;
    worldUI.screenDungeon(this);
    toast('🌀 Has cruzado la Brecha hacia: ' + biome.name);
  }

  // ---------- COMBAT ----------
  startCombat(enemyDef, opts = {}) {
    this.state = STATES.BATTLE;
    const level = opts.level != null ? opts.level : this.player.level;
    this.combat = new Combat(this.player, enemyDef, {
      level, seed: (Math.random() * 1e9) | 0,
      dungeon: this.currentDungeon,
      onEnd: (r) => this._combatEnd(r)
    });
    // build enemy mesh
    clearGroup(this.enemyGroup);
    const em = makeEnemyMesh(enemyDef.color, enemyDef.isBoss);
    em.position.set(0, 0, -7);
    this.enemyGroup.add(em);
    this.playerMesh.position.set(0, 0, 4);
    this.playerMesh.rotation.y = Math.PI;
    // combat camera
    const cam = this.render.camera;
    cam.position.set(0, 3.2, 7);
    cam.lookAt(0, 1.2, -3);
    worldUI.screenCombat(this, this.combat);
    sfx.enemy();
  }

  _combatEnd(result) {
    if (result.win) {
      saveGame(this.player);
      if (result.loot.length) toast('🎁 Loot obtenido: ' + result.loot.map(l => l.name).join(', '));
    } else {
      // soft death (section 91)
      this.player.hp = Math.floor(this.player.maxHp * 0.4);
      this.player.isDead = false;
      toast('Has caído... pero el Abismo te devuelve. [pérdida leve]');
    }
    setTimeout(() => {
      if (this.currentDungeon) { this.state = STATES.DUNGEON; worldUI.screenDungeon(this); }
      else { this.state = STATES.FREE_MODE; worldUI.screenFreeMode(this); }
    }, 1400);
  }

  // ---------- LOOP ----------
  _loop() {
    const tick = () => {
      requestAnimationFrame(tick);
      const dt = 1 / 60;
      if (this.state === STATES.FREE_MODE || this.state === STATES.WORLD_MODE) {
        this._updateWorld(dt);
      } else if (this.state === STATES.DUNGEON) {
        this._updateDungeon(dt);
      } else if (this.state === STATES.BATTLE && this.combat) {
        this.combat.update(dt);
      }
      this._renderWorld();
    };
    tick();
  }

  _updateWorld(dt) {
    let mx = this.joy.x, mz = this.joy.y;
    if (this._keys['w']) mz = 1; if (this._keys['s']) mz = -1;
    if (this._keys['a']) mx = -1; if (this._keys['d']) mx = 1;
    const speed = 5 * dt;
    let dx = mx * speed, dz = mz * speed;
    let nx = this.player.x + dx, nz = this.player.z - dz;
    // world bounds & walkability
    const half = this.map.size * this.tileSize / 2;
    nx = Math.max(-half, Math.min(half, nx));
    nz = Math.max(-half, Math.min(half, nz));
    if (this.map.isWalkable(nx, nz)) {
      this.player.x = nx; this.player.z = nz;
    }
    if (mx || mz) {
      this.player.rotation = Math.atan2(mx, mz);
      const dist = Math.hypot(dx, dz);
      this.movementDistance += dist;
      this.player.stats.virtualDistance += dist;
      // encounters
      this.accumulatedMove += dist;
      const biome = this.map.biomeAt(this.player.x, this.player.z);
      if (this.engine.rollEncounter(this.accumulatedMove, biome)) {
        this.accumulatedMove = 0;
        const enemy = this.engine.spawnEnemy(biome);
        this.startCombat(enemy, { level: Math.max(1, this.player.level) });
        return;
      }
      // check POI proximity
      this._checkPOI();
    }
    this.playerMesh.position.set(this.player.x, 0, this.player.z);
    this.playerMesh.rotation.y = this.player.rotation;
    // camera follows player
    this._updateCamera();
  }

  _checkPOI() {
    const poi = this.map.nearestPoi(this.player.x, this.player.z);
    if (poi && poi.distance < 1.6) {
      if (poi.type === 'mazmorra' || poi.type === 'brecha') {
        this.enterDungeon(poi.biome, (Math.random() * 1e9) | 0);
      } else if (poi.type === 'aldea' && !this.player.flags.villageVisited) {
        this.player.flags.villageVisited = true;
        toast('🏚️ Aldea del Reino. Los NPC te saludan.');
        sfx.unlock();
      }
    }
  }

  _updateDungeon(dt) {
    let mx = this.joy.x, mz = this.joy.y;
    if (this._keys['w']) mz = 1; if (this._keys['s']) mz = -1;
    if (this._keys['a']) mx = -1; if (this._keys['d']) mx = 1;
    const speed = 5 * dt;
    let dx = mx * speed, dz = mz * speed;
    const nx = this.player.x + dx, nz = this.player.z - dz;
    this.player.x = nx; this.player.z = nz;
    if (mx || mz) { this.player.rotation = Math.atan2(mx, mz); }
    // check room trigger
    const room = this.currentDungeon.roomAt(this.player.x, this.player.z);
    if (room && !room.cleared) {
      if (room.type === 'boss' || room.type === 'encounter' || room.type === 'elite') {
        room.cleared = true;
        const enemy = room.enemy || (room.type === 'boss' ? this._bossDef() : this._randomDungeonEnemy());
        this.startCombat(enemy, { level: this.currentDungeon.depth + 1 });
        return;
      }
      if (room.type === 'treasure') {
        room.cleared = true;
        const loot = generateLoot(this.player.level, null, 1);
        loot.forEach(it => this.player.addItem(it));
        toast('💎 Tesoro: ' + loot.map(l => l.name).join(', '));
        sfx.pickup();
      }
      if (room.type === 'event') { room.cleared = true; this._dungeonEvent(); }
    }
    this.playerMesh.position.set(this.player.x, 0, this.player.z);
    this.playerMesh.rotation.y = this.player.rotation;
    this._updateCamera();
  }

  _bossDef() {
    const boss = ENEMIES.find(e => e.isBoss) || ENEMIES[0];
    return { ...boss, level: this.player.level + 2 };
  }

  _randomDungeonEnemy() {
    const ids = ['sombras','bestia','golem','demonio','no_muerto'];
    const id = ids[Math.floor(Math.random() * ids.length)];
    return ENEMIES.find(e => e.id === id);
  }

  _dungeonEvent() {
    const events = [
      'Un altar olvidado emite luz. [Flag: altar_visitado]',
      'Encuentras runas antiguas. +20 XP',
      'Un susurro te habla desde las paredes...',
      'Cae un botín de un cofre oculto.'
    ];
    const e = events[Math.floor(Math.random() * events.length)];
    if (e.includes('XP')) { this.player.addXp(20); toast('✨ +20 XP'); }
    else toast(e);
  }

  _updateCamera() {
    const cam = this.render.camera;
    cam.position.set(this.player.x, 18, this.player.z + 12);
    cam.lookAt(this.player.x, 0, this.player.z);
  }

  _renderWorld() {
    if (this.state === STATES.DUNGEON) {
      // darken dungeon feel
      this.render.scene.background = new THREE.Color(0x0a0614);
    } else {
      this.render.scene.background = new THREE.Color(0x05080f);
    }
    this.render.renderer.render(this.render.scene, this.render.camera);
  }

  save() { saveGame(this.player); toast('💾 Partida guardada'); }
}
// Fase 2: ocultar carga cuando arranque modo libre
