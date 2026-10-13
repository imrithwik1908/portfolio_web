'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'

const experiences = [
  {
    title: 'Data Science Associate',
    company: 'Blackcoffer',
    period: 'Dec 2024 - May 2025',
    description:
      'I worked with a 40K+ retail-mall trajectory dataset, testing time-series models for customer movement and improving predictive accuracy by 18% over traditional methods. A second project focused on digital-ad revenue forecasts, along with the preprocessing, feature engineering, and validation needed to make the results useful.',
    tags: ['Time-series forecasting', 'Trajectory data', 'Revenue forecasting'],
  },
  {
    title: 'Summer Research Intern',
    company: 'Indian Institute of Technology, Indore',
    period: 'Apr 2024 - Nov 2024',
    description:
      'I worked on X-MuTeST, an explainable hate-speech detection framework for English, Hindi, and Telugu. The work covered human rationales, LLaMA 3.1, MuRIL and XLM-R encoders, plus deployment changes that reduced inference latency by 20%. It later became an AAAI 2026 paper.',
    tags: ['Explainable NLP', 'Multilingual models', 'Inference optimization'],
  },
  {
    title: 'Full Stack Developer Intern',
    company: 'CodeAlpha',
    period: 'Jun 2023 - Jul 2023',
    description:
      'This was my first internship. I worked through responsive front-end tasks and built a small Node.js/EJS application, which gave me an early look at how a feature continues past the page and into the application behind it.',
    tags: ['Node.js', 'EJS', 'Frontend'],
  },
]

export function Experience() {
  const flowRef = useRef<HTMLDivElement | null>(null)
  const [lineRange, setLineRange] = useState({
    points: [0, 0.5, 1],
    segments: [] as Array<{ top: number; height: number; start: number; end: number }>,
  })
  const { scrollYProgress } = useScroll({
    target: flowRef,
    offset: ['start 68%', 'end 52%'],
  })

  useLayoutEffect(() => {
    const flow = flowRef.current
    if (!flow) return

    const measure = () => {
      const markers = flow.querySelectorAll<HTMLElement>('.work-index span')
      const first = markers.item(0)
      const last = markers.item(markers.length - 1)
      if (!first || !last) return

      const flowRect = flow.getBoundingClientRect()
      const firstRect = first.getBoundingClientRect()
      const lastRect = last.getBoundingClientRect()
      const start = firstRect.top - flowRect.top + firstRect.height / 2
      const end = lastRect.top - flowRect.top + lastRect.height / 2
      const length = Math.max(0, end - start)
      const points = Array.from(markers).map((marker) => {
        const rect = marker.getBoundingClientRect()
        const center = rect.top - flowRect.top + rect.height / 2
        return length ? Math.min(1, Math.max(0, (center - start) / length)) : 0
      })
      const markerRects = Array.from(markers).map((marker) => marker.getBoundingClientRect())
      const segments = markerRects.slice(0, -1).map((rect, index) => {
        const nextRect = markerRects[index + 1]
        const top = rect.bottom - flowRect.top + 5
        const bottom = nextRect.top - flowRect.top - 5

        return {
          top,
          height: Math.max(0, bottom - top),
          start: points[index],
          end: points[index + 1],
        }
      })

      setLineRange({ points, segments })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(flow)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="experience" className="section-flow py-20">
      <div className="container mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 max-w-3xl"
        >
          <div>
            <p className="eyebrow">Experience</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-foreground sm:text-5xl">
              Where I&apos;ve worked.
            </h2>
          </div>
        </motion.div>

        <div ref={flowRef} className="work-flow">
          {lineRange.segments.map((segment, index) => (
            <TimelineSegment key={index} progress={scrollYProgress} segment={segment} />
          ))}
          {experiences.map((exp, index) => (
            <WorkItem
              key={exp.title}
              exp={exp}
              index={index}
              progress={scrollYProgress}
              threshold={lineRange.points[index] ?? index / Math.max(1, experiences.length - 1)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function TimelineSegment({
  progress,
  segment,
}: {
  progress: MotionValue<number>
  segment: { top: number; height: number; start: number; end: number }
}) {
  const scaleY = useTransform(progress, [segment.start, segment.end], [0, 1])

  return (
    <motion.div
      className="work-progress"
      style={{ top: segment.top, height: segment.height, scaleY, opacity: segment.height ? 1 : 0 }}
      aria-hidden="true"
    />
  )
}

function WorkItem({
  exp,
  index,
  progress,
  threshold,
}: {
  exp: (typeof experiences)[number]
  index: number
  progress: MotionValue<number>
  threshold: number
}) {
  const activationStart = Math.max(0, threshold - 0.012)
  const activationEnd = Math.min(1, Math.max(0.02, threshold + 0.012))
  const markerScale = useTransform(progress, [activationStart, activationEnd], [1, 1.035])
  const markerBg = useTransform(
    progress,
    [activationStart, activationEnd],
    ['hsl(var(--background))', 'hsl(var(--primary) / 0.09)'],
  )
  const markerBorder = useTransform(
    progress,
    [activationStart, activationEnd],
    ['hsl(var(--border))', 'hsl(var(--primary) / 0.78)'],
  )
  const markerShadow = useTransform(
    progress,
    [activationStart, activationEnd],
    ['0 0 0 6px hsl(var(--background)), 0 0 0 6px hsl(var(--primary) / 0)', '0 0 0 6px hsl(var(--background)), 0 0 0 11px hsl(var(--primary) / 0.075)'],
  )

  return (
    <motion.article
      initial={{ y: 26 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="work-item group"
    >
      <div className="work-index">
        <motion.span
          style={{ scale: markerScale, background: markerBg, borderColor: markerBorder, boxShadow: markerShadow }}
        >
          {String(index + 1).padStart(2, '0')}
        </motion.span>
      </div>

      <div className="work-copy">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h3 className="text-3xl font-black tracking-[-0.04em] text-foreground sm:text-4xl">
              {exp.title}
            </h3>
            <p className="mt-1 text-base font-medium text-primary">{exp.company}</p>
          </div>
          <p className="font-mono text-sm text-muted-foreground">{exp.period}</p>
        </div>

        <p className="mt-6 max-w-4xl text-base leading-8 text-muted-foreground">{exp.description}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {exp.tags.map((tag) => (
            <span key={tag} className="quiet-tag">
              <span aria-hidden="true" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  )
}
