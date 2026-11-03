import type { Metadata } from "next"
import { ProjectCard } from "@/components/xp/project-card"
import { SectionHead } from "@/components/xp/section-head"
import { projects } from "@/lib/portfolio-data"

export const metadata: Metadata = {
  title: "Projects",
  description: "LLM reliability, explainable NLP research, multimodal ML and a role-based web application.",
  alternates: { canonical: "/projects" },
}

export default function ProjectsPage() {
  return (
    <main id="main-content" className="xp">
      <section className="xp-section xp-page-top" aria-label="All projects">
        <SectionHead index="01" label="Projects" title="Everything, with the decisions behind it." />
        <div className="pc-gallery">
          {projects.map((project, i) => <ProjectCard key={project.slug} project={project} index={i} total={projects.length} variant="grid" />)}
        </div>
      </section>
    </main>
  )
}
