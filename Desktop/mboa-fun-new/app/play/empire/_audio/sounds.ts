/**
 * Empire audio engine — synthesized sounds via Web Audio API.
 * Background music falls back to synthesized ambient drone if no MP3 is found
 * at `/assets/audio/empire-ambient.mp3`.
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

/** Lazily creates / retrieves the AudioContext. */
function ac(): AudioContext {
  if (typeof window === 'undefined') {
    throw new Error('Audio is browser-only');
  }
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new Ctor();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

/** Master volume (0..1). */
export function setMasterVolume(v: number) {
  if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, v));
}

/** Resume audio after user gesture (browsers require it). */
export function resumeAudio() {
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

// ─── SOUND EFFECTS ─────────────────────────────────────────────────────────

export function playClick() {
  try {
    const a = ac();
    const o = a.createOscillator();
    const g = a.createGain();
    o.connect(g);
    g.connect(masterGain!);
    o.type = 'square';
    o.frequency.setValueAtTime(900, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(450, a.currentTime + 0.04);
    g.gain.setValueAtTime(0.12, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.06);
    o.start();
    o.stop(a.currentTime + 0.07);
  } catch {}
}

export function playDice() {
  try {
    const a = ac();
    // Wood-clatter: short noise bursts through a band-pass filter
    const burstCount = 5;
    for (let i = 0; i < burstCount; i++) {
      const buf = a.createBuffer(1, a.sampleRate * 0.06, a.sampleRate);
      const data = buf.getChannelData(0);
      for (let j = 0; j < data.length; j++) {
        const decay = Math.pow(1 - j / data.length, 1.8);
        data[j] = (Math.random() * 2 - 1) * decay;
      }
      const src = a.createBufferSource();
      src.buffer = buf;
      const filter = a.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200 + Math.random() * 800;
      filter.Q.value = 6;
      const g = a.createGain();
      g.gain.value = 0.35;
      src.connect(filter);
      filter.connect(g);
      g.connect(masterGain!);
      const startAt = a.currentTime + i * 0.07;
      src.start(startAt);
    }
  } catch {}
}

export function playGain() {
  try {
    const a = ac();
    // Pleasant chime: C5 → E5 → G5
    const tones = [523.25, 659.25, 783.99];
    tones.forEach((freq, i) => {
      const o = a.createOscillator();
      const g = a.createGain();
      o.connect(g);
      g.connect(masterGain!);
      o.type = 'sine';
      o.frequency.value = freq;
      const t = a.currentTime + i * 0.08;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.16, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      o.start(t);
      o.stop(t + 0.5);
    });
    // Bright sparkle on top
    const sparkle = a.createOscillator();
    const sg = a.createGain();
    sparkle.connect(sg);
    sg.connect(masterGain!);
    sparkle.type = 'triangle';
    sparkle.frequency.value = 1568;
    sg.gain.setValueAtTime(0.06, a.currentTime + 0.16);
    sg.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.6);
    sparkle.start(a.currentTime + 0.16);
    sparkle.stop(a.currentTime + 0.65);
  } catch {}
}

export function playLoss() {
  try {
    const a = ac();
    // Descending tones: F4 → D4 → A3
    const tones = [349.23, 293.66, 220.0];
    tones.forEach((freq, i) => {
      const o = a.createOscillator();
      const g = a.createGain();
      o.connect(g);
      g.connect(masterGain!);
      o.type = 'triangle';
      o.frequency.value = freq;
      const t = a.currentTime + i * 0.11;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.025);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.start(t);
      o.stop(t + 0.4);
    });
  } catch {}
}

export function playCard() {
  try {
    const a = ac();
    // Whoosh: filtered noise sweep
    const buf = a.createBuffer(1, a.sampleRate * 0.35, a.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      const env = Math.sin(t * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const src = a.createBufferSource();
    src.buffer = buf;
    const filter = a.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, a.currentTime);
    filter.frequency.linearRampToValueAtTime(2500, a.currentTime + 0.3);
    const g = a.createGain();
    g.gain.value = 0.18;
    src.connect(filter);
    filter.connect(g);
    g.connect(masterGain!);
    src.start();
    // End-of-flip click
    setTimeout(() => playClick(), 250);
  } catch {}
}

export function playPrison() {
  try {
    const a = ac();
    // Heavy metallic clang
    const freqs = [110, 165, 247, 330];
    freqs.forEach((freq, i) => {
      const o = a.createOscillator();
      const g = a.createGain();
      o.connect(g);
      g.connect(masterGain!);
      o.type = i === 0 ? 'sawtooth' : 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.22 / (i + 1), a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 1.4);
      o.start();
      o.stop(a.currentTime + 1.4);
    });
  } catch {}
}

export function playBuy() {
  try {
    const a = ac();
    // Coin / cash register: short metallic ding
    const o = a.createOscillator();
    const g = a.createGain();
    o.connect(g);
    g.connect(masterGain!);
    o.type = 'sine';
    o.frequency.setValueAtTime(880, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(1320, a.currentTime + 0.05);
    g.gain.setValueAtTime(0.18, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.3);
    o.start();
    o.stop(a.currentTime + 0.32);
  } catch {}
}

// ─── BACKGROUND MUSIC ──────────────────────────────────────────────────────

let bgmAudioEl: HTMLAudioElement | null = null;
let bgmSynthOscs: OscillatorNode[] = [];
let bgmEnabled = false;

const BGM_PATH = '/assets/audio/empire-ambient.mp3';

/** Starts the background music. Falls back to a synth drone if no MP3 found. */
export async function startBgm() {
  if (bgmEnabled) return;
  bgmEnabled = true;
  resumeAudio();

  // Try MP3 first
  try {
    const head = await fetch(BGM_PATH, { method: 'HEAD' });
    if (head.ok) {
      const el = new Audio(BGM_PATH);
      el.loop = true;
      el.volume = 0.35;
      await el.play();
      bgmAudioEl = el;
      return;
    }
  } catch {
    // Fall through to synth
  }

  // Synth fallback: D-minor drone with gentle LFO modulation
  startSynthBgm();
}

function startSynthBgm() {
  try {
    const a = ac();
    const masterBgm = a.createGain();
    masterBgm.gain.value = 0.05;
    masterBgm.connect(masterGain!);

    // Bass drone (D2)
    const bass = a.createOscillator();
    bass.type = 'sawtooth';
    bass.frequency.value = 73.42;
    const bassFilter = a.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.value = 350;
    const bassGain = a.createGain();
    bassGain.gain.value = 0.55;
    bass.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(masterBgm);
    bass.start();
    bgmSynthOscs.push(bass);

    // Chord pad: D3 (146.83), F3 (174.61), A3 (220.00) - D minor
    [146.83, 174.61, 220.0].forEach((freq, i) => {
      const o = a.createOscillator();
      o.type = 'triangle';
      o.frequency.value = freq;
      const g = a.createGain();
      g.gain.value = 0.22;
      // Slow LFO for "breathing" effect
      const lfo = a.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.08 + i * 0.05;
      const lfoGain = a.createGain();
      lfoGain.gain.value = 0.12;
      lfo.connect(lfoGain);
      lfoGain.connect(g.gain);
      o.connect(g);
      g.connect(masterBgm);
      o.start();
      lfo.start();
      bgmSynthOscs.push(o, lfo);
    });
  } catch {}
}

export function stopBgm() {
  bgmEnabled = false;
  if (bgmAudioEl) {
    bgmAudioEl.pause();
    bgmAudioEl = null;
  }
  bgmSynthOscs.forEach((o) => {
    try {
      o.stop();
    } catch {}
  });
  bgmSynthOscs = [];
}

export function isBgmEnabled(): boolean {
  return bgmEnabled;
}
