'use client';
import { ExploreTokens } from '@/components/ExploreTokens';
import { NetworkSelect } from '@/components/NetworkSelect';
import { Box, Container, Typography } from '@mui/material';
import { useState } from 'react';

export default function Explore() {
  const [chainId, setChainId] = useState(1);

  return (
    <Container maxWidth="xl" sx={{ marginLeft: 'unset', marginRight: 'unset' }}>
      <Box paddingY={2} flexDirection="column" display="flex" gap={2}>
        <Typography component="h1" variant="h5">
          Explore ERC20 tokens at:
        </Typography>

        <NetworkSelect
          value={chainId}
          onChange={(event) => setChainId(Number(event.target.value))}
          variant="standard"
          size="small"
        />

        <Box display="flex" flexWrap="wrap" gap={2} marginBlockStart={2}>
          <ExploreTokens chainId={chainId} />
        </Box>
      </Box>
    </Container>
  );
}
