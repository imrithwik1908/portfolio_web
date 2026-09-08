'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const experiences = [
  {
    title: 'Data Science Associate',
    company: 'Blackcoffer',
    period: 'Dec 2024 - May 2025',
    description:
      'Built predictive models for customer movement and revenue forecasting using real-world trajectory and behavior data. Applied time-series analysis to identify patterns that supported marketing decisions and business outcomes.',
    tags: ['Forecasting', 'Trajectory data', 'Business analysis'],
  },
  {
    title: 'Summer Research Intern',
    company: 'Indian Institute of Technology, Indore',
    period: 'Apr 2024 - Nov 2024',
    description:
      'Led deployment work for explainable hate speech detection models in a cloud-based architecture, improving resource allocation and multilingual scaling.',
    tags: ['Explainable AI', 'Cloud deployment', 'NLP'],
  },
  {
    title: 'Full Stack Developer Intern',
    company: 'CodeAlpha',
    period: 'Jun 2023 - Jul 2023',
    description:
      'Designed and maintained RESTful APIs, optimized MongoDB queries, and collaborated on front-end improvements that enhanced user satisfaction ratings by 25%.',
    tags: ['REST APIs', 'MongoDB', 'Frontend'],
  },
]

export function Experience() {
  const flowRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: flowRef,
    offset: ['start 72%', 'end 54%'],
  })

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
              Roles, without the resume wall.
            </h2>
          </div>
        </motion.div>

        <div ref={flowRef} className="work-flow">
          <motion.div className="work-progress" style={{ scaleY: scrollYProgress }} aria-hidden="true" />
          {experiences.map((exp, index) => (
            <WorkItem key={exp.title} exp={exp} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function WorkItem({ exp, index }: { exp: (typeof experiences)[number]; index: number }) {
  const itemRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ['start 68%', 'center 48%'],
  })
  const markerScale = useTransform(scrollYProgress, [0, 1], [0.94, 1.1])
  const markerBg = useTransform(
    scrollYProgress,
    [0, 1],
    ['hsl(var(--background) / 0.86)', 'hsl(var(--primary) / 0.1)'],
  )

  return (
    <motion.article
      ref={itemRef}
      initial={{ y: 26 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="work-item group"
    >
      <div className="work-index">
        <motion.span style={{ scale: markerScale, background: markerBg }}>
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
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  )
}
