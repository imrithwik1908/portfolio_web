"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion"
import {
  BrainCircuit,
  Code2,
  Database,
  Github,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  ServerCog,
} from "lucide-react"

const skillStages = [
  {
    signal: "Model",
    label: "AI & Data",
    descriptor: "Models are only useful when the data, evaluation, and result all make sense together.",
    icon: BrainCircuit,
    capabilities: ["Train and compare models", "Work with multimodal data", "Build NLP and forecasting experiments", "Evaluate what changed and why"],
    tools: ["Python", "PyTorch", "TensorFlow", "scikit-learn", "Pandas", "NumPy", "Power BI"],
    supporting: ["Machine Learning", "Deep Learning", "NLP", "Explainable AI", "LLMs", "Forecasting"],
    evidence: ["Tensor Fusion", "X-MuTeST", "Blackcoffer"],
    range: [-0.02, 0, 0.22, 0.25] as const,
  },
  {
    signal: "Build",
    label: "Product & Backend",
    descriptor: "This is where an idea becomes software other people can actually use.",
    icon: Code2,
    capabilities: ["Shape backend services", "Design API contracts", "Handle authentication and state", "Connect the interface to the system"],
    tools: ["Node.js", "FastAPI", "Flask", "REST APIs", "GraphQL", "React", "Next.js", "TypeScript", "JavaScript", "C++"],
    supporting: [],
    evidence: ["AgentGuard", "Course Catalog"],
    range: [0.25, 0.28, 0.44, 0.47] as const,
  },
  {
    signal: "Store",
    label: "Data Systems",
    descriptor: "The shape of the data usually decides how simple the rest of the application can be.",
    icon: Database,
    capabilities: ["Model relational data", "Work with document and graph data", "Design queries around real access patterns", "Keep application state consistent"],
    tools: ["PostgreSQL", "MongoDB", "Neo4j", "SQL", "Supabase", "Distributed Databases"],
    supporting: [],
    evidence: ["AgentGuard", "Course Catalog", "Distributed databases coursework"],
    range: [0.47, 0.5, 0.66, 0.69] as const,
  },
  {
    signal: "Ship",
    label: "Infrastructure & Delivery",
    descriptor: "A project feels finished when it can be run again, inspected, and changed without guesswork.",
    icon: ServerCog,
    capabilities: ["Package repeatable environments", "Deploy to cloud platforms", "Automate delivery workflows", "Work comfortably in Linux"],
    tools: ["Docker", "AWS", "GCP", "IBM Cloud", "Git", "Linux", "Jenkins", "CI/CD", "Vercel"],
    supporting: [],
    evidence: ["AgentGuard deployment", "IIT Indore deployment work"],
    range: [0.69, 0.72, 0.88, 0.91] as const,
  },
]

const socialLinks = [
  { label: "GitHub", href: "https://github.com/imrithwik1908", icon: Github },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/sairithwikreddy", icon: Linkedin },
  { label: "Email", href: "mailto:sairithwikreddy.chirra@gmail.com", icon: Mail },
  { label: "Instagram", href: "https://instagram.com/rithwik.cs", icon: Instagram },
]

const contextItems = [
  ["Now", "MS Computer Science at ASU"],
  ["Before", "B.Tech at IIIT Dharwad"],
  ["Work", "Industry and research roles"],
  ["Based in", "Tempe, Arizona"],
]

export function Skills() {
  return (
    <>
      <AboutSection />
      <SkillsStory />
    </>
  )
}

function AboutSection() {
  return (
    <section id="about" className="about-editorial section-flow">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="about-editorial-shell">
          <aside className="about-portrait-column">
            <div className="about-portrait">
              <Image
                src="/profile.jpg"
                alt="Sai Rithwik Reddy Chirra"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 144px, 220px"
                priority
              />
            </div>
            <div className="about-socials" aria-label="Social links">
              {socialLinks.map((social) => {
                const Icon = social.icon

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target={social.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={social.href.startsWith("mailto:") ? undefined : "noreferrer"}
                    aria-label={social.label}
                  >
                    <Icon aria-hidden="true" />
                  </a>
                )
              })}
            </div>
          </aside>

          <div className="about-editorial-copy">
            <p className="eyebrow">About</p>
            <h2>A bit about me.</h2>
            <div className="about-prose">
              <p>
                I&apos;m Rithwik, currently doing my MS in Computer Science at ASU. I studied computer science at IIIT Dharwad before moving to Arizona. Most of my work has ended up around systems that use data or models but still need ordinary software engineering to hold everything together.
              </p>
              <p>
                I got into research at IIT Indore through multilingual hate-speech detection. The interesting part wasn&apos;t only whether a model was accurate; we were also asking why it made a decision across English, Hindi, and Telugu. That meant working with human rationales, model behavior, and deployment. The work became X-MuTeST and, later, an AAAI 2026 paper.
              </p>
              <p>
                At Blackcoffer, the questions were less tidy: customer trajectories, advertising data, revenue forecasts, and business problems without a neat notebook-shaped answer. It made me more careful about what the data could actually support before reaching for a model.
              </p>
              <p>
                These days I keep circling back to the software around AI: APIs, databases, traces, evaluations, and failure cases. AgentGuard grew out of that interest. I like getting one layer beneath the obvious feature and leaving the whole system easier to reason about than I found it.
              </p>
            </div>
            <span className="about-location"><MapPin aria-hidden="true" /> Tempe, AZ</span>
          </div>
        </div>

        <div className="about-context" aria-label="Current context">
          {contextItems.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <p>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SkillsStory() {
  const storyRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({ target: storyRef, offset: ["start start", "end end"] })

  return (
    <section ref={storyRef} id="skills" className="skills-story section-flow">
      <div className="skills-story-sticky">
        <div className="skills-story-inner container mx-auto max-w-7xl px-4">
          <header className="skills-story-heading">
            <div>
              <p className="eyebrow">Technical work</p>
              <h2>What I work with</h2>
            </div>
            <p>The same project can involve more than one of these areas.</p>
          </header>

          <div className="skills-story-index" aria-label="Model, build, store, and ship">
            {skillStages.map((stage, index) => (
              <StoryNode key={stage.signal} stage={stage} index={index} progress={scrollYProgress} />
            ))}
          </div>

          <div className="skills-story-scenes">
            {skillStages.map((stage, index) => (
              <StoryStage key={stage.signal} stage={stage} index={index} progress={scrollYProgress} />
            ))}
            <StoryFinale progress={scrollYProgress} />
          </div>
        </div>
      </div>
    </section>
  )
}

function StoryNode({ stage, index, progress }: { stage: (typeof skillStages)[number]; index: number; progress: MotionValue<number> }) {
  const Icon = stage.icon
  const [enterStart, enterEnd, exitStart, exitEnd] = stage.range
  const opacity = useTransform(progress, [enterStart, enterEnd, exitStart, exitEnd, 0.92, 1], [0.34, 1, 1, 0.34, 0.56, 1])
  const y = useTransform(progress, [enterStart, enterEnd, exitStart, exitEnd, 0.92, 1], [2, -4, -4, 2, 0, -2])
  const scale = useTransform(progress, [enterStart, enterEnd, exitStart, exitEnd, 0.92, 1], [0.98, 1, 1, 0.98, 0.99, 1])
  const haloScale = useTransform(progress, [enterStart, enterEnd, exitStart, exitEnd, 0.92, 1], [0.25, 1, 1, 0.25, 0.45, 0.82])

  return (
    <motion.div className="skills-story-node" style={{ opacity, scale, y }}>
      <motion.b aria-hidden="true" style={{ scale: haloScale }} />
      <span>{String(index + 1).padStart(2, "0")}</span>
      <i><Icon aria-hidden="true" /></i>
      <div>
        <strong>{stage.signal}</strong>
        <small>{stage.label}</small>
      </div>
    </motion.div>
  )
}

function StoryStage({ stage, index, progress }: { stage: (typeof skillStages)[number]; index: number; progress: MotionValue<number> }) {
  const Icon = stage.icon
  const range = [...stage.range]
  const opacity = useTransform(progress, range, [0, 1, 1, 0])
  const y = useTransform(progress, range, [22, 0, 0, -18])
  const scale = useTransform(progress, range, [0.985, 1, 1, 0.99])
  const allTools = [...stage.supporting, ...stage.tools]

  return (
    <motion.article className="skills-story-stage" style={{ opacity, y, scale }} aria-label={`${stage.signal}: ${stage.label}`}>
      <div className="skills-stage-intro">
        <div className="skills-stage-kicker"><Icon aria-hidden="true" /><span>{String(index + 1).padStart(2, "0")} / 04</span><strong>{stage.signal}</strong></div>
        <h3>{stage.label}</h3>
        <p>{stage.descriptor}</p>
      </div>

      <div className="skills-stage-detail">
        <ol className="skills-capability-list">
          {stage.capabilities.map((capability, capabilityIndex) => (
            <li key={capability}>
              <span>{String(capabilityIndex + 1).padStart(2, "0")}</span>
              <strong>{capability}</strong>
            </li>
          ))}
        </ol>
        <div className="skills-stage-stack">
          <p className="skills-stage-label">Used in this part</p>
          <ul className="skills-tool-list">
            {allTools.map((tool) => <li key={tool}>{tool}</li>)}
          </ul>
          <div className="skills-evidence">
            <span>Seen in</span>
            {stage.evidence.map((item) => <small key={item}>{item}</small>)}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

function StoryFinale({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.91, 0.94, 1], [0, 1, 1])
  const y = useTransform(progress, [0.91, 0.95, 1], [22, 0, 0])

  return (
    <motion.div className="skills-story-finale" style={{ opacity, y }}>
      <p className="eyebrow">End to end</p>
      <h3>Putting it together.</h3>
      <p>AgentGuard brings several of these areas into one project: an SDK, backend services, PostgreSQL, evaluation jobs, and a web interface. Other projects stay within one or two parts.</p>
      <div aria-label="Connected areas">{skillStages.map((stage) => <span key={stage.signal}>{stage.signal}</span>)}</div>
    </motion.div>
  )
}
