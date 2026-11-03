"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toggleCloser } from "@/components/xp/ambient"
import { CopyEmail } from "@/components/xp/copy-email"
import { useGlider } from "@/components/xp/use-glider"

const watched = ["work", "research", "path", "education", "toolkit", "about", "contact"]

const sections = [
  ["work", "Work"],
  ["path", "Career"],
  ["about", "About"],
  ["contact", "Contact"],
] as const

// The R, written in the three languages of the X-MuTeST research. Rest the pointer on it
// (or keep focus on it) and it slowly turns through English, Telugu and Hindi.
const scripts = ["R", "ర", "र"]

function Monogram() {
  const [i, setI] = useState(0)
  const timer = useRef<number>()
  const start = () => {
    window.clearInterval(timer.current)
    timer.current = window.setInterval(() => setI((v) => (v + 1) % scripts.length), 1100)
  }
  const stop = () => { window.clearInterval(timer.current); setI(0) }
  useEffect(() => () => window.clearInterval(timer.current), [])
  return (
    <Link href="/" className="xp-nav-home" aria-label="Sai Rithwik Reddy Chirra, home" onMouseEnter={start} onMouseLeave={stop} onFocus={start} onBlur={stop}>
      <span key={i} aria-hidden="true">{scripts[i]}</span>
    </Link>
  )
}

export function XpNav() {
  const pathname = usePathname()
  const [active, setActive] = useState<string | null>(null)
  const [raised, setRaised] = useState(false)
  const [closer, setCloser] = useState(false)

  useEffect(() => {
    const onCloser = (event: Event) => setCloser((event as CustomEvent<boolean>).detail)
    window.addEventListener("closer", onCloser)
    return () => window.removeEventListener("closer", onCloser)
  }, [])
  const { container, register, style } = useGlider<HTMLAnchorElement>(active)

  useEffect(() => {
    if (pathname !== "/") return setActive(pathname.startsWith("/projects") ? "work" : null)
    const onScroll = () => setRaised(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    const visible = new Map<string, number>()
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0))
      const best = Array.from(visible.entries()).sort((a, b) => b[1] - a[1])[0]
      setActive(best && best[1] > 0 ? (best[0] === "research" ? "work" : best[0] === "toolkit" || best[0] === "education" ? "path" : best[0]) : null)
    }, { threshold: [0, 0.15, 0.4, 0.7], rootMargin: "-20% 0px -35% 0px" })
    watched.forEach((id) => { const node = document.getElementById(id); if (node) observer.observe(node) })
    return () => { observer.disconnect(); window.removeEventListener("scroll", onScroll) }
  }, [pathname])

  return (
    <nav className={`xp-nav ${raised ? "is-raised" : ""}`} aria-label="Main">
      <Monogram />
      <div className="xp-nav-links" ref={container as React.Ref<HTMLDivElement>}>
        <span className="xp-glider" style={style} aria-hidden="true" />
        {sections.map(([id, label]) => (
          <Link key={id} href={`/#${id}`} ref={register(id)} className={active === id ? "is-active" : undefined} aria-current={active === id ? "true" : undefined}>{label}</Link>
        ))}
      </div>
      <span className="xp-nav-rule" aria-hidden="true" />
      <CopyEmail className="xp-nav-copy" />
      <button type="button" className={`xp-nav-eye ${closer ? "is-on" : ""}`} aria-pressed={closer} onClick={toggleCloser} title="Look closer (X)">
        <span className="xp-eye" aria-hidden="true" /><span className="sr-only">Look closer: show how each part was built</span>
      </button>
    </nav>
  )
}
