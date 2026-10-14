import { earlierExperience, experiences } from "@/lib/portfolio-data"

export function Experience() {
  return (
    <section id="experience" className="experience-section page-shell" aria-labelledby="experience-title">
      <header className="section-heading experience-heading">
        <div><p className="section-kicker">Experience</p><h2 id="experience-title">Work that changed how I approach the next problem.</h2></div>
      </header>
      <div className="experience-list">
        {experiences.map((experience) => (
          <article key={experience.company}>
            <header><div><p>{experience.company}</p><h3>{experience.role}</h3></div><time>{experience.period}</time></header>
            <div className="experience-body">
              <p>{experience.summary}</p>
              <dl>{experience.metrics.map((metric) => <div key={metric.label}><dt>{metric.value}</dt><dd>{metric.label}</dd></div>)}</dl>
            </div>
          </article>
        ))}
      </div>
      <p className="earlier-role"><span>Earlier</span><strong>{earlierExperience.role}</strong> at {earlierExperience.company} · {earlierExperience.period}. {earlierExperience.summary}</p>
    </section>
  )
}
