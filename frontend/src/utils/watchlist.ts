import { APIResponse, authHttp, http, isAPIError } from '@/utils/http';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import invariant from 'tiny-invariant';
import { Address, isAddress } from 'viem';

type Token = {
  address: Address;
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
  logoUrl: string | null;
  priceInUSD: string | null;
};

type Watchlist = {
  holdings: Array<{
    address: Address;
    amount: string;
    token: Token;
  }>;
};

export const useWatchlist = (address: Address | undefined) => {
  return useQuery({
    enabled: address && isAddress(address),
    queryKey: ['watchlist', address],
    queryFn: async () => {
      invariant(address, 'Expected address to be a string');

      const res = await http.get<APIResponse<Watchlist>>(`/watchlists/${address}`);

      return res.data.responseObject;
    },
  });
};

export const useAddToWatchlist = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ address, ...data }: { address: Address; tokenAddress: Address; tokenChainId: number }) => {
      return authHttp.post(`/watchlists/${address}`, data);
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', data.address] });
    },
    onError: (error) => {
      if (isAPIError(error)) {
        enqueueSnackbar(error.response?.data.message ?? error.message, { variant: 'error' });
      }
    },
  });
};

export const useIsOnWatchlist = ({
  address,
  tokenAddress,
  tokenChainId,
}: {
  address: Address | undefined;
  tokenAddress: Address | undefined;
  tokenChainId: number | undefined;
}) => {
  const watchlist = useWatchlist(address);

  if (!watchlist.data) {
    return false;
  }

  return watchlist.data.holdings.some(
    (holding) => holding.token.address === tokenAddress && holding.token.chainId === tokenChainId,
  );
};
