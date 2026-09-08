'use client';

import { useState } from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip, Button, Snackbar } from '@mui/material';
import { ShoppingCartOutlined } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { formatPrice } from '@/utils/format';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { getErrorMessage } from '@/services/api';
import { colors } from '@/theme/colors';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [snack, setSnack] = useState('');

  const inStock = product.stockQuantity > 0 && product.status === 'active';
  const supplier = typeof product.supplierId === 'object' ? product.supplierId : null;

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
      <Card sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        border: `1px solid ${colors.divider}`,
        boxShadow: colors.cardShadow,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: colors.cardShadowHover,
          borderColor: colors.orange,
        },
      }}>
        <Link href={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Box sx={{ overflow: 'hidden', bgcolor: 'grey.100' }}>
            <CardMedia
              component="img"
              height="210"
              image={product.imageUrls?.[0] || '/placeholder-product.svg'}
              alt={product.name}
              sx={{
                objectFit: 'cover',
                transition: 'transform 0.35s ease',
                '.MuiCard-root:hover &': { transform: 'scale(1.03)' },
              }}
            />
          </Box>
          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, pt: 2, pb: 1.5 }}>
            {supplier && (
              <Typography variant="caption" color="secondary.main" noWrap sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>
                {supplier.storeName}
              </Typography>
            )}
            <Typography variant="body1" sx={{
              fontSize: '0.95rem',
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              lineHeight: 1.35,
              minHeight: '2.7em',
            }}>
              {product.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto', pt: 1.5 }}>
              <Typography variant="h6" color="primary.main" sx={{ fontSize: '1.05rem' }}>
                {formatPrice(product.price)}
              </Typography>
              <Chip
                label={inStock ? 'In Stock' : 'Out of Stock'}
                size="small"
                color={inStock ? 'success' : 'default'}
                variant="outlined"
                sx={{ height: 22, fontSize: '0.68rem' }}
              />
            </Box>
          </CardContent>
        </Link>

        <Box sx={{ px: 2, pb: 2, pt: 0 }}>
          <Button
            variant="contained"
            color="secondary"
            disabled={!inStock || adding}
            onClick={handleAddToCart}
            startIcon={<ShoppingCartOutlined />}
            fullWidth
            sx={{
              py: 1.1,
              borderRadius: '10px',
              fontSize: '0.85rem',
            }}
          >
            {inStock ? (adding ? 'Adding...' : 'Add to Cart') : 'Out of Stock'}
          </Button>
        </Box>
      </Card>

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack('')} message={snack} />
    </>
  );
}
