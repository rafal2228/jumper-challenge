import { formatAddress } from '@/utils/address';
import { getBlockExplorerUrl, getChainName } from '@/utils/chain';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { Box, Card, CardContent, IconButton, Link, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import Image from 'next/image';
import { useSnackbar } from 'notistack';
import { Address, formatUnits } from 'viem';
import { ChainIcon } from './ChainIcon';

const CopyButton = ({ address }: { address: string }) => {
  const { enqueueSnackbar } = useSnackbar();

  return (
    <IconButton
      size="small"
      onClick={() => {
        try {
          navigator.clipboard.writeText(address);
          enqueueSnackbar('Address copied to clipboard', { variant: 'success' });
        } catch (error) {
          enqueueSnackbar('Unable to copy address', { variant: 'error' });
        }
      }}
    >
      <ContentCopyIcon />
    </IconButton>
  );
};

type Props = {
  name: string;
  symbol: string;
  address: Address;
  chainId: number;
  logoUrl: string | null;
  balance: string;
  decimals: number;
};

export const TokenCard = ({ name, symbol, address, chainId, logoUrl, balance, decimals }: Props) => {
  const explorerUrl = getBlockExplorerUrl(address, chainId);
  const chainName = getChainName(chainId);

  return (
    <Card sx={{ width: { xs: '100%', md: 320 } }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box display="flex" gap={2} width="100%">
          <Box display="flex" alignItems="center" justifyContent="center" flex="0 0 auto">
            {logoUrl && (
              <Box width={56} height={56} borderRadius={9999} overflow="hidden">
                <Image alt={name} src={logoUrl} width={56} height={56} />
              </Box>
            )}
            {!logoUrl && (
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
            )}
          </Box>

          <Box flex="1 1 auto" overflow="hidden">
            <Typography variant="h6" component="h2" noWrap>
              {name}
            </Typography>

            <Typography variant="body1" component="p">
              {symbol}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body1" component="p">
            Address: {formatAddress(address)}
          </Typography>

          <CopyButton address={address} />
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body1" component="span">
            Network:
          </Typography>

          <ChainIcon id={chainId} size={24} />

          {chainName && (
            <Typography variant="body1" component="span">
              {chainName}
            </Typography>
          )}
        </Box>

        <Typography variant="body1" component="p">
          Current balance: {formatUnits(BigInt(balance), decimals)} {symbol}
        </Typography>

        {explorerUrl && (
          <Link href={explorerUrl} target="_blank" rel="noopener noreferrer">
            See on block explorer
          </Link>
        )}
      </CardContent>
    </Card>
  );
};
