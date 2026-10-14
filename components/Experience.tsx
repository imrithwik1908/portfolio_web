import { earlierExperience, experiences } from "@/lib/portfolio-data"

export function Experience() {
  return (
    <section id="experience" className="experience-section page-shell" aria-labelledby="experience-title">
      <header className="section-heading experience-heading">
        <div><p className="section-kicker">Experience</p><h2 id="experience-title">A couple of places where the questions got less tidy.</h2></div>
      </header>
      <div className="experience-list">
        {experiences.map((experience, index) => (
          <article key={experience.company} className={index % 2 ? "experience-right" : "experience-left"}>
            <span className="experience-year">{experience.year}</span>
            <div className="experience-copy">
              <header><div><p>{experience.company}</p><h3>{experience.role}</h3></div><time>{experience.period}</time></header>
              <p>{experience.summary}</p>
              <aside>{experience.aside}</aside>
            </div>
          </article>
        ))}
      </div>
      <p className="earlier-role"><span>Earlier</span><strong>{earlierExperience.company}</strong> · {earlierExperience.role} · {earlierExperience.period}<small>{earlierExperience.summary}</small></p>
    </section>
  )
}
