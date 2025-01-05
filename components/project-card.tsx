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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md h-[400px] flex flex-col bg-transparent border hover:border-border transform hover:-translate-y-1">
      <div className="relative h-40">
        <Image
          src={project.image}
          alt={project.title}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-2 line-clamp-1">{project.title}</h3>
        <p className="text-muted-foreground text-sm mb-3 flex-grow line-clamp-3">{project.description}</p>
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
        <div className="flex justify-between items-center mt-auto">
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

