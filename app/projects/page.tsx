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
        <p className="section-kicker">Project notes</p>
        <h1>The work, including the parts that fought back.</h1>
        <p>These are not launch announcements. They are short records of the problem, the implementation, the awkward decisions, and what still needs work.</p>
      </header>
      <ProjectIndex projects={projectPreviews} />
    </main>
  )
}
