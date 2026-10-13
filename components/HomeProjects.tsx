"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"

const projects = [
  {
    title: "AgentGuard",
    image: "/agentguard.png",
    media: "project-media-cover",
    description: "AgentGuard records LLM application traces, reruns test suites, and compares candidate versions against a stored baseline.",
    tags: ["FastAPI", "PostgreSQL", "Next.js"],
  },
  {
    title: "Tensor Fusion",
    image: "/tensor_fusion.jpg",
    media: "project-media-contain",
    description: "Experiments comparing ways to combine language, visual, and acoustic signals for sentiment analysis on review videos.",
    tags: ["Python", "Deep Learning", "Multimodal"],
  },
  {
    title: "Course Catalog",
    image: "/course_catalog.jpg",
    media: "project-media-cover",
    description: "A role-based course system with Google sign-in, separate student and professor flows, enrollment state, and MongoDB-backed records.",
    tags: ["Node.js", "MongoDB", "Google OAuth"],
  },
]

export function HomeProjects() {
  return (
    <section id="projects" className="section-flow py-20">
      <div className="container mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="eyebrow">Projects</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-black tracking-[-0.045em] text-foreground sm:text-5xl">
              A few things I&apos;ve worked on.
            </h2>
          </div>
          <Link
            href="/projects"
            className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary"
          >
            All projects
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        <div className="project-river">
          {projects.map((project, index) => (
            <motion.article
              key={project.title}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.52, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="project-slip group"
            >
              <div className="project-image-frame relative aspect-[16/10] overflow-hidden rounded-[1.1rem] border border-border/60 bg-muted">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(min-width: 1024px) 32vw, 92vw"
                  className={`${project.media} transition-transform duration-700`}
                />
              </div>
              <div className="pt-5">
                <h3 className="text-2xl font-black tracking-[-0.035em] text-foreground">{project.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{project.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="text-xs font-medium text-primary/90">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
