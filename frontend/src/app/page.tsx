import { TokenForm } from '@/components/TokenForm';
import { Watchlist } from '@/components/Watchlist';
import { Box, Container, Typography } from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth="xl">
      <Box paddingY={2}>
        <Typography component="h1" variant="h5" marginBlockEnd={2}>
          My ERC20 watchlist:
        </Typography>

        <Box display="flex" flexWrap="wrap" gap={2}>
          <Watchlist />

          <TokenForm />
        </Box>
      </Box>
    </Container>
  );
}
