'use client';

import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, AppBar, Toolbar,
  IconButton, Divider, Avatar, Chip, Tooltip,
} from '@mui/material';
import { Menu as MenuIcon, LogoutOutlined, StorefrontOutlined, HomeOutlined } from '@mui/icons-material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getActiveNavItem } from '@/utils/nav';
import { colors } from '@/theme/colors';

const DRAWER_WIDTH = 280;

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface PortalLayoutProps {
  title: string;
  navItems: NavItem[];
  children: React.ReactNode;
  portalName?: string;
  portalSubtitle?: string;
  roleLabel?: string;
  /** When set, shows a header button to return to the customer storefront */
  storefrontLink?: { href: string; label?: string };
}

export default function PortalLayout({
  title,
  navItems,
  children,
  portalName,
  portalSubtitle = 'Operations Console',
  roleLabel,
  storefrontLink,
}: PortalLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeItem = getActiveNavItem(navItems, pathname);
  const displayPortalName = portalName || title;
  const displayRole = roleLabel || (user?.role === 'admin' ? 'Administrator' : user?.role === 'supplier' ? 'Supplier' : 'User');

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'secondary.main' }}>
      {/* Brand */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <StorefrontOutlined sx={{ color: 'primary.main', fontSize: 22 }} />
          <Typography variant="h6" sx={{ color: 'common.white', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Brillar
          </Typography>
        </Box>

        {/* User profile card */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.06)',
            border: '1px solid',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontSize: '0.9rem', fontWeight: 700 }}>
              {user?.name?.charAt(0) || '?'}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" sx={{ color: 'common.white', fontWeight: 600, lineHeight: 1.3 }} noWrap>
                {user?.name}
              </Typography>
              <Chip
                label={displayRole}
                size="small"
                sx={{
                  mt: 0.5,
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation */}
      <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255,255,255,0.45)',
            fontWeight: 600,
            letterSpacing: '0.1em',
            fontSize: '0.65rem',
          }}
        >
          NAVIGATION
        </Typography>
      </Box>

      <List sx={{ flex: 1, px: 1.5, py: 0 }}>
        {navItems.map((item) => {
          const selected = activeItem?.href === item.href;
          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={selected}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                py: 1.1,
                color: 'rgba(255,255,255,0.65)',
                '& .MuiListItemIcon-root': { color: 'rgba(255,255,255,0.45)' },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.08)',
                  color: 'common.white',
                  '& .MuiListItemIcon-root': { color: 'rgba(255,255,255,0.85)' },
                },
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { sx: { fontSize: '0.875rem', fontWeight: selected ? 600 : 500 } } }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      <Box sx={{ px: 1.5, py: 1.5 }}>
        <ListItemButton
          onClick={() => { logout(); router.push('/login'); }}
          sx={{
            borderRadius: 2,
            color: 'rgba(255,255,255,0.65)',
            py: 1,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: 'common.white' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}><LogoutOutlined fontSize="small" /></ListItemIcon>
          <ListItemText primary="Logout" slotProps={{ primary: { sx: { fontSize: '0.875rem' } } }} />
        </ListItemButton>
      </Box>

      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
          © {new Date().getFullYear()} {displayPortalName}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ gap: 2, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Box>
              <Typography variant="body1" fontWeight={700}>
                {displayPortalName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activeItem?.label ? `${activeItem.label} · ${portalSubtitle}` : portalSubtitle}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {storefrontLink && (
              <Tooltip title={storefrontLink.label || 'Browse store as customer'}>
                <IconButton
                  component={Link}
                  href={storefrontLink.href}
                  aria-label={storefrontLink.label || 'Back to store home'}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '10px',
                    color: colors.charcoal,
                    '&:hover': {
                      borderColor: colors.orange,
                      bgcolor: 'rgba(244, 145, 33, 0.08)',
                      color: colors.orange,
                    },
                  }}
                >
                  <HomeOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.name}
            </Typography>
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
              {user?.name?.charAt(0) || '?'}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              borderRight: 'none',
              boxSizing: 'border-box',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3.5 },
          mt: 8,
          bgcolor: colors.cream,
          minHeight: '100vh',
          maxWidth: '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
