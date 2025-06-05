'use client'

import { useState, useEffect } from 'react'
import { ProjectGrid } from '@/components/project-grid'
import { TechBackground } from '@/components/TechBackground'

type Project = {
  id: string
  title: string
  description: string
  image: string
  tags: string[]
  github: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    fetch('/api/projects')
      .then(response => response.json())
      .then(data => setProjects(data))
  }, [])

  return (
    <div className="relative">
      <TechBackground />
      <div className="container mx-auto max-w-5xl px-4 py-16 relative z-10">
        <h1 className="mb-8 text-3xl font-bold text-center">Projects</h1>
        <ProjectGrid projects={projects} />
      </div>
    </div>
  )
}
