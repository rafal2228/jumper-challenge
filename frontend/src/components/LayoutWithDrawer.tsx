'use client';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { ComponentProps, PropsWithChildren, useState } from 'react';
import { AccountConfirmation } from './AccountConfirmation';
import { AccountConnection } from './AccountConnection';
import { AccountDetails } from './AccountDetails';

const drawerWidth = 240;

const Logo = (props: ComponentProps<typeof Box>) => {
  return (
    <Box display="flex" alignItems="center" {...props}>
      <Typography variant="h5" component="h1" color="primary.main" fontWeight="bold">
        ERC20 Explorer
      </Typography>
    </Box>
  );
};

const Links = () => (
  <List>
    <ListItem disablePadding>
      <ListItemButton component="a" href="/">
        <ListItemText primary="Watchlist" />
      </ListItemButton>
    </ListItem>
    <ListItem disablePadding>
      <ListItemButton component="a" href="/explore">
        <ListItemText primary="Explore" />
      </ListItemButton>
    </ListItem>
  </List>
);

export const LayoutWithDrawer = ({ children }: PropsWithChildren) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawerContent = (
    <>
      <Toolbar>
        <Logo />
      </Toolbar>

      <Box display="flex" flexDirection="column" alignItems="stretch" padding={2} gap={1}>
        <AccountConnection />

        <AccountDetails />

        <AccountConfirmation />
      </Box>

      <Divider />

      <Links />
    </>
  );

  return (
    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} minHeight="100vh" alignItems="stretch">
      <Box display={{ xs: 'block', md: 'none' }} position="sticky">
        <Toolbar
          sx={{
            gap: 1,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <IconButton color="inherit" aria-label="open drawer" onClick={() => setMobileOpen(true)} edge="start">
            <MenuIcon />
          </IconButton>

          <AccountDetails />
        </Toolbar>

        <Divider />
      </Box>

      <Drawer
        variant="temporary"
        sx={{
          display: { xs: 'block', md: 'none' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
        open
      >
        {drawerContent}
      </Drawer>

      <Box component="main" flexGrow={1}>
        {children}
      </Box>
    </Box>
  );
};
