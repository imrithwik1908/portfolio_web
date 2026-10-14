import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react"
import { ArchitectureFlow } from "@/components/architecture-flow"
import { getProject, projects } from "@/lib/portfolio-data"

type ProjectPageProps = { params: { slug: string } }

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }))
}

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
  const currentIndex = projects.findIndex((item) => item.slug === project.slug)
  const nextProject = projects[(currentIndex + 1) % projects.length]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.title,
    description: project.summary,
    codeRepository: project.github,
    author: { "@type": "Person", name: "Sai Rithwik Reddy Chirra" },
    programmingLanguage: project.stack,
  }

  return (
    <main id="main-content" className="case-study">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="case-hero page-shell">
        <Link className="back-link" href="/projects"><ArrowLeft aria-hidden="true" /> All projects</Link>
        <div className="case-title-row">
          <div><p className="section-kicker">{project.eyebrow}</p><h1>{project.question}</h1><p>{project.summary}</p></div>
          <span className="status-note"><i aria-hidden="true" />{project.status}</span>
        </div>
        <dl className="case-meta">
          <div><dt>Project</dt><dd>{project.title}</dd></div>
          <div><dt>Year</dt><dd>{project.year}</dd></div>
          <div><dt>{project.outcomeLabel}</dt><dd>{project.outcome}</dd></div>
          <div><dt>Stack</dt><dd>{project.stack.join(" · ")}</dd></div>
        </dl>
      </header>

      <div className="case-image page-shell">
        <Image src={project.image} alt={`${project.title} interface`} fill priority sizes="(max-width: 767px) 100vw, 1200px" className={project.imageFit === "contain" ? "object-contain" : "object-cover"} />
      </div>

      <article className="case-body page-shell">
        <section className="case-section case-two-column">
          <div><p className="case-index">01</p><h2>The problem</h2></div>
          <div className="case-prose">{project.problem.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </section>

        <section className="case-section">
          <div className="case-section-heading"><p className="case-index">02</p><h2>The system</h2></div>
          <div className="case-prose wide">{project.system.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          <ArchitectureFlow project={project} />
        </section>

        <section className="case-section">
          <div className="case-section-heading"><p className="case-index">03</p><h2>Decisions that mattered</h2></div>
          <div className="decision-list">{project.decisions.map((decision) => <article key={decision.title}><h3>{decision.title}</h3><p>{decision.body}</p></article>)}</div>
        </section>

        <section className="case-section case-debugging">
          <div><p className="case-index">04</p><h2>What broke?</h2><span>A debugging note, because the clean architecture diagram is never the whole story.</span></div>
          <details><summary>Open the incident note</summary><p>{project.debugging}</p></details>
        </section>

        <section className="case-section case-split">
          <div><p className="case-index">05</p><h2>Results</h2><ul>{project.results.map((result) => <li key={result}>{result}</li>)}</ul></div>
          <div><p className="case-index">06</p><h2>Limits</h2><ul>{project.limitations.map((limit) => <li key={limit}>{limit}</li>)}</ul></div>
        </section>

        <section className="case-section case-next">
          <p className="section-kicker">What I&apos;d change now</p><p>{project.next}</p>
          <div className="case-links">
            <a href={project.github} target="_blank" rel="noreferrer"><Github aria-hidden="true" /> Source code</a>
            {project.live && <a href={project.live} target="_blank" rel="noreferrer">Open live app <ArrowUpRight aria-hidden="true" /></a>}
          </div>
        </section>
      </article>

      <footer className="next-project page-shell"><p>Next project</p><Link href={`/projects/${nextProject.slug}`}><span>{nextProject.title}</span>{nextProject.question}<ArrowUpRight aria-hidden="true" /></Link></footer>
    </main>
  )
}

