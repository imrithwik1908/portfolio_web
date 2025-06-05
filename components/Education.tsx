'use client'

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { GraduationCap, Calendar, BookOpen, Award, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface EducationItem {
  degree: string
  institution: string
  location: string
  period: string
  gpa: string
  description: string
  skills: string[]
  achievements: string[]
  color: string
}

const education = [
  {
    degree: "Bachelor of Technology in Computer Science Engineering",
    institution: "Indian Institute of Information Technology, Dharwad",
    location: "Dharwad, India",
    period: "Dec 2021 - Jun 2025",
    gpa: "8.94/10.0",
    description:
      "Focused on core computer science fundamentals with practical projects in ML, Cybersecurity, and Software Development.",
    skills: [
      "Data Structures",
      "Algorithms",
      "Operating Systems",
      "Machine Learning",
      "Cybersecurity",
      "DevOps",
    ],
    achievements: [
      "Secured 1st in 66 Days of Data Science Event",
      "Research Internship at IIT Indore"
    ],
    color: "from-indigo-500/20 to-purple-500/20"
  },
  {
    degree: "12th Grade",
    institution: "Narayana College",
    location: "Hyderabad, India",
    period: "Jun 2019 - May 2021",
    gpa: "98%",
    description:
      "Specialized in Science stream with high marks in Mathematics and Physics.",
    skills: ["Mathematics", "Physics", "Chemistry"],
    achievements: [""],
    color: "from-green-400/20 to-teal-400/20"
  },
]

export function Education() {
  return (
    <section id="education" className="py-20 transition-colors duration-300">
      <div className="container px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6"
          >
            <BookOpen className="h-8 w-8 text-primary" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Education</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-primary/50 mx-auto mb-6 rounded-full" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            My academic journey and achievements that have shaped my knowledge and skills.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {education.map((item, i) => (
            <EducationCard key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function EducationCard({ item, index }: { item: EducationItem; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: -15 }}
      transition={{
        duration: 0.6,
        delay: index * 0.2,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{
        y: -10,
        transition: { duration: 0.2 },
      }}
      className="group h-full"
    >
      <Card className="relative h-full border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden">
        {/* Gradient background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />

        {/* Animated border */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-[1px] bg-card/90 backdrop-blur-sm rounded-lg" />
        </div>

        <CardHeader className="relative z-10 pb-4">
          <div className="flex items-start justify-between mb-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300"
            >
              <GraduationCap className="h-6 w-6 text-primary" />
            </motion.div>
            <Badge variant="outline" className="text-xs font-medium">
              {item.gpa}
            </Badge>
          </div>

          <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors duration-300">
            {item.degree}
          </CardTitle>

          <CardDescription className="space-y-2">
            <div className="font-medium text-foreground/80">{item.institution}</div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{item.period}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{item.location}</span>
              </div>
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>

          {/* Skills */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Key Skills
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {item.skills.map((skill: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                  transition={{ delay: index * 0.2 + i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-1 hover:bg-primary/20 transition-colors duration-200"
                  >
                    {skill}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Award className="h-3 w-3 text-primary" />
              Achievements
            </h4>
            <div className="space-y-1">
              {item.achievements.map((achievement: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.2 + i * 0.15 }}
                  className="text-xs text-muted-foreground flex items-center gap-2"
                >
                  <div className="w-1 h-1 rounded-full bg-primary/60"></div>
                  {achievement}
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>

        {/* Hover effect overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          initial={false}
        />
      </Card>
    </motion.div>
  )
}
