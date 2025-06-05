'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TypeAnimation } from 'react-type-animation'
import { Skills } from '@/components/Skills'
import { Experience } from '@/components/Experience'
import { Education } from '@/components/Education'
import { ContactSection } from '@/components/ContactSection'
import { Link as ScrollLink } from 'react-scroll'
import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const context = ctx as CanvasRenderingContext2D

    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)

    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    })

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5,
      o: Math.random()
    }))

    const comets = Array.from({ length: 6 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      dx: -2 - Math.random() * 3,
      dy: 1 + Math.random(),
      length: 100 + Math.random() * 100
    }))

    function drawMoon() {
      context.save()
      context.beginPath()
      context.arc(w - 100, 100, 40, 0, Math.PI * 2)
      context.shadowColor = theme === 'light' ? 'rgba(0,0,0,0.3)' : 'white'
      context.shadowBlur = 20
      context.fillStyle = theme === 'light' ? '#fefcd7' : 'white'
      context.fill()
      context.restore()
    }

    function drawStars() {
      stars.forEach((star) => {
        context.beginPath()
        context.arc(star.x, star.y, star.r, 0, 2 * Math.PI)
        context.fillStyle = `rgba(255,255,255,${Math.abs(Math.sin(Date.now() * 0.001 + star.o))})`
        context.fill()
      })
    }

    function drawComets() {
      comets.forEach((comet) => {
        context.beginPath()
        const gradient = context.createLinearGradient(
          comet.x,
          comet.y,
          comet.x + comet.length,
          comet.y - comet.length / 2
        )
        gradient.addColorStop(0, theme === 'light' ? '#3b82f6' : 'white')
        gradient.addColorStop(1, 'transparent')
        context.strokeStyle = gradient
        context.lineWidth = 2
        context.moveTo(comet.x, comet.y)
        context.lineTo(comet.x + comet.length, comet.y - comet.length / 2)
        context.stroke()

        comet.x += comet.dx
        comet.y += comet.dy

        if (comet.x < -comet.length || comet.y > h + comet.length) {
          comet.x = w + Math.random() * 200
          comet.y = Math.random() * h
        }
      })
    }

    function animate() {
      context.fillStyle = theme === 'light' ? '#ffffff' : '#000000'
      context.fillRect(0, 0, w, h)
      drawStars()
      drawMoon()
      drawComets()
      requestAnimationFrame(animate)
    }

    animate()
  }, [theme])

  return (
    <div className="relative overflow-hidden flex flex-col min-h-screen">
      {/* Background canvas */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
      />

      {/* Glass overlay */}
      <div className="absolute top-0 left-0 w-full h-full backdrop-blur-[2px] bg-white/5 dark:bg-black/10 -z-10 pointer-events-none" />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4">
              <span className="text-gradient">Hey, I&apos;m C Sai Rithwik Reddy</span>
            </h1>
            <TypeAnimation
              sequence={[
                'Machine Learning Enthusiast',
                2000,
                'Data Science Associate',
                2000,
                'Full Stack Developer',
                2000
              ]}
              wrapper="h2"
              cursor={true}
              repeat={Infinity}
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6"
            />
          </motion.div>
          <motion.p
            className="max-w-2xl text-lg mb-8 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Driven by data and AI, I build intelligent models and scalable backend systems to solve real-world problems. Skilled in machine learning, deep learning, and full-stack development, I focus on creating efficient, impactful solutions.
          </motion.p>
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <ScrollLink to="contact" smooth={true} duration={500}>
              <Button>Get in Touch</Button>
            </ScrollLink>
            <Button variant="outline" asChild>
              <Link href="/projects">View Projects</Link>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://drive.google.com/uc?export=download&id=167-7dvJgSWE9kbKYPYBwVaHln8JncN0n"
                download
              >
                Download Resume
              </a>
            </Button>

          </motion.div>
          <motion.div
            className="mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <ChevronDown className="animate-bounce" size={32} />
          </motion.div>
        </section>

        {/* Main Sections */}
        <Skills />
        <Experience />
        <Education />
      </main>

      {/* Footer Contact Section */}
      <ContactSection />
    </div>
  )
}
