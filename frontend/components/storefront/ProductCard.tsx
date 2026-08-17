'use client';

import { Card, CardContent, CardMedia, Typography, Box, Chip } from '@mui/material';
import Link from 'next/link';
import { Product } from '@/types';
import { formatPrice } from '@/utils/format';
import { colors } from '@/theme/colors';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const inStock = product.stockQuantity > 0 && product.status === 'active';
  const supplier = typeof product.supplierId === 'object' ? product.supplierId : null;

  return (
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
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, pt: 2, pb: 2 }}>
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
    </Card>
  );
}
