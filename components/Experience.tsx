'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const experiences = [
  {
    title: 'Data Science Associate',
    company: 'Blackcoffer',
    period: 'Jan 2025 - Present',
    description: 'Applying advanced data science techniques to solve complex business problems. Developing and implementing machine learning models for predictive analytics and data-driven decision making.',
  },
  {
    title: 'Summer Research Intern',
    company: 'Indian Institute of Technology, Indore',
    period: 'Apr 2024 - Dec 2024',
    description: 'Led the deployment of explainable hate speech detection models into a cloud-based architecture, optimizing resource allocation and scaling across multiple languages.',
  },
  {
    title: 'Full Stack Developer Intern',
    company: 'CodeAlpha',
    period: 'Jun 2023 - Jul 2023',
    description: 'Designed and maintained robust RESTful APIs, optimized MongoDB queries, and collaborated with UI/UX designers to improve front-end interfaces, enhancing user satisfaction ratings by 25%.',
  },
]

export function Experience() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const lineHeight = useTransform(scrollYProgress, [0, 0.9], ["0%", "100%"])

  return (
    <section id="experience" className="py-20" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl font-bold mb-12 text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Work Experience
        </motion.h2>
        <div className="relative">
          <motion.div
            className="absolute left-1/2 top-0 w-0.5 h-full bg-primary/30"
            style={{ scaleY: lineHeight, originY: 0 }}
          />
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              className="mb-12 flex items-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="w-1/2 pr-8 text-right">
                <h3 className="text-xl font-semibold">{exp.title}</h3>
                <p className="text-primary">{exp.company}</p>
              </div>
              <div className="w-4 h-4 rounded-full bg-primary z-10" />
              <div className="w-1/2 pl-8">
                <p className="text-sm text-muted-foreground mb-2">{exp.period}</p>
                <p className="text-muted-foreground">{exp.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

