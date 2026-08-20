// UI helpers: element creation, screens, toasts
import { sfx } from '../audio/audio.js';

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const k in attrs) {
    if (k === 'class') node.className = attrs[k];
    else if (k === 'html') node.innerHTML = attrs[k];
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), attrs[k]);
    else if (k === 'style') node.style.cssText = attrs[k];
    else node.setAttribute(k, attrs[k]);
  }
  (Array.isArray(children) ? children : [children]).forEach(c => {
    if (c == null) return;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}

export function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

export function showScreen(app, content) {
  clear(app);
  const s = el('div', { class: 'screen' });
  if (typeof content === 'function') content(s);
  else s.appendChild(content);
  app.appendChild(s);
  return s;
}

export function toast(msg, ms = 2200) {
  const t = el('div', { class: 'toast', html: msg });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

export function btn(text, onClick, opts = {}) {
  const b = el('button', {
    class: 'btn ' + (opts.class || ''),
    onclick: () => { sfx.click(); onClick && onClick(); }
  });
  if (opts.icon) b.appendChild(el('span', { class: 'ico', html: opts.icon }));
  b.appendChild(el('span', { html: text }));
  return b;
}

// Simple modal wrapper
export function modal(app, content) {
  const m = el('div', { class: 'modal', onclick: (e) => { if (e.target === m) m.remove(); } });
  m.appendChild(el('div', { class: 'card' }));
  m.lastChild.innerHTML = '';
  content(m.lastChild);
  app.appendChild(m);
  return m;
}
