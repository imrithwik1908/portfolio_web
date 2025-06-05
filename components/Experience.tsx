'use client'

import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { useRef, useState } from 'react'

const experiences = [
  {
    title: 'Data Science Associate',
    company: 'Blackcoffer',
    period: 'Dec 2024 - May 2025',
    description:
      'Built predictive models for customer movement and revenue forecasting using real-world trajectory and behavior data. Applied advanced time-series analysis and uncovered key patterns to help optimize marketing decisions and improve business outcomes.',
  },
  {
    title: 'Summer Research Intern',
    company: 'Indian Institute of Technology, Indore',
    period: 'Apr 2024 - Nov 2024',
    description:
      'Led the deployment of explainable hate speech detection models into a cloud-based architecture, optimizing resource allocation and scaling across multiple languages.',
  },
  {
    title: 'Full Stack Developer Intern',
    company: 'CodeAlpha',
    period: 'Jun 2023 - Jul 2023',
    description:
      'Designed and maintained robust RESTful APIs, optimized MongoDB queries, and collaborated with UI/UX designers to improve front-end interfaces, enhancing user satisfaction ratings by 25%.',
  },
]

export function Experience() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const lineHeight = useTransform(scrollYProgress, [0, 0.9], ['0%', '100%'])

  const totalNodes = experiences.length
  const [activeNodes, setActiveNodes] = useState<boolean[]>(Array(totalNodes).fill(false))

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const newActiveNodes = experiences.map((_, index) => latest >= index / totalNodes)
    setActiveNodes((prev) => {
      for (let i = 0; i < totalNodes; i++) {
        if (prev[i] !== newActiveNodes[i]) return newActiveNodes
      }
      return prev
    })
  })

  return (
    <section id="experience" className="py-20" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl font-bold mb-12 text-center text-foreground"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Work Experience
        </motion.h2>
        <div className="relative">
          {/* Vertical timeline line */}
          <motion.div
            className="absolute top-0 h-full bg-primary/30 origin-top"
            style={{
              left: 'calc(50% - 1px)',
              width: '2px',
              scaleY: lineHeight,
            }}
          />

          {experiences.map((exp, index) => {
            const isActive = activeNodes[index]

            return (
              <motion.div
                key={index}
                className="mb-12 flex items-center justify-center relative"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                {/* Left Side */}
                <motion.div
                  className={`w-1/2 pr-8 text-right transition-opacity duration-300 ${
                    isActive
                      ? 'opacity-100 text-foreground'
                      : 'opacity-50 text-muted-foreground'
                  }`}
                >
                  <h3 className="text-xl font-semibold">{exp.title}</h3>
                  <p className="text-primary">{exp.company}</p>
                </motion.div>

                {/* Node */}
                <div className="relative flex flex-col items-center justify-center w-8">
                  <div
                    className={`rounded-full border-2 border-primary transition-all duration-500 ${
                      isActive
                        ? 'bg-gradient-to-tr from-blue-600 to-blue-400 shadow-[0_0_10px_3px_rgba(59,130,246,0.6)]'
                        : 'bg-transparent'
                    }`}
                    style={{
                      width: 14,
                      height: 14,
                      boxShadow: isActive
                        ? '0 0 10px 3px rgba(59, 130, 246, 0.6)'
                        : 'none',
                    }}
                  />
                  {/* Glow below node */}
                  <div
                    className={`absolute bottom-[-10px] rounded-full transition-all duration-500 ${
                      isActive
                        ? 'bg-blue-500 opacity-30 blur-[8px]'
                        : 'bg-transparent opacity-0'
                    }`}
                    style={{ width: 24, height: 8 }}
                  />
                </div>

                {/* Right Side */}
                <motion.div
                  className={`w-1/2 pl-8 transition-opacity duration-300 ${
                    isActive
                      ? 'opacity-100 text-foreground'
                      : 'opacity-50 text-muted-foreground'
                  }`}
                >
                  <p className="text-sm mb-2">{exp.period}</p>
                  <p className="text-sm">{exp.description}</p>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
