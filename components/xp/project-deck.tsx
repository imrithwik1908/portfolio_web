"use client"

import { useEffect, useRef, useState } from "react"
import { ProjectCard } from "@/components/xp/project-card"
import type { Project } from "@/lib/portfolio-data"
import { projectMeta } from "@/lib/project-highlights"

// Sticky highlight cards. As a card is covered by the next one it recedes (scales and dims),
// and a side rail shows which card is in front.
export function ProjectDeck({ projects }: { projects: Project[] }) {
  const deck = useRef<HTMLDivElement>(null)
  const [front, setFront] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const root = deck.current
    if (!root) return
    const cards = Array.from(root.querySelectorAll<HTMLElement>(".pc-stack"))
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let frame = 0
    const update = () => {
      frame = 0
      const box = root.getBoundingClientRect()
      setVisible(box.top < window.innerHeight * 0.6 && box.bottom > window.innerHeight * 0.4)
      let current = 0
      cards.forEach((card, i) => {
        const next = cards[i + 1]
        const rect = card.getBoundingClientRect()
        if (rect.top < window.innerHeight * 0.5) current = i
        if (!next || reduce) return card.style.setProperty("--cover", "0")
        const gap = next.getBoundingClientRect().top - rect.top
        const cover = Math.min(1, Math.max(0, 1 - gap / rect.height))
        card.style.setProperty("--cover", cover.toFixed(3))
      })
      setFront(current)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll) }
  }, [])

  const jump = (i: number) => deck.current?.querySelectorAll<HTMLElement>(".pc-stack")[i]?.scrollIntoView({ behavior: "smooth", block: "start" })

  return (
    <div className="pc-deck-wrap">
      <nav className={`pc-rail ${visible ? "is-visible" : ""}`} aria-label="Featured projects">
        {projects.map((p, i) => (
          <button key={p.slug} type="button" className={i === front ? "is-front" : undefined} style={{ "--accent": projectMeta[p.slug].accent } as React.CSSProperties} onClick={() => jump(i)} aria-current={i === front ? "true" : undefined}>
            <i aria-hidden="true" /><span>{p.title}</span>
          </button>
        ))}
      </nav>
      <div className="pc-deck" ref={deck}>
        {projects.map((project, i) => <ProjectCard key={project.slug} project={project} index={i} total={projects.length} variant="stack" />)}
      </div>
    </div>
  )
}
