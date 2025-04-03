import { useState } from 'react';
import { Box, Typography, IconButton, Avatar, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import type { Post as PostType } from '../types';
import LocationMapView from './LocationMapView';

// Styled components with responsive dimensions
const PostContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: '600px',
  height: '80vh',
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

const TextSection = styled(Box)({
  padding: '2vh 0',
  flexGrow: 1,
  overflow: 'hidden',
  '& .MuiTypography-root': {
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: 300,
  }
});

const LocationSection = styled(Box)(({ theme }) => ({
  padding: '1vh',
  display: 'flex',
  flexDirection: 'column',
  gap: '1vh',
  color: theme.palette.text.secondary,
  '& .location-name': {
    fontFamily: "'Kosugi', sans-serif",
  }
}));

interface PostProps {
  post: PostType;
}

const MAX_LINES = 3;
const LINE_HEIGHT = 1.5;

export default function Post({ post }: PostProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate if text needs "See more" button
  const textRef = document.createElement('div');
  textRef.style.width = '100%';
  textRef.style.position = 'absolute';
  textRef.style.visibility = 'hidden';
  textRef.style.lineHeight = `${LINE_HEIGHT}em`;
  textRef.innerText = post.content || '';
  document.body.appendChild(textRef);
  const needsSeeMore = textRef.offsetHeight > (LINE_HEIGHT * MAX_LINES * 16);
  document.body.removeChild(textRef);

  // Get the first media file URL if available
  const mediaUrl = post.mediaFiles?.[0]?.url;

  return (
    <PostContainer elevation={0}>
      <ImageSection>
        {mediaUrl && <img src={`http://localhost:3001${mediaUrl}`} alt="Post content" />}
        <OverlayBar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              src={post.author.profileImage} 
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
              {post.author.username}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton size="small" sx={{ color: 'white' }}>
                <FavoriteBorderIcon />
              </IconButton>
              <Typography>{post.likes}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton size="small" sx={{ color: 'white' }}>
                <ChatBubbleOutlineIcon />
              </IconButton>
              <Typography>{post.comments.length}</Typography>
            </Box>
          </Box>
        </OverlayBar>
      </ImageSection>

      <TextSection>
        <Typography
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: isExpanded ? 'unset' : MAX_LINES,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: `${LINE_HEIGHT}em`,
          }}
        >
          {post.content}
        </Typography>
        {needsSeeMore && !isExpanded && (
          <Typography
            onClick={() => setIsExpanded(true)}
            sx={{ color: 'text.secondary', cursor: 'pointer', mt: 1 }}
          >
            See more
          </Typography>
        )}
      </TextSection>

      {post.location && (
        <LocationSection>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon />
            <Typography 
              variant="body2" 
              className="location-name"
            >
              {post.location.name}
            </Typography>
          </Box>
          <LocationMapView coordinates={post.location.coordinates} />
        </LocationSection>
      )}
    </PostContainer>
  );
} 