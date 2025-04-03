import { Box, Typography } from '@mui/material';
import Post from './Post';
import { usePosts } from '../context/PostsContext';
import { useEffect } from 'react';

export default function Feed() {
  const { posts } = usePosts();
  
  useEffect(() => {
    console.log('Feed: Received posts update:', JSON.stringify(posts, null, 2));
  }, [posts]);

  if (!posts || posts.length === 0) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', py: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No posts yet. Be the first to post!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 2 }}>
      {posts.map((post) => {
        console.log('Feed: Rendering post:', JSON.stringify(post, null, 2));
        return (
          <Post key={post.id} post={post} />
        );
      })}
    </Box>
  );
} 