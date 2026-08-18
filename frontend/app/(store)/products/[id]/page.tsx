'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Container, Grid, Typography, Button, Paper, Alert, Snackbar,
  Breadcrumbs, Link as MuiLink, IconButton, Divider, alpha,
} from '@mui/material';
import {
  AddShoppingCart, StorefrontOutlined, FavoriteBorder, Favorite,
  ShareOutlined, Remove, Add, NavigateNext, Star, LocationOnOutlined,
} from '@mui/icons-material';
import Link from 'next/link';
import { productService } from '@/services/product.service';
import { Product } from '@/types';
import { formatPrice } from '@/utils/format';
import { formatProductAgeRange, formatProductGender, formatProductType } from '@/utils/productAttributes';
import LoadingState from '@/components/common/LoadingState';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { getErrorMessage } from '@/services/api';
import { colors } from '@/theme/colors';

const clampQuantity = (value: number, maxStock: number) =>
  Math.min(maxStock, Math.max(1, value));

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [snack, setSnack] = useState('');
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    productService.getProduct(id).then(setProduct).catch(() => setProduct(null)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (product) {
      setQuantity((q) => clampQuantity(q, product.stockQuantity));
    }
  }, [product]);

  const requireAuth = () => {
    router.push(`/login?redirect=/products/${id}`);
    return false;
  };

  const handleAddToCart = async (redirectToCheckout = false) => {
    if (!isAuthenticated) return requireAuth();
    if (!product) return;
    const qty = clampQuantity(quantity, product.stockQuantity);
    if (qty !== quantity) setQuantity(qty);
    try {
      if (redirectToCheckout) setBuying(true);
      else setAdding(true);
      await addToCart(id, qty);
      if (redirectToCheckout) {
        router.push('/checkout');
      } else {
        setSnack('Added to cart');
      }
    } catch (err) {
      setSnack(getErrorMessage(err));
    } finally {
      setAdding(false);
      setBuying(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product?.name, url });
      } catch {
        /* dismissed */
      }
    } else {
      await navigator.clipboard.writeText(url);
      setSnack('Link copied to clipboard');
    }
  };

  if (loading) return <LoadingState />;
  if (!product) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography>Product not found.</Typography>
      </Container>
    );
  }

  const supplier = typeof product.supplierId === 'object' ? product.supplierId : null;
  const category = typeof product.categoryId === 'object' ? product.categoryId : null;
  const inStock = product.stockQuantity > 0 && product.status === 'active';
  const imageUrl = product.imageUrls?.[0] || '/placeholder-product.svg';
  const ageLabel = formatProductAgeRange(product.minAge, product.maxAge);
  const genderLabel = formatProductGender(product.gender);
  const typeLabel = formatProductType(product.productType);

  return (
    <Box sx={{ bgcolor: colors.cream, minHeight: '60vh' }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 3, '& .MuiBreadcrumbs-li': { fontSize: '0.875rem' } }}
        >
          <MuiLink component={Link} href="/" underline="hover" color="text.secondary">Home</MuiLink>
          <MuiLink component={Link} href="/products" underline="hover" color="text.secondary">Products</MuiLink>
          <Typography color="text.primary" sx={{ fontWeight: 600, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.name}
          </Typography>
        </Breadcrumbs>

        <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: { md: 'flex' } }}>
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                border: `1px solid ${colors.divider}`,
                borderRadius: '16px',
                overflow: 'hidden',
                bgcolor: colors.white,
                p: { xs: 2, md: 3 },
              }}
            >
              <Box
                sx={{
                  flex: { md: 1 },
                  borderRadius: '12px',
                  overflow: 'hidden',
                  bgcolor: 'grey.50',
                  aspectRatio: { xs: '1 / 1', md: 'auto' },
                  minHeight: { md: 280 },
                  display: 'flex',
                }}
              >
                <Box
                  component="img"
                  src={imageUrl}
                  alt={product.name}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </Box>
              {product.imageUrls.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap', flexShrink: 0 }}>
                  {product.imageUrls.slice(0, 4).map((url, i) => (
                    <Box
                      key={i}
                      component="img"
                      src={url}
                      alt=""
                      sx={{
                        width: 72,
                        height: 72,
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: `2px solid ${i === 0 ? colors.orange : colors.divider}`,
                      }}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Paper
              elevation={0}
              sx={{
                border: `1px solid ${colors.divider}`,
                borderRadius: '16px',
                bgcolor: colors.white,
                p: { xs: 2.5, md: 3 },
              }}
            >
              {inStock && (
                <Box
                  sx={{
                    display: 'inline-block',
                    bgcolor: '#e53935',
                    color: colors.white,
                    px: 1.5,
                    py: 0.4,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    mb: 2,
                    borderRadius: '4px',
                  }}
                >
                  Sale
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.3, flex: 1 }}>
                  {product.name}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setWishlisted((w) => !w)}
                  sx={{
                    border: `1px solid ${colors.divider}`,
                    borderRadius: '50%',
                    flexShrink: 0,
                  }}
                >
                  {wishlisted ? <Favorite fontSize="small" color="error" /> : <FavoriteBorder fontSize="small" />}
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 0.25 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} sx={{ fontSize: 18, color: colors.orange }} />
                    ))}
                  </Box>
                {/* <Typography variant="body2" color="text.secondary">4.5 (New)</Typography> */}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: colors.charcoal }}>
                  {formatPrice(product.price)}
                </Typography>
              </Box>

              {category && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Category: <strong>{category.name}</strong>
                </Typography>
              )}

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2.5, lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
              >
                {product.description}
              </Typography>

              <ChipRow inStock={inStock} stock={product.stockQuantity} />

              {inStock && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Quantity</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        border: `1px solid ${colors.divider}`,
                        borderRadius: '10px',
                        bgcolor: colors.white,
                        height: 44,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => setQuantity((q) => clampQuantity(q - 1, product.stockQuantity))}
                        disabled={quantity <= 1}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      <Typography sx={{ minWidth: 36, textAlign: 'center', fontWeight: 600 }}>
                        {quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setQuantity((q) => clampQuantity(q + 1, product.stockQuantity))}
                        disabled={quantity >= product.stockQuantity}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {product.stockQuantity} available
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mb: 2.5 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                      disabled={buying || adding}
                      onClick={() => handleAddToCart(true)}
                      sx={{ py: 1.35, borderRadius: '10px', fontWeight: 700 }}
                    >
                      {buying ? 'Processing...' : 'Buy Now'}
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      fullWidth
                      startIcon={<AddShoppingCart />}
                      disabled={adding || buying}
                      onClick={() => handleAddToCart(false)}
                      sx={{ py: 1.35, borderRadius: '10px', fontWeight: 600 }}
                    >
                      {adding ? 'Adding...' : isAuthenticated ? 'Add to Cart' : 'Sign in to Purchase'}
                    </Button>
                  </Box>
                </>
              )}

              {!inStock && (
                <Button variant="outlined" disabled fullWidth sx={{ mb: 2.5, borderRadius: '10px' }}>
                  Out of Stock
                </Button>
              )}

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  size="small"
                  startIcon={<ShareOutlined />}
                  onClick={handleShare}
                  sx={{ color: colors.orange, fontWeight: 600 }}
                >
                  Share
                </Button>

              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                Free shipping: estimated delivery 5–7 days
              </Typography>
              <Typography variant="body2" color="text.secondary">
                SKU: {product.sku}
              </Typography>
              {(typeLabel || genderLabel || ageLabel) && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  {typeLabel && <>Type: {typeLabel}</>}
                  {typeLabel && (genderLabel || ageLabel) && ' · '}
                  {genderLabel && <>Gender: {genderLabel}</>}
                  {genderLabel && ageLabel && ' · '}
                  {ageLabel && <>{ageLabel}</>}
                </Typography>
              )}
            </Paper>

            {supplier && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: `1px solid ${colors.divider}`,
                  borderRadius: '12px',
                  bgcolor: colors.white,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: (supplier.description || supplier.businessAddress) ? 1 : 0 }}>
                  <StorefrontOutlined sx={{ color: colors.orange, fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Sold by {supplier.storeName}
                  </Typography>
                </Box>
                {supplier.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: supplier.businessAddress ? 1 : 0 }}>
                    {supplier.description}
                  </Typography>
                )}
                {supplier.businessAddress && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <LocationOnOutlined sx={{ color: colors.orange, fontSize: 18, mt: 0.35, flexShrink: 0 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>
                        Shop location
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {supplier.businessAddress}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Paper>
            )}
          </Grid>
        </Grid>

        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: { xs: 2.5, md: 3 },
            border: `1px solid ${colors.divider}`,
            borderRadius: '16px',
            bgcolor: colors.white,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Product Description</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            {product.description}
          </Typography>
        </Paper>
      </Container>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}>
        <Alert severity={snack.includes('Added') || snack.includes('copied') ? 'success' : 'error'} onClose={() => setSnack('')}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function ChipRow({ inStock, stock }: { inStock: boolean; stock: number }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          borderRadius: '20px',
          border: `1px solid ${colors.divider}`,
          fontSize: '0.8rem',
          fontWeight: 500,
          bgcolor: alpha(colors.orange, 0.08),
        }}
      >
        {inStock ? `${stock} in stock` : 'Out of stock'}
      </Box>
    </Box>
  );
}
