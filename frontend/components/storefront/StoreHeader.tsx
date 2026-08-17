'use client';

import {
  AppBar, Toolbar, Box, Typography, IconButton, Badge, Button,
  Tooltip,
} from '@mui/material';
import {
  ShoppingCartOutlined,
  ReceiptLongOutlined,
  StorefrontOutlined,
  CategoryOutlined,
  HelpOutlineOutlined,
  PersonOutlined,
  AdminPanelSettingsOutlined,
  StoreOutlined,
  LoginOutlined,
  PersonAddOutlined,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import HeaderSearch from '@/components/storefront/HeaderSearch';
import { colors } from '@/theme/colors';

export default function StoreHeader({ hideSearch = false }: { hideSearch?: boolean }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar
        disableGutters
        sx={{
          width: '100%',
          gap: 2,
          py: 0,
          minHeight: 56,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Link
          href="/"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
        >
          <StorefrontOutlined sx={{ color: 'primary.main', fontSize: 24 }} />
          <Box>
            <Typography
              variant="h6"
              color="text.primary"
              sx={{ lineHeight: 1.1, letterSpacing: '-0.02em', fontWeight: 700, fontSize: '1rem' }}
            >
              Brillar Market
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: { xs: 'none', sm: 'block' },
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontSize: '0.58rem',
              }}
            >
              Multi-Supplier Store
            </Typography>
          </Box>
        </Link>

        {!hideSearch && <HeaderSearch />}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexShrink: 0, ml: hideSearch ? 'auto' : 0 }}>
          <Tooltip title="Products">
            <IconButton component={Link} href="/products" size="small" sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
              <CategoryOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Help">
            <IconButton component={Link} href="/faq" size="small" sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
              <HelpOutlineOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          {isAuthenticated ? (
            <>
              <Tooltip title="Orders">
                <IconButton component={Link} href="/orders" size="small">
                  <ReceiptLongOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cart">
                <IconButton component={Link} href="/cart" size="small">
                  <Badge badgeContent={itemCount} color="primary">
                    <ShoppingCartOutlined fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>
              {user?.role === 'admin' && (
                <Tooltip title="Admin Portal">
                  <IconButton component={Link} href="/admin" size="small" sx={{ display: { xs: 'none', lg: 'inline-flex' } }}>
                    <AdminPanelSettingsOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {user?.role === 'supplier' && (
                <Tooltip title="Supplier Portal">
                  <IconButton component={Link} href="/supplier" size="small" sx={{ display: { xs: 'none', lg: 'inline-flex' } }}>
                    <StoreOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Profile">
                <IconButton component={Link} href="/account" size="small">
                  <PersonOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
              <Button
                onClick={handleLogout}
                variant="contained"
                color="secondary"
                size="small"
                sx={{
                  ml: 0.5,
                  px: 2.5,
                  py: 0.85,
                  minWidth: 'auto',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '24px',
                  boxShadow: colors.cardShadow,
                  '&:hover': { boxShadow: colors.cardShadowHover },
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Tooltip title="Sign In">
                <IconButton component={Link} href="/login" size="small">
                  <LoginOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Register">
                <IconButton component={Link} href="/register" size="small" color="primary">
                  <PersonAddOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
