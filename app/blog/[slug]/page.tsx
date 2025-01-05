'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CalendarIcon, Clock } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { supabase } from '@/lib/supabase'

interface BlogPost {
  id: string
  title: string
  content: string
  created_at: string
  read_time: string
}

export default function BlogPostPage() {
  const [post, setPost] = useState<BlogPost | null>(null)
  const { slug } = useParams()
  const { toast } = useToast()

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .single()

        if (error) throw error
        setPost(data)
      } catch (error) {
        console.error('Error fetching blog post:', error)
        toast({
          title: "Error",
          description: "Failed to fetch blog post. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchPost()
  }, [slug, toast])

  if (!post) {
    return <div className="container mx-auto max-w-3xl px-4 py-16">Loading...</div>
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-8">
        <div className="flex items-center">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <time>{new Date(post.created_at).toLocaleDateString()}</time>
        </div>
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4" />
          <span>{post.read_time}</span>
        </div>
      </div>
      <div className="prose dark:prose-invert max-w-none">
        {post.content}
      </div>
    </div>
  )
}

