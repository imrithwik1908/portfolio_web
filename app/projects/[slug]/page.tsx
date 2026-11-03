import type { Metadata } from "next"
import Link from "next/link"
import { Arrow } from "@/components/xp/arrow"
import { notFound } from "next/navigation"
import { AgentGuardBench } from "@/components/xp/agentguard-bench"
import { ProjectVisual } from "@/components/xp/project-visual"
import { Figures } from "@/components/xp/figures"
import { Pipeline } from "@/components/xp/pipeline"
import { ProjectReader } from "@/components/xp/project-reader"
import { RepoSection } from "@/components/xp/repo-section"
import { Toc } from "@/components/xp/toc"
import { getProject, projects } from "@/lib/portfolio-data"
import { projectMeta } from "@/lib/project-highlights"
import { repoDetail } from "@/lib/project-repo"

type ProjectPageProps = { params: { slug: string } }

const chapterCopy: Record<string, { opening: string; system: string; decisions: string; debugging: string; results: string; limits: string }> = {
  agentguard: { opening: "Why traces were not enough", system: "How a run moves through the system", decisions: "The boundaries I chose", debugging: "The comparison bug", results: "What is working now", limits: "What v1 deliberately leaves out" },
  "x-mutest": { opening: "Why the label is only half the answer", system: "Training with reasons, not only labels", decisions: "How explanation quality was measured", debugging: "The annotation process needed another pass", results: "What the paper reports", limits: "What the benchmark cannot settle" },
  "tensor-fusion": { opening: "The sentence is not the whole signal", system: "Three representations, one prediction", decisions: "What I kept separate", debugging: "Alignment was the quiet failure mode", results: "The checked-in run", limits: "Where the experiment stops" },
  "course-catalog": { opening: "The same course means two different jobs", system: "One data model, two paths through it", decisions: "Small choices that shaped the flow", debugging: "Enrollment touched both sides", results: "What the repository implements", limits: "What would need hardening" },
}

export function generateStaticParams() { return projects.map((project) => ({ slug: project.slug })) }

export function generateMetadata({ params }: ProjectPageProps): Metadata {
  const project = getProject(params.slug)
  if (!project) return {}
  return { title: project.title, description: project.summary, alternates: { canonical: `/projects/${project.slug}` } }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const project = getProject(params.slug)
  if (!project) notFound()
  const meta = projectMeta[project.slug]
  const labels = chapterCopy[project.slug]
  const index = projects.findIndex((p) => p.slug === project.slug)
  const next = projects[(index + 1) % projects.length]

  // The first sentence of a passage, for the brief.
  const lead = (text: string) => (text.match(/^.*?[.!?](\s|$)/)?.[0] ?? text).trim()
  const facts = repoDetail[project.slug].facts

  const brief = (
    <>
      <section className="xp-brief-block">
        <p className="xp-brief-label">The question</p>
        <p className="xp-brief-lede">{project.question} {lead(project.problem[0])}</p>
      </section>
      <section className="xp-brief-block">
        <p className="xp-brief-label">The pipeline</p>
        <Pipeline nodes={project.architecture} label={`${project.title} architecture`} />
      </section>
      <section className="xp-brief-block">
        <p className="xp-brief-label">Decisions that mattered</p>
        <ol className="xp-brief-decisions">{project.decisions.map((d) => <li key={d.title}><strong>{d.title}</strong>{d.body}</li>)}</ol>
      </section>
      <section className="xp-brief-grid">
        <div>
          <p className="xp-brief-label">What it does today</p>
          <ul>{project.results.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
        <div>
          <p className="xp-brief-label">By the numbers</p>
          <dl>{facts.map((f) => <div key={f.label}><dt>{f.value}</dt><dd>{f.label}</dd></div>)}</dl>
        </div>
      </section>
      <section className="xp-brief-block">
        <p className="xp-brief-label">Known limits</p>
        <ul className="xp-brief-limits">{project.limitations.slice(0, 3).map((l) => <li key={l}>{l}</li>)}</ul>
        <p className="xp-brief-stack">{project.stack.join(" · ")}</p>
      </section>
    </>
  )

  const chapters: { id: string; title: string; body: React.ReactNode }[] = [
    { id: "problem", title: labels.opening, body: project.problem.map((p) => <p key={p}>{p}</p>) },
    {
      id: "system",
      title: labels.system,
      body: (
        <>
          {project.system.map((p) => <p key={p}>{p}</p>)}
          <Pipeline nodes={project.architecture} label={`${project.title} architecture`} />
        </>
      ),
    },
    { id: "decisions", title: labels.decisions, body: <div className="xp-decisions">{project.decisions.map((d) => <section key={d.title}><h3>{d.title}</h3><p>{d.body}</p></section>)}</div> },
    { id: "debugging", title: labels.debugging, body: <p className="xp-lede">{project.debugging}</p> },
    { id: "results", title: labels.results, body: <ul className="xp-points">{project.results.map((r) => <li key={r}>{r}</li>)}</ul> },
    { id: "limits", title: labels.limits, body: <ul className="xp-points is-muted">{project.limitations.map((l) => <li key={l}>{l}</li>)}</ul> },
    { id: "next", title: "If I picked it up again", body: <p className="xp-lede">{project.next}</p> },
  ]

  return (
    <main id="main-content" className="xp xp-project" style={{ "--tint": meta.tint, "--accent": meta.accent } as React.CSSProperties}>
      <header className="xp-project-hero">
        <div className="xp-project-hero-text">
          <Link href="/projects" className="xp-back"><Arrow dir="left" /> All projects</Link>
          <p className="xp-head-label"><span>{String(index + 1).padStart(2, "0")}</span>{project.eyebrow} · {project.year}</p>
          <h1>{project.title}</h1>
          <p className="xp-project-question">{project.question}</p>
          <p className="xp-project-summary">{project.summary}</p>
          <div className="xp-project-links">
            <a href={project.github} target="_blank" rel="noreferrer" className="xp-button">Source code <Arrow dir="out" /></a>
            {project.paper && <a href={project.paper} target="_blank" rel="noreferrer" className="xp-link">Read the paper <Arrow dir="out" /></a>}
            {project.live && <a href={project.live} target="_blank" rel="noreferrer" className="xp-link">Live app <Arrow dir="out" /></a>}
          </div>
        </div>
        <div className="xp-project-visual pc is-live"><ProjectVisual slug={project.slug} /></div>
      </header>

      <dl className="xp-project-facts">
        <div><dt>Status</dt><dd>{project.status}</dd></div>
        <div><dt>{project.outcomeLabel}</dt><dd>{project.outcome}</dd></div>
        <div><dt>Built with</dt><dd>{project.stack.join(", ")}</dd></div>
      </dl>

      <ProjectReader brief={brief}>
      <section className="xp-inshort" aria-label="In short">
        <div><p>The problem</p><span>{project.problem[0]}</span></div>
        <div><p>How it works</p><span>{project.system[0]}</span></div>
        <div><p>What I&apos;d do next</p><span>{project.next}</span></div>
      </section>

      {project.slug === "agentguard" && (
        <section className="xp-section xp-try" aria-labelledby="try-title">
          <p className="xp-head-label"><span>↳</span>Try it</p>
          <h2 id="try-title">Ten questions, two versions, one release decision.</h2>
          <p className="xp-try-intro">The repository&apos;s demo runs a support assistant twice on the same policy questions. The candidate reads more documents than the baseline. Pick a question to see what each version read and said, then run the release check.</p>
          <AgentGuardBench />
        </section>
      )}

      <Figures slug={project.slug} />

      <RepoSection detail={repoDetail[project.slug]} github={project.github} />

      <div className="xp-read">
      <Toc items={chapters.map((c) => ({ id: c.id, title: c.title }))} />
      <article className="xp-chapters">
        {chapters.map((c, i) => (
          <section key={c.id} className="xp-chapter" aria-labelledby={`ch-${c.id}`}>
            <p className="xp-chapter-num">{String(i + 1).padStart(2, "0")}</p>
            <div className="xp-chapter-body">
              <h2 id={`ch-${c.id}`}>{c.title}</h2>
              {c.body}
            </div>
          </section>
        ))}
      </article>
      </div>

      </ProjectReader>

      <Link href={`/projects/${next.slug}`} className="xp-next" style={{ "--tint": projectMeta[next.slug].tint, "--accent": projectMeta[next.slug].accent } as React.CSSProperties}>
        <span className="xp-head-label">Next project</span>
        <strong>{next.title}</strong>
        <span>{projectMeta[next.slug].tagline} <Arrow /></span>
      </Link>
    </main>
  )
}
