import { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, Backdrop } from '@mui/material';
import { styled } from '@mui/material/styles';

const ModalContent = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '400px',
  backgroundColor: 'white',
  borderRadius: '14px',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  outline: 'none',
  zIndex: 1300,
});

const BlurredBackdrop = styled(Backdrop)({
  backdropFilter: 'blur(20px)',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function BetaAccessModal() {
  const [open, setOpen] = useState(true);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user already has access
    const hasAccess = localStorage.getItem('betaAccess');
    if (hasAccess === 'true') {
      setOpen(false);
    }
  }, []);

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${API_URL}/api/verify-beta-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.reset) {
          // If this is the admin reset code, clear all local storage
          localStorage.clear();
          setError('All users must re-enter the beta code');
          return;
        }
        localStorage.setItem('betaAccess', 'true');
        setOpen(false);
      } else {
        setError('Invalid code. Please try again.');
      }
    } catch (err) {
      setError('Error verifying code. Please try again.');
    }
  };

  return (
    <Modal
      open={open}
      aria-labelledby="beta-access-modal"
      disableEscapeKeyDown
      disablePortal
      slots={{ backdrop: BlurredBackdrop }}
    >
      <ModalContent>
        <Typography variant="h5" fontFamily="Kosugi" textAlign="center">
          Spheres is in Closed Beta
        </Typography>
        <Typography variant="body1" textAlign="center">
          Input your invite code to access
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Enter code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          error={!!error}
          helperText={error}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            bgcolor: '#8BC2A9',
            '&:hover': {
              bgcolor: '#7AB299',
            },
            borderRadius: '8px',
            padding: '8px 24px',
          }}
        >
          Open Spheres
        </Button>
      </ModalContent>
    </Modal>
  );
} 