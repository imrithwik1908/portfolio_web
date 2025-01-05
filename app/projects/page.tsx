'use client'
import { useState, useEffect } from 'react'
import { ProjectGrid } from '@/components/project-grid'

type Project = {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  github: string;
}

// export const metadata = {
//   title: 'Projects | Your Name',
//   description: 'Explore my projects in AI, Machine Learning, and Backend Development',
// }

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    fetch('/api/projects')
      .then(response => response.json())
      .then(data => setProjects(data))
  }, [])

  return (
    <div className="container mx-auto max-w-5xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold text-center">Projects</h1>
      <ProjectGrid projects={projects} />
    </div>
  )
}

