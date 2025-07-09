import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, IconButton, Avatar, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import type { Post as PostType } from '../types';
import LocationMapView from './LocationMapView';
import LoadingPost from './LoadingPost';
import CommentPage from './CommentPage';
import { usePosts } from '../context/PostsContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Styled components with responsive dimensions
const PostContainer = styled(Paper)<{ hasMedia?: boolean }>(({ theme, hasMedia }) => ({
  width: '100%',
  height: hasMedia ? '80vh' : 'auto',
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  padding: '2vh',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  border: '2px solid #8BC2A9',
  borderRadius: '14px',
  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
}));

const ImageSection = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '60%',
  overflow: 'hidden',
  borderRadius: '14px',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '14px',
  },
});

const OverlayBar = styled(Box)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'rgba(218, 218, 218, 0.25)',
  padding: '1vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  color: 'white',
  borderBottomLeftRadius: '14px',
  borderBottomRightRadius: '14px',
});

const TextSection = styled(Box)<{ hasMedia?: boolean }>(({ hasMedia }) => ({
  padding: hasMedia ? '2vh 0' : '1vh 0',
  flexGrow: hasMedia ? 1 : 0,
  overflow: 'hidden',
  '& .MuiTypography-root': {
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: 300,
  }
}));

const LocationSection = styled(Box)<{ hasMedia?: boolean }>(({ theme, hasMedia }) => ({
  padding: hasMedia ? '1vh' : '0 1vh 1vh 1vh',
  display: 'flex',
  flexDirection: 'column',
  gap: '1vh',
  color: theme.palette.text.secondary,
  '& .location-name': {
    fontFamily: "'Kosugi', sans-serif",
  }
}));

// New styled component for text-only posts
const ProfileSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1vh 0',
});

interface PostProps {
  post: PostType;
  state: 'populated' | 'loading' | 'assigned' | 'unassigned';
}

const MAX_LINES = 3;
const LINE_HEIGHT = 1.5;

const Post = ({ post, state }: PostProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCommentPageOpen, setIsCommentPageOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(post);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const { refreshPosts } = usePosts();

  // Update currentPost when post prop changes
  useEffect(() => {
    setCurrentPost(post);
  }, [post]);

  // Handler for when a comment is added
  const handleCommentAdded = () => {
    // Immediately update the comment count
    setCurrentPost(prevPost => ({
      ...prevPost,
      engagement: {
        ...prevPost.engagement,
        commentCount: (prevPost.engagement.commentCount || 0) + 1
      }
    }));
    
    // Also refresh all posts for consistency
    refreshPosts();
  };

  // Handler for like/unlike
  const handleLike = async () => {
    if (isLiking) return; // Prevent double-clicking
    
    setIsLiking(true);
    const wasLiked = isLiked;
    const newLikeCount = wasLiked 
      ? (currentPost.engagement.likes || 0) - 1 
      : (currentPost.engagement.likes || 0) + 1;
    
    // Optimistic update
    setIsLiked(!wasLiked);
    setCurrentPost(prevPost => ({
      ...prevPost,
      engagement: {
        ...prevPost.engagement,
        likes: newLikeCount
      }
    }));
    
    try {
      const endpoint = wasLiked 
        ? `${API_URL}/api/posts/${currentPost.postId || currentPost.id}/like`
        : `${API_URL}/api/posts/${currentPost.postId || currentPost.id}/like`;
      
      const method = wasLiked ? 'DELETE' : 'POST';
      
      console.log(`${wasLiked ? '💔' : '❤️'} ${wasLiked ? 'Unliking' : 'Liking'} post:`, currentPost.postId || currentPost.id);
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'edgar' // TODO: Get from auth context
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${wasLiked ? 'unlike' : 'like'} post`);
      }
      
      console.log(`✅ Successfully ${wasLiked ? 'unliked' : 'liked'} post`);
      
    } catch (error) {
      console.error(`❌ Error ${wasLiked ? 'unliking' : 'liking'} post:`, error);
      
      // Revert optimistic update on error
      setIsLiked(wasLiked);
      setCurrentPost(prevPost => ({
        ...prevPost,
        engagement: {
          ...prevPost.engagement,
          likes: wasLiked ? newLikeCount + 1 : newLikeCount - 1
        }
      }));
      
      alert(`Failed to ${wasLiked ? 'unlike' : 'like'} post. Please try again.`);
    } finally {
      setIsLiking(false);
    }
  };
  
  // Enhanced debugging for post data
  useEffect(() => {
    console.log('📝 Post render:', {
      id: currentPost.id,
      state,
      content: currentPost.content,
      hasLocation: !!currentPost.coordinates,
      rawLocation: currentPost.coordinates,
      coordinates: currentPost.coordinates,
      locationStructure: currentPost.coordinates && {
        keys: Object.keys(currentPost.coordinates),
        coordinateKeys: currentPost.coordinates ? Object.keys(currentPost.coordinates) : null,
        isDoubleNested: !!(currentPost.coordinates && 'coordinates' in currentPost.coordinates)
      },
      timestamp: currentPost.timestamp,
      author: {
        username: currentPost.authorUsername,
        profileImage: currentPost.authorProfileImage
      },
      engagement: currentPost.engagement
    });
  }, [currentPost, state]);

  // Calculate if text needs "See more" button
  const textRef = document.createElement('div');
  textRef.style.width = '100%';
  textRef.style.position = 'absolute';
  textRef.style.visibility = 'hidden';
  textRef.style.lineHeight = `${LINE_HEIGHT}em`;
  textRef.innerText = currentPost.content || '';
  document.body.appendChild(textRef);
  const needsSeeMore = textRef.offsetHeight > (LINE_HEIGHT * MAX_LINES * 16);
  document.body.removeChild(textRef);

  // Check if post has media
  const hasMedia = currentPost.mediaUrls && currentPost.mediaUrls.length > 0 && currentPost.mediaUrls[0]?.url;
  const mediaUrl = hasMedia ? currentPost.mediaUrls[0] : null;
  
  // Memoize coordinates to prevent unnecessary LocationMapView re-renders
  const stableCoordinates = useMemo(() => {
    return currentPost.coordinates;
  }, [currentPost.coordinates?.lat, currentPost.coordinates?.lng]);

  // Only render loading state for now
  if (state === 'loading') {
    return <LoadingPost />;
  }

  // For other states, we'll implement them later
  if (state !== 'populated') {
    return null;
  }

  console.log('Post data:', currentPost);
  console.log('Post coordinates:', currentPost.coordinates);

  return (
    <PostContainer elevation={0} hasMedia={!!hasMedia}>
      {/* Only render ImageSection if post has media */}
      {hasMedia && mediaUrl && (
        <ImageSection>
          <img src={mediaUrl.url} alt="Post content" />
                     <OverlayBar>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <Avatar 
                 src={currentPost.authorProfileImage} 
                 sx={{ 
                   width: 32, 
                   height: 32,
                   border: '2px solid white',
                 }}
               />
               <Typography 
                 variant="subtitle2" 
                 sx={{ 
                   color: 'white',
                   fontWeight: 500,
                 }}
               >
                 {currentPost.authorUsername}
               </Typography>
             </Box>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
               <Box sx={{ display: 'flex', alignItems: 'center' }}>
                 <IconButton 
                   size="small" 
                   sx={{ color: isLiked ? '#8BC2A9' : 'white' }}
                   onClick={handleLike}
                   disabled={isLiking}
                 >
                   {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                 </IconButton>
                 <Typography sx={{ color: 'white' }}>{currentPost.engagement.likes}</Typography>
               </Box>
               <Box sx={{ display: 'flex', alignItems: 'center' }}>
                 <IconButton 
                   size="small" 
                   sx={{ color: 'white' }}
                   onClick={() => setIsCommentPageOpen(true)}
                 >
                   <ChatBubbleOutlineIcon />
                 </IconButton>
                 <Typography sx={{ color: 'white' }}>{currentPost.engagement.commentCount}</Typography>
               </Box>
             </Box>
           </OverlayBar>
        </ImageSection>
      )}

      {/* For text-only posts, show profile section separately */}
      {!hasMedia && (
        <ProfileSection>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              src={currentPost.authorProfileImage} 
              sx={{ 
                width: 32, 
                height: 32,
                border: '2px solid black',
              }}
            />
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: 'black',
                fontWeight: 500,
              }}
            >
              {currentPost.authorUsername}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                size="small" 
                sx={{ color: isLiked ? '#8BC2A9' : 'black' }}
                onClick={handleLike}
                disabled={isLiking}
              >
                {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <Typography sx={{ color: 'black' }}>{currentPost.engagement.likes}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                size="small" 
                sx={{ color: 'black' }}
                onClick={() => setIsCommentPageOpen(true)}
              >
                <ChatBubbleOutlineIcon />
              </IconButton>
              <Typography sx={{ color: 'black' }}>{currentPost.engagement.commentCount}</Typography>
            </Box>
          </Box>
        </ProfileSection>
      )}

      <TextSection hasMedia={!!hasMedia}>
        <Typography
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: isExpanded ? 'unset' : MAX_LINES,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: `${LINE_HEIGHT}em`,
            color: 'text.primary',
          }}
        >
          {currentPost.content}
        </Typography>
        {needsSeeMore && !isExpanded && (
          <Typography
            onClick={() => setIsExpanded(true)}
            sx={{ 
              color: 'text.secondary', 
              cursor: 'pointer', 
              mt: 1,
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            See more
          </Typography>
        )}
      </TextSection>

      <LocationSection hasMedia={!!hasMedia}>
        {stableCoordinates && (
          <LocationMapView coordinates={stableCoordinates} />
        )}
      </LocationSection>
      
      <CommentPage
        post={currentPost}
        isOpen={isCommentPageOpen}
        onClose={() => setIsCommentPageOpen(false)}
        onCommentAdded={handleCommentAdded}
      />
    </PostContainer>
  );
};

export default Post; 