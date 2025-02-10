import { formatAddress } from '@/utils/address';
import { Box, Typography } from '@mui/material';
import { useAccount, useEnsName } from 'wagmi';
import { ConnectorIcon } from './ConnectorIcon';

export const AccountDetails = () => {
  const { address, connector } = useAccount();
  const ensName = useEnsName({
    address,
    chainId: 1,
  });

  if (!address) {
    return null;
  }

  const hasENSName = ensName.status === 'success' && !!ensName.data;

  return (
    <Box display="flex" padding={1} gap={1} borderRadius={1}>
      <Box flex="0 0 auto">
        <ConnectorIcon name={connector?.name} src={connector?.icon} size={40} />
      </Box>

      <Box display="flex" flexDirection="column" justifyContent="center" flex="1 1 auto" overflow="hidden">
        <Typography variant="body1" noWrap>
          {hasENSName ? ensName.data : formatAddress(address)}
        </Typography>

        {hasENSName && (
          <Typography variant="body2" color="secondary" noWrap>
            {formatAddress(address)}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
