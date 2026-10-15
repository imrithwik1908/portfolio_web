"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Project } from "@/lib/portfolio-data"

export type ProjectPreview = Pick<Project, "slug" | "title" | "eyebrow" | "status" | "question" | "summary" | "image" | "imageFit" | "capabilities">

const filters = [
  ["all", "All work"],
  ["systems", "Systems"],
  ["data", "Data"],
  ["intelligence", "Intelligence"],
] as const

export function ProjectIndex({ projects }: { projects: ProjectPreview[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number][0]>("all")
  const visible = filter === "all" ? projects : projects.filter((project) => project.capabilities.includes(filter))

  return (
    <>
      <div className="project-filters" aria-label="Filter projects">
        {filters.map(([value, label]) => (
          <button key={value} type="button" className={filter === value ? "is-active" : ""} aria-pressed={filter === value} onClick={() => setFilter(value)}>
            {label}<span>{value === "all" ? projects.length : projects.filter((project) => project.capabilities.includes(value)).length}</span>
          </button>
        ))}
      </div>
      <div className="project-index-list" aria-live="polite">
        {visible.map((project, index) => (
          <article key={project.slug}>
            <div className="project-index-number">{String(index + 1).padStart(2, "0")}</div>
            <div className="project-index-visual">
              <Link href={`/projects/${project.slug}`} className="project-index-image" aria-label={`Read ${project.title}`}>
                <Image src={project.image} alt={`${project.title} project visual`} fill sizes="(max-width: 767px) 100vw, 55vw" className={project.imageFit === "contain" ? "object-contain" : "object-cover"} />
              </Link>
            </div>
            <div className="project-index-copy">
              <p>{project.eyebrow} · {project.status}</p>
              <h2><Link href={`/projects/${project.slug}`}>{project.title}</Link></h2>
              <h3>{project.question}</h3>
              <p>{project.summary}</p>
              <Link className="text-link" href={`/projects/${project.slug}`}>Open case study <span aria-hidden="true">↗</span></Link>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
