'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Github, ArrowUpRight, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Project = {
  id: string
  title: string
  description: string
  image: string
  tags: string[]
  github: string
  live?: string
  context?: string
  category?: string
}

type SpotlightProjectCardProps = {
  project: Project
  index: number
  reverse?: boolean
}

export function SpotlightProjectCard({
  project,
  index,
  reverse = false,
}: SpotlightProjectCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-90px' }}
        transition={{ duration: 0.58, delay: index * 0.04, ease: 'easeOut' }}
        className="group"
      >
        <div
          className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-10 ${
            reverse ? 'lg:[&>div:first-child]:order-2' : ''
          }`}
        >
          <ProjectImage
            project={project}
            index={index}
          />

          <ProjectContent
            project={project}
            index={index}
            onOpen={() => setIsOpen(true)}
          />
        </div>
      </motion.article>

      <AnimatePresence>
        {isOpen && (
          <ProjectDetailsModal project={project} onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </>
  )
}

function ProjectImage({
  project,
  index,
}: {
  project: Project
  index: number
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="relative mx-auto flex w-full justify-center"
    >
      <div className="absolute -inset-4 rounded-[2rem] bg-primary/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative w-full min-w-[280px] max-w-[500px] sm:min-w-[360px] lg:min-w-[430px]">
        <Image
          src={project.image}
          alt={project.title}
          width={900}
          height={560}
          className="h-auto max-h-[340px] min-h-[220px] w-full rounded-2xl object-contain shadow-xl shadow-black/20 transition-transform duration-700 group-hover:scale-[1.015]"
          priority={index === 0}
        />

        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-50" />

        <div className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
          {project.context ?? `Project ${index + 1}`}
        </div>
      </div>
    </motion.div>
  )
}

function ProjectContent({
  project,
  onOpen,
}: {
  project: Project
  index: number
  onOpen: () => void
}) {
  const shouldTruncate = project.description.length > 225

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
        {project.title}
      </h2>

      <p className={`mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base ${shouldTruncate ? 'line-clamp-4' : ''}`}>
        {project.description}
      </p>

      {shouldTruncate && (
        <button
          onClick={onOpen}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          Read the project notes
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="rounded-md bg-secondary/70 px-2.5 py-1 text-xs font-medium"
          >
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" className="rounded-lg">
          <a href={project.github} target="_blank" rel="noopener noreferrer">
            <Github className="mr-2 h-4 w-4" />
            Code
          </a>
        </Button>

        <Button
          onClick={onOpen}
          className="rounded-lg"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Project notes
        </Button>
      </div>
    </div>
  )
}

function ProjectDetailsModal({
  project,
  onClose,
}: {
  project: Project
  onClose: () => void
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.25 }}
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-background shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-20 rounded-full bg-black/45 p-2 text-white backdrop-blur-md transition hover:bg-black/70"
          aria-label="Close project details"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative aspect-[16/8] overflow-hidden">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent" />
        </div>

        <div className="max-h-[calc(85vh-18rem)] overflow-y-auto overscroll-contain p-7">
          <h3 className="text-3xl font-bold tracking-tight">
            {project.title}
          </h3>

          <p className="mt-4 text-base leading-8 text-muted-foreground">
            {project.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-md bg-secondary/80 px-3 py-1"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3 border-t border-border/60 pt-6">
            <Button asChild variant="outline" className="rounded-lg">
              <a href={project.github} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                Code
              </a>
            </Button>

            {project.live && <Button asChild className="rounded-lg">
              <a href={project.live} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open live app
              </a>
            </Button>}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
