'use client'

import Image from 'next/image'
import { useRef } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  MotionValue,
} from 'framer-motion'
import {
  Github,
  ExternalLink,
  BookOpen,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProjectCard } from './project-card'

type Project = {
  id: string
  title: string
  description: string
  image: string
  tags: string[]
  github: string
}

type ProjectBookProps = {
  projects: Project[]
}

export function ProjectBook({ projects }: ProjectBookProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  if (!projects.length) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading projects...
      </div>
    )
  }

  return (
    <section ref={containerRef} className="relative bg-background">
      <BackgroundGlow />

      {/* Mobile fallback */}
      <div className="container mx-auto block max-w-5xl px-4 py-16 md:hidden">
        <ProjectHeader projects={projects} scrollYProgress={scrollYProgress} />

        <div className="mt-10 grid gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>

      {/* Desktop book */}
      <div
        className="relative hidden md:block"
        style={{ height: `${projects.length * 105}vh` }}
      >
        <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col items-center overflow-hidden px-6 pt-5">
          <ProjectHeader projects={projects} scrollYProgress={scrollYProgress} />

          <div className="relative mt-3 flex min-h-0 flex-1 w-full items-center justify-center overflow-visible">
            <BookStage projects={projects} scrollYProgress={scrollYProgress} />
          </div>
        </div>
      </div>
    </section>
  )
}

function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-20 left-10 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="absolute right-10 top-1/3 h-[300px] w-[300px] rounded-full bg-purple-500/10 blur-[120px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
    </div>
  )
}

function ProjectHeader({
  projects,
  scrollYProgress,
}: {
  projects: Project[]
  scrollYProgress: MotionValue<number>
}) {
  const activeTitle = useTransform(scrollYProgress, (latest) => {
    const index = Math.min(
      projects.length - 1,
      Math.floor(latest * projects.length)
    )

    return projects[index]?.title ?? projects[0]?.title
  })

  return (
    <motion.div
      className="relative z-30 mx-auto max-w-4xl shrink-0 text-center"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 py-1.5 text-xs text-muted-foreground shadow-lg backdrop-blur-xl">
        <BookOpen className="h-3.5 w-3.5 text-primary" />
        Scroll to turn pages
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
        Project <span className="text-gradient">Book</span>
      </h1>

      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground lg:text-base">
        A curated, interactive showcase of projects across full-stack development,
        machine learning, APIs, and data-driven systems.
      </p>

      <div className="mx-auto mt-4 flex max-w-xl items-center justify-center rounded-2xl border border-border/70 bg-card/50 px-5 py-3 shadow-xl backdrop-blur-xl">
        <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>

        <div className="min-w-0 text-left">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Currently viewing
          </p>
          <motion.p className="truncate text-sm font-semibold text-foreground lg:text-base">
            {activeTitle}
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}

function BookStage({
  projects,
  scrollYProgress,
}: {
  projects: Project[]
  scrollYProgress: MotionValue<number>
}) {
  return (
    <div className="relative h-[560px] w-[860px] origin-center scale-[0.62] lg:scale-[0.72] xl:scale-[0.82] 2xl:scale-100 [perspective:2400px]">
      <BookBase />

      {projects.map((project, index) => (
        <ProjectBookPage
          key={project.id}
          project={project}
          index={index}
          total={projects.length}
          scrollYProgress={scrollYProgress}
        />
      ))}

      <BookSpine />
    </div>
  )
}

function BookBase() {
  return (
    <>
      {/* Left resting pages */}
      <div className="absolute left-[40px] top-1/2 h-[520px] w-[390px] -translate-y-1/2 rounded-l-[2rem] border border-border/60 bg-gradient-to-br from-card via-background to-secondary/30 shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-4 rounded-l-[1.5rem] border border-white/5" />
        <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-black/25 to-transparent" />
      </div>

      {/* Left paper edges */}
      <div className="absolute left-[55px] top-1/2 h-[500px] w-[365px] -translate-y-1/2 rounded-l-[1.7rem] border border-border/40 bg-background/70" />
      <div className="absolute left-[70px] top-1/2 h-[480px] w-[340px] -translate-y-1/2 rounded-l-[1.5rem] border border-border/30 bg-card/50" />

      {/* Right resting pages */}
      <div className="absolute left-[430px] top-1/2 h-[520px] w-[390px] -translate-y-1/2 rounded-r-[2rem] border border-border/60 bg-gradient-to-br from-secondary/50 via-background to-card shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-4 rounded-r-[1.5rem] border border-white/5" />
        <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-black/25 to-transparent" />
      </div>

      {/* Right paper edges */}
      <div className="absolute left-[440px] top-1/2 h-[500px] w-[365px] -translate-y-1/2 rounded-r-[1.7rem] border border-border/40 bg-background/70" />
      <div className="absolute left-[450px] top-1/2 h-[480px] w-[340px] -translate-y-1/2 rounded-r-[1.5rem] border border-border/30 bg-card/50" />

      {/* Table shadow */}
      <div className="absolute left-1/2 top-[93%] h-16 w-[720px] -translate-x-1/2 rounded-full bg-black/35 blur-3xl" />
    </>
  )
}

function BookSpine() {
  return (
    <div className="absolute left-[416px] top-1/2 z-[80] h-[535px] w-28 -translate-y-1/2 pointer-events-none">
      <div className="absolute left-0 top-0 h-full w-7 rounded-l-2xl bg-gradient-to-b from-primary/20 via-background to-secondary/80 shadow-2xl" />
      <div className="absolute left-7 top-0 h-full w-px bg-white/10" />
      <div className="absolute left-10 top-8 h-[470px] w-px bg-black/40" />
      <div className="absolute left-14 top-0 h-full w-16 bg-gradient-to-r from-black/35 to-transparent" />
    </div>
  )
}

function ProjectBookPage({
  project,
  index,
  total,
  scrollYProgress,
}: {
  project: Project
  index: number
  total: number
  scrollYProgress: MotionValue<number>
}) {
  const segment = 1 / total
  const start = index * segment
  const lift = start + segment * 0.22
  const turn = start + segment * 0.55
  const end = start + segment

  const rotateY = useTransform(
    scrollYProgress,
    [start, lift, turn, end],
    [0, -24, -118, -180]
  )

  const rotateZ = useTransform(
    scrollYProgress,
    [start, lift, turn, end],
    [0, -1.2, -3.2, 0]
  )

  const rotateX = useTransform(
    scrollYProgress,
    [start, lift, turn, end],
    [0, 2.5, 5, 0]
  )

  const y = useTransform(
    scrollYProgress,
    [start, lift, turn, end],
    ['-50%', 'calc(-50% - 8px)', 'calc(-50% + 2px)', '-50%']
  )

  const pageShadow = useTransform(
    scrollYProgress,
    [start, turn, end],
    [
      '0 24px 70px rgba(0,0,0,0.28)',
      '34px 34px 95px rgba(0,0,0,0.55)',
      '0 18px 55px rgba(0,0,0,0.25)',
    ]
  )

  const curlOpacity = useTransform(
    scrollYProgress,
    [start, lift, turn, end],
    [0.1, 0.55, 0.85, 0.15]
  )

  const edgeBrightness = useTransform(
    scrollYProgress,
    [start, turn, end],
    [0.15, 0.75, 0.2]
  )

  return (
    <motion.article
      className="absolute left-[430px] top-1/2 h-[500px] w-[370px] origin-left rounded-r-[1.7rem]"
      style={{
        y,
        rotateY,
        rotateZ,
        rotateX,
        zIndex: total - index + 20,
        transformStyle: 'preserve-3d',
        boxShadow: pageShadow,
      }}
    >
      {/* Front face */}
      <div
        className="absolute inset-0 overflow-hidden rounded-r-[1.7rem] border border-border/70 bg-card"
        style={{
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        <ProjectPageFront
          project={project}
          index={index}
          total={total}
          curlOpacity={curlOpacity}
          edgeBrightness={edgeBrightness}
        />
      </div>

      {/* Back face */}
      <div
        className="absolute inset-0 overflow-hidden rounded-l-[1.7rem] border border-border/70 bg-gradient-to-br from-muted/40 via-background to-card"
        style={{
          transform: 'rotateY(180deg)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        <ProjectPageBack index={index} total={total} />
      </div>
    </motion.article>
  )
}

function ProjectPageFront({
  project,
  index,
  total,
  curlOpacity,
  edgeBrightness,
}: {
  project: Project
  index: number
  total: number
  curlOpacity: MotionValue<number>
  edgeBrightness: MotionValue<number>
}) {
  return (
    <div className="relative flex h-full flex-col">
      {/* Inner spine shadow */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-10 bg-gradient-to-r from-black/35 to-transparent" />

      {/* Curved page highlight illusion */}
      <motion.div
        className="pointer-events-none absolute inset-y-0 right-0 z-30 w-24 bg-gradient-to-l from-white/20 via-white/6 to-transparent blur-[1px]"
        style={{ opacity: curlOpacity }}
      />

      {/* Bright paper edge */}
      <motion.div
        className="pointer-events-none absolute right-0 top-6 z-40 h-[calc(100%-3rem)] w-[3px] rounded-full bg-gradient-to-b from-blue-400 via-purple-500 to-primary"
        style={{ opacity: edgeBrightness }}
      />

      <div className="relative h-36 overflow-hidden rounded-br-[1.8rem]">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover"
          priority={index === 0}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-black/45 px-3 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-md">
          Page {index + 1} of {total}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold leading-tight tracking-tight">
            {project.title}
          </h2>
        </div>

        <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
          {project.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.tags.slice(0, 5).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="rounded-full border border-border/40 bg-secondary/70 px-3 py-1 text-xs"
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mt-auto border-t border-border/60 pt-5">
          <div className="flex items-center justify-between gap-4">
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              <Github className="h-4 w-4 transition-transform group-hover:-rotate-12" />
              GitHub
            </a>

            <Button asChild size="sm" variant="outline" className="rounded-full">
              <a href={project.github} target="_blank" rel="noopener noreferrer">
                View Code
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProjectPageBack({
  index,
  total,
}: {
  index: number
  total: number
}) {
  return (
    <div className="relative flex h-full flex-col justify-between p-8">
      <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/25 to-transparent" />

      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Project Archive
        </p>
        <div className="mt-5 h-px w-full bg-gradient-to-r from-primary/60 to-transparent" />
      </div>

      <div className="space-y-4">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <BookOpen className="h-7 w-7 text-primary" />
        </div>

        <h3 className="text-2xl font-bold">
          Page {index + 1}
        </h3>

        <p className="max-w-xs text-sm leading-6 text-muted-foreground">
          Every project here represents a practical problem, a technical decision,
          and a learning milestone.
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {index + 1} / {total}
        </span>
        <span>C Sai Rithwik Reddy</span>
      </div>
    </div>
  )
}