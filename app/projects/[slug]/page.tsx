import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArchitectureFlow } from "@/components/architecture-flow"
import { ProjectSignal } from "@/components/editorial-interactions"
import { getProject, projects } from "@/lib/portfolio-data"

type ProjectPageProps = { params: { slug: string } }

const chapterCopy: Record<string, { opening: string; system: string; decisions: string; debugging: string; results: string; limits: string }> = {
  agentguard: {
    opening: "Why traces were not enough",
    system: "How a run moves through the system",
    decisions: "The boundaries I chose",
    debugging: "The comparison bug",
    results: "What is working now",
    limits: "What v1 deliberately leaves out",
  },
  "x-mutest": {
    opening: "Why the label is only half the answer",
    system: "Training with reasons, not only labels",
    decisions: "How explanation quality was measured",
    debugging: "The annotation process needed another pass",
    results: "What the paper reports",
    limits: "What the benchmark cannot settle",
  },
  "tensor-fusion": {
    opening: "The sentence is not the whole signal",
    system: "Three representations, one prediction",
    decisions: "What I kept separate",
    debugging: "Alignment was the quiet failure mode",
    results: "The checked-in run",
    limits: "Where the experiment stops",
  },
  "course-catalog": {
    opening: "The same course means two different jobs",
    system: "One data model, two paths through it",
    decisions: "Small choices that shaped the flow",
    debugging: "Enrollment touched both sides",
    results: "What the repository implements",
    limits: "What would need hardening",
  },
}

export function generateStaticParams() { return projects.map((project) => ({ slug: project.slug })) }

export function generateMetadata({ params }: ProjectPageProps): Metadata {
  const project = getProject(params.slug)
  if (!project) return {}
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: `${project.title} — Project case study`, description: project.summary, url: `/projects/${project.slug}`, images: [project.image] },
  }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const project = getProject(params.slug)
  if (!project) notFound()
  const labels = chapterCopy[project.slug]
  const currentIndex = projects.findIndex((item) => item.slug === project.slug)
  const nextProject = projects[(currentIndex + 1) % projects.length]
  const signalProject = project.slug as "agentguard" | "x-mutest" | "tensor-fusion" | "course-catalog"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": project.slug === "x-mutest" ? "ScholarlyArticle" : "SoftwareSourceCode",
    name: project.title,
    description: project.summary,
    codeRepository: project.github,
    ...(project.slug === "x-mutest"
      ? { contributor: { "@type": "Person", name: "Sai Rithwik Reddy Chirra" } }
      : { author: { "@type": "Person", name: "Sai Rithwik Reddy Chirra" } }),
  }

  return (
    <main id="main-content" className={`case-study case-${project.slug}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="case-hero page-shell">
        <Link className="back-link" href="/projects"><span aria-hidden="true">←</span> Projects</Link>
        <div className="case-title-row">
          <div><p className="section-kicker">{project.eyebrow}</p><h1>{project.question}</h1><p>{project.summary}</p></div>
          <span className="status-note"><i aria-hidden="true" />{project.status}</span>
        </div>
        <dl className="case-meta">
          <div><dt>Project</dt><dd>{project.title}</dd></div>
          <div><dt>Year</dt><dd>{project.year}</dd></div>
          <div><dt>{project.outcomeLabel}</dt><dd>{project.outcome}</dd></div>
          <div><dt>Built with</dt><dd>{project.stack.join(" · ")}</dd></div>
        </dl>
      </header>

      <div className="case-lead-visual page-shell">
        <ProjectSignal project={signalProject} />
        <div className="case-image"><Image src={project.image} alt={`${project.title} project visual`} fill priority sizes="(max-width: 767px) 100vw, 1280px" className={project.imageFit === "contain" ? "object-contain" : "object-cover"} /></div>
      </div>

      <article className="case-body page-shell">
        <section className="case-section case-opening">
          <p className="case-index">01</p><h2>{labels.opening}</h2>
          <div className="case-prose"><p>{project.problem[0]}</p><p>{project.problem[1]}</p></div>
        </section>

        <section className="case-section case-system">
          <div className="case-section-heading"><p className="case-index">02</p><h2>{labels.system}</h2></div>
          <div className="case-prose wide">{project.system.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          <ArchitectureFlow project={project} />
          {project.slug === "x-mutest" && <figure className="annotation-figure"><Image src="/xmutest-annotation.png" alt="The iterative rationale annotation process used for X-MuTeST" fill sizes="(max-width: 767px) 100vw, 1100px" className="object-contain" /><figcaption>Three annotators per language, followed by guidance and re-annotation when agreement needed work.</figcaption></figure>}
        </section>

        <section className="case-section case-decisions">
          <div className="case-section-heading"><p className="case-index">03</p><h2>{labels.decisions}</h2></div>
          <div className="decision-list">{project.decisions.map((decision, index) => <article key={decision.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{decision.title}</h3><p>{decision.body}</p></article>)}</div>
        </section>

        <section className="case-section case-debugging">
          <div><p className="case-index">04</p><h2>{labels.debugging}</h2><p>{project.debugging}</p></div>
        </section>

        <section className="case-section case-results">
          <div><p className="case-index">05</p><h2>{labels.results}</h2><ul>{project.results.map((result) => <li key={result}>{result}</li>)}</ul></div>
          <aside><p className="case-index">06</p><h2>{labels.limits}</h2><ul>{project.limitations.map((limit) => <li key={limit}>{limit}</li>)}</ul></aside>
        </section>

        <section className="case-section case-next">
          <p className="section-kicker">If I picked it up again</p><p>{project.next}</p>
          <div className="case-links">
            <a href={project.github} target="_blank" rel="noreferrer">Source code <span aria-hidden="true">↗</span></a>
            {project.paper && <a href={project.paper} target="_blank" rel="noreferrer">Read the paper <span aria-hidden="true">↗</span></a>}
            {project.live && <a href={project.live} target="_blank" rel="noreferrer">Open live app <span aria-hidden="true">↗</span></a>}
          </div>
        </section>
      </article>

      <footer className="next-project page-shell"><p>Continue with</p><Link href={`/projects/${nextProject.slug}`}><span>{nextProject.title}</span>{nextProject.question}<i aria-hidden="true">↗</i></Link></footer>
    </main>
  )
}
