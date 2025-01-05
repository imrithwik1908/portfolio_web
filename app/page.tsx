'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useAnimation, useInView } from 'framer-motion'
import { Github, Linkedin, Mail, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TypeAnimation } from 'react-type-animation'
import { Skills } from '@/components/Skills'
import { Experience } from '@/components/Experience'
import { Education } from '@/components/Education'
import { Link as ScrollLink } from 'react-scroll'

const skills = [
  'Python', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'FastAPI',
  'Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Docker',
  'Kubernetes', 'AWS', 'Git', 'CI/CD'
]

const experiences = [
  {
    title: 'Senior Machine Learning Engineer',
    company: 'AI Solutions Inc.',
    period: '2021 - Present',
    description: 'Leading the development of deep learning models for computer vision and NLP tasks. Architecting scalable ML pipelines for production environments.'
  },
  {
    title: 'Backend Developer',
    company: 'Tech Innovators',
    period: '2019 - 2021',
    description: 'Developed and maintained high-performance RESTful APIs. Implemented microservices architecture and optimized database queries.'
  },
  {
    title: 'Data Scientist',
    company: 'Data Insights Co.',
    period: '2017 - 2019',
    description: 'Conducted exploratory data analysis and built predictive models. Collaborated with cross-functional teams to deliver data-driven solutions.'
  }
]

function FadeInWhenVisible({ children }: { children: React.ReactNode }) {
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref)

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      transition={{ duration: 0.5 }}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 20 }
      }}
    >
      {children}
    </motion.div>
  )
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <section className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4">
            <span className="text-gradient">Hey, I'm C Sai Rithwik Reddy</span>
          </h1>
          <TypeAnimation
            sequence={[
              'Full Stack Developer',
              2000,
              'Machine Learning Enthusiast',
              2000,
              'Data Science Associate',
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
          Passionate about crafting intelligent solutions with AI, robust backend systems, and cutting-edge web technologies. 
          Currently pursuing B.Tech in Computer Science Engineering at IIIT Dharwad.
        </motion.p>
        <motion.div
          className="flex space-x-4"
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
            <a href="https://drive.google.com/file/d/1WMYt4tfhId4PaS_8UJfbvrT25ncE78rN/view?usp=sharing" target="_blank" rel="noopener noreferrer">View Resume</a>
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

      <Skills />
      <Experience />
      <Education />

      <section id="contact" className="py-20 bg-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl font-bold mb-8"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Get in Touch
          </motion.h2>
          <motion.div
            className="flex flex-col items-center space-y-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-lg text-muted-foreground max-w-md">
              I'm always open to new opportunities and collaborations. Feel free to reach out!
            </p>
            <div className="flex justify-center space-x-6">
              <motion.a
                href="https://github.com/imrithwik1908"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-foreground hover:text-primary transition-colors"
              >
                <Github className="h-8 w-8" />
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/in/sairithwikreddy"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="h-8 w-8" />
              </motion.a>
              <motion.a
                href="mailto:csairithwik.reddy@gmail.com"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-8 w-8" />
              </motion.a>
            </div>
            <Button asChild>
              <a href="mailto:csairithwik.reddy@gmail.com">Send me an email</a>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

