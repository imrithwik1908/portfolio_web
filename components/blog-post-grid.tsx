'use client';

import { motion } from 'framer-motion';
import { BlogPostCard } from './blog-post-card';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  read_time: string;
  created_at: string;
  date: string;
}

interface BlogPostGridProps {
  posts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
  isAuthenticated: boolean;
}

export function BlogPostGrid({ posts, onEdit, onDelete, isAuthenticated }: BlogPostGridProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <BlogPostCard
            post={post}
            onEdit={() => onEdit(post)}
            onDelete={() => onDelete(post.id)}
            isAuthenticated={isAuthenticated}
          />
        </motion.div>
      ))}
    </div>
  );
}
