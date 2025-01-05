'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'

export default function Hero() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, 100])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-secondary/20">
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y: y1 }}
      >
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Background"
          layout="fill"
          objectFit="cover"
          className="opacity-50"
        />
      </motion.div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center relative z-10">
        <motion.div
          className="md:w-1/2 text-center md:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ y: y2 }}
        >
          <motion.h1
            className="text-4xl font-extrabold text-foreground sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Your Name
          </motion.h1>
          <motion.p
            className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Backend Developer | Data Scientist | Machine Learning Enthusiast
          </motion.p>
          <motion.div
            className="mt-5 sm:mt-8 sm:flex sm:justify-center md:justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="rounded-md shadow">
              <a
                href="#contact"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-background bg-primary hover:bg-primary/90 md:py-4 md:text-lg md:px-10"
              >
                Get in touch
              </a>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <a
                href="#projects"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 md:py-4 md:text-lg md:px-10"
              >
                View Projects
              </a>
            </div>
          </motion.div>
        </motion.div>
        <motion.div
          className="md:w-1/2 mt-10 md:mt-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          style={{ y: y2 }}
        >
          <Image
            src="/placeholder.svg?height=400&width=400"
            alt="Your Name"
            width={400}
            height={400}
            className="rounded-full shadow-2xl"
          />
        </motion.div>
      </div>
    </section>
  )
}

