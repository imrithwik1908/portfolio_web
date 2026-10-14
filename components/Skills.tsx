import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { capabilities, projects } from "@/lib/portfolio-data"

export function Skills() {
  return (
    <section id="capabilities" className="capabilities-section page-shell" aria-labelledby="capabilities-title">
      <header className="section-heading capability-heading">
        <div><p className="section-kicker">Capabilities</p><h2 id="capabilities-title">What I work on.</h2></div>
        <p>A shorter list, tied to the projects where it actually shows up.</p>
      </header>
      <div className="capability-list">
        {capabilities.map((capability) => (
          <article id={capability.id} key={capability.id}>
            <span className="capability-number">{capability.index}</span>
            <div><h3>{capability.title}</h3><p>{capability.summary}</p><small>{capability.tools}</small></div>
            <div className="capability-evidence" aria-label={`${capability.title} project evidence`}>
              {capability.evidence.map((slug) => {
                const project = projects.find((item) => item.slug === slug)
                return project ? <Link key={slug} href={`/projects/${slug}`}>{project.shortTitle}<ArrowUpRight aria-hidden="true" /></Link> : null
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
