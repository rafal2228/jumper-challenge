import LinkIcon from '@mui/icons-material/Link';
import { Box } from '@mui/material';
import Image from 'next/image';
import { arbitrum, avalanche, base, bsc, mainnet, polygon } from 'viem/chains';

const icons = {
  [mainnet.id]: '/chains/ethereum.webp',
  [base.id]: '/chains/base.webp',
  [avalanche.id]: '/chains/avalanche.webp',
  [arbitrum.id]: '/chains/arbitrum.webp',
  [polygon.id]: '/chains/polygon.webp',
  [bsc.id]: '/chains/binance.webp',
} as const;

type Props = {
  id: number | undefined;
  size?: number;
};

export const ChainIcon = ({ id, size = 24 }: Props) => {
  if (id && id in icons) {
    const src = icons[id as keyof typeof icons];

    if (src) {
      return (
        <Box display="inline-block" width={size} height={size} borderRadius={9999} overflow="hidden">
          <Image alt={`Chain #${id}`} src={src} width={size} height={size} />
        </Box>
      );
    }
  }

  return <LinkIcon width={size} height={size} />;
};
