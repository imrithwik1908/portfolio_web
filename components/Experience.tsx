import { earlierExperience, experiences } from "@/lib/portfolio-data"

export function Experience() {
  return (
    <section id="experience" className="experience-section page-shell" aria-labelledby="experience-title">
      <header className="section-heading experience-heading">
        <div><p className="section-kicker">Experience</p><h2 id="experience-title">Where I&apos;ve worked.</h2></div>
      </header>
      <div className="experience-list">
        {experiences.map((experience) => (
          <article key={experience.company}>
            <span className="experience-year">{experience.year}</span>
            <div className="experience-copy">
              <header><p>{experience.company}</p><h3>{experience.role}</h3><time>{experience.period}</time></header>
              <p>{experience.summary}</p>
              <p className="experience-result">{experience.aside}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="earlier-role"><span>Earlier</span><strong>{earlierExperience.company}</strong> · {earlierExperience.role} · {earlierExperience.period}<small>{earlierExperience.summary}</small></p>
    </section>
  )
}
