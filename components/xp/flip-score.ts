// The flipbook's score: an original seven-second cue, synthesised live with Web Audio so every
// sound lands on a cut. Nothing is taken from another piece.
//   0 – 4 s   a low drone and a string-like swell (detuned saws, filter slowly opening) in D minor,
//             a soft paper flick on every cut, and a noise riser that climbs with the cutting
//   4 s       the hit: a deep boom, a wide brass-like D minor chord, a cymbal-ish wash
//   4 – 7 s   the chord rings and opens to D major (add 9) as the name settles, a high bell on the shine

export type FlipScore = { start: () => Promise<boolean>; stop: (seconds?: number) => void }

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12)

export function createFlipScore(cuts: number[], hitAt: number, volume = 0.6): FlipScore | null {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  const ctx = new AC()
  const master = ctx.createGain(); master.gain.value = 0
  const glue = ctx.createDynamicsCompressor()
  glue.threshold.value = -14; glue.ratio.value = 4; glue.attack.value = 0.005; glue.release.value = 0.25
  const bus = ctx.createGain()
  // A short, dark room.
  const verb = ctx.createConvolver()
  const len = Math.floor(ctx.sampleRate * 2.6)
  const ir = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6) }
  verb.buffer = ir
  const wet = ctx.createGain(); wet.gain.value = 0.32
  bus.connect(master); bus.connect(verb).connect(wet).connect(master)
  master.connect(glue).connect(ctx.destination)

  const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  { const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1 }

  const saws = (notes: number[], t: number, dur: number, peak: number, from: number, to: number, attack: number) => {
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + attack); g.gain.setValueAtTime(peak, t + dur * 0.75); g.gain.linearRampToValueAtTime(0, t + dur)
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.Q.value = 0.7
    lp.frequency.setValueAtTime(from, t); lp.frequency.exponentialRampToValueAtTime(to, t + attack)
    g.connect(lp).connect(bus)
    for (const n of notes) for (const d of [-9, 0, 9]) {
      const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = hz(n); o.detune.value = d
      const v = ctx.createGain(); v.gain.value = 0.035
      o.connect(v).connect(g); o.start(t); o.stop(t + dur + 0.1)
    }
  }
  const flick = (t: number, vel: number) => {
    const s = ctx.createBufferSource(); s.buffer = noise
    const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 2400
    const g = ctx.createGain(); g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
    s.connect(f).connect(g).connect(bus); s.start(t, Math.random()); s.stop(t + 0.06)
  }
  const thump = (t: number, vel: number, f0 = 90, f1 = 40, dur = 0.5) => {
    const o = ctx.createOscillator(); o.type = "sine"
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.5)
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(g).connect(bus); o.start(t); o.stop(t + dur + 0.05)
  }
  const wash = (t: number, dur: number, vel: number, rising: boolean) => {
    const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 0.9
    const g = ctx.createGain()
    if (rising) {
      f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(7000, t + dur)
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vel, t + dur); g.gain.linearRampToValueAtTime(0, t + dur + 0.04)
    } else {
      f.frequency.setValueAtTime(6000, t); f.frequency.exponentialRampToValueAtTime(1800, t + dur)
      g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    }
    s.connect(f).connect(g).connect(bus); s.start(t); s.stop(t + dur + 0.1)
  }
  const bell = (freq: number, t: number, vel: number) => {
    for (const [m, a] of [[1, 1], [2.76, 0.3], [5.4, 0.12]] as const) {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = freq * m
      const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel * a, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4)
      o.connect(g).connect(bus); o.start(t); o.stop(t + 2.5)
    }
  }

  const schedule = () => {
    const t0 = ctx.currentTime + 0.05
    const s = (ms: number) => t0 + ms / 1000
    const hit = s(hitAt)
    // Under the montage: drone on D, then a swell that opens as the cuts speed up.
    saws([38, 50], t0, hitAt / 1000 + 0.05, 0.5, 120, 400, 1.2)
    saws([62, 65, 69], s(600), (hitAt - 600) / 1000 + 0.05, 0.42, 300, 3800, (hitAt - 600) / 1000)
    wash(s(1200), (hitAt - 1200) / 1000, 0.22, true)
    cuts.forEach((c, i) => {
      const k = i / cuts.length
      flick(s(c), 0.08 + 0.12 * k)
      if (i < 10 || i % 2 === 0) thump(s(c), 0.12 + 0.18 * k, 120, 55, 0.25)
    })
    // The hit.
    thump(hit, 0.95, 70, 28, 2.2)
    thump(hit, 0.4, 160, 60, 0.4)
    wash(hit, 2.2, 0.28, false)
    saws([38, 50, 57, 62, 65, 69], hit, 1.4, 0.75, 800, 5200, 0.03) // D minor, wide
    saws([38, 50, 57, 62, 66, 69, 76], hit + 1.2, 2.6, 0.62, 2400, 3400, 0.5) // opens to D major add 9
    bell(hz(81), hit + 1.4, 0.07)
    bell(hz(86), hit + 2.0, 0.05)
  }

  let started = false, stopped = false
  return {
    async start() {
      try { await ctx.resume() } catch { return false }
      if (ctx.state !== "running" || started) return false
      started = true
      master.gain.setValueAtTime(volume, ctx.currentTime)
      schedule()
      return true
    },
    stop(seconds = 1.2) {
      if (stopped) return
      stopped = true
      const t = ctx.currentTime
      master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t)
      master.gain.setTargetAtTime(0, t, seconds / 4)
      window.setTimeout(() => ctx.close().catch(() => {}), seconds * 1000 + 300)
    },
  }
}
