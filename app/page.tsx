'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowDown, FileText } from 'lucide-react'
import { Link as ScrollLink } from 'react-scroll'
import { Button } from '@/components/ui/button'
import { Skills } from '@/components/Skills'
import { Experience } from '@/components/Experience'
import { Education } from '@/components/Education'
import { HomeProjects } from '@/components/HomeProjects'
import { ContactSection } from '@/components/ContactSection'

const heroSignals = [
  ['Now', 'MS Computer Science at ASU'],
  ['Interested in', 'The systems behind data and AI'],
  ['Based in', 'Tempe, Arizona'],
]

const roles = [
  'Machine Learning Engineer',
  'Backend Engineer',
  'Data Science Associate',
  'Full-Stack Developer',
]

export default function Home() {
  const [roleIndex, setRoleIndex] = useState(0)
  const [typedRole, setTypedRole] = useState(roles[0].slice(0, 1))
  const [rolePhase, setRolePhase] = useState<'typing' | 'holding' | 'deleting'>('typing')

  useEffect(() => {
    let buffer = ''

    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0 })
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      buffer = `${buffer}${event.key.toLowerCase()}`.slice(-8)

      if (buffer.includes('hire')) {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  useEffect(() => {
    const currentRole = roles[roleIndex]

    if (rolePhase === 'holding') {
      const timer = window.setTimeout(() => setRolePhase('deleting'), 850)
      return () => window.clearTimeout(timer)
    }

    if (rolePhase === 'deleting') {
      const timer = window.setTimeout(() => {
        if (typedRole.length <= 1) {
          const nextIndex = (roleIndex + 1) % roles.length
          setRoleIndex(nextIndex)
          setTypedRole(roles[nextIndex].slice(0, 1))
          setRolePhase('typing')
          return
        }

        setTypedRole((value) => value.slice(0, -1))
      }, 20)
      return () => window.clearTimeout(timer)
    }

    if (typedRole === currentRole) {
      const timer = window.setTimeout(() => setRolePhase('holding'), 180)
      return () => window.clearTimeout(timer)
    }

    const timer = window.setTimeout(() => {
      setTypedRole(currentRole.slice(0, typedRole.length + 1))
    }, 46)

    return () => window.clearTimeout(timer)
  }, [roleIndex, rolePhase, typedRole])

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      <main className="relative z-10 flex-grow">
        <section className="container relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-4 py-16">
          <div className="mx-auto w-full">
            <div className="mx-auto max-w-6xl text-center">
              <h1 className="hero-title text-5xl font-black leading-[0.92] tracking-[-0.055em] text-foreground sm:text-6xl md:text-7xl">
                <span className="block">Hey, I&apos;m</span>
                <span className="hero-name text-gradient animate-gradient block whitespace-normal lg:whitespace-nowrap">
                  Sai Rithwik Reddy Chirra
                </span>
              </h1>

              <div className="role-stage mx-auto mt-7 min-h-[3rem] max-w-5xl text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl md:text-5xl">
                <span className="role-type" data-phase={rolePhase}>{typedRole}</span>
              </div>

              <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
                I&apos;m Rithwik, an MS Computer Science student at ASU. I work mostly on backend systems, data, and machine learning, often in the same project.
              </p>

              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Button size="lg" asChild>
                  <Link href="/projects">View projects</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <ScrollLink to="contact" smooth={true} duration={500}>Get in touch</ScrollLink>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a
                    href="https://drive.google.com/file/d/1LF8cf2CkC7JzFfhFVyHCXXfUYF6L9pZd/view?usp=sharing"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    Resume
                  </a>
                </Button>
              </div>
            </div>

            <div className="hero-signal-row mx-auto mt-10">
              {heroSignals.map(([label, value]) => (
                <span key={label} className="hero-signal">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </span>
              ))}
            </div>
          </div>

          <div className="absolute bottom-7 left-1/2 -translate-x-1/2">
            <ArrowDown className="h-7 w-7 animate-bounce text-foreground/80" />
          </div>
        </section>

        <Skills />
        <HomeProjects />
        <Experience />
        <Education />
      </main>

      <ContactSection />
    </div>
  )
}
