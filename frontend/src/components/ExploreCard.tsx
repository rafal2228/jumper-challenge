'use client';
import { Address, erc20Abi } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';
import { TokenCard } from './TokenCard';
import { useAddToWatchlist, useIsOnWatchlist } from '@/utils/watchlist';
import { Button } from '@mui/material';
import { useAuth } from '@/auth';
import { AccountConfirmation } from './AccountConfirmation';

type Props = {
  address: Address;
  chainId: number;
  balance: string;
};

export const ExploreCard = ({ address, chainId, balance }: Props) => {
  const account = useAccount();
  const auth = useAuth();
  const isOnWatchlist = useIsOnWatchlist({
    address: account.address as Address,
    tokenAddress: address,
    tokenChainId: chainId,
  });
  const addToWatchlist = useAddToWatchlist();

  const metadata = useReadContracts({
    contracts: [
      {
        abi: erc20Abi,
        address,
        functionName: 'name',
        chainId,
      },
      {
        abi: erc20Abi,
        address,
        functionName: 'symbol',
        chainId,
      },
      {
        abi: erc20Abi,
        address,
        functionName: 'decimals',
        chainId,
      },
    ],
  });

  const [name, symbol, decimals] = metadata.data ?? [];

  return (
    <TokenCard
      address={address}
      chainId={chainId}
      name={name?.status === 'success' ? name.result : name?.status === 'failure' ? 'Unable to load' : 'Loading...'}
      symbol={symbol?.result ?? ''}
      decimals={decimals?.result ?? 0}
      balance={balance}
      logoUrl={null}
      priceInUSD={null}
    >
      <AccountConfirmation />

      {account.address && account.address === auth.address && (
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            addToWatchlist.mutate({
              address: account.address as Address,
              tokenAddress: address,
              tokenChainId: chainId,
            })
          }
          disabled={isOnWatchlist || addToWatchlist.isPending}
        >
          {addToWatchlist.isPending ? 'Adding...' : isOnWatchlist ? 'Already on watchlist' : 'Add to Watchlist'}
        </Button>
      )}
    </TokenCard>
  );
};
