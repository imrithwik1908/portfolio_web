"use client"

import { useEffect, useRef, useState } from "react"
import { tempeNow } from "@/components/xp/ambient"
import { Arrow } from "@/components/xp/arrow"
import { EMAIL } from "@/components/xp/copy-email"
import { Note } from "@/components/xp/note"

const links = [
  ["GitHub", "https://github.com/imrithwik1908"],
  ["LinkedIn", "https://www.linkedin.com/in/sairithwikreddy"],
  ["Résumé", "https://drive.google.com/file/d/1LF8cf2CkC7JzFfhFVyHCXXfUYF6L9pZd/view?usp=sharing"],
] as const

// A small coded line in the credits. It looks like noise; clicking it decodes, letter by letter.
const SECRET = "You read the credits. Most people leave before this."
const CODED = typeof btoa === "function" ? btoa(SECRET) : "WW91IHJlYWQgdGhlIGNyZWRpdHMu"
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

function Cipher() {
  const [text, setText] = useState(CODED.slice(0, 32))
  const [open, setOpen] = useState(false)
  const frame = useRef(0)
  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const toggle = () => {
    const target = open ? CODED.slice(0, 32) : SECRET
    setOpen(!open)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setText(target)
    const start = performance.now()
    const step = (now: number) => {
      const settled = Math.floor((now - start) / 28)
      setText(Array.from(target, (ch, i) => (i < settled || ch === " " ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(""))
      if (settled < target.length) frame.current = requestAnimationFrame(step)
    }
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(step)
  }

  return (
    <button type="button" className={`xp-cipher ${open ? "is-open" : ""}`} onClick={toggle} aria-label={open ? SECRET : "A coded line. Select to decode it."}>
      <span aria-hidden="true">{text}</span>
    </button>
  )
}

export function Contact() {
  const scene = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [now, setNow] = useState<ReturnType<typeof tempeNow> | null>(null)
  const timer = useRef<number>()

  useEffect(() => {
    setNow(tempeNow())
    const node = scene.current
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    // The letterbox closes as the final scene reaches the middle of the screen.
    let frame = 0
    const update = () => {
      frame = 0
      const rect = node.getBoundingClientRect()
      const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight * 1.1)))
      node.style.setProperty("--close", progress.toFixed(3))
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); window.clearTimeout(timer.current) }
  }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 2400)
    } catch {
      window.location.href = `mailto:${EMAIL}`
    }
  }

  return (
    <div ref={scene} className="xp-finale">
      <span className="xp-finale-bar is-top" aria-hidden="true" />
      <span className="xp-finale-bar is-bottom" aria-hidden="true" />

      <div className="xp-finale-inner">
        <p className="xp-finale-kicker">Contact</p>
        <h2 className="xp-finale-title">Got something that <em>doesn&apos;t quite add up?</em></h2>
        <p className="xp-finale-lede">A role, a research question, or a system failing in a way nobody can explain yet. Let&apos;s look at it together.</p>

        <button type="button" className={`xp-mail ${copied ? "is-copied" : ""}`} onClick={copy}>
          <span className="xp-mail-address">{EMAIL}</span>
          <span className="xp-mail-state" aria-live="polite">{copied ? "Copied. Talk soon." : "Click to copy the address"}</span>
        </button>

        <ul className="xp-finale-links">
          <li><a href={`mailto:${EMAIL}`} className="xp-link">Write an email <Arrow dir="out" /></a></li>
          {links.map(([label, href]) => <li key={label}><a href={href} target="_blank" rel="noreferrer" className="xp-link">{label} <Arrow dir="out" /></a></li>)}
        </ul>
      </div>

      <footer className="xp-credits">
        <span>Sai Rithwik Reddy Chirra</span>
        <Cipher />
        <span><span className={`xp-sky ${now?.day ? "is-day" : "is-night"}`} aria-hidden="true" />{now ? `${now.part} in Tempe, ${now.time}` : "Tempe, Arizona"}</span>
      </footer>
      <Note className="is-contact">The bars close with your scroll position. Copy uses the Clipboard API and falls back to your mail app if the browser blocks it.</Note>
    </div>
  )
}
