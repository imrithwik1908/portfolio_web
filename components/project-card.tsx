import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Github } from 'lucide-react'
import { motion } from 'framer-motion'

interface Project {
  title: string
  description: string
  image: string
  tags: string[]
  github: string
}

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  // Handle mouse movement for tilt effect
  function handleMouseMove(e: React.MouseEvent) {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const cardX = rect.left + rect.width / 2
    const cardY = rect.top + rect.height / 2

    const deltaX = e.clientX - cardX
    const deltaY = e.clientY - cardY

    // Max tilt angle in degrees
    const maxTilt = 10

    // Calculate tilt relative to center (-maxTilt to maxTilt)
    const rotateX = Math.min(
      maxTilt,
      Math.max(-maxTilt, (-deltaY / (rect.height / 2)) * maxTilt)
    )
    const rotateY = Math.min(
      maxTilt,
      Math.max(-maxTilt, (deltaX / (rect.width / 2)) * maxTilt)
    )

    setTilt({ rotateX, rotateY })
  }

  // Reset tilt on mouse leave
  function handleMouseLeave() {
    setTilt({ rotateX: 0, rotateY: 0 })
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative group cursor-pointer"
      style={{
        perspective: 1000,
      }}
    >
      <Card
        className="overflow-hidden transition-shadow duration-300 h-[460px] flex flex-col bg-background border border-border/30 shadow-md"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.rotateX !== 0 || tilt.rotateY !== 0 ? 1.03 : 1
            })`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Project image */}
        <div className="relative h-40">
          <Image
            src={project.image}
            alt={project.title}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
        </div>

        <CardContent className="p-4 flex flex-col flex-grow backdrop-blur-md bg-white/5">
          {/* Title with glow on hover */}
          <h3
            className="text-lg font-semibold mb-2 line-clamp-1 transition-colors duration-300"
            style={{
              filter:
                tilt.rotateX !== 0 || tilt.rotateY !== 0
                  ? 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.8))'
                  : 'none',
              transform: `translateX(${tilt.rotateY / 3}px) translateY(${tilt.rotateX / 3}px)`,
              transition: 'transform 0.1s ease-out, filter 0.3s ease',
            }} 
          >
            {project.title}
          </h3>

          {/* Description subtle effect */}
          <p className="text-foreground text-sm mb-3 flex-grow line-clamp-3 transition duration-300 group-hover:text-foreground/90 group-hover:translate-x-0.5">
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* GitHub bottom right */}
          <div className="flex justify-end items-end mt-auto">
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
