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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BetaAccessModal />
      <PostsProvider>
        <Router>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh',
            width: '100vw',
            bgcolor: 'background.default',
            pt: '56px', // Height of the navbar
          }}>
            <Navbar onAddPost={() => setIsCreatePostOpen(true)} />
            <Container 
              component="main" 
              sx={{ 
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 2,
                pb: 7,
              }}
              maxWidth={false}
            >
              <Box sx={{ 
                width: '100%', 
                maxWidth: 500,
                margin: '0 auto',
              }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/profile/:username" element={<Profile />} />
                  <Route path="/login" element={<Login />} />
                </Routes>
              </Box>
            </Container>
            <BottomBar />
          </Box>

          <CreatePostModal
            open={isCreatePostOpen}
            onClose={() => setIsCreatePostOpen(false)}
          />
        </Router>
      </PostsProvider>
    </ThemeProvider>
  );
}

export default App;
