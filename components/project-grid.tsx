'use client'

import { motion } from 'framer-motion'
import { ProjectCard } from './project-card'

const projects = [
  {
    title: 'Fusion - A Social Media Platform',
    description: 'Developed a MERN stack social media platform with real-time communication features, increasing user engagement by 30%. Implemented 5+ backend services, optimizing API performance and reducing server response time by 20%.',
    image: '/fusion.png',
    tags: ['React', 'Node.js', 'MongoDB', 'Express', 'Socket.io'],
    github: 'https://github.com/imrithwik1908/FUSION_CHAT',
  },
  {
    title: 'Tensor Fusion - Multimodal Sentiment Analysis',
    description: 'Built a multimodal sentiment analysis model integrating language, visual, and acoustic modalities, achieving 15% improvement in sentiment accuracy. Implemented a low-rank tensor fusion method, reducing computational overhead by 20%.',
    image: '/tensor_fusion.jpg',
    tags: ['Python', 'TensorFlow', 'NLP', 'Computer Vision', 'Audio Processing'],
    github: 'https://github.com/imrithwik1908/Tensor-Fusion-Network',
  },
  {
    title: 'Custom API for Athlete Performance Tracking',
    description: 'Developed a custom API to track athlete performance data and manage real-time competition results. Utilized SQLite and SQLAlchemy for efficient data management and querying. Published on PyPI for easy integration.',
    image: '/custom_api.png',
    tags: ['Python', 'Flask', 'SQLite', 'SQLAlchemy', 'API Development'],
    github: 'https://github.com/imrithwik1908/Mini-Project---6th-Sem',
  },
  {
    title: 'Course Catalog Website',
    description: 'Built a role-based course catalog website for students and professors with Google OAuth authentication. Features include course management, enrollment system, and responsive UI.',
    image: '/course_catalog.jpg',
    tags: ['Node.js', 'Express.js', 'MongoDB', 'EJS', 'Google OAuth'],
    github: 'https://eu-de.git.cloud.ibm.com/21bcs026/Group2Finalproject.git',
  },
]

export function ProjectGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
      {projects.map((project, index) => (
        <motion.div
          key={project.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="w-full"
        >
          <ProjectCard project={project} />
        </motion.div>
      ))}
    </div>
  )
}

