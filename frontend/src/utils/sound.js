// Lightweight Web Audio API sound generator (no external files)
let ctx = null;
let enabled = true;

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, duration = 0.12, type = "sine", vol = 0.15, delay = 0) {
  const c = getCtx();
  if (!c || !enabled) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export const sfx = {
  setEnabled(v) { enabled = v; },
  isEnabled() { return enabled; },
  flip() { tone(520, 0.08, "triangle", 0.10); },
  match() {
    tone(660, 0.12, "sine", 0.14, 0);
    tone(880, 0.16, "sine", 0.13, 0.08);
  },
  mismatch() {
    tone(220, 0.14, "sawtooth", 0.10);
    tone(180, 0.12, "sawtooth", 0.09, 0.06);
  },
  win() {
    tone(523, 0.14, "triangle", 0.15, 0);
    tone(659, 0.14, "triangle", 0.15, 0.12);
    tone(784, 0.14, "triangle", 0.15, 0.24);
    tone(1046, 0.28, "triangle", 0.17, 0.36);
  },
  tap() { tone(400, 0.05, "triangle", 0.08); },
  unlock() {
    tone(400, 0.10, "sine", 0.13);
    tone(600, 0.12, "sine", 0.13, 0.08);
    tone(900, 0.16, "sine", 0.14, 0.18);
  },
};
