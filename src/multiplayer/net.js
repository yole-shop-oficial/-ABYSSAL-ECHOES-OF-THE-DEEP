// Local Wi-Fi multiplayer via WebRTC RTCDataChannel with manual/local signaling
// (sections 48-66). No external signaling server required: offers/answers are
// exchanged by copy/paste or QR, keeping everything LAN/offline.
import { MULTIPLAYER } from '../core/constants.js';
import { uid } from '../core/rng.js';

export const NET_STATE = { IDLE: 'idle', HOSTING: 'hosting', JOINING: 'joining', CONNECTED: 'connected' };

export class NetHost {
  constructor(player) {
    this.player = player;
    this.state = NET_STATE.IDLE;
    this.role = null;
    this.roomId = uid('rm_').toUpperCase();
    this.peers = new Map(); // id -> { dataChannel, state }
    this.pc = null;
    this.channel = null;
    this.offer = null;
    this.handlers = {};
  }

  on(type, fn) { this.handlers[type] = fn; }
  _emit(type, data) { if (this.handlers[type]) this.handlers[type](data); }

  createRoom() {
    this.role = 'host';
    this.state = NET_STATE.HOSTING;
    this.pc = this._makePc();
    this.channel = this.pc.createDataChannel('abyssal', { ordered: false, maxRetransmits: 0 });
    this._wireChannel(this.channel);
    return this._buildOffer();
  }

  async _buildOffer() {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    this.offer = this.pc.localDescription;
    return { type: 'offer', sdp: this.offer.sdp, roomId: this.roomId };
  }

  async acceptAnswer(answerText) {
    try {
      const answer = JSON.parse(answerText);
      await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (e) { console.error(e); }
  }

  joinRoom() {
    this.role = 'joiner';
    this.state = NET_STATE.JOINING;
    this.pc = this._makePc();
    this._wireChannel(this.pc.createDataChannel('abyssal'));
  }

  async handleOffer(offerText) {
    try {
      const offer = JSON.parse(offerText);
      await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      this.answer = this.pc.localDescription;
      return JSON.stringify(this.answer);
    } catch (e) { console.error('handleOffer', e); return null; }
  }

  _makePc() {
    const cfg = { iceServers: [] }; // LAN only — no STUN needed for same-network
    const pc = new RTCPeerConnection(cfg);
    pc.onicecandidate = (e) => {
      if (e.candidate) this._emit('ice', { candidate: e.candidate });
    };
    pc.ondatachannel = (ev) => {
      this.channel = ev.channel;
      this._wireChannel(ev.channel);
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') { this.state = NET_STATE.CONNECTED; this._emit('connected', {}); }
    };
    return pc;
  }

  _wireChannel(ch) {
    ch.onopen = () => { this.state = NET_STATE.CONNECTED; this._emit('connected', {}); };
    ch.onmessage = (ev) => { this._emit('message', JSON.parse(ev.data)); };
    ch.onclose = () => this._emit('disconnected', {});
  }

  send(data) {
    if (this.channel && this.channel.readyState === 'open') {
      this.channel.send(JSON.stringify(data));
    }
  }

  sendPosition() {
    this.send({ t: 'pos', id: this.player.id, name: this.player.name,
      x: this.player.x, z: this.player.z, lvl: this.player.level,
      cls: this.player.classId, mode: this.player.mode });
  }

  cleanup() {
    try { if (this.channel) this.channel.close(); } catch (e) {}
    try { if (this.pc) this.pc.close(); } catch (e) {}
    this.state = NET_STATE.IDLE;
  }
}

// Encode a signaling message as a short alphanumeric code for manual entry
export function encodeSignal(obj) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/[+/=]/g, c => ({ '+': '-', '/': '_', '=': '.' }[c]));
}
export function decodeSignal(code) {
  const b64 = code.replace(/[-_.]/g, c => ({ '-': '+', '_': '/', '.': '=' }[c]));
  return JSON.parse(decodeURIComponent(escape(atob(b64))));
}

// Render a QR code for the room (simple, dependency-free placeholder using a canvas)
export function drawQR(canvas, text) {
  const ctx = canvas.getContext('2d');
  const n = 25; const size = canvas.width; const cell = size / n;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000';
  const randomBits = [];
  let seed = text.length;
  const r = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  // pseudo finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (ox, oy) => {
    ctx.fillRect(ox * cell, oy * cell, cell * 7, cell * 7);
    ctx.fillStyle = '#fff';
    ctx.fillRect((ox + 1) * cell, (oy + 1) * cell, cell * 5, cell * 5);
    ctx.fillStyle = '#000';
    ctx.fillRect((ox + 2) * cell, (oy + 2) * cell, cell * 3, cell * 3);
    ctx.fillStyle = '#000';
  };
  drawFinder(0, 0); drawFinder(n - 7, 0); drawFinder(0, n - 7);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const inFinder = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
      if (inFinder) continue;
      if (r() < 0.48) ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }
}
