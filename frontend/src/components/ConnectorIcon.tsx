import WalletIcon from '@mui/icons-material/Wallet';
import Image from 'next/image';

type Props = {
  name: string | undefined;
  src: string | undefined;
  size?: number;
};

export const ConnectorIcon = ({ name, src, size = 24 }: Props) => {
  if (name === 'WalletConnect') {
    return <Image alt={name} src="/walletconnect.svg" width={size} height={size} />;
  }

  if (src) {
    return <Image alt={name ?? ''} src={src} width={size} height={size} />;
  }

  return <WalletIcon width={size} height={size} />;
};
