import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';

interface BlogPost {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  read_time: string;
  date?: string; // Optional since it's computed
  created_at?: string;
}

interface BlogPostFormProps {
  post?: BlogPost;
  onSubmit: (post: Omit<BlogPost, 'id' | 'created_at' | 'date'>) => void;
  onAuthRequest: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BlogPostForm({ post, onSubmit, onAuthRequest, isOpen, onOpenChange }: BlogPostFormProps) {
  const [formData, setFormData] = useState<Omit<BlogPost, 'id' | 'created_at' | 'date'>>({
    title: '',
    excerpt: '',
    content: '',
    slug: '',
    read_time: '',
    ...(post || {}),
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        slug: '',
        read_time: '',
        ...(post || {}),
      });
    }
  }, [isOpen, post]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      onAuthRequest();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          {post ? 'Edit Post' : 'Add New Post'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? 'Edit Blog Post' : 'Add New Blog Post'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter post title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              placeholder="Enter post slug"
              value={formData.slug}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              placeholder="Enter post excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              required
              className="h-20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Write your blog post content here"
              value={formData.content}
              onChange={handleChange}
              required
              className="h-64"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="read_time">Read Time</Label>
            <Input
              id="read_time"
              name="read_time"
              placeholder="e.g., 5 min read"
              value={formData.read_time}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            {post ? 'Update Post' : 'Add Post'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
