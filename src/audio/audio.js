// Procedural audio using Web Audio API (section 133). All sounds synthesized, no files needed (offline-first).
let ctx = null;
let master = null;
let muted = false;
let vol = 0.6;

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = vol;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type = 'sine', gain = 0.15, slideTo = null) {
  if (!ensure() || muted) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g); g.connect(master);
  osc.start(t); osc.stop(t + dur);
}

function noise(dur, gain = 0.08, filterFreq = 1200) {
  if (!ensure() || muted) return;
  const t = ctx.currentTime;
  const bufferSize = Math.floor(ctx.sampleRate * dur);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass'; f.frequency.value = filterFreq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(master);
  src.start(t);
}

export const sfx = {
  click() { tone(700, 0.06, 'triangle', 0.1); },
  hover() { tone(500, 0.04, 'sine', 0.05); },
  attack() { noise(0.15, 0.12, 1800); tone(180, 0.12, 'sawtooth', 0.12, 90); },
  skill() { tone(600, 0.25, 'sine', 0.15, 1200); },
  hit() { noise(0.1, 0.1, 900); tone(300, 0.08, 'square', 0.08, 200); },
  crit() { tone(800, 0.3, 'sawtooth', 0.15, 1400); noise(0.2, 0.12, 2500); },
  combo() { tone(660, 0.12, 'triangle', 0.15); setTimeout(() => tone(880, 0.18, 'triangle', 0.15), 90); },
  ultimate() { tone(200, 0.6, 'sawtooth', 0.2, 60); noise(0.5, 0.15, 400); },
  enemy() { tone(160, 0.4, 'sawtooth', 0.14, 80); },
  breach() { tone(300, 0.5, 'sine', 0.15, 900); noise(0.4, 0.08, 3000); },
  levelup() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,0.2,'triangle',0.14),i*120)); },
  death() { tone(220, 0.8, 'sawtooth', 0.16, 60); },
  pickup() { tone(900, 0.1, 'sine', 0.12); tone(1200, 0.12, 'sine', 0.1); },
  dodge() { tone(400, 0.15, 'sine', 0.1, 700); },
  ambient() { noise(2, 0.02, 300); },
  unlock() { [392,523,659].forEach((f,i)=>setTimeout(()=>tone(f,0.15,'triangle',0.12),i*100)); }
};

export function setVolume(v) { vol = v; if (master) master.gain.value = v; }
export function setMuted(m) { muted = m; }
export function isMuted() { return muted; }
export function unlock() { ensure(); }
