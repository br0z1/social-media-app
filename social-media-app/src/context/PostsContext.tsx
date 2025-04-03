import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Post } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface PostsContextType {
  posts: Post[];
  refreshPosts: () => Promise<void>;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);

  const refreshPosts = async () => {
    try {
      console.log('PostsContext: Fetching posts from server...');
      const response = await fetch(`${API_URL}/api/posts`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      console.log('PostsContext: Received posts from server:', JSON.stringify(data, null, 2));
      setPosts(data);
      console.log('PostsContext: Updated posts state:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('PostsContext: Error fetching posts:', error);
    }
  };

  useEffect(() => {
    console.log('PostsContext: Initial fetch of posts');
    refreshPosts();
  }, []);

  return (
    <PostsContext.Provider value={{ posts, refreshPosts }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
} 