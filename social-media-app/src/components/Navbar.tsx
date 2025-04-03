import { AppBar, Toolbar, IconButton, Badge, Typography } from '@mui/material';
import { Person as PersonIcon, Mail as MailIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const AddPostButton = styled(Typography)(() => ({
  fontFamily: "'Kosugi', sans-serif",
  cursor: 'pointer',
  transition: 'color 0.2s',
  '&:hover': {
    color: 'rgba(0, 0, 0, 0.6)',
  },
}));

interface NavbarProps {
  onAddPost: () => void;
}

const Navbar = ({ onAddPost }: NavbarProps) => {
  return (
    <AppBar 
      position="fixed"
      color="transparent" 
      elevation={0}
      sx={{ 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        bgcolor: '#BEFFE1',
        width: '100%',
      }}
    >
      <Toolbar 
        sx={{ 
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '100%',
          minHeight: '56px !important',
          height: '56px',
        }}
      >
        <IconButton
          edge="start"
          component={RouterLink}
          to="/profile/me"
          sx={{ color: 'text.primary' }}
        >
          <PersonIcon />
        </IconButton>

        <AddPostButton onClick={onAddPost}>
          ADD POST
        </AddPostButton>

        <IconButton
          edge="end"
          sx={{ color: 'text.primary' }}
        >
          <Badge badgeContent={3} color="primary">
            <MailIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 