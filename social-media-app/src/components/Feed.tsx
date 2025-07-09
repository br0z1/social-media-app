import { Box, Typography } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import Post from './Post';
import type { Post as PostType } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface FeedProps {
  selectedSphere: string | null;
  sphereCoordinates?: {
    center: {
      lat: number;
      lng: number;
    };
    radius: number;
  };
}

const Feed = ({ selectedSphere, sphereCoordinates }: FeedProps) => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noMorePosts, setNoMorePosts] = useState(false);
  const [seenPostIds, setSeenPostIds] = useState<Set<string>>(new Set());
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useRef<HTMLDivElement>(null);

  // Debug logging for state changes
  useEffect(() => {
  }, [selectedSphere, posts.length, isLoading, noMorePosts, seenPostIds.size]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (noMorePosts) return;

    const observerInstance = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoading && !noMorePosts) {
          console.log('🚀 Loading more posts...');
          loadMorePosts();
        }
      },
      { threshold: 0.5 }
    );

    // Store observer in ref so we can access it in other effects
    observer.current = observerInstance;

    // Observe the last post if it exists
    if (lastPostRef.current) {
      observerInstance.observe(lastPostRef.current);
    }

    return () => {
      observerInstance.disconnect();
      observer.current = null;
    };
  }, [noMorePosts]);

  // Update observer target when posts change
  useEffect(() => {
    if (observer.current && lastPostRef.current && !noMorePosts) {
      // Disconnect from previous target and observe new last post
      observer.current.disconnect();
      observer.current.observe(lastPostRef.current);
    }
  }, [posts.length, noMorePosts]);

  // Load more posts
  const loadMorePosts = async () => {
    if (!selectedSphere || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/posts/next-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sphereId: selectedSphere,
          count: 7,
          coordinates: sphereCoordinates
        })
      });

      if (!response.ok) {
        console.error('❌ Failed to load posts:', response.status, response.statusText);
        throw new Error('Failed to fetch posts');
      }

      const newPosts = await response.json();
      
      if (newPosts.length === 0) {
        console.log('📄 No more posts available');
        setNoMorePosts(true);
      } else {
        // Filter out posts we've already seen
        const uniqueNewPosts = newPosts.filter(
          (post: PostType) => !seenPostIds.has(post.id)
        );

        // If no unique posts after filtering, treat as "no more posts"
        if (uniqueNewPosts.length === 0) {
          console.log('📄 No new unique posts, reached end of feed');
          setNoMorePosts(true);
          return;
        }

        // Update seen posts set
        const newSeenPostIds = new Set(seenPostIds);
        uniqueNewPosts.forEach((post: PostType) => newSeenPostIds.add(post.id));
        setSeenPostIds(newSeenPostIds);

        console.log(`📝 Added ${uniqueNewPosts.length} new posts (total: ${posts.length + uniqueNewPosts.length})`);
        setPosts(prev => [...prev, ...uniqueNewPosts]);
      }
    } catch (error) {
      console.error('❌ Error loading more posts:', error);
      // On error, also set noMorePosts to prevent infinite retries
      setNoMorePosts(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset feed when sphere changes
  useEffect(() => {
    if (selectedSphere) {
      console.log(`🌍 Loading posts for ${selectedSphere}`);
      // Reset state
      setPosts([]);
      setSeenPostIds(new Set());
      setNoMorePosts(false);
      setIsLoading(false);
      
      // Load initial posts
      loadMorePosts();
    }
  }, [selectedSphere]);

  if (!selectedSphere) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center'
      }}>
        <Typography variant="h6" color="text.secondary">
          Select a sphere to see posts
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: 'min(85%, 480px)',  // Changed from 600px to 500px
      mx: 'auto',
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      p: 2,
      height: '100%',
      overflow: 'auto'
    }}>
      {posts.map((post, index) => (
        <Box
          key={post.id}
          ref={index === posts.length - 1 ? lastPostRef : null}
          sx={{ 
            mb: 2,
            width: '100%'
          }}
        >
          <Post post={post} state="populated" />
        </Box>
      ))}
      {isLoading && (
        <Box sx={{ p: 2 }}>
          <Typography>Loading more posts...</Typography>
        </Box>
      )}
      {noMorePosts && (
        <Box sx={{ p: 2 }}>
          <Typography>No more posts to load</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Feed; 