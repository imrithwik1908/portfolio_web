import Image from "next/image"
import Link from "next/link"
import { SelectedWork } from "@/components/selected-work"
import { Experience } from "@/components/Experience"
import { Skills } from "@/components/Skills"
import { Education } from "@/components/Education"
import { ContactSection } from "@/components/ContactSection"

const resumeUrl = "https://drive.google.com/file/d/1LF8cf2CkC7JzFfhFVyHCXXfUYF6L9pZd/view?usp=sharing"

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Sai Rithwik Reddy Chirra",
  alternateName: "Rithwik",
  url: "https://sairithwikreddy.vercel.app",
  email: "mailto:sairithwikreddy.chirra@gmail.com",
  jobTitle: "Computer Science graduate student",
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "Indian Institute of Information Technology Dharwad" },
  ],
  affiliation: { "@type": "CollegeOrUniversity", name: "Arizona State University" },
  sameAs: [
    "https://github.com/imrithwik1908",
    "https://www.linkedin.com/in/sairithwikreddy",
  ],
  knowsAbout: ["backend systems", "data systems", "machine learning", "LLM evaluation"],
}

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <main id="main-content">
        <section className="hero page-shell" aria-labelledby="hero-title">
          <div className="hero-name">
            <p>Hi, I&apos;m</p>
            <h1 id="hero-title" aria-label="Sai Rithwik Reddy Chirra"><span aria-hidden="true">Sai Rithwik</span><span aria-hidden="true">Reddy Chirra.</span></h1>
          </div>
          <div className="hero-intro">
            <h2>I work on the software around data and AI.</h2>
            <p>That usually means APIs, databases, evaluation, and ML systems. I like the point where a model stops being a notebook result and has to behave like ordinary software.</p>
          </div>
          <div className="hero-actions" aria-label="Primary links">
            <Link href="/#work">Projects <span aria-hidden="true">↓</span></Link>
            <a href={resumeUrl} target="_blank" rel="noreferrer">Resume <span aria-hidden="true">↗</span></a>
            <a href="mailto:sairithwikreddy.chirra@gmail.com">Email <span aria-hidden="true">↗</span></a>
          </div>
          <div className="hero-context">
            <p>M.S. Computer Science @ ASU <span aria-hidden="true">·</span> Tempe, Arizona <span aria-hidden="true">·</span> graduating May 2027</p>
            <p>Currently working on reliability for LLM applications.</p>
          </div>
        </section>

        <SelectedWork />

        <section id="about" className="about-section page-shell" aria-labelledby="about-title">
          <div className="about-photo-wrap">
            <div className="about-photo"><Image src="/profile.jpg" alt="Rithwik standing outdoors at IIIT Dharwad" fill sizes="(max-width: 767px) 76vw, 26vw" className="object-cover" /></div>
            <span>IIIT Dharwad · 2024</span>
          </div>
          <div className="about-copy">
            <p className="section-kicker">A little context</p>
            <h2 id="about-title">I&apos;m Rithwik.</h2>
            <p className="about-lede">I came to computer science through machine learning, but the surrounding engineering kept pulling me in.</p>
            <p>At IIT Indore, I worked on multilingual hate-speech detection in English, Hindi, and Telugu. Getting the label right was only half the problem; we also needed to inspect which words supported it. That work became X-MuTeST, an AAAI 2026 paper and rationale benchmark.</p>
            <p>Blackcoffer was much less tidy. Customer trajectories and advertising data arrived as business questions first, modelling problems second. Working through that ambiguity made me care more about the data and assumptions behind an answer, not only the score at the end.</p>
            <p>I&apos;m now doing my M.S. in Computer Science at ASU. Recent work has moved further into APIs, databases, background jobs, and evaluation systems. AgentGuard is the clearest example: what started as an LLM-testing idea became a system about traces, stored evidence, and release decisions.</p>
            <div className="about-links"><Link href="/projects/x-mutest">Read the research <span aria-hidden="true">↗</span></Link><Link href="/projects/agentguard">Open AgentGuard <span aria-hidden="true">↗</span></Link></div>
          </div>
        </section>

        <Experience />
        <Skills />
        <Education />
      </main>
      <ContactSection />
    </>
  )
}
