'use client';

import { Box, Container, Grid, Typography, Link as MuiLink, Divider } from '@mui/material';
import Link from 'next/link';

export default function StoreFooter() {
  return (
    <Box component="footer" sx={{ bgcolor: 'secondary.main', color: 'rgba(255,255,255,0.75)', mt: 'auto', py: 5 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 600 }}>
              Brillar Market
            </Typography>
            <Typography variant="body2" sx={{ maxWidth: 280 }}>
              A trusted multi-supplier marketplace connecting quality sellers with customers nationwide.
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>Shop</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <MuiLink component={Link} href="/products" color="inherit" underline="hover" variant="body2">All Products</MuiLink>
              <MuiLink component={Link} href="/products?sort=newest" color="inherit" underline="hover" variant="body2">New Arrivals</MuiLink>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>Support</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <MuiLink component={Link} href="/faq" color="inherit" underline="hover" variant="body2">FAQ</MuiLink>
              <MuiLink component={Link} href="/become-a-supplier" color="inherit" underline="hover" variant="body2">Sell on Brillar</MuiLink>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>Sell With Us</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Join our growing network of suppliers and reach thousands of customers.
            </Typography>
            <MuiLink component={Link} href="/become-a-supplier" sx={{ color: 'primary.main', fontWeight: 600 }} underline="hover" variant="body2">
              Apply to become a supplier →
            </MuiLink>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.12)' }} />
        <Typography variant="caption" color="grey.500">
          © {new Date().getFullYear()} Brillar Market. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
