"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { CopyEmail } from "@/components/xp/copy-email"
import { useGlider } from "@/components/xp/use-glider"

const sections = [
  ["work", "Work"],
  ["about", "About"],
  ["contact", "Contact"],
] as const

export function XpNav() {
  const pathname = usePathname()
  const [active, setActive] = useState<string | null>(null)
  const [raised, setRaised] = useState(false)
  const { container, register, style } = useGlider<HTMLAnchorElement>(active)

  useEffect(() => {
    if (pathname !== "/") return setActive(null)
    const onScroll = () => setRaised(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    const visible = new Map<string, number>()
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0))
      const best = Array.from(visible.entries()).sort((a, b) => b[1] - a[1])[0]
      setActive(best && best[1] > 0 ? best[0] : null)
    }, { threshold: [0, 0.15, 0.4, 0.7], rootMargin: "-20% 0px -35% 0px" })
    sections.forEach(([id]) => { const node = document.getElementById(id); if (node) observer.observe(node) })
    return () => { observer.disconnect(); window.removeEventListener("scroll", onScroll) }
  }, [pathname])

  return (
    <nav className={`xp-nav ${raised ? "is-raised" : ""}`} aria-label="Main">
      <Link href="/" className="xp-nav-home" aria-label="Sai Rithwik Reddy Chirra, home">R</Link>
      <div className="xp-nav-links" ref={container as React.Ref<HTMLDivElement>}>
        <span className="xp-glider" style={style} aria-hidden="true" />
        {sections.map(([id, label]) => (
          <Link key={id} href={`/#${id}`} ref={register(id)} className={active === id ? "is-active" : undefined} aria-current={active === id ? "true" : undefined}>{label}</Link>
        ))}
      </div>
      <span className="xp-nav-rule" aria-hidden="true" />
      <CopyEmail className="xp-nav-copy" />
    </nav>
  )
}
