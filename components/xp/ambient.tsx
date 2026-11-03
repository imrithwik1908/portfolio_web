"use client"

import { useEffect } from "react"

// The room: a faint light that follows the pointer, film grain, and "look closer" mode
// (press X, or the eye in the navigation) which reveals notes on how each part was built.
export function Ambient() {
  useEffect(() => {
    const root = document.documentElement
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    let frame = 0
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        root.style.setProperty("--light-x", `${event.clientX}px`)
        root.style.setProperty("--light-y", `${event.clientY}px`)
      })
    }
    if (fine) window.addEventListener("pointermove", onMove, { passive: true })

    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (event.metaKey || event.ctrlKey || event.altKey || target.closest("input, textarea, [contenteditable]")) return
      if (event.key.toLowerCase() === "x") toggleCloser()
    }
    window.addEventListener("keydown", onKey)

    console.info("%cYou looked beneath the surface.", "font: 600 13px/1.6 Georgia, serif; color: #e9c27b")
    console.info("Press X anywhere on the page to see how it was built.")

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("keydown", onKey)
    }
  }, [])

  return (
    <>
      <div className="xp-light" aria-hidden="true" />
      <div className="xp-grain" aria-hidden="true" />
    </>
  )
}

export function toggleCloser() {
  const root = document.documentElement
  const on = root.dataset.closer !== "true"
  root.dataset.closer = String(on)
  window.dispatchEvent(new CustomEvent("closer", { detail: on }))
}
