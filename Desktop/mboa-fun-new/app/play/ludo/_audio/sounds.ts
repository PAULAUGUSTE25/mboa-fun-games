/**
 * Ludo audio engine — synthesized SFX via Web Audio API.
 * No external assets needed: all sounds are generated at runtime.
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function ac(): AudioContext {
  if (typeof window === 'undefined') throw new Error('Audio is browser-only');
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.75;
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

export function resumeAudio() {
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

export function setMasterVolume(v: number) {
  if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, v));
}

// ─── DICE ROLL — gobelet en bois → impact → roulade ────────────────────────
/**
 * Trois phases :
 *  1) « shake » : 7-9 chocs sourds, rapides, filtrés low-pass (les dés dans le gobelet)
 *  2) « slam »  : un gros impact à mi-parcours (le gobelet renversé sur la table)
 *  3) « roll »  : 4-5 chocs aigus qui s'espacent (le dé qui rebondit puis s'immobilise)
 */
export function playDiceRoll() {
  try {
    const a = ac();
    const t0 = a.currentTime;

    // Helper : crée un click "bois" enveloppé avec un filtre donné.
    const clack = (
      offsetSec: number,
      durationSec: number,
      gain: number,
      filterType: BiquadFilterType,
      filterFreq: number,
      filterQ: number,
    ) => {
      const buf = a.createBuffer(1, Math.max(8, Math.floor(a.sampleRate * durationSec)), a.sampleRate);
      const data = buf.getChannelData(0);
      for (let j = 0; j < data.length; j++) {
        const env = Math.pow(1 - j / data.length, 1.8);
        data[j] = (Math.random() * 2 - 1) * env;
      }
      const src = a.createBufferSource();
      src.buffer = buf;
      const filter = a.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.value = filterFreq;
      filter.Q.value = filterQ;
      const g = a.createGain();
      g.gain.value = gain;
      src.connect(filter);
      filter.connect(g);
      g.connect(masterGain!);
      src.start(t0 + offsetSec);
    };

    // 1) SHAKE — dans le gobelet, sourd, rapide, irrégulier
    // (couvre la phase d'animation du dé qui tourne, ~700 ms côté UI)
    const shakeEnd = 0.62;
    let t = 0;
    while (t < shakeEnd) {
      const dur = 0.035 + Math.random() * 0.025;
      const freq = 300 + Math.random() * 250; // grave (caisse fermée)
      clack(t, dur, 0.32 + Math.random() * 0.1, 'lowpass', freq, 1.5);
      // petits doublets pour imiter deux dés qui s'entrechoquent
      if (Math.random() < 0.45) {
        clack(t + 0.012, dur, 0.22, 'lowpass', freq * 1.4, 1.5);
      }
      t += 0.045 + Math.random() * 0.05;
    }

    // 2) SLAM — le gobelet est renversé sur la table (gros choc grave)
    const slamAt = shakeEnd + 0.02;
    // Choc grave (basse fréquence + decay long)
    const slamOsc = a.createOscillator();
    const slamGain = a.createGain();
    slamOsc.connect(slamGain);
    slamGain.connect(masterGain!);
    slamOsc.type = 'sine';
    slamOsc.frequency.setValueAtTime(110, t0 + slamAt);
    slamOsc.frequency.exponentialRampToValueAtTime(45, t0 + slamAt + 0.25);
    slamGain.gain.setValueAtTime(0.55, t0 + slamAt);
    slamGain.gain.exponentialRampToValueAtTime(0.001, t0 + slamAt + 0.4);
    slamOsc.start(t0 + slamAt);
    slamOsc.stop(t0 + slamAt + 0.45);
    // Click aigu d'attaque sur le slam (l'air qui claque)
    clack(slamAt, 0.05, 0.38, 'highpass', 1200, 1);

    // 3) ROLL — 4-5 rebonds aigus qui se ralentissent (dé qui tournoie sur la table)
    const rollStart = slamAt + 0.09;
    let rt = 0;
    let nextDelay = 0.06;
    for (let i = 0; i < 5; i++) {
      const at = rollStart + rt;
      const freq = 1400 + Math.random() * 600;
      const gain = 0.34 * Math.pow(0.78, i); // décroît
      clack(at, 0.04, gain, 'bandpass', freq, 5);
      rt += nextDelay;
      nextDelay *= 1.45; // les rebonds s'espacent
    }
  } catch {}
}

// ─── PAWN STEP TAP ──────────────────────────────────────────────────────────
// Short crisp "tap" — quick noise click with high-pass.
export function playPawnStep() {
  try {
    const a = ac();
    const buf = a.createBuffer(1, a.sampleRate * 0.04, a.sampleRate);
    const data = buf.getChannelData(0);
    for (let j = 0; j < data.length; j++) {
      const decay = Math.pow(1 - j / data.length, 3);
      data[j] = (Math.random() * 2 - 1) * decay;
    }
    const src = a.createBufferSource();
    src.buffer = buf;
    const filter = a.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    const g = a.createGain();
    g.gain.value = 0.28;
    src.connect(filter);
    filter.connect(g);
    g.connect(masterGain!);
    src.start();

    // Small woody resonance on top
    const o = a.createOscillator();
    const og = a.createGain();
    o.connect(og);
    og.connect(masterGain!);
    o.type = 'square';
    o.frequency.setValueAtTime(1600, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(800, a.currentTime + 0.03);
    og.gain.setValueAtTime(0.06, a.currentTime);
    og.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.05);
    o.start();
    o.stop(a.currentTime + 0.06);
  } catch {}
}

// ─── PAWN LAND "BOUNGLOUM" ──────────────────────────────────────────────────
// Deep thud when the pawn lands on its destination cell.
export function playPawnLand() {
  try {
    const a = ac();
    // Low sine punch with quick pitch drop
    const o = a.createOscillator();
    const g = a.createGain();
    o.connect(g);
    g.connect(masterGain!);
    o.type = 'sine';
    o.frequency.setValueAtTime(220, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(60, a.currentTime + 0.22);
    g.gain.setValueAtTime(0.45, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.35);
    o.start();
    o.stop(a.currentTime + 0.4);

    // Wood click on top for attack
    const o2 = a.createOscillator();
    const g2 = a.createGain();
    o2.connect(g2);
    g2.connect(masterGain!);
    o2.type = 'triangle';
    o2.frequency.value = 480;
    g2.gain.setValueAtTime(0.18, a.currentTime);
    g2.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.08);
    o2.start();
    o2.stop(a.currentTime + 0.1);
  } catch {}
}

// ─── PAWN EXIT BASE ─────────────────────────────────────────────────────────
// "Pop" / cork-out sound when a pawn leaves its base.
export function playPawnExit() {
  try {
    const a = ac();
    const o = a.createOscillator();
    const g = a.createGain();
    o.connect(g);
    g.connect(masterGain!);
    o.type = 'sine';
    o.frequency.setValueAtTime(220, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(880, a.currentTime + 0.09);
    g.gain.setValueAtTime(0.32, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.22);
    o.start();
    o.stop(a.currentTime + 0.25);
  } catch {}
}

// ─── PAWN PASSES SAFE CELL ──────────────────────────────────────────────────
// Magical sparkle — high-pitched short chime.
export function playPawnSafe() {
  try {
    const a = ac();
    const tones = [1318.51, 1760.0]; // E6, A6
    tones.forEach((freq, i) => {
      const o = a.createOscillator();
      const g = a.createGain();
      o.connect(g);
      g.connect(masterGain!);
      o.type = 'sine';
      o.frequency.value = freq;
      const t = a.currentTime + i * 0.05;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.start(t);
      o.stop(t + 0.3);
    });
  } catch {}
}

// ─── PAWN CAPTURE ───────────────────────────────────────────────────────────
// Crash + whoosh — dramatic capture.
export function playPawnCapture() {
  try {
    const a = ac();
    // Whoosh
    const buf = a.createBuffer(1, a.sampleRate * 0.45, a.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI);
    }
    const src = a.createBufferSource();
    src.buffer = buf;
    const filter = a.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, a.currentTime);
    filter.frequency.linearRampToValueAtTime(400, a.currentTime + 0.4);
    filter.Q.value = 3;
    const g = a.createGain();
    g.gain.value = 0.32;
    src.connect(filter);
    filter.connect(g);
    g.connect(masterGain!);
    src.start();

    // Low boom
    const o = a.createOscillator();
    const og = a.createGain();
    o.connect(og);
    og.connect(masterGain!);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(180, a.currentTime + 0.06);
    o.frequency.exponentialRampToValueAtTime(45, a.currentTime + 0.5);
    og.gain.setValueAtTime(0.4, a.currentTime + 0.06);
    og.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.6);
    o.start(a.currentTime + 0.06);
    o.stop(a.currentTime + 0.65);
  } catch {}
}

// ─── PAWN FINISH (reaches home) ─────────────────────────────────────────────
// Triumphant chime cluster.
export function playPawnFinish() {
  try {
    const a = ac();
    const tones = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    tones.forEach((freq, i) => {
      const o = a.createOscillator();
      const g = a.createGain();
      o.connect(g);
      g.connect(masterGain!);
      o.type = 'sine';
      o.frequency.value = freq;
      const t = a.currentTime + i * 0.07;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      o.start(t);
      o.stop(t + 0.6);
    });
    // Sparkle
    const sp = a.createOscillator();
    const sg = a.createGain();
    sp.connect(sg);
    sg.connect(masterGain!);
    sp.type = 'triangle';
    sp.frequency.value = 2093;
    sg.gain.setValueAtTime(0.09, a.currentTime + 0.18);
    sg.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.8);
    sp.start(a.currentTime + 0.18);
    sp.stop(a.currentTime + 0.85);
  } catch {}
}

// ─── VICTORY (overall game win) ─────────────────────────────────────────────
export function playWin() {
  try {
    const a = ac();
    const tones = [392, 523.25, 659.25, 783.99, 1046.5, 1318.51];
    tones.forEach((freq, i) => {
      const o = a.createOscillator();
      const g = a.createGain();
      o.connect(g);
      g.connect(masterGain!);
      o.type = i % 2 === 0 ? 'sine' : 'triangle';
      o.frequency.value = freq;
      const t = a.currentTime + i * 0.09;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.22, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      o.start(t);
      o.stop(t + 0.75);
    });
  } catch {}
}
