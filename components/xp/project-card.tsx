"use client"

import Link from "next/link"
import { CountUp } from "@/components/xp/count-up"
import { ProjectVisual } from "@/components/xp/project-visual"
import { useInView } from "@/components/xp/use-in-view"
import type { Project } from "@/lib/portfolio-data"
import { projectMeta } from "@/lib/project-highlights"

// One project as a highlight card. `variant="stack"` is the large sticky card on the homepage;
// `variant="grid"` is the compact card on the projects index.
export function ProjectCard({ project, index, total, variant }: { project: Project; index: number; total: number; variant: "stack" | "grid" }) {
  const meta = projectMeta[project.slug]
  const { ref, inView } = useInView<HTMLElement>("0px 0px -25% 0px")
  const number = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`

  return (
    <article
      ref={ref}
      className={`pc pc-${variant} ${inView ? "is-live" : ""}`}
      style={{ "--tint": meta.tint, "--accent": meta.accent, "--n": index } as React.CSSProperties}
    >
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
        <span className="pc-cta" aria-hidden="true">Explore the project <i>→</i></span>
      </div>
      <div className="pc-visual"><ProjectVisual slug={project.slug} /></div>
    </article>
  )
}
