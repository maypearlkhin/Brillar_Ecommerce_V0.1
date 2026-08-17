'use client';

import { useState } from 'react';
import { Box, Typography, IconButton, Snackbar, Paper, alpha } from '@mui/material';
import { Star, ShoppingCartOutlined } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { formatPrice } from '@/utils/format';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { getErrorMessage } from '@/services/api';
import { colors } from '@/theme/colors';

interface DealProductCardProps {
  product: Product;
}

export default function DealProductCard({ product }: DealProductCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [snack, setSnack] = useState('');

  const inStock = product.stockQuantity > 0 && product.status === 'active';
  const [imageUrl, setImageUrl] = useState(product.imageUrls?.[0] || '/placeholder-product.svg');

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${product._id}`);
      return;
    }
    try {
      setAdding(true);
      await addToCart(product._id, 1);
      setSnack('Added to cart');
    } catch (err) {
      setSnack(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          border: `1px solid ${colors.divider}`,
          borderRadius: '12px',
          overflow: 'hidden',
          bgcolor: colors.white,
          boxShadow: colors.cardShadow,
          transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
          willChange: 'transform',
          '&:hover': {
            transform: 'translateY(-8px)',
            borderColor: alpha(colors.orange, 0.45),
            boxShadow: colors.cardShadowHover,
          },
        }}
      >
        <Box
          component={Link}
          href={`/products/${product._id}`}
          sx={{
            position: 'relative',
            display: 'block',
            textDecoration: 'none',
            color: 'inherit',
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: '100%',
              aspectRatio: '1 / 1',
              overflow: 'hidden',
              bgcolor: 'grey.100',
            }}
          >
            <Box
              component="img"
              src={imageUrl}
              alt={product.name}
              onError={() => setImageUrl('/placeholder-product.svg')}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
              }}
            />
          </Box>

          {inStock && (
            <IconButton
              onClick={handleAddToCart}
              disabled={adding}
              sx={{
                position: 'absolute',
                bottom: 10,
                right: 10,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                width: 40,
                height: 40,
                boxShadow: `0 2px 8px ${colors.orangeShadow}`,
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <ShoppingCartOutlined fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Box sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
            <Star sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="caption" fontWeight={600}>4.5</Typography>
            <Typography variant="caption" color="text.secondary">(New)</Typography>
          </Box>

          <Typography
            component={Link}
            href={`/products/${product._id}`}
            variant="body2"
            sx={{
              fontWeight: 500,
              mb: 0.75,
              textDecoration: 'none',
              color: 'inherit',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.4,
              '&:hover': { color: 'primary.main' },
            }}
          >
            {product.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body1" fontWeight={700}>
              {formatPrice(product.price)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack('')} message={snack} />
    </>
  );
}
