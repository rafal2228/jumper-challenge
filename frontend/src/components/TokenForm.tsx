'use client';
import { useAuth } from '@/auth';
import { getBlockExplorerUrl, supportedChains } from '@/utils/chain';
import { authHttp, isAPIError } from '@/utils/http';
import { zodResolver } from '@hookform/resolvers/zod';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { Box, Button, Card, CardContent, Link, TextField, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { Address, erc20Abi, formatUnits, isAddress } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';
import { z } from 'zod';
import { AccountConfirmation } from './AccountConfirmation';
import { AccountConnection } from './AccountConnection';

const schema = z.object({
  tokenAddress: z.string().refine((value) => isAddress(value) as unknown as string, 'Invalid address'),
  tokenChainId: z.coerce
    .number()
    .int()
    .refine((value) => supportedChains.includes(value as (typeof supportedChains)[number]), 'Unsupported chain'),
});

const useAddToWatchlist = () => {
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

export const TokenForm = () => {
  const { address } = useAccount();
  const auth = useAuth();
  const addToWatchlist = useAddToWatchlist();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      tokenAddress: '',
      tokenChainId: 1,
    },
  });

  const formTokenAddress = watch('tokenAddress');
  const tokenAddress = isAddress(formTokenAddress) ? formTokenAddress : undefined;

  const formTokenChainId = watch('tokenChainId');
  const tokenChainId = supportedChains.includes(+formTokenChainId as (typeof supportedChains)[number])
    ? +formTokenChainId
    : undefined;

  const explorerUrl =
    tokenAddress && typeof tokenChainId === 'number' ? getBlockExplorerUrl(tokenAddress, tokenChainId) : undefined;

  const metadata = useReadContracts({
    query: {
      enabled: !!address && !!tokenAddress && !!tokenChainId,
    },
    contracts: [
      {
        abi: erc20Abi,
        address: tokenAddress,
        functionName: 'name',
        chainId: tokenChainId,
      },
      {
        abi: erc20Abi,
        address: tokenAddress,
        functionName: 'symbol',
        chainId: tokenChainId,
      },
      {
        abi: erc20Abi,
        address: tokenAddress,
        functionName: 'decimals',
        chainId: tokenChainId,
      },
      {
        abi: erc20Abi,
        address: tokenAddress,
        functionName: 'balanceOf',
        chainId: tokenChainId,
        args: [address!],
      },
    ],
  });
  const [name, symbol, decimals, balance] = metadata.data ?? [];

  const renderSubmit = () => {
    if (!address) {
      return <AccountConnection />;
    }

    if (auth.address !== address) {
      return <AccountConfirmation />;
    }

    return (
      <Button variant="contained" color="primary" type="submit" disabled={addToWatchlist.isPending}>
        Add
      </Button>
    );
  };

  return (
    <Card
      sx={{ width: { xs: '100%', md: 320 } }}
      component="form"
      onSubmit={handleSubmit(async (data) => {
        if (!address) {
          return;
        }

        try {
          await addToWatchlist.mutateAsync({
            address: address,
            tokenAddress: data.tokenAddress as Address,
            tokenChainId: data.tokenChainId,
          });

          reset();
        } catch {
          //
        }
      })}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box display="flex" gap={2}>
          <Box display="flex" alignItems="center" justifyContent="center">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              width={56}
              height={56}
              borderRadius={9999}
              sx={{ backgroundColor: grey[200] }}
            >
              <MonetizationOnIcon width={32} height={32} />
            </Box>
          </Box>

          <Box>
            <Typography variant="h6" component="h2">
              {name?.status === 'success' ? name.result : 'Watch new token'}
            </Typography>

            <Typography variant="body1" component="p">
              {symbol?.status === 'success' ? symbol.result : 'Specify ERC20 token details'}
            </Typography>
          </Box>
        </Box>

        <TextField
          variant="standard"
          label="Address"
          {...register('tokenAddress')}
          error={!!errors.tokenAddress}
          helperText={errors.tokenAddress?.message}
        />

        <TextField
          variant="standard"
          label="Network ID"
          type="number"
          {...register('tokenChainId')}
          error={!!errors.tokenChainId}
          helperText={errors.tokenChainId?.message}
        />

        <Typography variant="body1" component="p">
          Current balance:{' '}
          {formatUnits(
            balance?.status === 'success' ? balance.result : BigInt(0),
            decimals?.status === 'success' ? decimals.result : 0,
          )}{' '}
          {symbol?.status === 'success' ? symbol.result : ''}
        </Typography>

        {explorerUrl && (
          <Link href={explorerUrl} target="_blank" rel="noopener noreferrer">
            See on block explorer
          </Link>
        )}

        {renderSubmit()}
      </CardContent>
    </Card>
  );
};
