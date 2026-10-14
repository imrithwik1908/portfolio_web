import type { Metadata } from "next"
import { ProjectIndex, type ProjectPreview } from "@/components/project-index"
import { projects } from "@/lib/portfolio-data"

export const metadata: Metadata = {
  title: "Projects",
  description: "Case studies in backend systems, data infrastructure, LLM evaluation, and multimodal machine learning.",
  alternates: { canonical: "/projects" },
}

export default function ProjectsPage() {
  const projectPreviews: ProjectPreview[] = projects.map(({ slug, title, eyebrow, status, question, summary, image, imageFit, capabilities }) => ({
    slug,
    title,
    eyebrow,
    status,
    question,
    summary,
    image,
    imageFit,
    capabilities,
  }))

  return (
    <main id="main-content" className="projects-page page-shell">
      <header className="projects-hero">
        <p className="section-kicker">Projects</p>
        <h1>The details matter more than the launch copy.</h1>
        <p>Four records of what I was trying to solve, how the implementation changed, and what the finished version still does not do.</p>
      </header>
      <ProjectIndex projects={projectPreviews} />
    </main>
  )
}
