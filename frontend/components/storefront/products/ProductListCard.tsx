'use client';

import { useState } from 'react';
import { Box, Typography, Button, Paper, Snackbar, alpha } from '@mui/material';
import { Star, ShoppingCartOutlined } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { formatPrice } from '@/utils/format';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { getErrorMessage } from '@/services/api';
import { colors } from '@/theme/colors';

interface ProductListCardProps {
  product: Product;
}

export default function ProductListCard({ product }: ProductListCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [snack, setSnack] = useState('');

  const inStock = product.stockQuantity > 0 && product.status === 'active';
  const supplier = typeof product.supplierId === 'object' ? product.supplierId : null;
  const category = typeof product.categoryId === 'object' ? product.categoryId : null;
  const imageUrl = product.imageUrls?.[0] || '/placeholder-product.svg';
  const [imgSrc, setImgSrc] = useState(imageUrl);

  const handleAddToCart = async (e: React.MouseEvent) => {
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

  const goToProduct = () => {
    router.push(`/products/${product._id}`);
  };

  return (
    <>
      <Paper
        elevation={0}
        onClick={goToProduct}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 1.5, md: 3 },
          p: { xs: 1.5, md: 2 },
          border: `1px solid ${colors.divider}`,
          borderRadius: '12px',
          bgcolor: colors.white,
          boxShadow: colors.cardShadow,
          cursor: 'pointer',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
          willChange: 'transform',
          '&:hover': {
            transform: 'translateY(-4px)',
            borderColor: alpha(colors.orange, 0.4),
            boxShadow: colors.cardShadowHover,
          },
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: 88, sm: 110, md: 130 },
            height: { xs: 88, sm: 110, md: 130 },
            borderRadius: '10px',
            overflow: 'hidden',
            bgcolor: 'grey.100',
          }}
        >
          <Box
            component="img"
            src={imgSrc}
            alt={product.name}
            onError={() => setImgSrc('/placeholder-product.svg')}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, py: 0.5 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              lineHeight: 1.35,
              mb: 0.5,
              color: colors.charcoal,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.name}
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
            {category?.name || 'Category'}
          </Typography>
          {supplier && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
              Sold by: <Box component="span" sx={{ fontWeight: 600, color: colors.charcoal }}>{supplier.storeName}</Box>
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <Star sx={{ fontSize: 16, color: colors.orange }} />
            <Typography variant="caption" fontWeight={600}>4.5</Typography>
            <Typography variant="caption" color="text.secondary">(New)</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.orange, fontSize: '1.1rem' }}>
              {formatPrice(product.price)}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'center' }, width: { xs: '100%', sm: 'auto' } }}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="contained"
            color="secondary"
            disabled={!inStock || adding}
            onClick={handleAddToCart}
            startIcon={<ShoppingCartOutlined />}
            fullWidth={undefined}
            sx={{
              px: { xs: 2, md: 2.5 },
              py: 1.1,
              borderRadius: '10px',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            {inStock ? (adding ? 'Adding...' : 'Add to Cart') : 'Out of Stock'}
          </Button>
        </Box>
      </Paper>

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack('')} message={snack} />
    </>
  );
}
