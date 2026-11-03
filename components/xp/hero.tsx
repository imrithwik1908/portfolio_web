"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { tempeNow } from "@/components/xp/ambient"
import { Arrow } from "@/components/xp/arrow"
import { Note } from "@/components/xp/note"

const resumeUrl = "https://drive.google.com/file/d/1LF8cf2CkC7JzFfhFVyHCXXfUYF6L9pZd/view?usp=sharing"

// The opening shot: letterbox bars part once per visit, the name comes into focus, and the
// portrait settles. Nothing here waits on the visitor or blocks the page.
function Letterbox() {
  const [play, setPlay] = useState(false)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    try {
      if (sessionStorage.getItem("opened")) return
      sessionStorage.setItem("opened", "1")
    } catch { /* storage unavailable: still play */ }
    setPlay(true)
  }, [])
  if (!play) return null
  return <div className="xp-letterbox is-opening" aria-hidden="true"><span /><span /></div>
}

export function Hero() {
  const [now, setNow] = useState<ReturnType<typeof tempeNow> | null>(null)
  useEffect(() => {
    const tick = () => setNow(tempeNow())
    tick()
    const id = window.setInterval(tick, 20_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section className="xp-hero" aria-labelledby="xp-hero-title">
      <Letterbox />
      <div className="xp-hero-text">
        <p className="xp-hero-meta">
          <span className={`xp-sky ${now?.day ? "is-day" : "is-night"}`} aria-hidden="true" />
          Tempe, Arizona{now && <> · {now.part}, {now.time}</>}
        </p>
        <h1 id="xp-hero-title">Hi, I&apos;m <em>Rithwik</em>.</h1>
        <p className="xp-hero-line">I build machine learning systems and the software around them, and I care more about why a model fails than about its best score.</p>
        <p className="xp-hero-sub">I&apos;m doing my M.S. in Computer Science at Arizona State, graduating May 2027. Before that, research at IIT Indore that became an AAAI 2026 paper, and forecasting work at Blackcoffer. I&apos;m looking for ML engineering and data science roles.</p>
        <div className="xp-hero-actions">
          <Link href="/#work" className="xp-button">See what I&apos;ve built <Arrow dir="down" /></Link>
          <a href={resumeUrl} target="_blank" rel="noreferrer" className="xp-link">Résumé <Arrow dir="out" /></a>
        </div>
      </div>

      <figure className="xp-portrait">
        {/* A plain image: no optimizer round-trip and no filters, just the photograph. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/profile.jpg" alt="Rithwik standing outdoors at IIIT Dharwad" width={1200} height={1600} loading="eager" fetchPriority="high" decoding="async" />
        <figcaption>IIIT Dharwad, 2024</figcaption>
      </figure>

      <a href="#work" className="xp-scroll-cue" aria-label="Scroll to the work"><span /></a>
      <Note className="is-hero">The letterbox plays once per visit and is skipped entirely if you prefer reduced motion. The sky icon follows the real hour in Tempe.</Note>
    </section>
  )
}
