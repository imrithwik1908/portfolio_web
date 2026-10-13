'use client'

import { motion } from 'framer-motion'
import { Award, Calendar, GraduationCap, MapPin } from 'lucide-react'

const education = [
  {
    mark: 'ASU',
    degree: 'Master of Science in Computer Science',
    institution: 'Arizona State University',
    location: 'Tempe, AZ, USA',
    period: 'Aug 2025 - Present',
    gpa: '4.00',
    description:
      'Current coursework in artificial intelligence, databases, software verification, and the behavior of larger software systems.',
    courses: [
      'Knowledge Representation',
      'Software Verification',
      'Artificial Intelligence',
      'Data Mining',
      'Distributed Databases',
      'Data Visualization',
    ],
    highlights: ['Current GPA: 4.00'],
  },
  {
    mark: 'IIIT DWD',
    degree: 'Bachelor of Technology in Computer Science Engineering',
    institution: 'Indian Institute of Information Technology, Dharwad',
    location: 'Dharwad, India',
    period: 'Dec 2021 - Jun 2025',
    gpa: '8.94/10.0',
    description:
      'Core computer science coursework, with project work in machine learning, cybersecurity, and web systems.',
    courses: ['Data Structures', 'Algorithms', 'Operating Systems', 'Machine Learning', 'Cybersecurity', 'DevOps'],
    highlights: ['Secured 1st in 66 Days of Data Science', 'Research Internship at IIT Indore'],
  },
]

export function Education() {
  return (
    <section id="education" className="section-flow py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <p className="eyebrow">Education</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.045em] text-foreground sm:text-5xl">
            Where I studied.
          </h2>
        </motion.div>

        <div className="education-compact">
          {education.map((item, index) => (
            <motion.article
              key={item.degree}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="education-card group"
            >
              <div className="education-mark" aria-hidden="true">
                <span>{item.mark}</span>
              </div>

              <div className="education-main">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="max-w-3xl text-2xl font-black tracking-[-0.035em] text-foreground sm:text-3xl">
                      {item.degree}
                    </h3>
                    <p className="mt-1 text-base font-semibold text-primary">{item.institution}</p>
                  </div>

                  <div className="education-meta">
                    <span>
                      <Calendar className="h-4 w-4" />
                      {item.period}
                    </span>
                    <span>
                      <MapPin className="h-4 w-4" />
                      {item.location}
                    </span>
                    <span>
                      <GraduationCap className="h-4 w-4" />
                      GPA {item.gpa}
                    </span>
                  </div>
                </div>

                <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{item.description}</p>

                <div className="education-grid">
                  <div>
                    <p className="detail-label">Courses</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.courses.map((course) => (
                        <span key={course} className="micro-tag">
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="detail-label">Highlights</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.highlights.map((highlight) => (
                        <span key={highlight} className="micro-tag micro-tag-strong">
                          <Award className="h-3.5 w-3.5" />
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
