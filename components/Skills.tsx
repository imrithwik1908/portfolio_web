import Link from "next/link"
import { capabilities, projects } from "@/lib/portfolio-data"

export function Skills() {
  return (
    <section id="capabilities" className="capabilities-section page-shell" aria-labelledby="capabilities-title">
      <header className="section-heading capability-heading">
        <div><p className="section-kicker">The shorter version</p><h2 id="capabilities-title">Three recurring parts of the work.</h2></div>
        <p>Not a complete inventory. These are the areas that keep showing up in the projects above.</p>
      </header>
      <div className="capability-list">
        {capabilities.map((capability) => (
          <article id={capability.id} key={capability.id}>
            <span className="capability-number">{capability.index}</span>
            <div className="capability-copy"><h3>{capability.title}</h3><p>{capability.summary}</p><small>{capability.tools}</small></div>
            <div className="capability-evidence" aria-label={`${capability.title} project evidence`}>
              {capability.evidence.map((slug) => {
                const project = projects.find((item) => item.slug === slug)
                return project ? <Link key={slug} href={`/projects/${slug}`}>{project.shortTitle}<span aria-hidden="true">↗</span></Link> : null
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
