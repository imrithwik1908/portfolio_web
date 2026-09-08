"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Code2, Cpu, Database, Github, Instagram, Linkedin, Mail, MapPin, Wrench } from "lucide-react"

const skillGroups = [
  {
    label: "Development",
    icon: Code2,
    summary: "Interfaces, APIs, and full-stack product work.",
    signal: "Build",
    items: ["React", "Next.js", "TypeScript", "Node.js", "JavaScript", "REST APIs", "GraphQL"],
  },
  {
    label: "AI & Data",
    icon: Cpu,
    summary: "Modeling, analysis, and data workflows.",
    signal: "Model",
    items: ["Python", "TensorFlow", "PyTorch", "Pandas", "NLP", "Forecasting", "Data Mining"],
  },
  {
    label: "Database",
    icon: Database,
    summary: "Schemas, queries, storage, and data access.",
    signal: "Store",
    items: ["MongoDB", "PostgreSQL", "Supabase", "SQL", "Distributed DBMS"],
  },
  {
    label: "Tools",
    icon: Wrench,
    summary: "The setup that helps ideas ship cleanly.",
    signal: "Ship",
    items: ["AWS", "Docker", "Vercel", "Git", "Linux", "Automation"],
  },
]

const socialLinks = [
  { label: "GitHub", href: "https://github.com/imrithwik1908", icon: Github },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/sairithwikreddy", icon: Linkedin },
  { label: "Email", href: "mailto:csairithwik.reddy@gmail.com", icon: Mail },
  { label: "Instagram", href: "https://instagram.com/rithwik.cs", icon: Instagram },
]

const stats = [
  ["1+", "Years Experience"],
  ["20+", "Projects Completed"],
  ["4.00", "Current GPA"],
]

export function Skills() {
  const [activeGroupLabel, setActiveGroupLabel] = useState(skillGroups[1].label)
  const activeGroup = skillGroups.find((group) => group.label === activeGroupLabel) ?? skillGroups[1]

  return (
    <section id="about" className="section-flow py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="about-grid">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="about-copy"
          >
            <div className="intro-lockup">
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-[1.55rem] border border-border/70 bg-muted shadow-xl shadow-foreground/5 sm:h-36 sm:w-36">
                <Image
                  src="/profile.jpg"
                  alt="Sai Rithwik Reddy Chirra"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-[1.05]"
                  sizes="144px"
                  priority
                />
              </div>
              <div>
                <p className="eyebrow">About</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-foreground sm:text-4xl">
                  Hi, this is Rithwik.
                </h2>
                <div className="mt-5 flex gap-4 text-muted-foreground">
                  {socialLinks.map((social) => {
                    const Icon = social.icon

                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target={social.href.startsWith("mailto:") ? undefined : "_blank"}
                        rel={social.href.startsWith("mailto:") ? undefined : "noreferrer"}
                        aria-label={social.label}
                        className="hover-glow transition-colors duration-200 hover:text-primary"
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 max-w-3xl space-y-5 text-lg leading-8 text-muted-foreground">
              <p>
                I’m currently pursuing my MS in Computer Science at Arizona State University, with most of my energy going into machine learning, backend systems, and product-facing AI workflows.
              </p>
              <p>
                I like the space between experiments and real software: cleaning data, testing model ideas, shaping APIs, and building interfaces that make technical work easier to understand and use.
              </p>
              <p>
                My recent work has touched forecasting, explainable NLP, REST APIs, MongoDB optimization, cloud deployment, and full-stack product polish.
              </p>
              <p>
                Outside of formal work, I keep experimenting with new tools, reading emerging research, and learning from open-source communities. I care about clarity, maintainable code, and measurable impact.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Tempe, AZ
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Open to selective roles
              </span>
            </div>

            <div className="about-stats">
              {stats.map(([value, label], index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                  className="about-stat"
                >
                  <span>{value}</span>
                  <p>{label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="expertise-panel"
          >
            <div>
              <h3 className="text-4xl font-black tracking-[-0.045em] text-foreground">Technical Expertise</h3>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                A compact map of the stack I reach for when moving from model idea to usable product.
              </p>
            </div>

            <div className="skill-atlas">
              <div className="skill-atlas-head">
                <span>{activeGroup.signal}</span>
                <strong>{activeGroup.label}</strong>
                <p>{activeGroup.summary}</p>
              </div>

              <div className="skill-lanes" aria-label="Skill categories">
                {skillGroups.map((group) => {
                  const Icon = group.icon
                  const isActive = group.label === activeGroup.label

                  return (
                    <button
                      key={group.label}
                      type="button"
                      className={`skill-lane ${isActive ? "is-active" : ""}`}
                      onClick={() => setActiveGroupLabel(group.label)}
                    >
                      <span className="skill-lane-title">
                        <Icon className="h-5 w-5" />
                        <span>{group.label}</span>
                      </span>
                      <span className="skill-lane-summary">{group.summary}</span>
                      <span className="skill-lane-chips">
                        {group.items.map((item, index) => (
                          <motion.span
                            key={item}
                            initial={false}
                            animate={{
                              y: isActive ? 0 : 3,
                              opacity: isActive || index < 4 ? 1 : 0.55,
                            }}
                            transition={{ duration: 0.24, delay: isActive ? index * 0.025 : 0 }}
                          >
                            {item}
                          </motion.span>
                        ))}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="skill-ribbon" aria-hidden="true">
              {skillGroups.map((group, groupIndex) => {
                const Icon = group.icon

                return (
                  <span key={group.label} style={{ animationDelay: `${groupIndex * 0.35}s` }}>
                    <Icon className="h-4 w-4" />
                    {group.label}
                  </span>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
