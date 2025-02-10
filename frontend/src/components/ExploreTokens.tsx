'use client';
import { supportedChains } from '@/utils/chain';
import { APIResponse, http } from '@/utils/http';
import { Button, Card, CardContent, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { Address, isAddress } from 'viem';
import { useAccount } from 'wagmi';
import { AccountConnection } from './AccountConnection';
import { ExploreCard } from './ExploreCard';

type Token = {
  address: Address;
  balance: string;
};

type Props = {
  chainId: number;
};

export const ExploreTokens = ({ chainId }: Props) => {
  const { address } = useAccount();

  const tokens = useQuery({
    enabled: address && isAddress(address) && supportedChains.includes(chainId as (typeof supportedChains)[number]),
    queryKey: ['explore', address, chainId],
    queryFn: async () => {
      invariant(address, 'Expected address to be a string');

      const res = await http.post<APIResponse<{ tokens: Token[] }>>('/explore', {
        address,
        chainId,
      });

      return res.data.responseObject;
    },
  });

  if (!address) {
    return (
      <Card sx={{ width: { xs: '100%', md: 320 } }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography>Connect account to start exploring your ERC20 tokens</Typography>

          <AccountConnection />
        </CardContent>
      </Card>
    );
  }

  if (tokens.status === 'error') {
    return (
      <Card sx={{ width: { xs: '100%', md: 320 } }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography>Unable to load tokens</Typography>

          <Button variant="text" onClick={() => tokens.refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (tokens.status === 'pending') {
    return (
      <Card sx={{ width: { xs: '100%', md: 320 } }}>
        <CardContent>Loading tokens...</CardContent>
      </Card>
    );
  }

  return (
    <>
      {tokens.data.tokens.map((token) => (
        <ExploreCard key={token.address + chainId} address={token.address} chainId={chainId} balance={token.balance} />
      ))}
    </>
  );
};
