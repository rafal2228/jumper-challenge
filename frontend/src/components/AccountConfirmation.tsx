import { useAuth } from '@/auth';
import { Button } from '@mui/material';
import { useAccount } from 'wagmi';

export const AccountConfirmation = () => {
  const { address } = useAccount();
  const auth = useAuth();

  if (!address || auth.address === address) {
    return null;
  }

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={() => auth.handleConfirmAddress(address)}
      disabled={auth.isPending}
    >
      {auth.isPending ? 'Confirming...' : 'Confirm Address'}
    </Button>
  );
};
