'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowDown, Download } from 'lucide-react'
import { Link as ScrollLink } from 'react-scroll'
import { Button } from '@/components/ui/button'
import { Skills } from '@/components/Skills'
import { Experience } from '@/components/Experience'
import { Education } from '@/components/Education'
import { HomeProjects } from '@/components/HomeProjects'
import { ContactSection } from '@/components/ContactSection'

const heroSignals = [
  ['Current', 'MS CS @ Arizona State University'],
  ['Focus', 'ML systems + backend APIs'],
  ['Based in', 'Tempe, AZ'],
]

const roles = [
  'Machine Learning Engineer',
  'Data Science Associate',
  'Backend Systems Builder',
  'Full Stack Developer',
]

export default function Home() {
  const [roleIndex, setRoleIndex] = useState(0)
  const [typedRole, setTypedRole] = useState("")

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

    if (typedRole === currentRole) {
      const timer = window.setTimeout(() => {
        setRoleIndex((index) => (index + 1) % roles.length)
        setTypedRole("")
      }, 1600)
      return () => window.clearTimeout(timer)
    }

    const timer = window.setTimeout(() => {
      setTypedRole(currentRole.slice(0, typedRole.length + 1))
    }, typedRole.length === 0 ? 170 : 58)

    return () => window.clearTimeout(timer)
  }, [roleIndex, typedRole])

  useEffect(() => {
    if (typedRole.length > 0) return

    const timer = window.setTimeout(() => {
      setTypedRole(roles[roleIndex].slice(0, 1))
    }, 210)

    return () => window.clearTimeout(timer)
  }, [roleIndex, typedRole])

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <main className="relative z-10 flex-grow">
        <section className="container relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-4 py-16">
          <div className="mx-auto w-full">
            <div className="mx-auto max-w-6xl text-center">
              <button
                type="button"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="hero-kicker mx-auto mb-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase text-primary"
              >
                Open to selective opportunities
              </button>

              <h1 className="hero-title text-5xl font-black leading-[0.92] tracking-[-0.055em] text-foreground sm:text-6xl md:text-7xl">
                <span className="block">Hey, I&apos;m</span>
                <span className="hero-name text-gradient animate-gradient block whitespace-normal lg:whitespace-nowrap">
                  Sai Rithwik Reddy Chirra
                </span>
              </h1>

              <div className="mt-7 min-h-[3rem] text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl md:text-5xl">
                <span className="role-type">{typedRole}</span>
              </div>

              <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
                I build practical AI workflows, predictive models, APIs, and product systems where the output needs to be clear, useful, and dependable.
              </p>

              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <ScrollLink to="contact" smooth={true} duration={500}>
                  <Button size="lg">Get in Touch</Button>
                </ScrollLink>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/projects">View Projects</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a
                    href="https://drive.google.com/uc?export=download&id=167-7dvJgSWE9kbKYPYBwVaHln8JncN0n"
                    download
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
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
