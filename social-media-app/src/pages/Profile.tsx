import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Card, CardContent, CardHeader, Avatar, Grid } from '@mui/material';

const Profile = () => {
  const { username } = useParams();

  // Mock user data
  const user = {
    name: 'John Doe',
    bio: 'Software Developer | Coffee Lover',
    posts: [
      {
        id: 1,
        content: 'Working on my new project!',
        timestamp: '1 day ago',
      },
      {
        id: 2,
        content: 'Just had a great cup of coffee ☕',
        timestamp: '3 days ago',
      },
    ],
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ width: 100, height: 100, mr: 2 }}>{user.name[0]}</Avatar>
          <Box>
            <Typography variant="h4" component="h1">
              {user.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              @{username}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body1">{user.bio}</Typography>
      </Box>

      <Typography variant="h5" gutterBottom>
        Posts
      </Typography>
      <Grid container spacing={3}>
        {user.posts.map((post) => (
          <Grid item xs={12} key={post.id}>
            <Card>
              <CardHeader
                avatar={<Avatar>{user.name[0]}</Avatar>}
                title={user.name}
                subheader={post.timestamp}
              />
              <CardContent>
                <Typography variant="body1">{post.content}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Profile; 