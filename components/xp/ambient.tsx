"use client"

import { useEffect, useState } from "react"

// The room: a still light from above, a vignette and film grain. Plus a few quiet details for
// people who wander: X shows how things were built, the tab speaks when you leave, and the
// console keeps a case file.
export function toast(message: string) {
  window.dispatchEvent(new CustomEvent("xp:toast", { detail: message }))
}

const SHORTCUTS = [
  ["X", "Show how each part of the site was built"],
  ["?", "This card"],
  ["← →", "Step through experience, figures and the demo"],
  ["Esc", "Close the résumé or a figure"],
  ["⌘ / Ctrl + P", "Print the résumé, wherever you are"],
]

export function Ambient() {
  const [note, setNote] = useState<string | null>(null)
  const [help, setHelp] = useState(false)
  const [fog, setFog] = useState(false)

  useEffect(() => {
    let typed = ""
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (event.metaKey || event.ctrlKey || event.altKey || target?.closest?.("input, textarea, [contenteditable]")) return
      const key = event.key.toLowerCase()
      if (key === "x") toggleCloser()
      if (event.key === "?") setHelp((v) => !v)
      if (event.key === "Escape") setHelp(false)
      // Typing "fog" anywhere lets the fog roll in for a moment.
      typed = (typed + key).slice(-3)
      if (typed === "fog") { setFog(true); window.setTimeout(() => setFog(false), 3200); toast("Fog of war, briefly. My chess bot lives like this.") }
    }
    window.addEventListener("keydown", onKey)

    let toastTimer = 0
    const onToast = (event: Event) => {
      setNote((event as CustomEvent<string>).detail)
      window.clearTimeout(toastTimer)
      toastTimer = window.setTimeout(() => setNote(null), 3400)
    }
    window.addEventListener("xp:toast", onToast)

    // Copying straight out of the paper gets a gentle pointer to the proper citation.
    const onCopy = () => {
      const node = document.getSelection()?.anchorNode
      const el = node instanceof HTMLElement ? node : node?.parentElement
      if (el?.closest(".xp-paper")) toast("Copied. The Copy BibTeX button gives you the proper citation.")
    }
    document.addEventListener("copy", onCopy)

    // Leave the page alone for a minute and the eye in the navigation blinks.
    let idle = 0
    const blink = () => {
      document.documentElement.classList.add("is-blinking")
      window.setTimeout(() => document.documentElement.classList.remove("is-blinking"), 700)
      idle = window.setTimeout(blink, 60_000)
    }
    const resetIdle = () => { window.clearTimeout(idle); idle = window.setTimeout(blink, 60_000) }
    resetIdle()
    window.addEventListener("pointermove", resetIdle, { passive: true })
    window.addEventListener("scroll", resetIdle, { passive: true })

    // A small object for people who poke around in the console.
    Object.defineProperty(window, "rithwik", {
      configurable: true,
      value: Object.freeze({
        email: "sairithwikreddy.chirra@gmail.com",
        github: "https://github.com/imrithwik1908",
        looking_for: "ML engineering and data science roles",
        resume: () => { window.dispatchEvent(new Event("resume:open")); return "Opening it on the page." },
        hint: () => "Try typing fog. Then wait at the very end of the page.",
      }),
    })

    let title = document.title
    const onVisibility = () => {
      if (document.hidden) {
        title = document.title
        document.title = "[1]+ Stopped — fg to resume"
      } else document.title = title
    }
    document.addEventListener("visibilitychange", onVisibility)

    console.info(
      "%cHi, fellow console reader.%c\nThis site is Next.js with no animation libraries, no trackers and no cookies.\nEvery number on it comes from a repository, a notebook output or my résumé.\n\nA few things are hidden. One answers to a single key, one waits until the credits\nhave rolled, one lives past the edge of the map, and Cmd/Ctrl+P does something useful.\nOr just type: rithwik",
      "font: 600 14px/1.8 Georgia, serif; color: #e9c27b",
      "font: 12px/1.6 ui-monospace, monospace; color: #b4ada1",
    )

    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("xp:toast", onToast)
      document.removeEventListener("copy", onCopy)
      window.removeEventListener("pointermove", resetIdle)
      window.removeEventListener("scroll", resetIdle)
      window.clearTimeout(idle)
      window.clearTimeout(toastTimer)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return (
    <>
      <div className="xp-light" aria-hidden="true">
        {/* Dust in the light from above: a dozen motes drifting slowly; one glints now and then. */}
        {MOTES.map(([x, y, size, dur, delay], i) => (
          <i key={i} className={i === 4 ? "is-glint" : undefined} style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, animationDuration: `${dur}s`, animationDelay: `-${delay}s` }} />
        ))}
      </div>
      <div className="xp-grain" aria-hidden="true" />
      <div className={`xp-fog-roll ${fog ? "is-on" : ""}`} aria-hidden="true" />
      <p className={`xp-toast ${note ? "is-on" : ""}`} role="status" aria-live="polite">{note}</p>
      {help && (
        <div className="xp-help" role="dialog" aria-label="Keyboard shortcuts">
          <p className="xp-help-title">Keyboard</p>
          <dl>{SHORTCUTS.map(([k, v]) => <div key={k}><dt><kbd>{k}</kbd></dt><dd>{v}</dd></div>)}</dl>
          <p className="xp-help-foot">Some things aren&apos;t listed. Press ? or Esc to close.</p>
        </div>
      )}
    </>
  )
}

// x%, y%, size px, drift seconds, phase seconds. Fixed values so server and client render identically.
const MOTES: [number, number, number, number, number][] = [
  [38, 8, 2, 46, 3], [44, 22, 1.5, 58, 17], [52, 14, 2, 52, 29], [57, 30, 1, 64, 8], [48, 6, 2.5, 72, 40],
  [61, 18, 1.5, 49, 22], [41, 34, 1, 61, 12], [55, 40, 1.5, 55, 33], [47, 26, 1, 68, 5], [63, 9, 1, 57, 45],
  [36, 20, 1.5, 63, 26], [59, 28, 2, 50, 37],
]

export function toggleCloser() {
  const root = document.documentElement
  const on = root.dataset.closer !== "true"
  root.dataset.closer = String(on)
  window.dispatchEvent(new CustomEvent("closer", { detail: on }))
}

// Tempe's local time and whether it is day there, for the small sun/moon details.
export function tempeNow() {
  const date = new Date()
  const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Phoenix" }).format(date)
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "America/Phoenix" }).format(date)) % 24
  const part = hour < 5 ? "late night" : hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night"
  return { time, day: hour >= 6 && hour < 19, part }
}
