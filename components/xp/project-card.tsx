"use client"

import Link from "next/link"
import { useState } from "react"
import { Arrow } from "@/components/xp/arrow"
import { CountUp } from "@/components/xp/count-up"
import { ProjectVisual } from "@/components/xp/project-visual"
import { useInView } from "@/components/xp/use-in-view"
import type { Project } from "@/lib/portfolio-data"
import { projectMeta } from "@/lib/project-highlights"

// One project as a highlight card. `variant="stack"` is the large sticky card on the homepage;
// `variant="grid"` is the compact card on the projects index.
export function ProjectCard({ project, index, total, variant }: { project: Project; index: number; total: number; variant: "stack" | "grid" }) {
  const meta = projectMeta[project.slug]
  const [beneath, setBeneath] = useState(false)
  const { ref, inView } = useInView<HTMLElement>("0px 0px -25% 0px")
  const number = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`

  // A soft light that follows the pointer across the card, and a slight lean on the diagram.
  const onMove = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    event.currentTarget.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`)
    event.currentTarget.style.setProperty("--my", `${(y * 100).toFixed(1)}%`)
    event.currentTarget.style.setProperty("--rx", `${((0.5 - y) * 6).toFixed(2)}deg`)
    event.currentTarget.style.setProperty("--ry", `${((x - 0.5) * 8).toFixed(2)}deg`)
  }
  const onLeave = (event: React.PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--rx", "0deg")
    event.currentTarget.style.setProperty("--ry", "0deg")
  }

  return (
    <article
      ref={ref}
      className={`pc pc-${variant} ${inView ? "is-live" : ""}`}
      style={{ "--tint": meta.tint, "--accent": meta.accent, "--n": index } as React.CSSProperties}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <span className="pc-light" aria-hidden="true" />
      <div className="pc-text">
        <p className="pc-kicker"><span>{number}</span><span>{project.eyebrow}</span><span>{project.year}</span></p>
        <h3><Link href={`/projects/${project.slug}`} className="pc-title-link">{project.title}</Link></h3>
        <p className="pc-tagline">{meta.tagline}</p>
        {variant === "stack" && (
          <dl className="pc-highlights">
            {meta.highlights.map((h) => (
              <div key={h.label}>
                <dt>{h.count ? <CountUp value={h.count.to} run={inView} decimals={h.count.decimals} suffix={h.count.suffix} /> : h.value}</dt>
                <dd>{h.label}</dd>
              </div>
            ))}
          </dl>
        )}
        <ul className="pc-tools" aria-label="Built with">
          {project.stack.slice(0, variant === "stack" ? 5 : 3).map((tool) => <li key={tool}>{tool}</li>)}
        </ul>
        <span className="pc-cta" aria-hidden="true">Explore the project <Arrow /></span>
      </div>
      <div className="pc-visual"><ProjectVisual slug={project.slug} /></div>
      {variant === "stack" && (
        <>
          <button type="button" className="pc-beneath-toggle" aria-pressed={beneath} onClick={() => setBeneath((v) => !v)}>
            <span className="xp-eye" aria-hidden="true" />{beneath ? "Back" : "How it works"}
          </button>
          <div className={`pc-beneath ${beneath ? "is-open" : ""}`} aria-hidden={!beneath}>
            <p className="pc-beneath-label">How {project.title} is wired</p>
            <ol>
              {project.architecture.map((node, i) => (
                <li key={node.label} style={{ "--i": i } as React.CSSProperties}><span>{String(i + 1).padStart(2, "0")}</span><strong>{node.label}</strong><em>{node.detail}</em></li>
              ))}
            </ol>
            <Link href={`/projects/${project.slug}`} className="xp-link" tabIndex={beneath ? 0 : -1}>The full write-up <Arrow /></Link>
          </div>
        </>
      )}
    </article>
  )
}
