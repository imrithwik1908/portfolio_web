"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

// Page transitions with the browser's View Transitions API. Internal links cross-fade; a project
// card's diagram and title grow into the case study's header.
// Browsers without the API, and visitors who prefer reduced motion, get normal navigation.

type VTDocument = Document & { startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> } }

const SHARED = [["pc-visual", "xp-hero-visual"], ["pc-text h3", "xp-hero-title"]] as const

export function PageTransitions() {
  const router = useRouter()
  const pathname = usePathname()
  const waiting = useRef<{ path: string; done: () => void } | null>(null)

  useEffect(() => {
    const w = waiting.current
    if (w && pathname === w.path) { waiting.current = null; w.done() }
  }, [pathname])

  useEffect(() => {
    const doc = document as VTDocument
    if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const clearNames = () => document.querySelectorAll<HTMLElement>("[data-vt]").forEach((el) => { el.style.viewTransitionName = ""; delete el.dataset.vt })
    const name = (el: Element | null | undefined, n: string) => { if (el instanceof HTMLElement) { el.style.viewTransitionName = n; el.dataset.vt = "1" } }
    // Resolves once the new route has committed: the pathname hook fires, or the URL changes
    // (Next updates it on commit); the browser then captures the new page on its next frame.
    const arrive = (path: string) => new Promise<void>((resolve) => {
      let settled = false
      const finish = () => { if (settled) return; settled = true; window.clearInterval(poll); window.clearTimeout(cap); resolve() }
      waiting.current = { path, done: finish }
      const poll = window.setInterval(() => { if (window.location.pathname === path) finish() }, 16)
      const cap = window.setTimeout(finish, 2500) // never hold the page hostage
    })

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return
      const url = new URL(a.href, window.location.href)
      if (url.origin !== window.location.origin || url.hash || url.pathname === window.location.pathname) return
      if (url.pathname.startsWith("/api/")) return

      e.preventDefault()
      const card = a.closest(".pc")
      clearNames()
      if (card) {
        SHARED.forEach(([sel, n]) => name(card.querySelector(`.${sel}`), n))
      }
      const path = url.pathname
      const t = doc.startViewTransition!(async () => {
        clearNames()
        const landed = arrive(path)
        router.push(path + url.search)
        await landed
      })
      t.finished.finally(clearNames)
    }

    document.addEventListener("click", onClick, true)
    return () => { document.removeEventListener("click", onClick, true) }
  }, [router])

  return null
}
