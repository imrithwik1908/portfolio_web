'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

const timelineItems = [
  {
    date: 'Jan 2023',
    title: 'Senior Backend Developer',
    description: 'Led development of scalable microservices architecture',
  },
  {
    date: 'Mar 2021',
    title: 'Data Scientist',
    description: 'Implemented machine learning models for predictive analytics',
  },
  {
    date: 'Jun 2019',
    title: 'Software Engineer',
    description: 'Developed robust backend systems and APIs',
  },
]

export default function About() {
  const { scrollYProgress } = useScroll()
  const scaleProgress = useTransform(scrollYProgress, [0, 1], [0.5, 1])

  return (
    <section id="about" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl font-extrabold text-foreground sm:text-4xl text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          About Me
        </motion.h2>
        <motion.p
          className="mt-4 max-w-2xl text-xl text-muted-foreground lg:mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          I'm a passionate backend developer and data scientist with a keen interest in machine learning. 
          With a strong foundation in computer science and years of industry experience, I strive to create 
          efficient, scalable solutions that drive innovation and solve complex problems.
        </motion.p>
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">My Journey</h3>
          <div className="relative">
            <motion.div
              className="absolute left-1/2 h-full w-0.5 bg-border"
              style={{ scaleY: scaleProgress }}
            />
            {timelineItems.map((item, index) => (
              <motion.div
                key={index}
                className="mb-8 flex justify-between items-center w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="order-1 w-5/12 text-right pr-8">
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
                <div className="z-20 flex items-center order-1 shadow-xl w-8 h-8 rounded-full">
                  <CheckCircle className="w-full h-full text-primary" />
                </div>
                <div className="order-1 rounded-lg shadow-xl w-5/12 px-6 py-4 bg-card">
                  <h3 className="mb-3 font-bold text-foreground text-xl">{item.title}</h3>
                  <p className="text-sm leading-snug tracking-wide text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

