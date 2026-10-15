import Image from "next/image"
import Link from "next/link"
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
            <div className="project-copy">
              <p className="project-context"><span>{String(index + 1).padStart(2, "0")}</span>{project.eyebrow} · {project.year}</p>
              <h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3>
              <p className="project-question">{project.question}</p>
              <p>{project.summary}</p>
              <dl className="project-proof"><div><dt>{project.outcomeLabel}</dt><dd>{project.outcome}</dd></div></dl>
              <p className="project-tools">{project.stack.slice(0, 4).join(" · ")}</p>
              <Link className="text-link" href={`/projects/${project.slug}`}>Open case study <span aria-hidden="true">↗</span></Link>
            </div>

            <div className="project-visual">
              <Link href={`/projects/${project.slug}`} className={`project-image ${project.imageFit === "contain" ? "is-diagram" : ""}`} aria-label={`Read the ${project.title} case study`}>
                <Image src={project.image} alt={`${project.title} project visual`} fill sizes="(max-width: 767px) 100vw, 60vw" className={project.imageFit === "contain" ? "object-contain" : "object-cover"} priority={index === 0} loading={index === 0 ? undefined : "eager"} />
              </Link>
            </div>
          </article>
        ))}
      </div>
      <Link className="all-work-link" href="/projects">All projects and notes <span aria-hidden="true">↗</span></Link>
    </section>
  )
}
