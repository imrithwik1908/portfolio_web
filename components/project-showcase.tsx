'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, Cpu, Database, Layers3, Sparkles } from 'lucide-react'
import { SpotlightProjectCard } from '@/components/spotlight-project-card'

type Project = {
  id: string
  title: string
  description: string
  image: string
  tags: string[]
  github: string
}

type ProjectShowcaseProps = {
  projects: Project[]
}

const filters = [
  { label: 'All', value: 'all', icon: Sparkles },
  { label: 'Full Stack', value: 'full-stack', icon: Layers3 },
  { label: 'AI / ML', value: 'ai-ml', icon: Cpu },
  { label: 'Backend / API', value: 'backend-api', icon: Code2 },
  { label: 'Database', value: 'database', icon: Database },
]

function getProjectCategory(project: Project) {
  const text = `${project.title} ${project.description} ${project.tags.join(' ')}`.toLowerCase()

  if (
    text.includes('tensorflow') ||
    text.includes('machine learning') ||
    text.includes('nlp') ||
    text.includes('computer vision') ||
    text.includes('audio') ||
    text.includes('sentiment') ||
    text.includes('ai') ||
    text.includes('python')
  ) {
    return 'ai-ml'
  }

  if (
    text.includes('api') ||
    text.includes('flask') ||
    text.includes('sqlalchemy') ||
    text.includes('express') ||
    text.includes('node')
  ) {
    return 'backend-api'
  }

  if (
    text.includes('mongodb') ||
    text.includes('sqlite') ||
    text.includes('sql') ||
    text.includes('database')
  ) {
    return 'database'
  }

  return 'full-stack'
}

export function ProjectShowcase({ projects }: ProjectShowcaseProps) {
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') return projects
    return projects.filter((project) => getProjectCategory(project) === activeFilter)
  }, [activeFilter, projects])

  return (
    <section className="relative px-4 py-16 sm:px-6 lg:px-8">
      <BackgroundGlow />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="mb-12"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            Selected work
          </div>

          <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Projects that turn ideas into{' '}
            <span className="text-gradient">working systems</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            A curated collection of full-stack, machine learning, backend, and data-driven projects
            built with a focus on performance, usability, and practical impact.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="mb-16 flex flex-wrap gap-2"
        >
          {filters.map((filter) => {
            const Icon = filter.icon
            const isActive = activeFilter === filter.value

            return (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-project-filter"
                    className="absolute inset-0 -z-10 rounded-full bg-primary/10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                {filter.label}
              </button>
            )
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.35 }}
            className="space-y-24"
          >
            {filteredProjects.map((project, index) => (
              <SpotlightProjectCard
                key={project.id}
                project={project}
                index={index}
                reverse={index % 2 === 1}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredProjects.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            No projects found for this category.
          </div>
        )}
      </div>
    </section>
  )
}

function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-20 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]" />
      <div className="absolute bottom-20 left-10 h-[320px] w-[320px] rounded-full bg-blue-500/10 blur-[130px]" />
      <div className="absolute right-10 top-1/3 h-[320px] w-[320px] rounded-full bg-purple-500/10 blur-[130px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
    </div>
  )
}