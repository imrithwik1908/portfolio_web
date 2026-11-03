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
  ["g g  /  G", "Top of the page / the very end"],
]

// Our own eased scroll: native smooth scrolling isn't reliable everywhere, and the target can move
// while sections reveal on the way, so the destination is re-read every frame.
function glide(target: () => number, ms = 1100) {
  const html = document.documentElement
  const from = window.scrollY, start = performance.now()
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  html.style.scrollBehavior = "auto"
  const step = (now: number) => {
    const t = reduce ? 1 : Math.min(1, (now - start) / ms)
    const ease = 1 - Math.pow(1 - t, 3)
    window.scrollTo(0, from + (target() - from) * ease)
    if (t < 1) requestAnimationFrame(step)
    else html.style.scrollBehavior = ""
  }
  requestAnimationFrame(step)
}

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
      // Typing "fog" anywhere lets the fog roll in for a moment; "hire" heads for the contact section.
      typed = (typed + key).slice(-4)
      if (typed.endsWith("fog")) { setFog(true); window.setTimeout(() => setFog(false), 3200); toast("Fog of war, briefly. My chess bot lives like this.") }
      if (typed === "hire") {
        const contact = document.getElementById("contact")
        if (contact) { glide(() => window.scrollY + contact.getBoundingClientRect().top); toast("Good instinct. This is the part with my email.") }
        else toast("Good instinct. My email is on the home page, at the very end.")
      }
      // Vim motions: gg to the top, G to the bottom.
      if (event.key === "G") { jumped = true; glide(() => document.documentElement.scrollHeight - window.innerHeight); toast("G. Straight to the credits.") }
      else if (key === "g") {
        if (performance.now() - lastG < 450) { glide(() => 0); toast("gg. Back to the top."); lastG = 0 }
        else lastG = performance.now()
      }
    }
    let lastG = 0, jumped = false
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

    // Selecting the email by hand gets pointed at the button that copies it.
    let selectHinted = 0
    const onSelect = () => {
      if (performance.now() - selectHinted < 15_000 || !document.getSelection()?.toString().includes("@gmail.com")) return
      selectHinted = performance.now()
      toast("The button next to it copies it in one click.")
    }
    document.addEventListener("selectionchange", onSelect)

    // Reaching the very bottom within a few seconds of leaving the top. Back at the top, the clock resets.
    let leftTop = performance.now()
    let sped = false
    let lastY = window.scrollY, lastT = performance.now(), rewound = 0
    const onBottom = () => {
      const y = window.scrollY, t = performance.now()
      // Scrolling back up fast from deep in the page: the film rewinds for a moment.
      const speed = (lastY - y) / Math.max(1, t - lastT)
      if (speed > 6 && y > 600 && t - rewound > 12_000) {
        rewound = t
        document.documentElement.classList.add("is-rewinding")
        window.setTimeout(() => document.documentElement.classList.remove("is-rewinding"), 900)
        toast("Rewinding.")
      }
      lastY = y; lastT = t
      if (y < 200) { leftTop = t; sped = false; jumped = false; return }
      if (sped || jumped || location.pathname !== "/") return
      if (window.innerHeight + y < document.documentElement.scrollHeight - 4) return
      sped = true
      if (t - leftTop < 8000) toast("Speedrun. The good parts were in the middle.")
    }

    // The eye in the navigation watches the pointer; the hero lamp follows it too.
    let eyeFrame = 0
    const onPointer = (event: PointerEvent) => {
      if (eyeFrame) return
      eyeFrame = requestAnimationFrame(() => {
        eyeFrame = 0
        const eye = document.querySelector<HTMLElement>(".xp-eye")
        if (eye) {
          const r = eye.getBoundingClientRect()
          const dx = event.clientX - (r.left + r.width / 2), dy = event.clientY - (r.top + r.height / 2)
          const d = Math.max(1, Math.hypot(dx, dy))
          eye.style.setProperty("--ex", `${(dx / d) * Math.min(3.5, d / 40)}px`)
          eye.style.setProperty("--ey", `${(dy / d) * Math.min(2, d / 60)}px`)
        }
        const hero = document.querySelector<HTMLElement>(".xp-hero")
        if (hero) {
          const r = hero.getBoundingClientRect()
          hero.style.setProperty("--mx", `${event.clientX - r.left}px`)
          hero.style.setProperty("--my", `${event.clientY - r.top}px`)
        }
      })
    }
    window.addEventListener("pointermove", onPointer, { passive: true })

    // First visit only: once the opening has played, a whisper that there's more than meets the eye.
    let whisper = 0
    try {
      if (!sessionStorage.getItem("whispered")) {
        sessionStorage.setItem("whispered", "1")
        whisper = window.setTimeout(() => toast("Press ? at any time. Not everything here is on the surface."), 7000)
      }
    } catch { /* no storage, no whisper */ }
    window.addEventListener("scroll", onBottom, { passive: true })

    // Leave the page alone for a minute and the eye in the navigation blinks.
    let idle = 0
    const blink = () => {
      document.documentElement.classList.add("is-blinking")
      window.setTimeout(() => document.documentElement.classList.remove("is-blinking"), 1400)
      idle = window.setTimeout(blink, 12_000)
    }
    const resetIdle = () => { window.clearTimeout(idle); idle = window.setTimeout(blink, 12_000) }
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
        hint: () => "Try typing fog, or hire. Vim users: gg and G. Then wait at the very end of the page.",
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
      document.removeEventListener("selectionchange", onSelect)
      window.removeEventListener("pointermove", onPointer)
      cancelAnimationFrame(eyeFrame)
      window.clearTimeout(whisper)
      window.removeEventListener("scroll", onBottom)
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
      <Timecode />
      <div className={`xp-fog-roll ${fog ? "is-on" : ""}`} aria-hidden="true" />
      <p className={`xp-toast ${note ? "is-on" : ""}`} role="status" aria-live="polite">{note}</p>
      {help && (
        <div className="xp-help" role="dialog" aria-label="Keyboard shortcuts">
          <p className="xp-help-title">Keyboard</p>
          <dl>{SHORTCUTS.map(([k, v]) => <div key={k}><dt><kbd>{k}</kbd></dt><dd>{v}</dd></div>)}</dl>
          <p className="xp-help-foot">A few words do things if you type them. One is three letters and lives in the 404 page; one is what you&apos;d say to a candidate. Press ? or Esc to close.</p>
        </div>
      )}
    </>
  )
}

// A projector's timecode in the corner: time since you arrived, shown only while the film is moving.
function Timecode() {
  const [shown, setShown] = useState(false)
  const [text, setText] = useState("")
  useEffect(() => {
    const start = performance.now()
    let hide = 0
    const onScroll = () => {
      const t = Math.floor((performance.now() - start) / 1000)
      const pad = (n: number) => String(n).padStart(2, "0")
      const reel = Math.min(99, Math.floor((window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) * 100))
      setText(`${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(t % 60)} · ${pad(reel)}%`)
      setShown(true)
      window.clearTimeout(hide)
      hide = window.setTimeout(() => setShown(false), 1200)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => { window.removeEventListener("scroll", onScroll); window.clearTimeout(hide) }
  }, [])
  return <p className={`xp-timecode ${shown ? "is-on" : ""}`} aria-hidden="true"><i />{text}</p>
}

// x%, y%, size px, drift seconds, phase seconds. Fixed values so server and client render identically.
const MOTES: [number, number, number, number, number][] = [
  [38, 8, 2.5, 46, 3], [44, 22, 2, 58, 17], [52, 14, 2.5, 52, 29], [57, 30, 1.5, 64, 8], [48, 6, 3, 72, 40],
  [61, 18, 2, 49, 22], [41, 34, 1.5, 61, 12], [55, 40, 2, 55, 33], [47, 26, 1.5, 68, 5], [63, 9, 1.5, 57, 45],
  [36, 20, 2, 63, 26], [59, 28, 2.5, 50, 37], [50, 46, 1.5, 66, 19], [43, 12, 2, 59, 51],
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
