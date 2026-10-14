import Image from "next/image"
import Link from "next/link"
import { ArrowDown, ArrowUpRight, FileText, Mail } from "lucide-react"
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
          <div className="hero-topline"><span>Sai Rithwik Reddy Chirra</span><span>Tempe, Arizona · 2:17 AM somewhere in the commit history</span></div>
          <div className="hero-copy">
            <p className="section-kicker">Systems, data &amp; AI</p>
            <h1 id="hero-title">I build the systems around data and AI.</h1>
            <p>Backend services, data infrastructure, evaluations, and ML applications. Usually the work between a model call and something another person can actually rely on.</p>
          </div>
          <div className="hero-actions" aria-label="Primary links">
            <Link className="primary-action" href="/#work">Selected work <ArrowDown aria-hidden="true" /></Link>
            <a href={resumeUrl} target="_blank" rel="noreferrer"><FileText aria-hidden="true" /> Resume</a>
            <a href="mailto:sairithwikreddy.chirra@gmail.com"><Mail aria-hidden="true" /> Contact</a>
          </div>
          <dl className="hero-context">
            <div><dt>Now</dt><dd>M.S. Computer Science at ASU</dd></div>
            <div><dt>Graduating</dt><dd>May 2027</dd></div>
            <div><dt>Current thread</dt><dd>Reliability for LLM applications</dd></div>
          </dl>
        </section>

        <SelectedWork />

        <section id="about" className="about-section page-shell" aria-labelledby="about-title">
          <div className="about-photo">
            <Image src="/profile.jpg" alt="Rithwik standing outdoors at IIIT Dharwad" fill sizes="(max-width: 767px) 46vw, 25vw" className="object-cover" />
            <span aria-hidden="true">IIIT Dharwad · 2024</span>
          </div>
          <div className="about-copy">
            <p className="section-kicker">A little context</p>
            <h2 id="about-title">I&apos;m Rithwik.</h2>
            <p className="about-lede">I started in ML through multilingual NLP research at IIT Indore, where accuracy wasn&apos;t enough. We also had to ask why a model made a decision across English, Hindi, and Telugu.</p>
            <p>Industry work at Blackcoffer brought a different kind of problem: messy data, ambiguous questions, and no neat notebook-shaped answer. Somewhere between those two, I became more interested in the engineering around intelligent systems: how data is stored, how APIs behave, how models are evaluated, and what happens when something fails.</p>
            <p>That is mostly what I work on now. AgentGuard is the clearest example: a project that began with LLM evaluation and quickly became a problem about traces, background jobs, database boundaries, and release decisions.</p>
            <Link className="text-link" href="/projects/agentguard">See how that turned into a system <ArrowUpRight aria-hidden="true" /></Link>
          </div>
          <aside className="about-notes" aria-label="Current context">
            <div><span>Now</span><p>Arizona State University</p></div>
            <div><span>Before</span><p>IIIT Dharwad</p></div>
            <div><span>Research</span><p>X-MuTeST · AAAI 2026</p></div>
          </aside>
        </section>

        <Experience />
        <Skills />
        <Education />
      </main>
      <ContactSection />
    </>
  )
}
