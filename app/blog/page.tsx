'use client';

import { useState, useEffect } from 'react';
import { BlogPostGrid } from '@/components/blog-post-grid';
import { BlogPostForm } from '@/components/blog-post-form';
import { useToast } from '@/components/ui/use-toast';
import { AuthPopup } from '@/components/AuthPopup';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

const SESSION_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthPopupOpen, setIsAuthPopupOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchBlogPosts();
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setSession(session);
        localStorage.setItem('sessionExpiry', (Date.now() + SESSION_EXPIRY_TIME).toString());
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        localStorage.removeItem('sessionExpiry');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  });

  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const expiryTime = localStorage.getItem('sessionExpiry');
      if (expiryTime && parseInt(expiryTime) > Date.now()) {
        setSession(data.session);
      } else {
        await supabase.auth.signOut();
      }
    }
  };

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogPosts(data);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch blog posts. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddPost = async (newPost) => {
    if (!session) {
      setIsAuthPopupOpen(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{ ...newPost, user_id: session.user.id }])
        .select();

      if (error) throw error;

      setBlogPosts([data[0], ...blogPosts]);
      setIsFormOpen(false);
      toast({
        title: 'Success',
        description: 'Blog post added successfully!',
      });
    } catch (error) {
      console.error('Error adding blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to add blog post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditPost = async (updatedPost) => {
    if (!session) {
      setIsAuthPopupOpen(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(updatedPost)
        .eq('id', updatedPost.id)
        .select();

      if (error) throw error;

      setBlogPosts(blogPosts.map((post) => (post.id === data[0].id ? data[0] : post)));
      setEditingPost(null);
      toast({
        title: 'Success',
        description: 'Blog post updated successfully!',
      });
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update blog post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePost = async (id) => {
    if (!session) {
      setIsAuthPopupOpen(true);
      return;
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBlogPosts(blogPosts.filter((post) => post.id !== id));
      toast({
        title: 'Success',
        description: 'Blog post deleted successfully!',
      });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete blog post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAuthRequest = () => {
    if (!session) {
      setIsAuthPopupOpen(true);
    } else {
      setIsFormOpen(true);
    }
  };

  const handleAuthSuccess = async () => {
    await checkSession();
    setIsAuthPopupOpen(false);
    setIsFormOpen(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    localStorage.removeItem('sessionExpiry');
    router.push('/');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Blog</h1>
        <div className="flex items-center space-x-4">
          <BlogPostForm
            onSubmit={editingPost ? handleEditPost : handleAddPost}
            onAuthRequest={handleAuthRequest}
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            post={editingPost}
          />
          {session && (
            <Button onClick={handleLogout} variant="ghost" className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          )}
        </div>
      </div>
      <BlogPostGrid
        posts={blogPosts}
        onEdit={(post) => {
          setEditingPost(post);
          setIsFormOpen(true);
        }}
        onDelete={handleDeletePost}
        isAuthenticated={!!session}
      />
      <AuthPopup isOpen={isAuthPopupOpen} onClose={() => setIsAuthPopupOpen(false)} onSuccess={handleAuthSuccess} />
    </div>
  );
}
