"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Arrow } from "@/components/xp/arrow"
import { CountUp } from "@/components/xp/count-up"
import { ProjectVisual } from "@/components/xp/project-visual"
import { useInView } from "@/components/xp/use-in-view"
import { projectMeta } from "@/lib/project-highlights"

const resumeUrl = "https://drive.google.com/file/d/1LF8cf2CkC7JzFfhFVyHCXXfUYF6L9pZd/view?usp=sharing"

const previews = {
  "x-mutest": { title: "X-MuTeST", line: "Explainable hate-speech detection · AAAI 2026" },
  agentguard: { title: "AgentGuard", line: "A release gate for LLM applications" },
} as const
type PreviewKey = keyof typeof previews

const facts = [
  { to: 1, label: "paper at AAAI 2026" },
  { to: 4, label: "projects with full write-ups" },
  { to: 3, label: "roles across research, data and web" },
  { to: 2, label: "degrees, one in progress" },
]

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

// A phrase that previews a project inside the photo frame on hover, and opens it on click.
function Term({ slug, onPreview, children }: { slug: PreviewKey; onPreview: (slug: PreviewKey | null) => void; children: React.ReactNode }) {
  return (
    <Link
      href={`/projects/${slug}`}
      className="xp-term"
      onMouseEnter={() => onPreview(slug)}
      onMouseLeave={() => onPreview(null)}
      onFocus={() => onPreview(slug)}
      onBlur={() => onPreview(null)}
    >
      {children}
    </Link>
  )
}

// A printed photo on a small stack. It leans toward the cursor, shows project previews in its
// frame, and turns over to its back: rotated edge-on, swapped, then rotated back, so the face
// is never seen mirrored.
function Print({ preview }: { preview: PreviewKey | null }) {
  const tilt = useRef<HTMLDivElement>(null)
  const flipper = useRef<HTMLButtonElement>(null)
  const [back, setBack] = useState(false)
  const turning = useRef(false)

  useEffect(() => {
    const node = tilt.current
    if (!node || !window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let frame = 0
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect()
        node.style.setProperty("--tilt-x", `${(-(event.clientY - rect.top - rect.height / 2) / window.innerHeight * 10).toFixed(2)}deg`)
        node.style.setProperty("--tilt-y", `${((event.clientX - rect.left - rect.width / 2) / window.innerWidth * 12).toFixed(2)}deg`)
      })
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => { cancelAnimationFrame(frame); window.removeEventListener("pointermove", onMove) }
  }, [])

  const turn = async () => {
    const node = flipper.current
    if (!node || turning.current) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setBack((v) => !v)
    turning.current = true
    await node.animate([{ transform: "rotateY(0deg)" }, { transform: "rotateY(90deg)" }], { duration: 200, easing: "cubic-bezier(.5,0,.75,0)" }).finished
    setBack((v) => !v)
    await node.animate([{ transform: "rotateY(-90deg)" }, { transform: "rotateY(0deg)" }], { duration: 420, easing: "cubic-bezier(.2,1.2,.4,1)" }).finished
    turning.current = false
  }

  const showing = preview && !back ? preview : null

  return (
    <figure className="xp-print-wrap">
      <div className="xp-print-tilt" ref={tilt}>
        <span className="xp-print-under is-one" aria-hidden="true" />
        <span className="xp-print-under is-two" aria-hidden="true" />
        <button ref={flipper} type="button" className="xp-print" onClick={turn} aria-pressed={back} aria-label={back ? "Show the photo" : "Turn the photo over"}>
          {!back ? (
            <span className="xp-print-face">
              <span className="xp-print-photo">
                <Image src="/profile.jpg" alt="Rithwik standing outdoors at IIIT Dharwad" fill priority sizes="(max-width: 767px) 70vw, 340px" />
                {(Object.keys(previews) as PreviewKey[]).map((slug) => (
                  <span key={slug} className={`xp-print-preview ${showing === slug ? "is-on" : ""}`} style={{ "--tint": projectMeta[slug].tint, "--accent": projectMeta[slug].accent } as React.CSSProperties} aria-hidden="true">
                    <span className="pc is-live"><ProjectVisual slug={slug} /></span>
                  </span>
                ))}
              </span>
              <span className="xp-print-caption">{showing ? previews[showing].title : "IIIT Dharwad, 2024"}</span>
            </span>
          ) : (
            <span className="xp-print-face xp-print-back">
              <span className="xp-print-stamp">IIIT Dharwad · 2024</span>
              <span className="xp-placeholder-note">Placeholder: a short note from you about this photo or this period.</span>
            </span>
          )}
        </button>
      </div>
      <figcaption className="xp-print-hint">{showing ? previews[showing].line : back ? "Click to turn back" : "Click the photo to turn it over"}</figcaption>
    </figure>
  )
}

function Facts() {
  const { ref, inView } = useInView<HTMLDListElement>("0px")
  return (
    <dl ref={ref} className="xp-facts">
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt><CountUp value={fact.to} run={inView} /></dt>
          <dd>{fact.label}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Hero() {
  const [preview, setPreview] = useState<PreviewKey | null>(null)

  return (
    <section className="xp-hero" aria-labelledby="xp-hero-title">
      <div className="xp-hero-main">
        <div className="xp-hero-text">
          <p className="xp-hero-meta">
            <span>Sai Rithwik Reddy Chirra</span>
            <span className="xp-pill"><i aria-hidden="true" />Tempe, AZ · <TempeTime /></span>
          </p>
          <h1 id="xp-hero-title">Hi, I&apos;m <em>Rithwik.</em></h1>
          <p className="xp-hero-line">
            I build the software around <Term slug="x-mutest" onPreview={setPreview}>data and AI</Term>, the part where a model has to behave like <Term slug="agentguard" onPreview={setPreview}>ordinary software</Term>.
          </p>
          <p className="xp-hero-sub">M.S. Computer Science at Arizona State, graduating May 2027.</p>
          <div className="xp-hero-actions">
            <Link href="/#work" className="xp-button">See my work <Arrow dir="down" /></Link>
            <a href={resumeUrl} target="_blank" rel="noreferrer" className="xp-link">Résumé <Arrow dir="out" /></a>
          </div>
        </div>
        <Print preview={preview} />
      </div>
      <Facts />
    </section>
  )
}
