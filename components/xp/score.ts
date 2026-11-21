// The opening's music: a licensed audio file in /public, played quietly and faded with Web Audio so
// it never starts or stops abruptly. If the file isn't there, nothing plays and nothing is shown.
//
// To set or change the track: put it at public/audio/intro.mp3, and credit it in TRACK_CREDIT if
// its license asks for attribution.

export const TRACK_SRC = "/audio/intro.mp3"
export const TRACK_CREDIT = "" // e.g. "Music: “Title” by Author, CC BY 4.0"

export type Score = { start: () => Promise<boolean>; fadeOut: (seconds?: number) => void; running: () => boolean }

export async function trackAvailable() {
  try { return (await fetch(TRACK_SRC, { method: "HEAD", cache: "force-cache" })).ok } catch { return false }
}

export function createScore(volume = 0.32): Score | null {
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
    async start() {
      if (done) return false
      try { await ctx.resume(); if (!started) await audio.play() } catch { return false }
      if (ctx.state !== "running") return false
      if (!started) {
        started = true
        const t = ctx.currentTime
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(volume, t + 2.5) // a slow swell in, never a jolt
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
