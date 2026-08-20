// Screen builders: loading, main menu, character creation, mode select, etc.
import { GAME, CLASSES, STATES } from '../core/constants.js';
import { CLASS_DATA } from '../data/classes.js';
import { LOADING_TIPS, INTRO, MODES } from '../data/lore.js';
import { hasSave, loadGame, deleteSave, exportSave, importSave } from '../storage/save.js';
import { Player } from '../player/player.js';
import { powerTotal } from '../player/progression.js';
import { showScreen, clear, toast, btn, el, modal } from './ui.js';
import { sfx } from '../audio/audio.js';

export function screenLoading(game, onDone) {
  showScreen(game.app, (s) => {
    s.appendChild(el('div', { class: 'spinner' }));
    const steps = ['Inicializando mundo', 'Cargando recursos', 'Cargando región', 'Preparando aventurero'];
    let i = 0;
    const title = el('h1', { class: 'title', html: GAME.NAME });
    const tip = el('div', { style: 'margin-top:20px;color:var(--dim);font-size:13px;text-align:center;max-width:300px;' });
    const bar = el('div', { class: 'progress' });
    const fill = el('div', { class: 'fill', style: 'width:0%' });
    bar.appendChild(fill);
    const status = el('div', { style: 'margin-top:10px;color:var(--text);font-size:14px;' });
    s.appendChild(title); s.appendChild(tip); s.appendChild(bar); s.appendChild(status);
    tip.textContent = LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)];
    const iv = setInterval(() => {
      i += 1;
      const pct = Math.min(100, i * 12);
      fill.style.width = pct + '%';
      status.textContent = steps[Math.min(steps.length - 1, Math.floor(i / 2))] + '... ' + pct + '%';
      if (pct >= 100) { clearInterval(iv); setTimeout(onDone, 300); }
    }, 110);
  });
}

export function screenMainMenu(game) {
  showScreen(game.app, (s) => {
    s.appendChild(el('h1', { class: 'title', html: GAME.NAME }));
    s.appendChild(el('div', { class: 'subtitle', html: 'Ecos del Abismo' }));
    s.appendChild(el('div', { style: 'margin-top:10px;color:var(--dim);font-size:13px;', html: 'RPG de fantasía oscura · PWA · Offline-first' }));
    const menu = el('div', { class: 'menu' });
    if (hasSave() && !game.player) {
      menu.appendChild(btn('▶ Continuar Aventura', () => { game.player = loadGame(); game.showModeSelect(); }, { class: 'primary', icon: '▶' }));
    }
    if (game.player) {
      menu.appendChild(btn('▶ Continuar (' + game.player.name + ')', () => game.showModeSelect(), { class: 'primary', icon: '▶' }));
    }
    menu.appendChild(btn('🆕 Nueva Aventura', () => game.showCharacterCreation(null), { icon: '✦' }));
    menu.appendChild(btn('📜 Historial / Lore', () => screenLore(game), { icon: '📜' }));
    menu.appendChild(btn('🌐 Multijugador Local', () => game.showMultiplayer(), { icon: '📶' }));
    menu.appendChild(btn('⚙️ Ajustes', () => game.showSettings(), { icon: '⚙️' }));
    menu.appendChild(btn('💾 Guardar', () => game.save(), { icon: '💾' }));
    if (hasSave()) menu.appendChild(btn('🗑 Borrar Partida', () => { if (confirm('¿Borrar la partida local?')) { deleteSave(); location.reload(); } }, { class: 'danger', icon: '🗑' }));
    s.appendChild(menu);
  });
}

export function screenCharacterCreation(game, existing) {
  showScreen(game.app, (s) => {
    s.appendChild(el('h2', { class: 'title', html: 'Crea tu Aventurero' }));
    const p = existing || game.player || new Player();
    if (!existing && game.player) { p.classId = game.player.classId; p.name = game.player.name; }
    const name = el('input', { value: p.name, placeholder: 'Nombre del aventurero' });
    name.style.marginBottom = '16px';
    s.appendChild(name);
    const grid = el('div', { class: 'grid grid2', style: 'width:min(480px,92vw);max-height:50vh;overflow-y:auto;' });
    CLASS_DATA.forEach((c) => {
      const card = el('button', {
        class: 'btn', style: 'flex-direction:column;align-items:flex-start;gap:4px;' +
          (c.id === p.classId ? 'border-color:var(--primary);box-shadow:0 0 14px var(--glow);' : ''),
        onclick: () => { p.classId = c.id; refresh(); sfx.click(); }
      });
      card.innerHTML = `<b>${c.name}</b><span style="font-size:11px;color:var(--dim)">${c.desc}</span>`;
      grid.appendChild(card);
    });
    s.appendChild(grid);
    const info = el('div', { class: 'card', style: 'margin-top:12px;width:min(480px,92vw);' });
    const refresh = () => {
      const c = CLASS_DATA.find(x => x.id === p.classId);
      p.classId = c.id;
      p.applyClass();
      info.innerHTML = '';
      info.appendChild(el('div', { html: `<b style="color:${c.color}">${c.name}</b> · Evolución: ${c.evolve.join(' → ')}` }));
      const stats = ['hp','mp','atk','def','spd','crit'];
      const st = el('div', { class: 'grid grid2', style: 'margin-top:8px;' });
      stats.forEach(k => st.appendChild(el('div', { class: 'stat', html: `<span>${k.toUpperCase()}</span><b>${c.base[k]}</b>` })));
      info.appendChild(st);
    };
    refresh();
    s.appendChild(info);
    const row = el('div', { style: 'display:flex;gap:10px;margin-top:16px;' });
    row.appendChild(btn('✅ Comenzar', () => {
      p.name = name.value.trim() || 'Aventurero';
      p.applyClass();
      game.player = p;
      sfx.levelup();
      toast('Bienvenido, ' + p.name + '. El Abismo te observa.');
      game.showModeSelect();
    }, { class: 'primary' }));
    row.appendChild(btn('Volver', () => game.showMainMenu()));
    s.appendChild(row);
  });
}

export function screenModeSelect(game) {
  showScreen(game.app, (s) => {
    s.appendChild(el('h2', { class: 'title', html: 'Elige tu modo' }));
    const p = game.player;
    s.appendChild(el('div', { class: 'stat', style: 'width:min(360px,90vw);margin:12px 0;', html: `<span>${p.name}</span><b>Nv ${p.level} · ${p.class.name} · Poder ${powerTotal(p)}</b>` }));
    const menu = el('div', { class: 'menu' });
    menu.appendChild(btn(MODES.free.title + ' — ' + MODES.free.desc, () => game.startFreeMode(), { class: 'primary', icon: '🌀' }));
    menu.appendChild(btn(MODES.real.title + ' — ' + MODES.real.desc, () => game.startWorldMode(), { class: 'primary', icon: '🌍' }));
    menu.appendChild(btn('🎒 Inventario', () => game.showInventory(), { icon: '🎒' }));
    menu.appendChild(btn('👤 Personaje', () => game.showProfile(), { icon: '👤' }));
    menu.appendChild(btn('📜 Lore', () => screenLore(game), { icon: '📜' }));
    menu.appendChild(btn('💾 Guardar', () => game.save(), { icon: '💾' }));
    menu.appendChild(btn('Menú', () => game.showMainMenu()));
    s.appendChild(menu);
  });
}

export function screenInventory(game) {
  const p = game.player;
  showScreen(game.app, (s) => {
    s.appendChild(el('h2', { class: 'title', html: '🎒 Inventario' }));
    const wrap = el('div', { class: 'panel-scroll', style: 'width:min(480px,92vw);' });
    const stats = el('div', { class: 'card', style: 'margin-bottom:10px;' });
    const st = p.effectiveStats;
    stats.innerHTML = `<b>Equipo equipado:</b> ${Object.entries(p.equipment).map(([slot,it]) => `${slot}: ${it.name}`).join(' | ') || 'nada'}`;
    wrap.appendChild(stats);
    if (!p.inventory.length) wrap.appendChild(el('div', { style: 'color:var(--dim);padding:10px;', html: 'Sin objetos aún.' }));
    p.inventory.forEach((it, i) => {
      const c = el('div', { class: 'card', style: 'margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;' });
      const statsStr = Object.entries(it.stats || {}).map(([k,v]) => `${k}:${v}`).join(', ');
      c.innerHTML = `<div><b>${it.name}</b><div style="font-size:11px;color:var(--dim)">${it.rarity} · ${statsStr}</div></div>`;
      const actions = el('div', { style: 'display:flex;gap:6px;' });
      if (it.slot === 'consumible') {
        actions.appendChild(btn('Usar', () => { p.heal(it.stats.hp || 30); p.inventory.splice(i,1); toast('🧪 +' + (it.stats.hp||30) + ' HP'); sfx.pickup(); game.showInventory(); }, { class: 'small' }));
      } else {
        actions.appendChild(btn('Equipar', () => { p.equipment[it.slot] = it; toast('Equipado: ' + it.name); sfx.unlock(); game.showInventory(); }, { class: 'small' }));
      }
      c.appendChild(actions);
      wrap.appendChild(c);
    });
    s.appendChild(wrap);
    s.appendChild(btn('Volver', () => game.showModeSelect()));
  });
}

export function screenProfile(game) {
  const p = game.player;
  showScreen(game.app, (s) => {
    s.appendChild(el('h2', { class: 'title', html: p.name }));
    const card = el('div', { class: 'card', style: 'width:min(420px,90vw);' });
    const rows = [
      ['Clase', p.class.name], ['Nivel', p.level], ['Poder total', powerTotal(p)],
      ['XP', p.xp + ' / ' + p.xpNext], ['Títulos', p.titles.join(', ') || '—'],
      ['Descubrimientos', `Brechas ${p.discoveries.brechas} · Mazmorras ${p.discoveries.mazmorras} · Jefes ${p.discoveries.jefes} · Secretos ${p.discoveries.secretos}`],
      ['Exploración real', Math.floor(p.stats.realDistance) + ' m'],
      ['Distancia virtual', Math.floor(p.stats.virtualDistance) + ' m'],
      ['Encuentros', p.stats.encounters]
    ];
    rows.forEach(([k, v]) => card.appendChild(el('div', { class: 'stat', html: `<span>${k}</span><b>${v}</b>` })));
    s.appendChild(card);
    s.appendChild(btn('Ajustar Personaje', () => game.showCharacterCreation(p), { class: 'small' }));
    s.appendChild(btn('Volver', () => game.showModeSelect()));
  });
}

export function screenSettings(game) {
  showScreen(game.app, (s) => {
    s.appendChild(el('h2', { class: 'title', html: '⚙️ Ajustes' }));
    const card = el('div', { class: 'card', style: 'width:min(420px,90vw);' });
    const audioRow = el('div', { class: 'stat', html: `<span>Sonido</span>` });
    audioRow.appendChild(btn('Silenciar', () => { import('../audio/audio.js').then(a => a.setMuted(!a.isMuted())); toast('Sonido actualizado'); }, { class: 'small' }));
    card.appendChild(audioRow);
    card.appendChild(el('div', { class: 'stat', html: `<span>GPS</span><b>${game.gps.enabled ? 'Activo' : 'Inactivo'}</b>` }));
    card.appendChild(el('div', { class: 'stat', html: `<span>Hora local</span><b>${hourLabel()}</b>` }));
    card.appendChild(el('div', { class: 'stat', html: `<span>Versión</span><b>${GAME.VERSION}</b>` }));
    s.appendChild(card);
    const row = el('div', { style: 'display:flex;gap:8px;margin-top:14px;' });
    row.appendChild(btn('Exportar backup', () => exportSave(), { class: 'small' }));
    s.appendChild(row);
    s.appendChild(btn('Volver', () => game.showMainMenu()));
  });
}

export function screenLore(game) {
  const lore = {
    brechas: 'Las Brechas conectan nuestro mundo con lugares desconocidos. No son simples portales: son parte de algo mucho mayor.',
    proyeccion: 'Todo aventurero aprende a separar su conciencia del cuerpo. Tu cuerpo permanece seguro; tu conciencia cruza la Frontera.',
    abismo: 'En los pisos más profundos existe algo que no debería haber despertado. Algunos lo llaman el Abismo.'
  };
  showScreen(game.app, (s) => {
    s.appendChild(el('h2', { class: 'title', html: '📜 Lore' }));
    const card = el('div', { class: 'card panel-scroll', style: 'width:min(460px,92vw);max-height:70vh;' });
    card.appendChild(el('p', { style: 'line-height:1.6;', html: INTRO.join('<br/><br/>') }));
    card.appendChild(el('div', { class: 'section-title', html: 'El Mundo' }));
    Object.entries(lore).forEach(([k, v]) => card.appendChild(el('p', { style: 'line-height:1.6;margin-top:8px;color:var(--dim);', html: `<b style="color:var(--text)">${k}</b><br/>${v}` })));
    s.appendChild(card);
    s.appendChild(btn('Volver', () => game.showMainMenu()));
  });
}

export function screenMultiplayer(game) {
  showScreen(game.app, (s) => {
    s.appendChild(el('h2', { class: 'title', html: '🌐 Multijugador Local' }));
    const card = el('div', { class: 'card', style: 'width:min(420px,90vw);' });
    card.appendChild(el('p', { style: 'font-size:13px;color:var(--dim);line-height:1.5;', html: 'Conecta 2–4 jugadores en la MISMA red Wi-Fi, sin internet. Usa WebRTC P2P. Intercambia el código/QR de señalización.' }));
    s.appendChild(card);
    const status = el('div', { class: 'stat', style: 'width:min(420px,90vw);margin-top:10px;', html: `<span>Estado</span><b id="netstate">${game.net.state}</b>` });
    s.appendChild(status);
    const codeBox = el('div', { id: 'netcode', style: 'width:min(420px,90vw);margin-top:10px;' });
    const canvas = el('canvas', { width: 200, height: 200, style: 'width:200px;height:200px;margin:10px auto;display:block;background:#fff;' });
    const ta = el('textarea', { placeholder: 'Pega aquí el código/offer del otro jugador', rows: 4, style: 'margin-top:10px;' });
    s.appendChild(canvas); s.appendChild(ta);
    const row = el('div', { style: 'display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;' });
    row.appendChild(btn('👑 Crear Partida', async () => {
      game.net = new NetHost(game.player);
      const offer = await game.net.createRoom();
      const code = offer.sdp;
      codeBox.innerHTML = `<div class="card"><b>Código de sala:</b> ${game.net.roomId}<br/><span style="font-size:11px;color:var(--dim)">Comparte este offer:</span><textarea rows=4>${code}</textarea></div>`;
      drawQR(canvas, code);
      document.getElementById('netstate').textContent = 'hosting — esperando jugador';
      game.net.on('connected', () => { document.getElementById('netstate').textContent = 'CONECTADO'; toast('⚔️ Jugador conectado!'); });
      game.net.on('message', (m) => { if (m.t === 'pos') updatePeer(m); });
    }, { class: 'primary', icon: '👑' }));
    row.appendChild(btn('🔗 Unirse', async () => {
      game.net = new NetHost(game.player);
      game.net.joinRoom();
      const ans = await game.net.handleOffer(ta.value.trim());
      if (ans) { codeBox.innerHTML = `<div class="card"><b>Envía esta respuesta al host:</b><textarea rows=4>${ans}</textarea></div>`; toast('Copia y envía esta respuesta'); }
    }, { class: 'primary', icon: '🔗' }));
    row.appendChild(btn('Aceptar Respuesta', async () => { if (game.net.role === 'host') { await game.net.acceptAnswer(ta.value.trim()); toast('Conectando...'); } }, { class: 'small' }));
    s.appendChild(row);
    s.appendChild(btn('Volver', () => game.showMainMenu()));
  });
}

export function screenBreach(game) {
  showScreen(game.app, (s) => {
    s.appendChild(el('h2', { class: 'title', html: '🌀 BRECHA DETECTADA' }));
    s.appendChild(el('div', { style: 'color:var(--secondary);margin:10px 0;', html: 'Amenaza: ████░░░░' }));
    s.appendChild(btn('⚔️ Entrar en la Brecha', () => game.enterBreach({ id: 'abismo', name: 'Dimensión Rota', tile: '#1a1028', wall: '#0d0820', accent: '#ff6a88', boss: 'guardian' }), { class: 'primary' }));
  });
}

function updatePeer(m) { /* peers rendered in worldUI when active */ }

function hourLabel() {
  const d = new Date();
  return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
}
