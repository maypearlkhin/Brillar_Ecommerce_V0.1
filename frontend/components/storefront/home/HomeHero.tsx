'use client';

import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme/colors';

interface HomeHeroProps {
  showCta: boolean;
}

export default function HomeHero({ showCta }: HomeHeroProps) {
  const { user, isAuthenticated } = useAuth();

  const showSupplierApply = !user || user.role !== 'supplier';
  const supplierApplyHref = isAuthenticated
    ? '/become-a-supplier'
    : '/login?redirect=/become-a-supplier';

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: { xs: 420, sm: 460, md: 520 },
        overflow: 'hidden',
      }}
    >
      <Box
        component="img"
        src="/images/home-banner.png"
        alt=""
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: { xs: '75% center', md: 'right center' },
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: {
            xs: `linear-gradient(
              105deg,
              ${colors.white} 0%,
              ${colors.white} 42%,
              rgba(255, 255, 255, 0.88) 58%,
              rgba(255, 255, 255, 0.45) 78%,
              rgba(255, 255, 255, 0.12) 100%
            )`,
            md: `linear-gradient(
              90deg,
              ${colors.white} 0%,
              ${colors.white} 30%,
              rgba(255, 255, 255, 0.92) 45%,
              rgba(255, 255, 255, 0.55) 62%,
              rgba(255, 255, 255, 0.18) 82%,
              transparent 100%
            )`,
          },
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          minHeight: { xs: 420, sm: 460, md: 520 },
          display: 'flex',
          alignItems: 'center',
          py: { xs: 5, md: 6 },
        }}
      >
        <Stack
          spacing={0}
          sx={{
            width: { xs: '100%', md: '52%', lg: '48%' },
            minWidth: { xs: 'auto', md: 360 },
            maxWidth: 560,
            alignItems: 'flex-start',
            textAlign: 'left',
          }}
        >
          <Box
            sx={{
              display: 'inline-block',
              bgcolor: colors.orange,
              color: colors.charcoal,
              px: 2.25,
              py: 0.75,
              borderRadius: 0,
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              mb: 3,
              whiteSpace: 'nowrap',
            }}
          >
            WEEKEND DISCOUNT
          </Box>

          <Typography
            component="h1"
            sx={{
              width: '100%',
              fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.25rem' },
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: colors.charcoal,
              mb: 2.5,
              whiteSpace: 'normal',
            }}
          >
            Best Deals
            <br />
            Endless Deals
          </Typography>

          <Typography
            component="p"
            sx={{
              width: '100%',
              color: colors.textSecondary,
              mb: 3.5,
              lineHeight: 1.75,
              fontSize: { xs: '0.9375rem', md: '1rem' },
              maxWidth: 440,
            }}
          >
            Discover the best deals across endless options, offering quality and unbeatable variety daily.
          </Typography>

          {(showCta || showSupplierApply) && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: '100%' }}>
              {showCta && (
                <Button
                  component={Link}
                  href="/products"
                  variant="contained"
                  color="secondary"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    px: 3.5,
                    py: 1.35,
                    borderRadius: '24px',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    boxShadow: colors.cardShadow,
                    '&:hover': { boxShadow: colors.cardShadowHover },
                  }}
                >
                  Explore Deals
                </Button>
              )}
              {showSupplierApply && (
                <Button
                  component={Link}
                  href={supplierApplyHref}
                  variant="outlined"
                  color="primary"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    px: 3,
                    py: 1.35,
                    borderRadius: '24px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    whiteSpace: { xs: 'normal', sm: 'nowrap' },
                    '&:hover': { borderWidth: 2 },
                  }}
                >
                  Apply to become a supplier
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
