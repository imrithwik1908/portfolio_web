import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { CalendarIcon, Clock, ArrowRight, Edit, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  date: string
  slug: string
  read_time: string
}

interface BlogPostCardProps {
  post: BlogPost
  onEdit: (post: BlogPost) => void
  onDelete: (id: string) => void
  isAuthenticated: boolean
}

export function BlogPostCard({ post, onEdit, onDelete, isAuthenticated }: BlogPostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg">
        <CardContent className="flex-grow p-6">
          <h3 className="text-2xl font-bold mb-3 text-primary">
            <Link href={`/blog/${post.slug}`} className="hover:underline">
              {post.title}
            </Link>
          </h3>
          <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <time>{post.date}</time>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>{post.read_time}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0 flex justify-between items-center">
          <Link href={`/blog/${post.slug}`} passHref>
            <Button variant="link" className="p-0 h-auto font-semibold text-primary">
              Read More <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          {isAuthenticated && (
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={() => onEdit(post)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(post.id)}>
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

