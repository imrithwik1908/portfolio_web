// An original ambient score for the opening, generated live with the Web Audio API: slow organ-like
// chord swells in A minor under a few sparse, high, bell-like notes, in a large soft reverb.
// No samples, nothing borrowed; the chords, voicings and timing are written here.

export type Score = { start: () => Promise<boolean>; stop: (fade?: number) => void; running: () => boolean }

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12)

// Four chords, each held about four seconds and cross-faded into the next.
const CHORDS = [
  [45, 52, 57, 60, 64],       // A minor
  [41, 48, 57, 60, 64],       // F major 7
  [38, 45, 53, 57, 60],       // D minor 7
  [40, 47, 52, 55, 59],       // E minor
]
const HOLD = 4.2

function impulse(ctx: AudioContext, seconds: number) {
  const len = Math.floor(ctx.sampleRate * seconds)
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6)
  }
  return buf
}

// Creates the score without making a sound. Browsers keep audio suspended until the visitor
// interacts, so `start()` is called from a click or key press (or tried right away, in case the
// browser already allows sound for this site). Everything is scheduled when it actually starts.
export function createScore(volume = 0.85): Score | null {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  const ctx = new AC()
  const master = ctx.createGain()
  master.gain.value = 0
  const limit = ctx.createDynamicsCompressor()
  limit.threshold.value = -10; limit.knee.value = 8; limit.ratio.value = 6; limit.attack.value = 0.01; limit.release.value = 0.4
  const tone = ctx.createBiquadFilter()
  tone.type = "lowpass"; tone.frequency.value = 2400; tone.Q.value = 0.3
  const verb = ctx.createConvolver(); verb.buffer = impulse(ctx, 4.5)
  const wet = ctx.createGain(); wet.gain.value = 0.7
  const dry = ctx.createGain(); dry.gain.value = 0.9
  tone.connect(dry).connect(master)
  tone.connect(verb).connect(wet).connect(master)
  master.connect(limit).connect(ctx.destination)

  let started = false, stopped = false

  // Organ-ish voice: a few harmonics of a sine, slow attack and release, a whisper of vibrato.
  const organ = (freq: number, start: number, dur: number, level: number) => {
    const env = ctx.createGain()
    env.gain.setValueAtTime(0, start)
    env.gain.linearRampToValueAtTime(level, start + 1.6)
    env.gain.setValueAtTime(level, start + dur - 1.8)
    env.gain.linearRampToValueAtTime(0, start + dur + 0.6)
    env.connect(tone)
    const lfo = ctx.createOscillator(); lfo.frequency.value = 4.6
    const depth = ctx.createGain(); depth.gain.value = freq * 0.0025
    lfo.connect(depth)
    for (const [mult, amp] of [[1, 1], [2, 0.45], [3, 0.18], [4, 0.1]] as const) {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = freq * mult
      depth.connect(o.frequency)
      const g = ctx.createGain(); g.gain.value = amp * 0.12
      o.connect(g).connect(env)
      o.start(start); o.stop(start + dur + 0.8)
    }
    lfo.start(start); lfo.stop(start + dur + 0.8)
  }

  // A soft bell: one sine with a quick bloom and a long fade.
  const bell = (freq: number, start: number) => {
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = freq
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, start)
    g.gain.linearRampToValueAtTime(0.05, start + 0.04)
    g.gain.exponentialRampToValueAtTime(0.0001, start + 3.2)
    o.connect(g).connect(tone)
    o.start(start); o.stop(start + 3.3)
  }

  const schedule = () => {
    const now = ctx.currentTime + 0.05
    master.gain.setValueAtTime(0, now)
    master.gain.linearRampToValueAtTime(volume, now + 2)
    CHORDS.forEach((chord, c) => {
      const at = now + c * HOLD
      chord.forEach((n, i) => organ(hz(n), at, HOLD + 1.2, i === 0 ? 0.9 : 0.55))
      // Two or three high notes from the chord, placed unevenly so nothing repeats like a loop.
      const picks = [chord[3] + 12, chord[4] + 12, chord[2] + 24]
      picks.slice(0, c % 2 ? 2 : 3).forEach((n, k) => bell(hz(n), at + 0.9 + k * (1.15 + c * 0.17)))
    })
  }

  return {
    async start() {
      if (stopped) return false
      try { await ctx.resume() } catch { return false }
      if (ctx.state !== "running") return false
      if (!started) { started = true; schedule() }
      return true
    },
    running: () => started && !stopped && ctx.state === "running",
    stop(fade = 3) {
      if (stopped) return
      stopped = true
      if (!started) { ctx.close().catch(() => {}); return }
      const t = ctx.currentTime
      master.gain.cancelScheduledValues(t)
      master.gain.setValueAtTime(master.gain.value, t)
      master.gain.linearRampToValueAtTime(0, t + fade)
      window.setTimeout(() => ctx.close().catch(() => {}), (fade + 0.3) * 1000)
    },
  }
}
