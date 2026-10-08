import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import MenuIcon from '@mui/icons-material/Menu';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Suspense, useState } from 'react';
import { Link as RouterLink, NavLink, Outlet } from 'react-router-dom';
import { PageLoader } from '../components/common/StateViews';

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/', icon: <DashboardIcon />, end: true },
  { label: 'Products', to: '/products', icon: <Inventory2Icon /> },
  { label: 'Orders', to: '/orders', icon: <ReceiptLongIcon /> },
];

function NavContent({ onNavigate }) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#111827', color: '#e5e7eb' }}>
      <Toolbar sx={{ gap: 1.5 }}>
        <Inventory2Icon sx={{ color: '#818cf8' }} />
        <Typography variant="h6" noWrap sx={{ color: '#fff' }}>
          Inventory
        </Typography>
      </Toolbar>
      <List sx={{ px: 1.5 }}>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: 'inherit',
              '& .MuiListItemIcon-root': { color: '#9ca3af', minWidth: 40 },
              '&.active': { bgcolor: 'rgba(129, 140, 248, 0.16)', color: '#fff' },
              '&.active .MuiListItemIcon-root': { color: '#818cf8' },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

export default function AppLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
        elevation={0}
      >
        <Toolbar>
          {!isDesktop && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }} aria-label="Open menu">
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="subtitle1" noWrap sx={{ flexGrow: 1, fontWeight: 600 }}>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Mini Inventory &amp; Order Management
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              Inventory
            </Box>
          </Typography>
          <Button component={RouterLink} to="/orders/new" variant="contained" startIcon={<AddShoppingCartIcon />}>
            New Order
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isDesktop ? 'permanent' : 'temporary'}
          open={isDesktop || mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
        >
          <NavContent onNavigate={() => setMobileOpen(false)} />
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, sm: 3 } }}>
        <Toolbar />
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
}
