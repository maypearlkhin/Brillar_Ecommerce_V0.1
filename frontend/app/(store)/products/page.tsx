'use client';

import { useEffect, useState, Suspense, useMemo, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box, Container, Grid, Typography, MenuItem, Select, FormControl,
  Breadcrumbs, Link as MuiLink, ToggleButton, ToggleButtonGroup,
  Paper, alpha, Pagination, Stack,
} from '@mui/material';
import {
  GridViewOutlined, ViewListOutlined, NavigateNext,
} from '@mui/icons-material';
import Link from 'next/link';
import { productService } from '@/services/product.service';
import { Product, Category } from '@/types';
import ProductCard from '@/components/storefront/ProductCard';
import ProductListCard from '@/components/storefront/products/ProductListCard';
import ProductsFilterSidebar from '@/components/storefront/products/ProductsFilterSidebar';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import { useProductLikeContext } from '@/contexts/ProductLikeContext';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { colors } from '@/theme/colors';

type ViewMode = 'list' | 'grid';

const PRODUCTS_PAGE_SIZE = 12;

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const gender = searchParams.get('gender') || '';
  const type = searchParams.get('type') || '';
  const age = searchParams.get('age') || '';
  const sort = searchParams.get('sort') || 'newest';
  const inStock = searchParams.get('inStock') === 'true';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const requestIdRef = useRef(0);
  const { seedProducts } = useProductLikeContext();

  const loadProducts = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const data = await productService.getProducts({
        search, category, gender, type,
        ...(age ? { age: Number(age) } : {}),
        sort,
        inStock,
        ...(minPrice ? { minPrice: Number(minPrice) } : {}),
        ...(maxPrice ? { maxPrice: Number(maxPrice) } : {}),
        page,
        limit: PRODUCTS_PAGE_SIZE,
      });

      if (requestId !== requestIdRef.current) return;

      setProducts(data.products);
      setTotalResults(data.pagination?.total ?? data.products.length);
      setTotalPages(data.pagination?.pages ?? 1);
      seedProducts(data.products);
    } finally {
      if (requestId !== requestIdRef.current) return;
      setLoading(false);
    }
  }, [search, category, gender, type, age, sort, inStock, minPrice, maxPrice, page, seedProducts]);

  const updateParams = (updates: Record<string, string>, resetPage = true) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    if (resetPage) params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const setPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) params.delete('page');
    else params.set('page', String(nextPage));
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/products');
  };

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useRefreshOnFocus(loadProducts);

  useEffect(() => {
    productService.getCategories().then(setCategories);
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((c) => {
      counts[c.slug] = c.productCount ?? 0;
    });
    return counts;
  }, [categories]);

  return (
    <Box sx={{ bgcolor: colors.cream, minHeight: '60vh' }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 3, '& .MuiBreadcrumbs-li': { fontSize: '0.875rem' } }}
        >
          <MuiLink component={Link} href="/" underline="hover" color="text.secondary">
            Home
          </MuiLink>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>Products</Typography>
        </Breadcrumbs>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <ProductsFilterSidebar
              categories={categories}
              categoryCounts={categoryCounts}
              selectedCategory={category}
              inStock={inStock}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onCategoryChange={(slug) => updateParams({ category: slug })}
              onInStockChange={(checked) => updateParams({ inStock: checked ? 'true' : '' })}
              onPriceChange={(min, max) => updateParams({ minPrice: min, maxPrice: max })}
              onClearAll={clearAllFilters}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 9 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2.5,
                border: `1px solid ${colors.divider}`,
                borderRadius: '12px',
                bgcolor: colors.white,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ToggleButtonGroup
                  size="small"
                  value={viewMode}
                  exclusive
                  onChange={(_, v) => v && setViewMode(v)}
                  sx={{
                    '& .MuiToggleButton-root': {
                      borderRadius: '8px',
                      border: `1px solid ${colors.divider}`,
                      px: 1.25,
                      '&.Mui-selected': {
                        bgcolor: alpha(colors.orange, 0.12),
                        color: colors.orange,
                        borderColor: alpha(colors.orange, 0.4),
                      },
                    },
                  }}
                >
                  <ToggleButton value="grid" aria-label="grid view">
                    <GridViewOutlined fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="list" aria-label="list view">
                    <ViewListOutlined fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>

                {!loading && totalResults > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Showing {((page - 1) * PRODUCTS_PAGE_SIZE) + 1}–{Math.min(page * PRODUCTS_PAGE_SIZE, totalResults)} of {totalResults} result{totalResults === 1 ? '' : 's'}
                  </Typography>
                )}
              </Box>

              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select
                  value={sort}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                  displayEmpty
                  sx={{ borderRadius: '10px', bgcolor: colors.white }}
                >
                  <MenuItem value="newest">Sort: Newest</MenuItem>
                  <MenuItem value="price_asc">Price: Low to High</MenuItem>
                  <MenuItem value="price_desc">Price: High to Low</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                </Select>
              </FormControl>
            </Paper>

            {loading ? (
              <LoadingState />
            ) : products.length === 0 ? (
              <EmptyState title="No products found" description="Try adjusting your filters or search terms." />
            ) : viewMode === 'list' ? (
              <Stack spacing={2}>
                {products.map((p) => (
                  <ProductListCard key={p._id} product={p} />
                ))}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
                    <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
                  </Box>
                )}
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Grid container spacing={2}>
                  {products.map((p) => (
                    <Grid key={p._id} size={{ xs: 6, sm: 4, md: 4 }}>
                      <ProductCard product={p} />
                    </Grid>
                  ))}
                </Grid>
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
                    <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
                  </Box>
                )}
              </Stack>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProductsContent />
    </Suspense>
  );
}
