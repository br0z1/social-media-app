import { Container } from '@mui/material';
import Feed from '../components/Feed';

export default function Home() {
  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Feed />
    </Container>
  );
} 