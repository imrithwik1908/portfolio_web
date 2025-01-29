'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { School, Calendar, BookOpen } from 'lucide-react'

const education = [
  {
    degree: 'B.Tech in Computer Science Engineering',
    school: 'Indian Institute of Information Technology, Dharwad',
    period: 'Dec 2021 - Jun 2025',
    description: 'CGPA: 8.88',
    courses: [
      'Data Structures & Algorithms',
      'Operating Systems',
      'Computer Networks',
      'Database Management Systems',
      'Machine Learning',
      'Software Development',
      'Cybersecurity',
      'DevOps'
    ],
  },
  {
    degree: '12th Grade',
    school: 'Narayana College, Hyderabad',
    period: 'Jun 2019 - May 2021',
    description: 'Percentage: 98%',
  },
]

export function Education() {
  return (
    <section id="education" className="py-16 bg-secondary/10">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-2 text-white">Education</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-white/70">
            My academic journey in computer science and technology
          </p>
        </motion.div>
        <div className="space-y-6">
          {education.map((edu, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card className="overflow-hidden hover:shadow-md transition-all duration-300 bg-secondary/20">
                <CardHeader className="bg-secondary/30 border-b border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-xl text-white">
                        <School className="h-5 w-5 text-white" />
                        {edu.degree}
                      </CardTitle>
                      <p className="text-white/70 mt-2 font-medium">{edu.school}</p>
                    </div>
                    <div className="flex items-center text-sm text-white/50">
                      <Calendar className="h-4 w-4 mr-1" />
                      {edu.period}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="font-semibold text-white">{edu.description}</p>
                  {edu.courses && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-white">
                        <BookOpen className="h-4 w-4 text-white" />
                        Relevant Coursework
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {edu.courses.map((course, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.05 }}
                            className="text-sm text-white/70 bg-secondary/40 rounded-md px-3 py-1"
                          >
                            {course}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
