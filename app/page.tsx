import Link from "next/link"
import { About } from "@/components/xp/about"
import { Arrow } from "@/components/xp/arrow"
import { Contact } from "@/components/xp/contact"
import { EMAIL } from "@/components/xp/copy-email"
import { Hero } from "@/components/xp/hero"
import { Note } from "@/components/xp/note"
import { Chapters } from "@/components/xp/chapters"
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
  jobTitle: "Software engineer",
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
        <SectionHead index="01" label="Work" title="Things I built to understand something." aside={<Link href="/projects" className="xp-link">All {projects.length} projects <Arrow /></Link>} />
        <ProjectDeck projects={shown} />
        <Note className="is-deck">Each card recedes as the next one covers it: one scroll listener writes a CSS variable. AgentGuard&apos;s dots are its recorded demo, where 2 of 10 cases regress.</Note>
      </section>

      <section id="research" className="xp-section" aria-label="Research">
        <SectionHead index="02" label="Research" title="Published at AAAI 2026." />
        <Publication />
        <Note className="is-paper">The citation is copied verbatim from the repository&apos;s README, not retyped.</Note>
      </section>

      <section id="path" className="xp-section" aria-label="Path">
        <SectionHead index="03" label="Chapters" title="From Dharwad to Tempe, one question at a time." />
        <Chapters />
        <Note className="is-path">Chapters advance on their own only while on screen and stop for good once you pick one. Each question comes from my own notes on that work.</Note>
      </section>

      <section id="toolkit" className="xp-section xp-section-tight" aria-label="Toolkit">
        <SectionHead index="04" label="Toolkit" title="What I reach for." />
        <Skills />
      </section>

      <section id="about" className="xp-section" aria-label="About">
        <SectionHead index="05" label="About" title="Beneath the résumé." />
        <About />
      </section>

      <section id="contact" className="xp-section xp-section-finale" aria-label="Contact">
        <Contact />
      </section>
    </main>
  )
}
