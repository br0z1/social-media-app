import { useState, useRef } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Close as CloseIcon, AddPhotoAlternate } from '@mui/icons-material';
import imageCompression from 'browser-image-compression';
import { LocationMapSelector } from './LocationMapSelector';
import { usePosts } from '../context/PostsContext';

const ModalContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '600px',
  height: '70vh',
  backgroundColor: 'white',
  borderRadius: '14px',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  outline: 'none',
}));

const BackdropOverlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  // Temporarily remove backdrop blur
  // backdropFilter: 'blur(5px)',
});

const MediaPreviewContainer = styled(Box)({
  width: '100%',
  height: '40%',
  borderRadius: '14px',
  border: '2px dashed #8BC2A9',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  cursor: 'pointer',
  overflow: 'hidden',
  position: 'relative',
});

const MediaPreviewGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
  gap: '8px',
  width: '100%',
  height: '100%',
  padding: '8px',
  overflowY: 'auto',
});

const MediaPreviewItem = styled(Box)({
  position: 'relative',
  aspectRatio: '1',
  borderRadius: '8px',
  overflow: 'hidden',
  '& img, & video': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
}

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function CreatePostModal({ open, onClose }: CreatePostModalProps) {
  const { refreshPosts } = usePosts();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<{ getCurrentCenter: () => { lat: number; lng: number } }>(null);

  const isValid = mediaFiles.length > 0 || content.trim().length > 0;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + mediaFiles.length > 5) {
      alert('Maximum 5 files allowed');
      return;
    }

    setIsLoading(true);
    try {
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          let processedFile = file;
          let preview = '';

          if (file.type.startsWith('image/')) {
            if (file.size > 2 * 1024 * 1024) { // If larger than 2MB
              processedFile = await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
              });
            }
            preview = URL.createObjectURL(processedFile);
            return {
              file: processedFile,
              preview,
              type: 'image' as const,
            };
          } else if (file.type.startsWith('video/')) {
            preview = URL.createObjectURL(file);
            return {
              file,
              preview,
              type: 'video' as const,
            };
          }
          throw new Error('Unsupported file type');
        })
      );

      setMediaFiles(prev => [...prev, ...processedFiles]);
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Error processing some files');
    } finally {
      setIsLoading(false);
    }
  };

  const generateFileName = (lat: number, lng: number, timestamp: string, hasMedia: boolean) => {
    // Format coordinates: replace periods with 'p' and negatives with 'n'
    const formatCoordinate = (coord: number) => {
      const str = coord.toString();
      return str.replace('.', 'p').replace('-', 'n');
    };
    
    const formattedLat = formatCoordinate(lat);
    const formattedLng = formatCoordinate(lng);
    
    // Format timestamp to HHMMSS_MMDD
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const formattedTime = `${hours}${minutes}${seconds}_${month}${day}`;
    
    // Set engagement to low by default
    const engagement = 'l';
    
    // Set file type indicator
    const fileType = hasMedia ? 'm' : 't';
    
    // Set default file size
    const fileSize = '1p5mb';
    
    return `${formattedLat}_${formattedLng}_${formattedTime}_${engagement}_${fileType}_${fileSize}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setIsLoading(true);
      
      // Get coordinates from the map
      const center = mapRef.current?.getCurrentCenter();
      if (!center) {
        throw new Error('Please select a location on the map');
      }

      console.log('📍 Map coordinates:', center);

      // Create form data
      const formData = new FormData();
      formData.append('content', content);
      formData.append('coordinates', JSON.stringify({
        lat: center.lat,
        lng: center.lng
      }));
      
      // Add media files if any
      if (mediaFiles.length > 0) {
        mediaFiles.forEach(file => {
          console.log('📁 Adding media file:', file.file.name, file.file.type);
          formData.append('media', file.file);
        });
      }

      // Add author information (hardcoded for now)
      formData.append('authorId', 'edgar');
      formData.append('authorUsername', 'edgar');
      formData.append('authorProfileImage', 'https://spheres-s3-media.s3.us-east-2.amazonaws.com/test-user/first-profile.jpg');
      formData.append('subjectCategory', 'general');  // Add default subject category

      console.log('📤 Sending request to:', `${API_URL}/api/posts`);
      console.log('📝 Form data contents:', {
        content,
        coordinates: { lat: center.lat, lng: center.lng },
        mediaCount: mediaFiles.length,
        authorId: 'edgar'
      });

      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.error || 'Failed to create post');
      }

      const responseData = await response.json();
      console.log('✅ Post created successfully:', responseData);
      
      // Refresh posts and close modal
      refreshPosts();
      onClose();
      
      // Clear form
      setContent('');
      setMediaFiles([]);
    } catch (error) {
      console.error('❌ Error creating post:', error);
      alert(error instanceof Error ? error.message : 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMediaFiles([]);
    setContent('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="create-post-modal"
      BackdropComponent={() => <BackdropOverlay />}
    >
      <ModalContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontFamily="Kosugi">
            Create Post
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
        />

        <MediaPreviewContainer onClick={() => fileInputRef.current?.click()}>
          {mediaFiles.length > 0 ? (
            <MediaPreviewGrid>
              {mediaFiles.map((file, index) => (
                <MediaPreviewItem key={index}>
                  {file.type === 'image' ? (
                    <img src={file.preview} alt={`Preview ${index + 1}`} />
                  ) : (
                    <video src={file.preview} controls />
                  )}
                </MediaPreviewItem>
              ))}
            </MediaPreviewGrid>
          ) : (
            <>
              <AddPhotoAlternate sx={{ fontSize: 40, color: '#8BC2A9' }} />
              <Typography variant="body1" color="text.secondary">
                Click to add photos or videos
              </Typography>
            </>
          )}
        </MediaPreviewContainer>

        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Write something..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          variant="outlined"
        />

        <LocationMapSelector
          onLocationSelect={(location) => {
            console.log('Location selected:', location);
          }}
          defaultCenter={{ lat: 40.7128, lng: -74.0060 }}
          isVisible={open}
          ref={mapRef}
        />

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          sx={{
            backgroundColor: '#8BC2A9',
            '&:hover': {
              backgroundColor: '#7ab098',
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Post'}
        </Button>
      </ModalContent>
    </Modal>
  );
} 