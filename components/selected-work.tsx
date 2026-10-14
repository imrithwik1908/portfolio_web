import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { selectedProjects } from "@/lib/portfolio-data"

export function SelectedWork() {
  return (
    <section id="work" className="work-section page-shell" aria-labelledby="selected-work-title">
      <header className="section-heading work-heading">
        <div><p className="section-kicker">Selected work</p><h2 id="selected-work-title">Three projects worth opening.</h2></div>
        <p>Different problems, with enough detail to see the decisions behind them.</p>
      </header>

      <div className="selected-work-list">
        {selectedProjects.map((project, index) => (
          <article className="selected-project" key={project.slug}>
            <Link href={`/projects/${project.slug}`} className="selected-project-media" aria-label={`Read the ${project.title} case study`}>
              <Image src={project.image} alt="" fill sizes="(max-width: 767px) 100vw, 55vw" className={project.imageFit === "contain" ? "object-contain" : "object-cover"} priority={index === 0} />
              <span>{String(index + 1).padStart(2, "0")}</span>
            </Link>
            <div className="selected-project-copy">
              <p className="project-context">{project.eyebrow} · {project.year}</p>
              <h3><Link href={`/projects/${project.slug}`}>{project.question}</Link></h3>
              <p>{project.summary}</p>
              <dl className="project-proof">
                <div><dt>{project.outcomeLabel}</dt><dd>{project.outcome}</dd></div>
                <div><dt>Built with</dt><dd>{project.stack.slice(0, 3).join(" · ")}</dd></div>
              </dl>
              <Link className="text-link" href={`/projects/${project.slug}`}>Read case study <ArrowUpRight aria-hidden="true" /></Link>
            </div>
          </article>
        ))}
      </div>
      <Link className="all-work-link" href="/projects">See all project notes <ArrowUpRight aria-hidden="true" /></Link>
    </section>
  )
}
