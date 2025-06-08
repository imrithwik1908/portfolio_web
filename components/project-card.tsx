'use client'

import React, { useState, useRef, useEffect } from 'react'
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
  const [tilt, setTilt] = useState({ rotateY: 0 })
  const cardRef = useRef<HTMLDivElement>(null)
  const [showAllTags, setShowAllTags] = useState(false)
  const [titleHover, setTitleHover] = useState(false)
  const [isTitleClamped, setIsTitleClamped] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const checkClamped = () => {
      if (titleRef.current) {
        const isClamped =
          titleRef.current.scrollWidth > titleRef.current.clientWidth
        setIsTitleClamped(isClamped)
      }
    }

    checkClamped()
    window.addEventListener('resize', checkClamped)
    return () => window.removeEventListener('resize', checkClamped)
  }, [project.title])

  function handleMouseMove(e: React.MouseEvent) {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const cardX = rect.left + rect.width / 2
    const deltaX = e.clientX - cardX
    const maxTilt = 10
    const rotateY = Math.min(
      maxTilt,
      Math.max(-maxTilt, (deltaX / (rect.width / 2)) * maxTilt)
    )
    setTilt({ rotateY })
  }

  function handleMouseLeave() {
    setTilt({ rotateY: 0 })
  }

  const visibleTags = showAllTags ? project.tags : project.tags.slice(0, 3)
  const hiddenTagCount = project.tags.length - 3

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative group cursor-pointer"
      style={{ perspective: 1000, maxWidth: 360 }}
    >
      <Card
        className={`
          overflow-hidden transition-shadow duration-300 h-[540px] flex flex-col
          bg-white text-black border border-black/10 shadow-md rounded-lg
          dark:bg-[#0b0c10] dark:text-white dark:border-white/10
        `}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateY(${tilt.rotateY}deg) scale(${tilt.rotateY !== 0 ? 1.03 : 1})`,
          transition: 'transform 0.1s ease-out',
          width: '100%',
        }}
      >
        {/* Project image */}
        <div className="relative w-full h-[190px]">
          <Image
            src={project.image}
            alt={project.title}
            layout="fill"
            objectFit="cover"
            className="w-full h-full"
            priority
          />
        </div>

        {/* Horizontal line */}
        <hr className="border-t border-gray-200 dark:border-gray-700 m-0" />

        <CardContent
          className="p-5 flex flex-col flex-grow dark:bg-[#0b0c10]"
          style={{ paddingTop: '1rem' }}
        >
          {/* Title with smart expansion on hover if clamped */}
          <div className="relative mb-2">
            <h3
              ref={titleRef}
              onMouseEnter={() => setTitleHover(true)}
              onMouseLeave={() => setTitleHover(false)}
              className={`
                text-lg font-semibold cursor-default transition-all duration-300
                ${isTitleClamped && titleHover ? 'whitespace-normal break-words' : 'truncate'}
              `}
              style={{
                transform: `translateX(${tilt.rotateY / 3}px) scale(${titleHover ? 1.05 : 1})`,
                background: titleHover
                  ? 'linear-gradient(to right, #3b82f6, #ec4899)'
                  : 'none',
                WebkitBackgroundClip: titleHover ? 'text' : undefined,
                WebkitTextFillColor: titleHover ? 'transparent' : undefined,
              }}
            >
              {project.title}
            </h3>
          </div>

          {/* Description */}
          <div
            className="mb-4 flex-grow overflow-y-auto no-scrollbar"
            style={{
              maxHeight: '8.5rem',
              WebkitOverflowScrolling: 'touch',
              transition: 'box-shadow 0.3s ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.boxShadow = 'inset 0 4px 8px -2px rgba(0,0,0,0.15)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.boxShadow = 'none'
            }}
          >
            <style>{`
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <p className="text-sm leading-relaxed">{project.description}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
            {visibleTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-2 py-0.5 transition-colors duration-300 cursor-default hover:bg-primary/10 hover:text-primary"
              >
                {tag}
              </Badge>
            ))}
            {!showAllTags && hiddenTagCount > 0 && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 cursor-pointer select-none"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowAllTags(true)
                }}
              >
                +{hiddenTagCount}
              </Badge>
            )}
            {showAllTags && hiddenTagCount > 0 && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 cursor-pointer select-none"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowAllTags(false)
                }}
              >
                Show less
              </Badge>
            )}
          </div>

          {/* GitHub Icon */}
          <div className="flex justify-end items-end">
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-transform duration-500"
            >
              <Github className="h-5 w-5 hover:rotate-[360deg] transition-transform duration-500" />
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
