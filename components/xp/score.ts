// The opening's score: an original ten-second cue, written here note by note and synthesised live
// with Web Audio, so the picture can be cut to exactly the same clock.
//
// 96 BPM, one beat = 0.625 s, about 15 beats. A minor.
//   beats 0–11  a soft low pulse on every beat (A2), from the very first moment, slowly gaining weight
//   beats 2–9   a piano figure in eighths joins, climbing a little each bar
//   beats 6–9   a warm pad enters underneath (A minor, then F major)
//   beat 10     everything resolves onto one held C major 9 chord, with two high bell notes
//   beats 12–15 it breathes out
// Nothing here is taken from another piece: the figure, chords and timing are written for this.

export const BPM = 96
export const BEAT_MS = 60000 / BPM // 625 ms
export const beat = (n: number) => n * BEAT_MS

export type Score = { start: (at?: number) => Promise<boolean>; fadeOut: (seconds?: number) => void; running: () => boolean }

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12)
const N: Record<string, number> = { A2: 45, C3: 48, F3: 53, G3: 55, A3: 57, C4: 60, D4: 62, E4: 64, F4: 65, G4: 67, A4: 69, B4: 71, C5: 72, D5: 74, E5: 76, F5: 77, G5: 79, B5: 83, E6: 88 }

// The piano figure, one note per eighth (two per beat), beats 4–11.
const FIGURE = [
  "E4", "A4", "C5", "A4", "E4", "A4", "D5", "A4", // beats 2–5: the idea, asked twice
  "E4", "A4", "C5", "E5", "F4", "A4", "C5", "F5", // beats 6–9: it opens upward with the chords
]
const PAD = [
  { at: 6, len: 2.2, notes: ["A3", "C4", "E4"] },
  { at: 8, len: 2.2, notes: ["F3", "A3", "C4"] },
  { at: 10, len: 5, notes: ["C3", "G3", "E4", "B4", "D5"] }, // the resolution, held under the sunrise
]

function room(ctx: AudioContext, seconds: number) {
  const len = Math.floor(ctx.sampleRate * seconds)
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)
  }
  return buf
}

export function createScore(volume = 0.55): Score | null {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  const ctx = new AC()
  const master = ctx.createGain(); master.gain.value = 0
  const glue = ctx.createDynamicsCompressor()
  glue.threshold.value = -16; glue.knee.value = 10; glue.ratio.value = 3; glue.attack.value = 0.02; glue.release.value = 0.3
  const verb = ctx.createConvolver(); verb.buffer = room(ctx, 3.2)
  const wet = ctx.createGain(); wet.gain.value = 0.38
  const dry = ctx.createGain(); dry.gain.value = 0.85
  const bus = ctx.createBiquadFilter(); bus.type = "lowpass"; bus.frequency.value = 5200
  bus.connect(dry).connect(master)
  bus.connect(verb).connect(wet).connect(master)
  master.connect(glue).connect(ctx.destination)

  // Piano-like: a quick strike, a few slightly stretched partials, an exponential ring-out.
  const piano = (freq: number, t: number, vel: number, ring = 1.6) => {
    const out = ctx.createGain(); out.gain.value = 0
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(3200 + vel * 2400, t); lp.frequency.exponentialRampToValueAtTime(900, t + ring)
    out.connect(lp).connect(bus)
    out.gain.setValueAtTime(0, t)
    out.gain.linearRampToValueAtTime(vel, t + 0.006)
    out.gain.exponentialRampToValueAtTime(vel * 0.35, t + 0.25)
    out.gain.exponentialRampToValueAtTime(0.0001, t + ring)
    for (const [m, a] of [[1, 1], [2.003, 0.42], [3.01, 0.18], [4.02, 0.08]] as const) {
      const o = ctx.createOscillator(); o.type = m === 1 ? "triangle" : "sine"; o.frequency.value = freq * m
      const g = ctx.createGain(); g.gain.value = a * 0.3
      o.connect(g).connect(out); o.start(t); o.stop(t + ring + 0.05)
    }
  }
  // The pulse: a low, rounded thump with a little body, felt more than heard.
  const pulse = (t: number, vel: number) => {
    const o = ctx.createOscillator(); o.type = "sine"
    o.frequency.setValueAtTime(hz(N.A2) * 1.5, t); o.frequency.exponentialRampToValueAtTime(hz(N.A2), t + 0.08)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55)
    o.connect(g).connect(bus); o.start(t); o.stop(t + 0.6)
    piano(hz(N.A2) * 2, t, vel * 0.25, 0.9) // a soft octave above, so it has pitch on small speakers
  }
  // A warm pad: two detuned saws per note through a gentle low-pass, slow in, slow out.
  const pad = (freq: number, t: number, len: number, vel: number) => {
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + len * 0.35); g.gain.setValueAtTime(vel, t + len * 0.7); g.gain.linearRampToValueAtTime(0, t + len + 0.8)
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1100; lp.Q.value = 0.4
    g.connect(lp).connect(bus)
    for (const d of [-6, 6]) {
      const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = freq; o.detune.value = d
      const v = ctx.createGain(); v.gain.value = 0.05
      o.connect(v).connect(g); o.start(t); o.stop(t + len + 1)
    }
  }
  const bell = (freq: number, t: number, vel: number) => {
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = freq
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8)
    o.connect(g).connect(bus); o.start(t); o.stop(t + 2.9)
  }

  // Schedule everything from `offset` seconds into the cue (a late start joins in time).
  // Soft percussion: a felt-mallet low drum (a pitched sine thump) and a brushed tick (filtered
  // noise), quiet enough to be felt more than heard.
  const noiseBuf = (() => { const b = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b })()
  const drum = (t: number, vel: number) => {
    const o = ctx.createOscillator(); o.type = "sine"
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(52, t + 0.18)
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7)
    o.connect(g).connect(bus); o.start(t); o.stop(t + 0.75)
  }
  const brush = (t: number, vel: number) => {
    const n = ctx.createBufferSource(); n.buffer = noiseBuf
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 3200; f.Q.value = 0.7
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28)
    n.connect(f).connect(g).connect(bus); n.start(t); n.stop(t + 0.3)
  }
  const schedule = (offset: number) => {
    const t0 = ctx.currentTime + 0.04 - offset
    const at = (b: number) => t0 + (b * BEAT_MS) / 1000
    const live = (b: number) => at(b) >= ctx.currentTime
    for (let b = 0; b < 12; b++) if (live(b)) pulse(at(b), 0.34 + 0.22 * (b / 11))
    // Drums join on beat 2 with the first title, land on every beat to the resolution, and the
    // brush ticks on the off-beats once the name arrives (beat 6); one bigger hit marks beat 10.
    for (let b = 2; b < 10; b++) if (live(b)) drum(at(b), 0.16 + 0.1 * ((b - 2) / 7))
    for (let b = 6; b < 10; b++) if (live(b + 0.5)) brush(at(b + 0.5), 0.05)
    if (live(10)) drum(at(10), 0.34)
    FIGURE.forEach((n, i) => { const b = 2 + i / 2; if (live(b)) piano(hz(N[n]), at(b), 0.16 + 0.06 * (i / FIGURE.length) + (i % 4 === 0 ? 0.04 : 0)) })
    PAD.forEach((p) => p.notes.forEach((n) => { if (live(p.at)) pad(hz(N[n]), at(p.at), (p.len * BEAT_MS) / 1000, p.at === 10 ? 0.55 : 0.38) }))
    if (live(10)) { piano(hz(N.C3), at(10), 0.3, 3.5); piano(hz(N.G4), at(10), 0.18, 3.2); piano(hz(N.E5), at(10), 0.16, 3.2) }
    if (live(10.5)) bell(hz(N.B5), at(10.5), 0.05)
    if (live(12.5)) bell(hz(N.E6), at(12.5), 0.045) // marks the R lifting off
  }

  let started = false, done = false
  return {
    async start(at = 0) {
      if (done) return false
      try { await ctx.resume() } catch { return false }
      if (ctx.state !== "running") return false
      if (!started) {
        started = true
        const t = ctx.currentTime
        master.gain.setValueAtTime(0, t)
        master.gain.linearRampToValueAtTime(volume, t + (at > 0.3 ? 0.4 : 0.05))
        schedule(at)
      }
      return true
    },
    running: () => started && !done && ctx.state === "running",
    fadeOut(seconds = 2.5) {
      if (done) return
      done = true
      if (!started) { ctx.close().catch(() => {}); return }
      const t = ctx.currentTime
      master.gain.cancelScheduledValues(t)
      master.gain.setValueAtTime(master.gain.value, t)
      master.gain.setTargetAtTime(0, t, seconds / 4)
      window.setTimeout(() => ctx.close().catch(() => {}), seconds * 1000 + 400)
    },
  }
}
