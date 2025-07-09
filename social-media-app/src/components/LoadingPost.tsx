import { Box, Typography, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

const PostContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '500px',
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  padding: '2vh',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  border: '2px solid #8BC2A9',
  borderRadius: '14px',
  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  backgroundColor: '#f5f5f5', // Light gray background
}));

const HeaderSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1vh',
  borderBottom: '1px solid #e0e0e0',
});

const ContentSection = styled(Box)({
  padding: '2vh',
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100px', // Minimum height for content area
});

const MapSection = styled(Box)({
  height: '200px', // Fixed height for map container
  backgroundColor: '#e0e0e0', // Slightly darker gray for map area
  borderRadius: '8px',
  margin: '1vh',
});

const LoadingDots = styled(Typography)({
  '&::after': {
    content: '"..."',
    animation: 'dots 1.5s steps(5, end) infinite',
  },
  '@keyframes dots': {
    '0%, 20%': { content: '"."' },
    '40%': { content: '".."' },
    '60%, 100%': { content: '"..."' },
  },
});

const LoadingPost = () => {
  return (
    <PostContainer>
      <HeaderSection>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, backgroundColor: '#e0e0e0' }} />
          <Box sx={{ width: '100px', height: '16px', backgroundColor: '#e0e0e0', borderRadius: '4px' }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ width: '40px', height: '24px', backgroundColor: '#e0e0e0', borderRadius: '4px' }} />
          <Box sx={{ width: '40px', height: '24px', backgroundColor: '#e0e0e0', borderRadius: '4px' }} />
        </Box>
      </HeaderSection>

      <ContentSection>
        <LoadingDots variant="body1" sx={{ color: '#9e9e9e' }}>
          Loading
        </LoadingDots>
      </ContentSection>

      <MapSection />
    </PostContainer>
  );
};

export default LoadingPost; 