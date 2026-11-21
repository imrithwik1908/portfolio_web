// The opening's music: a licensed audio file in /public, played quietly and faded with Web Audio so
// it never starts or stops abruptly. If the file isn't there, nothing plays and nothing is shown.
//
// To set or change the track: put it at public/audio/intro.mp3, and credit it in TRACK_CREDIT if
// its license asks for attribution.

export const TRACK_SRC = "/audio/intro.mp3"
export const TRACK_CREDIT = "" // Pixabay Content License: no credit required ("Interstellar Piano" by Ivan_Luzan, trimmed to 12 s)

export type Score = { start: (at?: number) => Promise<boolean>; fadeOut: (seconds?: number) => void; running: () => boolean }

export async function trackAvailable() {
  try { return (await fetch(TRACK_SRC, { method: "HEAD", cache: "force-cache" })).ok } catch { return false }
}

export function createScore(volume = 0.4): Score | null {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  const audio = new Audio(TRACK_SRC)
  audio.preload = "auto"
  const ctx = new AC()
  const gain = ctx.createGain()
  gain.gain.value = 0
  ctx.createMediaElementSource(audio).connect(gain).connect(ctx.destination)
  let started = false, done = false

  return {
    // `at` (seconds) lets a late start join the intro in time, so the beats still land on the text.
    async start(at = 0) {
      if (done) return false
      try {
        await ctx.resume()
        if (!started) { if (at > 0) audio.currentTime = at; await audio.play() }
      } catch { return false }
      if (ctx.state !== "running") return false
      if (!started) {
        started = true
        const t = ctx.currentTime
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(volume, t + (at > 0.3 ? 0.6 : 1.2)) // a soft swell in, never a jolt
      }
      return true
    },
    running: () => started && !done && ctx.state === "running",
    fadeOut(seconds = 2.8) {
      if (done) return
      done = true
      if (!started) { ctx.close().catch(() => {}); return }
      const t = ctx.currentTime
      gain.gain.cancelScheduledValues(t)
      gain.gain.setValueAtTime(gain.gain.value, t)
      // Most of the drop early, the last whisper lingering: no sudden stop.
      gain.gain.setTargetAtTime(0, t, seconds / 4)
      window.setTimeout(() => { audio.pause(); ctx.close().catch(() => {}) }, seconds * 1000 + 400)
    },
  }
}
