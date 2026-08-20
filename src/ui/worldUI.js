// World screens: free/world mode, dungeon, combat HUD, joystick
import { showScreen, clear, toast, btn, el } from './ui.js';
import { dayPhase, hourOfDay } from '../world/encounters.js';
import { sfx } from '../audio/audio.js';

export function screenFreeMode(game) {
  showScreen(game.app, (s) => {
    s.style.justifyContent = 'flex-start';
    s.style.alignItems = 'stretch';
    // attach 3D canvas
    s.appendChild(game.render.renderer.domElement);
    s.appendChild(buildHUD(game, 'free'));
    s.appendChild(buildJoystick(game));
  });
}

export function screenWorldMode(game) {
  showScreen(game.app, (s) => {
    s.style.justifyContent = 'flex-start';
    s.style.alignItems = 'stretch';
    s.appendChild(game.render.renderer.domElement);
    const gps = game.gps;
    if (!gps.enabled && gps.isAvailable()) {
      gps.onUpdate(() => {
        if (gps.state === 'stable') {
          const p = game.player;
          p.x = gps.worldX * 0.3; p.z = gps.worldZ * 0.3;
        }
      });
      gps.enable();
    }
    s.appendChild(buildHUD(game, 'real'));
    s.appendChild(buildJoystick(game));
  });
}

export function screenDungeon(game) {
  showScreen(game.app, (s) => {
    s.style.justifyContent = 'flex-start';
    s.style.alignItems = 'stretch';
    s.appendChild(game.render.renderer.domElement);
    s.appendChild(buildHUD(game, 'dungeon'));
    s.appendChild(buildJoystick(game));
  });
}

function buildHUD(game, mode) {
  const hud = el('div', { class: 'hud' });
  const top = el('div', { class: 'top' });
  const bars = el('div', { class: 'bars' });
  bars.appendChild(el('div', { class: 'bar hp', id: 'hpbar', html: '<div class="fill"></div><span id="hptext"></span>' }));
  bars.appendChild(el('div', { class: 'bar mp', id: 'mpbar', html: '<div class="fill"></div><span id="mptext"></span>' }));
  bars.appendChild(el('div', { class: 'bar xp', id: 'xpbar', html: '<div class="fill"></div><span id="xptext"></span>' }));
  top.appendChild(bars);
  const badge = el('div', { class: 'badge', id: 'modebadge' });
  badge.innerHTML = `<span style="color:var(--accent)">${mode === 'free' ? '🌀 PROYECCIÓN' : mode === 'real' ? '🌍 MUNDO REAL · ' + dayPhase(hourOfDay()) : '🏰 MAZMORRA'}</span>`;
  top.appendChild(badge);
  hud.appendChild(top);
  // log area
  hud.appendChild(el('div', { class: 'log', id: 'worldlog' }));
  // save button
  const saveBtn = el('button', { class: 'skillbtn', style: 'font-size:20px;', onclick: () => game.save() });
  saveBtn.appendChild(document.createTextNode('💾'));
  const actions = el('div', { class: 'skillbar', style: 'bottom:calc(var(--st-bottom) + 20px);right:16px;left:auto;' });
  actions.appendChild(saveBtn);
  hud.appendChild(actions);
  return hud;
}

function buildJoystick(game) {
  const joy = el('div', { class: 'joystick' });
  const base = el('div', { class: 'base' });
  const knob = el('div', { class: 'knob' });
  joy.appendChild(base); joy.appendChild(knob);
  let active = false;
  const maxR = 34;
  const clamp = (v, m) => Math.max(-m, Math.min(m, v));
  function move(e) {
    const rect = joy.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const dx = clamp(e.clientX - cx, maxR);
    const dy = clamp(e.clientY - cy, maxR);
    knob.style.left = (rect.width / 2 - 23 + dx) + 'px';
    knob.style.top = (rect.height / 2 - 23 + dy) + 'px';
    game.joy.x = dx / maxR;
    game.joy.y = dy / maxR;
  }
  function end() {
    active = false;
    game.joy.x = 0; game.joy.y = 0;
    knob.style.left = '37px'; knob.style.top = '37px';
  }
  joy.addEventListener('touchstart', (e) => { active = true; sfx.hover(); move(e.touches[0]); e.preventDefault(); }, { passive: false });
  joy.addEventListener('touchmove', (e) => { if (active) move(e.touches[0]); e.preventDefault(); }, { passive: false });
  joy.addEventListener('touchend', end);
  joy.addEventListener('mousedown', (e) => { active = true; move(e); });
  window.addEventListener('mousemove', (e) => { if (active) move(e); });
  window.addEventListener('mouseup', end);
  return joy;
}

// ---------- COMBAT ----------
export function screenCombat(game, combat) {
  showScreen(game.app, (s) => {
    s.style.justifyContent = 'flex-start';
    s.style.alignItems = 'stretch';
    s.appendChild(game.render.renderer.domElement);
    const hud = el('div', { class: 'hud' });
    const top = el('div', { class: 'top' });
    top.appendChild(el('div', { class: 'bars', id: 'enemybars',
      html: `<div style="font-size:14px;font-weight:800;margin-bottom:4px;"><span id="enemyname"></span></div>
             <div class="bar hp"><div class="fill" id="enemyfill"></div><span id="enemytext"></span></div>` }));
    const badge = el('div', { class: 'badge', id: 'phasebadge' });
    badge.innerHTML = 'Fase 1';
    top.appendChild(badge);
    hud.appendChild(top);
    // player bars (bottom-right)
    const pbars = el('div', { class: 'bars', style: 'position:absolute;left:12px;bottom:calc(var(--st-bottom) + 16px);width:min(200px,50vw);' });
    pbars.appendChild(el('div', { class: 'bar hp', id: 'hpbar', html: '<div class="fill"></div><span id="hptext"></span>' }));
    pbars.appendChild(el('div', { class: 'bar mp', id: 'mpbar', html: '<div class="fill"></div><span id="mptext"></span>' }));
    hud.appendChild(pbars);
    // log
    hud.appendChild(el('div', { class: 'log', id: 'clog', style: 'top:calc(var(--st-top) + 110px);' }));
    // skill bar
    const bar = el('div', { class: 'skillbar' });
    combat.player.skills.filter(s => s.type !== 'ultimate').forEach((skill) => {
      const b = el('button', { class: 'skillbtn', id: 'sk_' + skill.id, onclick: () => { combat.cast(skill.id); sfx.skill(); } });
      b.innerHTML = `<span style="font-size:20px;color:${skill.color}">${skillIcon(skill.icon)}</span><span>${skill.name}</span>`;
      if (skill.cost > 0) b.innerHTML += `<span style="font-size:10px;color:var(--dim)">${skill.cost}mp</span>`;
      bar.appendChild(b);
    });
    const ult = el('button', { class: 'skillbtn', style: 'border-color:var(--secondary);', onclick: () => { combat.castUltimate(); sfx.ultimate(); } });
    ult.id = 'ultbtn';
    ult.innerHTML = `<span style="font-size:20px">✦</span><span>ULT</span><div class="ult-fill" id="ultfill"></div>`;
    bar.appendChild(ult);
    hud.appendChild(bar);
    s.appendChild(hud);
    updateCombatHUD(game, combat.snapshot());
  });
}

export function updateCombatHUD(game, snap) {
  const hp = document.getElementById('hpbar');
  const mp = document.getElementById('mpbar');
  if (hp) { hp.querySelector('.fill').style.width = (snap.playerHp / snap.playerMaxHp) * 100 + '%'; hp.querySelector('span').textContent = snap.playerHp + ' / ' + snap.playerMaxHp; }
  if (mp) { mp.querySelector('.fill').style.width = (snap.playerMp / snap.playerMaxMp) * 100 + '%'; mp.querySelector('span').textContent = snap.playerMp + ' / ' + snap.playerMaxMp; }
  const efill = document.getElementById('enemyfill');
  if (efill) { efill.style.width = (snap.enemyHp / snap.enemyMaxHp) * 100 + '%'; }
  const en = document.getElementById('enemytext');
  if (en) en.textContent = snap.enemyHp + ' / ' + snap.enemyMaxHp;
  const enname = document.getElementById('enemyname');
  if (enname) enname.textContent = snap.enemyName + ' · Nv ' + snap.enemyLevel;
  const ph = document.getElementById('phasebadge');
  if (ph && snap.phases > 1) ph.innerHTML = 'Fase ' + snap.phase + '/' + snap.phases;
  const ultfill = document.getElementById('ultfill');
  if (ultfill) ultfill.style.height = (snap.ultimate * 100) + '%';
  // cooldowns
  for (const id in snap.cooldowns) {
    const b = document.getElementById('sk_' + id);
    if (b) {
      const old = b.querySelector('.cd');
      if (old) old.remove();
      if (snap.cooldowns[id] > 0) {
        const cd = el('div', { class: 'cd', html: snap.cooldowns[id].toFixed(1) });
        b.appendChild(cd);
      }
    }
  }
  // log
  const clog = document.getElementById('clog');
  if (clog && snap.log && snap.log.length) {
    const last = snap.log[snap.log.length - 1];
    clog.innerHTML = `<div class="${last.kind === 'combo' ? 'combo' : last.kind === 'ultimate' ? 'ultimate' : ''}">${last.msg}</div>` + clog.innerHTML.slice(0, 400);
  }
}

function skillIcon(icon) {
  const map = { sword: '🗡️', shield: '🛡️', fire: '🔥', ice: '❄️', bolt: '⚡', shadow: '🌑', holy: '✨', poison: '☠️', blood: '🩸', wind: '🌪️', earth: '🪨', magic: '🔮', void: '🌀', axe: '🪓', bow: '🏹', dagger: '🗡️' };
  return map[icon] || '⚔️';
}
