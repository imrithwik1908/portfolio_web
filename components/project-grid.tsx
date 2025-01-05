'use client'

import { motion } from 'framer-motion'
import { ProjectCard } from './project-card'

interface ProjectGridProps {
  projects: Array<{
    id: string;
    title: string;
    description: string;
    image: string;
    tags: string[];
    github: string;
  }>;
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
      {projects.map((project, index) => (
        <motion.div
          key={project.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="w-full"
        >
          <ProjectCard project={project} />
        </motion.div>
      ))}
    </div>
  )
}

