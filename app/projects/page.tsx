'use client'

import { useEffect, useState } from 'react'
import { ProjectShowcase } from '../../components/project-showcase'

type Project = {
  id: string
  title: string
  description: string
  image: string
  tags: string[]
  github: string
  live?: string
  context?: string
  category?: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    fetch('/api/projects')
      .then((response) => response.json())
      .then((data) => setProjects(data))
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <ProjectShowcase projects={projects} />
    </div>
  )
}
