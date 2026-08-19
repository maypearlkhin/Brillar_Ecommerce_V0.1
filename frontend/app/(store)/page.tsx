'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Box, Container, Typography, Button, Grid, Paper, alpha,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import Link from 'next/link';
import { homeService, HomeData } from '@/services/home.service';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import SectionHeading from '@/components/storefront/home/SectionHeading';
import HomeHero from '@/components/storefront/home/HomeHero';
import DealProductCard from '@/components/storefront/home/DealProductCard';
import FaqPreviewCard from '@/components/storefront/home/FaqPreviewCard';
import { useProductLikeContext } from '@/contexts/ProductLikeContext';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { colors } from '@/theme/colors';

export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { seedProducts } = useProductLikeContext();

  const loadHomeData = useCallback(async () => {
    try {
      const nextData = await homeService.getHomeData();
      setData(nextData);
      setError(false);
      seedProducts(nextData.featured);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [seedProducts]);

  useEffect(() => {
    void loadHomeData();
  }, [loadHomeData]);

  useRefreshOnFocus(loadHomeData);

  if (loading) return <LoadingState message="Loading marketplace..." />;

  if (error || !data) {
    return (
      <Container sx={{ py: 8 }}>
        <EmptyState
          title="Unable to load marketplace"
          description="Please check that the backend server is running and try again."
        />
      </Container>
    );
  }

  const { stats, featured, categories, faqs } = data;

  return (
    <>
      <HomeHero showCta={stats.productCount > 0} />

      {/* Branded deals — featured products */}
      {featured.length > 0 && (
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase' }}
            >
              Branded Deals
            </Typography>
            <Button
              component={Link}
              href="/products"
              color="inherit"
              sx={{ fontWeight: 500, color: 'text.secondary' }}
            >
              View All
            </Button>
          </Box>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {featured.map((product) => (
              <Grid key={product._id} size={{ xs: 6, sm: 4, md: 3 }}>
                <DealProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        </Container>
      )}

      {/* Categories — only if DB has categories with products */}
      {categories.length > 0 && (
        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 6 } }}>
          <SectionHeading
            title="Shop by Category"
            subtitle="Browse departments with active listings from our suppliers."
          />
          <Grid container spacing={2}>
            {categories.map((cat) => (
              <Grid key={cat._id} size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }}>
                <Paper
                  component={Link}
                  href={`/products?category=${cat.slug}`}
                  elevation={0}
                  sx={{
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    '&:hover': { boxShadow: `0 4px 16px ${colors.orangeShadow}`, borderColor: 'primary.main' },
                  }}
                >
                  {cat.imageUrl ? (
                    <Box
                      component="img"
                      src={cat.imageUrl}
                      alt={cat.name}
                      sx={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <Box sx={{ height: 100, bgcolor: 'grey.100' }} />
                  )}
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{cat.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cat.productCount} product{cat.productCount !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}

      {featured.length === 0 && categories.length === 0 && (
        <Container sx={{ py: 6 }}>
          <EmptyState
            title="No products available yet"
            description="Check back soon as suppliers add new items to the marketplace."
            action={stats.productCount === 0 ? undefined : { label: 'Browse Products', href: '/products' }}
          />
        </Container>
      )}

      {/* FAQs from database */}
      {faqs.length > 0 && (
        <Box
          sx={{
            position: 'relative',
            bgcolor: colors.cream,
            borderTop: 1,
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -80,
              right: -60,
              width: 280,
              height: 280,
              borderRadius: '50%',
              bgcolor: alpha(colors.orange, 0.08),
              pointerEvents: 'none',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -100,
              left: -80,
              width: 320,
              height: 320,
              borderRadius: '50%',
              bgcolor: alpha(colors.orange, 0.06),
              pointerEvents: 'none',
            }}
          />
          <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 4, md: 5 } }}>
            <SectionHeading
              eyebrow="Need help?"
              title="Common Questions"
              subtitle="Quick answers about orders, payments, and selling on Brillar Market."
            />
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {faqs.map((faq) => (
                <Grid key={faq._id} size={{ xs: 12, md: 4 }}>
                  <FaqPreviewCard faq={faq} />
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                component={Link}
                href="/faq"
                variant="outlined"
                color="primary"
                endIcon={<ArrowForward />}
                sx={{
                  px: 3,
                  py: 1.1,
                  borderRadius: '10px',
                  borderWidth: 2,
                  fontWeight: 600,
                  '&:hover': { borderWidth: 2 },
                }}
              >
                View All FAQs
              </Button>
            </Box>
          </Container>
        </Box>
      )}

      {/* Supplier CTA — static navigation only, no fake data */}
      <Box sx={{ bgcolor: 'secondary.main', color: 'common.white', py: { xs: 4, md: 5 } }}>
        <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ mb: 0.5 }}>Interested in selling?</Typography>
            <Typography variant="body2" sx={{ color: alpha('#fff', 0.78), maxWidth: 480 }}>
              Apply to join the marketplace and start listing your products.
            </Typography>
          </Box>
          <Button component={Link} href="/become-a-supplier" variant="contained" color="primary" endIcon={<ArrowForward />}>
            Apply to Sell
          </Button>
        </Container>
      </Box>
    </>
  );
}
