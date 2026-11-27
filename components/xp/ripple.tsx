"use client"

import { useEffect } from "react"

// A click on empty space leaves a small trace: a faint ring widening out, and a few specks of
// starlight drifting off and going out. Nothing on links, buttons, text, images or anything else
// that does or says something; never with reduced motion.
const BUSY = "a, button, input, textarea, select, label, summary, [role=button], [tabindex], p, h1, h2, h3, h4, li, dt, dd, blockquote, figure, img, svg, canvas:not(.xp-stars), pre, code, .pc, .xp-cmd, .xp-write, [data-no-ripple]"

export function Ripple() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || !(e.target instanceof Element) || e.target.closest(BUSY)) return
      if (window.getSelection()?.toString()) return
      const at = document.createElement("span")
      at.className = "xp-ripple"
      at.style.left = `${e.clientX}px`
      at.style.top = `${e.clientY}px`
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + Math.random() * 0.9
        const d = 16 + Math.random() * 20
        const s = document.createElement("i")
        s.style.setProperty("--dx", `${Math.cos(a) * d}px`)
        s.style.setProperty("--dy", `${Math.sin(a) * d}px`)
        s.style.setProperty("--delay", `${Math.round(Math.random() * 80)}ms`)
        at.appendChild(s)
      }
      document.body.appendChild(at)
      window.setTimeout(() => at.remove(), 1100)
    }
    window.addEventListener("pointerdown", onDown)
    return () => window.removeEventListener("pointerdown", onDown)
  }, [])
  return null
}
