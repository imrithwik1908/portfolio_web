"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Arrow } from "@/components/xp/arrow"
import { ProjectVisual } from "@/components/xp/project-visual"
import { projectMeta } from "@/lib/project-highlights"

const resumeUrl = "https://drive.google.com/file/d/1LF8cf2CkC7JzFfhFVyHCXXfUYF6L9pZd/view?usp=sharing"

const previews = {
  "x-mutest": { title: "X-MuTeST", line: "Explainable hate-speech detection · AAAI 2026" },
  agentguard: { title: "AgentGuard", line: "A release gate for LLM applications" },
} as const
type PreviewKey = keyof typeof previews

function useTempeTime() {
  const [time, setTime] = useState("")
  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Phoenix" })
    const tick = () => setTime(format.format(new Date()))
    tick()
    const id = window.setInterval(tick, 20_000)
    return () => window.clearInterval(id)
  }, [])
  return time
}

// A paper object on the desk that can be picked up and moved. It lifts while held and
// settles with a slight random turn when dropped. Purely decorative: its text is repeated in the copy.
function Paper({ className, start, children }: { className: string; start: { x: number; y: number; r: number }; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const pos = useRef(start)
  const [held, setHeld] = useState(false)

  const apply = () => ref.current?.style.setProperty("transform", `translate(${pos.current.x}px, ${pos.current.y}px) rotate(${pos.current.r}deg)`)
  useEffect(apply, [])

  const onDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const node = ref.current
    if (!node) return
    event.preventDefault()
    node.setPointerCapture(event.pointerId)
    node.style.zIndex = String(Date.now() % 100000)
    const origin = { x: event.clientX - pos.current.x, y: event.clientY - pos.current.y }
    setHeld(true)
    const move = (e: PointerEvent) => { pos.current = { ...pos.current, x: e.clientX - origin.x, y: e.clientY - origin.y }; apply() }
    const up = () => {
      pos.current = { ...pos.current, r: Math.round((Math.random() * 10 - 5) * 10) / 10 }
      apply()
      setHeld(false)
      node.removeEventListener("pointermove", move)
      node.removeEventListener("pointerup", up)
      node.removeEventListener("pointercancel", up)
    }
    node.addEventListener("pointermove", move)
    node.addEventListener("pointerup", up)
    node.addEventListener("pointercancel", up)
  }

  return <div ref={ref} className={`xp-paper-bit ${className} ${held ? "is-held" : ""}`} onPointerDown={onDown} aria-hidden="true">{children}</div>
}

function Term({ slug, onPreview, children }: { slug: PreviewKey; onPreview: (slug: PreviewKey | null) => void; children: React.ReactNode }) {
  return (
    <Link href={`/projects/${slug}`} className="xp-term" onMouseEnter={() => onPreview(slug)} onMouseLeave={() => onPreview(null)} onFocus={() => onPreview(slug)} onBlur={() => onPreview(null)}>
      {children}
    </Link>
  )
}

export function Hero() {
  const [preview, setPreview] = useState<PreviewKey | null>(null)
  const time = useTempeTime()

  return (
    <section className="xp-hero" aria-labelledby="xp-hero-title">
      <div className="xp-hero-text">
        <p className="xp-hero-meta">Sai Rithwik Reddy Chirra · Tempe, Arizona{time && <> · <time>{time}</time></>}</p>
        <h1 id="xp-hero-title">Hi, I&apos;m <em>Rithwik</em>.</h1>
        <p className="xp-hero-line">
          I build the software around <Term slug="x-mutest" onPreview={setPreview}>data and AI</Term>, the part where a model has to behave like <Term slug="agentguard" onPreview={setPreview}>ordinary software</Term>.
        </p>
        <p className="xp-hero-sub">M.S. Computer Science at Arizona State, graduating May 2027. Co-author of an AAAI 2026 paper.</p>
        <div className="xp-hero-actions">
          <Link href="/#work" className="xp-button">See my work <Arrow dir="down" /></Link>
          <a href={resumeUrl} target="_blank" rel="noreferrer" className="xp-link">Résumé <Arrow dir="out" /></a>
        </div>
      </div>

      <div className="xp-desk">
        <figure className="xp-print">
          <span className="xp-print-photo">
            {/* A plain image keeps the photo independent of the image optimizer and of any 3D transforms. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/profile.jpg" alt="Rithwik standing outdoors at IIIT Dharwad" width={1200} height={1600} loading="eager" decoding="async" />
            {(Object.keys(previews) as PreviewKey[]).map((slug) => (
              <span key={slug} className={`xp-print-preview ${preview === slug ? "is-on" : ""}`} style={{ "--tint": projectMeta[slug].tint, "--accent": projectMeta[slug].accent } as React.CSSProperties} aria-hidden="true">
                <span className="pc is-live"><ProjectVisual slug={slug} /></span>
              </span>
            ))}
          </span>
          <figcaption className="xp-print-caption">{preview ? previews[preview].title : "IIIT Dharwad, 2024"}</figcaption>
        </figure>

        <Paper className="is-ticket" start={{ x: -64, y: 300, r: -6 }}>
          <span className="xp-ticket-label">Local time</span>
          <span className="xp-ticket-value">{time || "Tempe"}</span>
          <span className="xp-ticket-label">Tempe, AZ</span>
        </Paper>
        <Paper className="is-stamp" start={{ x: 236, y: -26, r: 12 }}>
          <span>AAAI</span><strong>2026</strong><span>published</span>
        </Paper>
        <Paper className="is-label" start={{ x: 150, y: 372, r: 4 }}>
          M.S. CS · ASU · May 2027
        </Paper>
        <p className="xp-desk-hint" aria-hidden="true">{preview ? previews[preview].line : "These move. Go on."}</p>
      </div>
    </section>
  )
}
