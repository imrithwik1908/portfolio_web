import Link from "next/link"
import { Arrow } from "@/components/xp/arrow"
import { CopyEmail, EMAIL } from "@/components/xp/copy-email"
import { Education } from "@/components/xp/education"
import { Experience } from "@/components/xp/experience"
import { Hero } from "@/components/xp/hero"
import { ProjectDeck } from "@/components/xp/project-deck"
import { Publication } from "@/components/xp/publication"
import { SectionHead } from "@/components/xp/section-head"
import { Skills } from "@/components/xp/skills"
import { projects } from "@/lib/portfolio-data"

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Sai Rithwik Reddy Chirra",
  alternateName: "Rithwik",
  url: "https://sairithwikreddy.vercel.app",
  email: `mailto:${EMAIL}`,
  jobTitle: "Computer Science graduate student",
  alumniOf: [{ "@type": "CollegeOrUniversity", name: "Indian Institute of Information Technology Dharwad" }],
  affiliation: { "@type": "CollegeOrUniversity", name: "Arizona State University" },
  sameAs: ["https://github.com/imrithwik1908", "https://www.linkedin.com/in/sairithwikreddy"],
}

const featured = ["agentguard", "x-mutest", "tensor-fusion"]

export default function Home() {
  const shown = projects.filter((p) => featured.includes(p.slug))

  return (
    <main id="main-content" className="xp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <Hero />

      <section id="work" className="xp-section" aria-label="Selected work">
        <SectionHead index="01" label="Selected work" title="Things I've built, and what they taught me." aside={<Link href="/projects" className="xp-link">All {projects.length} projects <Arrow /></Link>} />
        <ProjectDeck projects={shown} />
      </section>

      <section id="experience" className="xp-section" aria-label="Experience">
        <SectionHead index="02" label="Experience" title="Where the work happened." />
        <Experience />
      </section>

      <section id="research" className="xp-section" aria-label="Research">
        <SectionHead index="03" label="Research" title="Published at AAAI 2026." />
        <Publication />
      </section>

      <section id="education" className="xp-section" aria-label="Education">
        <SectionHead index="04" label="Education" title="Two degrees, two continents." />
        <Education />
      </section>

      <section id="skills" className="xp-section" aria-label="Skills">
        <SectionHead index="05" label="Skills" title="Tools, and where I used them." />
        <Skills />
      </section>

      <section id="about" className="xp-section" aria-label="About">
        <SectionHead index="06" label="About" title="Outside the résumé." />
        <div className="xp-about-slots">
          <p className="xp-placeholder-note">Placeholder: a short personal story from you.</p>
          <p className="xp-placeholder-note">Placeholder: interests outside work.</p>
          <p className="xp-placeholder-note">Placeholder: photos you&apos;d like to share.</p>
        </div>
      </section>

      <section id="contact" className="xp-section xp-contact" aria-label="Contact">
        <p className="xp-head-label"><span>07</span>Contact</p>
        <h2>Say hello.</h2>
        <p>Roles, research, or an interesting engineering problem are all good reasons to write.</p>
        <div className="xp-contact-actions">
          <CopyEmail className="xp-button" label={EMAIL} />
          <a className="xp-link" href="https://github.com/imrithwik1908" target="_blank" rel="noreferrer">GitHub <Arrow dir="out" /></a>
          <a className="xp-link" href="https://www.linkedin.com/in/sairithwikreddy" target="_blank" rel="noreferrer">LinkedIn <Arrow dir="out" /></a>
          <a className="xp-link" href="https://drive.google.com/file/d/1LF8cf2CkC7JzFfhFVyHCXXfUYF6L9pZd/view?usp=sharing" target="_blank" rel="noreferrer">Résumé <Arrow dir="out" /></a>
        </div>
      </section>
    </main>
  )
}
