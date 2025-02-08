import { Button, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useAccount, useConnect, useConnectors } from 'wagmi';
import { AccountDetails } from './AccountDetails';
import { ConnectorIcon } from './ConnectorIcon';

const WalletDropdown = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const { connect } = useConnect({
    mutation: {
      onError: (error) => {
        if (error.name !== 'UserRejectedRequestError') {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      },
    },
  });
  const connectors = useConnectors();

  return (
    <>
      <Button variant="contained" color="primary" onClick={(event) => setAnchorEl(event.currentTarget)}>
        Connect Wallet
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        elevation={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {connectors.map((connector) => (
          <MenuItem
            key={connector.id}
            onClick={() =>
              connect({
                connector,
              })
            }
          >
            <ListItemIcon>
              <ConnectorIcon name={connector.name} src={connector.icon} />
            </ListItemIcon>

            <Typography variant="body2">{connector.name}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export const AccountConnection = () => {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return <WalletDropdown />;
  }

  return <AccountDetails />;
};
