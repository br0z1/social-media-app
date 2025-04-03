import { Paper, Box, Typography, Fab } from '@mui/material';

const BottomBar = () => {
  const BAR_HEIGHT = 56; // Match with Navbar height
  const BUTTON_SIZE = Math.round(BAR_HEIGHT * 0.8);

  return (
    <>
      {/* Floating Button */}
      <Fab
        sx={{
          position: 'fixed',
          bottom: BAR_HEIGHT/2,
          left: '50%',
          transform: 'translateX(-50%)',
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          bgcolor: 'white',
          border: '1px solid #8BC2A9',
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            bgcolor: 'white',
          },
          zIndex: 1000,
        }}
      />

      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0,
          bgcolor: '#BEFFE1',
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          height: BAR_HEIGHT,
          zIndex: 999,
        }} 
        elevation={0}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            height: '100%',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontFamily: "'Kosugi', sans-serif",
              fontSize: '1.5rem',
            }}
          >
            YOUR SPHERE
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "'Kosugi', sans-serif",
              fontSize: '1.5rem',
            }}
          >
            BEDSTUY, BK
          </Typography>
        </Box>
      </Paper>
    </>
  );
};

export default BottomBar; 