"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

const resumeUrl = "https://drive.google.com/file/d/1LF8cf2CkC7JzFfhFVyHCXXfUYF6L9pZd/view?usp=sharing"

const previews = {
  data: { title: "X-MuTeST", line: "Explainable hate-speech detection in English, Hindi and Telugu. AAAI 2026.", href: "/projects/x-mutest", cta: "Read the research" },
  software: { title: "AgentGuard", line: "Regression testing and a release gate for LLM applications.", href: "/#work", cta: "Try it below" },
} as const

type PreviewKey = keyof typeof previews

function Term({ id, open, onOpen, onClose, children }: { id: PreviewKey; open: boolean; onOpen: () => void; onClose: () => void; children: React.ReactNode }) {
  const preview = previews[id]
  return (
    <span className="xp-term-wrap" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button type="button" className={`xp-term ${open ? "is-open" : ""}`} aria-expanded={open} aria-controls={`preview-${id}`} onClick={() => (open ? onClose() : onOpen())} onFocus={onOpen}>
        {children}
      </button>
      <span id={`preview-${id}`} role="note" className={`xp-preview ${open ? "is-open" : ""}`}>
        <strong>{preview.title}</strong>
        <span>{preview.line}</span>
        <Link href={preview.href} tabIndex={open ? 0 : -1} onBlur={onClose}>{preview.cta} →</Link>
      </span>
    </span>
  )
}

function TempeTime() {
  const [time, setTime] = useState("")
  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Phoenix" })
    const tick = () => setTime(format.format(new Date()))
    tick()
    const id = window.setInterval(tick, 20_000)
    return () => window.clearInterval(id)
  }, [])
  return <time>{time || " "}</time>
}

// A printed photo that leans toward the cursor and flips over to show a note on the back.
function Print() {
  const ref = useRef<HTMLButtonElement>(null)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const card = ref.current
    if (!card || !window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let frame = 0
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect()
        const x = (event.clientX - (rect.left + rect.width / 2)) / window.innerWidth
        const y = (event.clientY - (rect.top + rect.height / 2)) / window.innerHeight
        card.style.setProperty("--tilt-x", `${(-y * 10).toFixed(2)}deg`)
        card.style.setProperty("--tilt-y", `${(x * 12).toFixed(2)}deg`)
      })
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => { cancelAnimationFrame(frame); window.removeEventListener("pointermove", onMove) }
  }, [])

  return (
    <figure className="xp-print-wrap">
      <button ref={ref} type="button" className={`xp-print ${flipped ? "is-flipped" : ""}`} onClick={() => setFlipped((v) => !v)} aria-pressed={flipped} aria-label={flipped ? "Show the photo" : "Turn the photo over"}>
        <span className="xp-print-face xp-print-front">
          <span className="xp-print-photo"><Image src="/profile.jpg" alt="Rithwik standing outdoors at IIIT Dharwad" fill priority sizes="(max-width: 767px) 60vw, 320px" /></span>
          <span className="xp-print-caption">IIIT Dharwad, 2024</span>
        </span>
        <span className="xp-print-face xp-print-back" aria-hidden={!flipped}>
          <span className="xp-print-stamp">IIIT Dharwad · 2024</span>
          <span className="xp-placeholder-note">Placeholder: a short handwritten-style note from you about this photo or this period.</span>
        </span>
      </button>
      <figcaption className="xp-print-hint">{flipped ? "Turn back" : "Turn it over"}</figcaption>
    </figure>
  )
}

export function Hero() {
  const [open, setOpen] = useState<PreviewKey | null>(null)
  const close = (key: PreviewKey) => () => setOpen((current) => (current === key ? null : current))

  return (
    <section className="xp-hero" aria-labelledby="xp-hero-title">
      <div className="xp-hero-text">
        <p className="xp-hero-meta">
          <span>Sai Rithwik Reddy Chirra</span>
          <span className="xp-pill"><i aria-hidden="true" />Tempe, AZ · <TempeTime /></span>
        </p>
        <h1 id="xp-hero-title">Hi, I&apos;m Rithwik.</h1>
        <p className="xp-hero-line">
          I build the software around{" "}
          <Term id="data" open={open === "data"} onOpen={() => setOpen("data")} onClose={close("data")}>data and AI</Term>
          {" "}— the part where a model has to behave like{" "}
          <Term id="software" open={open === "software"} onOpen={() => setOpen("software")} onClose={close("software")}>ordinary software</Term>.
        </p>
        <p className="xp-hero-sub">M.S. Computer Science at Arizona State, graduating May 2027.</p>
        <div className="xp-hero-actions">
          <Link href="/#work" className="xp-button">See how I work</Link>
          <a href={resumeUrl} target="_blank" rel="noreferrer" className="xp-link">Résumé ↗</a>
        </div>
      </div>
      <Print />
    </section>
  )
}
