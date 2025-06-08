"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "framer-motion"
import {
  MapPin,
  Calendar,
  Code,
  Database,
  Brain,
  Wrench,
  Target,
  Zap,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type SkillCategory = "Development" | "AI & Data" | "Database" | "Tools"

const skillsData: Record<SkillCategory, { icon: JSX.Element; skills: string[] }> = {
  Development: {
    icon: <Code className="h-4 w-4" />,
    skills: ["React", "Next.js", "TypeScript", "Node.js", "Python", "JavaScript", "GraphQL", "REST APIs"],
  },
  "AI & Data": {
    icon: <Brain className="h-4 w-4" />,
    skills: ["TensorFlow", "PyTorch", "Pandas", "OpenAI", "Data Analysis", "NLP", "Computer Vision"],
  },
  Database: {
    icon: <Database className="h-4 w-4" />,
    skills: ["PostgreSQL", "MongoDB", "Supabase", "Firebase", "SQL", "Database Design"],
  },
  Tools: {
    icon: <Wrench className="h-4 w-4" />,
    skills: ["Docker", "AWS", "Vercel", "Git", "Figma", "Kubernetes", "CI/CD"],
  },
}

const stats = [
  { label: "Years Experience", value: "1+", icon: <Calendar className="h-5 w-5" /> },
  { label: "Projects Completed", value: "20+", icon: <Target className="h-5 w-5" /> },
]

type Stat = {
  label: string;
  value: string;
  icon: JSX.Element;
}

export function Skills() {
  const [activeCategory, setActiveCategory] = useState<SkillCategory>("Development")

  return (
    <section id="about" className="py-20 transition-colors duration-300">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">About Me</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-primary/50 mx-auto mb-6 rounded-full"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - About Me Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="h-6 w-6 text-primary" />
                  Hello, I&apos;m Rithwik
                </h3>
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed mb-4">
                   I&apos;m a data-driven developer with a strong interest in AI and machine learning. I enjoy working on problems that require both analytical thinking and creativity — whether it&apos;s building models to understand human behavior or making systems more efficient with smart automation. I&apos;ve spent most of my time exploring how data can be used to solve real problems, and I&apos;m especially drawn to projects where the impact is clear and measurable
                </p>
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed mb-4">
                   Outside of work, I like experimenting with new tools, following emerging research, and learning from open-source communities. I care about writing clean, maintainable code and building solutions that are practical and scalable. For me, it&apos;s not just about applying algorithms — it&apos;s about understanding the problem deeply and using the right tools to solve it well..
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4 text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-900 dark:text-gray-100" />
                  <span className="text-gray-900 dark:text-gray-100">Hyderabad, IND</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-gray-900 dark:text-gray-100">Available for work</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-4"
              >
                {/* <Button className="group">
                  <Download className="mr-2 h-4 w-4 group-hover:translate-y-1 transition-transform duration-200" />
                  Download CV
                </Button>
                <Button variant="outline">
                  Let&apos;s Connect
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button> */}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-6"
            >
              {stats.map((stat, index) => (
                <StatCard key={index} stat={stat} index={index} />
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Skills */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-bold mb-2">Technical Expertise</h3>
              <p className="text-muted-foreground text-sm">Technologies I work with to build exceptional experiences</p>
            </div>

            <div className="flex flex-wrap gap-1 border-b border-border/30">
              {Object.entries(skillsData).map(([category, data]) => (
                <motion.button
                  key={category}
                  onClick={() => setActiveCategory(category as SkillCategory)}
                  className={`
                    relative px-3 py-2 text-sm font-medium transition-all duration-300 flex items-center gap-2
                    ${activeCategory === category ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className={activeCategory === category ? "text-primary" : "text-muted-foreground/70"}>
                    {data.icon}
                  </span>
                  <span className="hidden sm:inline">{category}</span>
                  {activeCategory === category && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="pt-2"
              >
                <CompactSkillsDisplay skills={skillsData[activeCategory].skills} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.05 }}
      className="group"
    >
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 mx-auto mb-2">
            <div className="text-primary">{stat.icon}</div>
          </div>
          <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
          <div className="text-xs text-muted-foreground">{stat.label}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function CompactSkillsDisplay({ skills }: { skills: string[] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div ref={ref} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {skills.slice(0, 4).map((skill, index) => (
          <SkillPill key={skill} skill={skill} index={index} isInView={isInView} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.slice(4, 8).map((skill, index) => (
          <SkillPill key={skill} skill={skill} index={index + 4} isInView={isInView} />
        ))}
      </div>
    </motion.div>
  )
}

function SkillPill({ skill, index, isInView }: { skill: string; index: number; isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
      transition={{
        delay: index * 0.08,
        duration: 0.4,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{
        scale: 1.05,
        y: -2,
        transition: { duration: 0.2 },
      }}
      className="group cursor-pointer"
    >
      <div className="relative px-4 py-2 bg-muted/50 hover:bg-muted/80 border border-border/50 hover:border-primary/30 rounded-full transition-all duration-300 backdrop-blur-sm">
        <motion.div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300" />
        <span className="relative text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors duration-200">
          {skill}
        </span>
        <motion.div className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
      </div>
    </motion.div>
  )
}
