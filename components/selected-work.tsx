import Image from "next/image"
import Link from "next/link"
import { ProjectSignal } from "@/components/editorial-interactions"
import { selectedProjects } from "@/lib/portfolio-data"

export function SelectedWork() {
  return (
    <section id="work" className="work-section page-shell" aria-labelledby="projects-title">
      <header className="work-heading">
        <p className="section-kicker">Projects</p>
        <h2 id="projects-title">A few things I&apos;ve built.</h2>
        <p>The useful details are in the decisions, the measurements, and the parts that did not work immediately.</p>
      </header>

      <div className="project-compositions">
        {selectedProjects.map((project, index) => (
          <article className={`project-composition project-${project.slug}`} key={project.slug}>
            <div className="project-ordinal" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
            <div className="project-copy">
              <p className="project-context">{project.eyebrow} <span>·</span> {project.year}</p>
              <h3><Link href={`/projects/${project.slug}`}>{project.question}</Link></h3>
              <p>{project.summary}</p>
              <dl className="project-proof"><div><dt>{project.outcomeLabel}</dt><dd>{project.outcome}</dd></div></dl>
              <Link className="text-link" href={`/projects/${project.slug}`}>Open case study <span aria-hidden="true">↗</span></Link>
            </div>

            <div className="project-visual">
              <ProjectSignal project={project.slug as "agentguard" | "x-mutest" | "tensor-fusion" | "course-catalog"} />
              <Link href={`/projects/${project.slug}`} className="project-image" aria-label={`Read the ${project.title} case study`}>
                <Image src={project.image} alt="" fill sizes="(max-width: 767px) 100vw, 62vw" className={project.imageFit === "contain" ? "object-contain" : "object-cover"} priority={index === 0} />
              </Link>
              {project.slug === "agentguard" && <div className="project-detail" aria-hidden="true"><Image src={project.image} alt="" fill sizes="280px" className="object-cover" /></div>}
            </div>
          </article>
        ))}
      </div>
      <Link className="all-work-link" href="/projects">All projects and notes <span aria-hidden="true">↗</span></Link>
    </section>
  )
}
