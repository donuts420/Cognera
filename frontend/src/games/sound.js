// Tiny WebAudio helper. Gentle tones only — no harsh buzzers (DOCUMENTATION.md:
// "Never a red X, never a buzzer"). Used for optional cues in Sequence Memory
// and Sound Recognition. Everything degrades silently if audio is unavailable.

let ctx = null;
function audio() {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function tone(freq = 440, ms = 240, type = 'sine', gain = 0.12) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = 0;
  osc.connect(g);
  g.connect(ac.destination);
  const t = ac.currentTime;
  g.gain.linearRampToValueAtTime(gain, t + 0.02);
  g.gain.linearRampToValueAtTime(gain, t + ms / 1000 - 0.04);
  g.gain.linearRampToValueAtTime(0, t + ms / 1000);
  osc.start(t);
  osc.stop(t + ms / 1000);
}

// Play a rhythm: pattern is a list of on/off durations in ms, starting with "on".
export async function pattern(durations = [], freq = 300) {
  const ac = audio();
  if (!ac) return;
  let on = true;
  for (const d of durations) {
    if (on) tone(freq, d, 'sine', 0.1);
    await new Promise((r) => setTimeout(r, d + 40));
    on = !on;
  }
}

export function chime(up = true) {
  const notes = up ? [523, 659, 784] : [784, 659, 523];
  notes.forEach((n, i) => setTimeout(() => tone(n, 200, 'sine', 0.08), i * 130));
}
