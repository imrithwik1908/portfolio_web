import Link from "next/link"
import { AgentGuardBench } from "@/components/xp/agentguard-bench"
import { CopyEmail, EMAIL } from "@/components/xp/copy-email"
import { Hero } from "@/components/xp/hero"

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

const otherWork = [
  ["x-mutest", "X-MuTeST", "Explainable hate-speech detection in three languages"],
  ["tensor-fusion", "Tensor Fusion", "Sentiment from language, voice and expression"],
  ["course-catalog", "Course Catalog", "One course system for students and professors"],
] as const

export default function Home() {
  return (
    <main id="main-content" className="xp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <Hero />

      <section id="work" className="xp-section xp-work" aria-labelledby="xp-work-title">
        <header className="xp-intro">
          <p className="xp-eyebrow">Selected work · 01</p>
          <h2 id="xp-work-title">AgentGuard asks one question of every release: <em>what changed, and is it safe?</em></h2>
          <p>It&apos;s a regression-testing and release gate for LLM applications. Its demo runs a support assistant twice on the same ten policy questions. The candidate reads more documents than the baseline. Pick a question to see what each version read and said, then run the release check.</p>
        </header>
        <AgentGuardBench />

        <nav className="xp-more-work" aria-label="More projects">
          <p className="xp-eyebrow">More work</p>
          <ul>
            {otherWork.map(([slug, title, line]) => (
              <li key={slug}><Link href={`/projects/${slug}`}><strong>{title}</strong><span>{line}</span><i aria-hidden="true">→</i></Link></li>
            ))}
          </ul>
        </nav>
      </section>

      <section id="about" className="xp-section xp-about" aria-labelledby="xp-about-title">
        <p className="xp-eyebrow">About</p>
        <h2 id="xp-about-title">Placeholder</h2>
        <p className="xp-placeholder-note">This section is waiting on you: two or three personal stories, interests outside work, and any photos you&apos;d like to share. Nothing here will be written until you provide it.</p>
      </section>

      <section id="contact" className="xp-section xp-contact" aria-labelledby="xp-contact-title">
        <h2 id="xp-contact-title">Say hello.</h2>
        <p>Roles, research, or an interesting engineering problem are all good reasons to write.</p>
        <div className="xp-contact-actions">
          <CopyEmail className="xp-button" label={EMAIL} />
          <a className="xp-link" href="https://github.com/imrithwik1908" target="_blank" rel="noreferrer">GitHub ↗</a>
          <a className="xp-link" href="https://www.linkedin.com/in/sairithwikreddy" target="_blank" rel="noreferrer">LinkedIn ↗</a>
        </div>
      </section>
    </main>
  )
}
