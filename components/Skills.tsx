'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code, Database, Brain, Cpu } from 'lucide-react'

const skillCategories = [
  {
    name: 'Development',
    icon: Code,
    skills: ['Python', 'JavaScript', 'C/C++', 'React', 'Node.js', 'Express', 'Flask'],
  },
  {
    name: 'Data & AI',
    icon: Brain,
    skills: ['Machine Learning', 'Deep Learning', 'Data Science', 'Analytics'],
  },
  {
    name: 'Databases',
    icon: Database,
    skills: ['SQL', 'NoSQL', 'MongoDB', 'PostgreSQL'],
  },
  {
    name: 'Tools',
    icon: Cpu,
    skills: ['Git', 'Docker', 'Linux', 'CI/CD', 'GCP', 'Power BI'],
  },
]

export function Skills() {
  const [activeCategory, setActiveCategory] = useState(skillCategories[0].name)

  return (
    <section id="skills" className="py-16 bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.h2
          className="text-3xl font-bold mb-12 text-center text-foreground"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Skills & Expertise
        </motion.h2>
        <div className="flex justify-center mb-12 space-x-4">
          {skillCategories.map((category, index) => (
            <motion.button
              key={category.name}
              className={`p-2 rounded-full transition-colors duration-200 ${
                activeCategory === category.name
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 text-secondary-foreground hover:bg-primary/20'
              }`}
              onClick={() => setActiveCategory(category.name)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <category.icon className="w-6 h-6" />
            </motion.button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <motion.h3
              className="text-2xl font-semibold mb-6 text-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {activeCategory}
            </motion.h3>
            <div className="flex flex-wrap justify-center gap-4">
              {skillCategories.find(cat => cat.name === activeCategory)?.skills.map((skill, index) => (
                <motion.div
                  key={skill}
                  className="bg-card rounded-full px-4 py-2 shadow-md"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <motion.span
                    className="text-foreground font-medium"
                    whileHover={{ scale: 1.1 }}
                  >
                    {skill}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

