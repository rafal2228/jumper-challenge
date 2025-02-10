'use client';
import { APIResponse, http } from '@/utils/http';
import { Button, Card, CardContent, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { Address, isAddress } from 'viem';
import { useAccount } from 'wagmi';
import { AccountConnection } from './AccountConnection';
import { TokenCard } from './TokenCard';

type Token = {
  address: Address;
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
  logoUrl: string | null;
};

type Watchlist = {
  holdings: Array<{
    address: Address;
    amount: string;
    token: Token;
  }>;
};

export const Watchlist = () => {
  const { address } = useAccount();
  const watchlist = useQuery({
    enabled: address && isAddress(address),
    queryKey: ['watchlist', address],
    queryFn: async () => {
      invariant(address, 'Expected address to be a string');

      const res = await http.get<APIResponse<Watchlist>>(`/watchlists/${address}`);

      return res.data.responseObject;
    },
  });

  if (!address) {
    return (
      <Card sx={{ width: { xs: '100%', md: 320 } }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography>Connect account to start creating a watchlist</Typography>

          <AccountConnection />
        </CardContent>
      </Card>
    );
  }

  if (watchlist.status === 'error') {
    return (
      <Card sx={{ width: { xs: '100%', md: 320 } }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography>Unable to load watchlist</Typography>

          <Button variant="text" onClick={() => watchlist.refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (watchlist.status === 'pending') {
    return (
      <Card sx={{ width: { xs: '100%', md: 320 } }}>
        <CardContent>Loading watchlist...</CardContent>
      </Card>
    );
  }

  return (
    <>
      {watchlist.data.holdings.map((holding) => (
        <TokenCard
          key={holding.token.address + holding.token.chainId}
          address={holding.token.address}
          name={holding.token.name}
          chainId={holding.token.chainId}
          symbol={holding.token.symbol}
          balance={holding.amount}
          decimals={holding.token.decimals}
          logoUrl={holding.token.logoUrl}
        />
      ))}
    </>
  );
};
