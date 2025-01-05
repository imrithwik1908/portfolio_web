'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const projects = [
  {
    title: 'AI-Powered Recommendation Engine',
    description: 'Developed a scalable recommendation system using collaborative filtering and deep learning techniques.',
    image: '/placeholder.svg?height=300&width=400',
    tags: ['Python', 'TensorFlow', 'AWS'],
    link: '#',
  },
  {
    title: 'Distributed Data Processing Pipeline',
    description: 'Built a high-throughput data processing pipeline using Apache Kafka and Spark for real-time analytics.',
    image: '/placeholder.svg?height=300&width=400',
    tags: ['Scala', 'Kafka', 'Spark'],
    link: '#',
  },
  {
    title: 'Blockchain-based Supply Chain System',
    description: 'Implemented a transparent and secure supply chain management system using blockchain technology.',
    image: '/placeholder.svg?height=300&width=400',
    tags: ['Solidity', 'Ethereum', 'Node.js'],
    link: '#',
  },
]

export default function Projects() {
  return (
    <section id="projects" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl font-extrabold text-foreground sm:text-4xl text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Featured Projects
        </motion.h2>
        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-12">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.2,
              }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src={project.image}
                      alt={project.title}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="mb-2">{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 p-6 pt-0">
                  {project.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </CardFooter>
                <CardFooter className="p-6 pt-0">
                  <Button asChild>
                    <a href={project.link}>Learn More</a>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

