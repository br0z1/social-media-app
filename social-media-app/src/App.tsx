import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import BottomBar from './components/BottomBar';
import CreatePostModal from './components/CreatePostModal';
import 'leaflet/dist/leaflet.css';
import { PostsProvider } from './context/PostsContext';
import BetaAccessModal from './components/BetaAccessModal';
import Feed from './components/Feed';
import type { Post as PostType } from './types';
import { FeedManagerProvider } from './context/FeedManagerContext';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#8BC2A9', // Green outline color
      light: '#BEFFE1', // Light mint green for bars
    },
    background: {
      default: '#ffffff', // White background
    },
  },
  typography: {
    fontFamily: "'Urbanist', sans-serif",
    h1: {
      fontFamily: "'Kosugi', sans-serif",
    },
    h2: {
      fontFamily: "'Kosugi', sans-serif",
    },
    h3: {
      fontFamily: "'Kosugi', sans-serif",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid #8BC2A9',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        fontFamily: "'Urbanist', sans-serif",
      },
    },
  },
});

function App() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [selectedSphere, setSelectedSphere] = useState<string | null>(null);
  const [sphereCoordinates, setSphereCoordinates] = useState<{
    center: { lat: number; lng: number };
    radius: number;
  } | null>(null);

  // Toggle closed-beta modal via env var
  const betaEnabled = import.meta.env.VITE_BETA_ENABLED === 'true';

  const handleSphereSelect = (location: { displayName: string; coordinates: { center: { lat: number; lng: number }; radius: number } }) => {
    setSelectedSphere(location.displayName);
    setSphereCoordinates(location.coordinates);
  };

  const experimentalFeedManagerEnabled = import.meta.env.VITE_FEED_MANAGER_ENABLED === 'true';

  const AppShell = (
    <Router>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        width: '100vw',
        bgcolor: 'background.default',
      }}>
        <Navbar onAddPost={() => setIsCreatePostOpen(true)} />
        
        <Box sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          mt: '56px', // Height of the navbar
          mb: '56px', // Height of the bottom navigation
          overflow: 'hidden', // Prevent double scrollbars
        }}>
          <Routes>
            <Route path="/" element={
              <Box sx={{ 
                height: '100%',
                overflow: 'auto',
              }}>
                <Feed 
                  selectedSphere={selectedSphere} 
                  sphereCoordinates={sphereCoordinates || undefined}
                />
              </Box>
            } />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Box>

        <CreatePostModal
          open={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
        />

        <BottomBar onSphereSelect={handleSphereSelect} />
      </Box>
    </Router>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {betaEnabled && <BetaAccessModal />}
      <PostsProvider>
        {experimentalFeedManagerEnabled ? (
          <FeedManagerProvider>{AppShell}</FeedManagerProvider>
        ) : (
          AppShell
        )}
      </PostsProvider>
    </ThemeProvider>
  );
}

export default App;
