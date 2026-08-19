'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box, InputBase, List, ListItemButton, ListItemIcon, ListItemText, Paper, Typography, alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  CategoryOutlined,
  CheckroomOutlined,
  PersonOutlined,
} from '@mui/icons-material';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { productService } from '@/services/product.service';
import { Category } from '@/types';
import {
  PRODUCT_GENDER_LABELS,
  PRODUCT_TYPE_LABELS,
} from '@/constants/productAttributes';
import {
  buildProductsSearchPath,
  matchCategories,
  matchGenders,
  matchProductTypes,
  parseProductSearchQuery,
} from '@/utils/productSearch';

const SEARCH_HEIGHT = 40;

export default function HeaderSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    productService.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (pathname === '/products') {
      setSearch(searchParams.get('q') || '');
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const query = search.trim().toLowerCase();

  const matchingCategories = useMemo(() => {
    if (!query) return [];
    return matchCategories(query, categories);
  }, [categories, query]);

  const matchingGenders = useMemo(() => {
    if (!query) return [];
    return matchGenders(query).slice(0, 4);
  }, [query]);

  const matchingTypes = useMemo(() => {
    if (!query) return [];
    return matchProductTypes(query).slice(0, 4);
  }, [query]);

  const hasSuggestions =
    matchingCategories.length > 0 || matchingGenders.length > 0 || matchingTypes.length > 0;

  const showSuggestions = open && query.length > 0 && hasSuggestions;

  const navigateWithParsed = (raw: string) => {
    const parsed = parseProductSearchQuery(raw, categories);
    router.push(buildProductsSearchPath(parsed, raw));
  };

  const handleProductSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setOpen(false);
    navigateWithParsed(search.trim());
  };

  const handleCategorySelect = (category: Category) => {
    setSearch('');
    setOpen(false);
    router.push(`/products?category=${encodeURIComponent(category.slug)}`);
  };

  const handleGenderSelect = (gender: string) => {
    setSearch('');
    setOpen(false);
    router.push(`/products?gender=${encodeURIComponent(gender)}`);
  };

  const handleTypeSelect = (type: string) => {
    setSearch('');
    setOpen(false);
    router.push(`/products?type=${encodeURIComponent(type)}`);
  };

  return (
    <Box
      ref={containerRef}
      component="form"
      onSubmit={handleProductSearch}
      sx={{
        flex: 1,
        minWidth: 0,
        display: { xs: 'none', sm: 'flex' },
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: SEARCH_HEIGHT,
          bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
          borderRadius: showSuggestions ? '20px 20px 0 0' : `${SEARCH_HEIGHT / 2}px`,
          border: '1px solid',
          borderColor: showSuggestions ? 'primary.main' : 'divider',
          borderBottomColor: showSuggestions ? 'transparent' : undefined,
          px: 2,
          overflow: 'hidden',
          transition: 'border-radius 0.15s ease, border-color 0.15s ease',
        }}
      >
        <SearchIcon sx={{ color: 'text.secondary', fontSize: 20, flexShrink: 0 }} />
        <InputBase
          placeholder="Search "
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          sx={{
            ml: 1.25,
            flex: 1,
            fontSize: '0.875rem',
            height: SEARCH_HEIGHT,
          }}
        />
      </Box>

      {showSuggestions && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: SEARCH_HEIGHT - 1,
            left: 0,
            right: 0,
            zIndex: (t) => t.zIndex.modal,
            borderRadius: '0 0 16px 16px',
            border: '1px solid',
            borderColor: 'primary.main',
            borderTop: 'none',
            overflow: 'hidden',
          }}
        >
          {matchingGenders.length > 0 && (
            <>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  px: 2,
                  pt: 1.25,
                  pb: 0.5,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Gender
              </Typography>
              <List dense disablePadding>
                {matchingGenders.map((gender) => (
                  <ListItemButton
                    key={gender}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleGenderSelect(gender)}
                    sx={{ py: 0.75 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PersonOutlined fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={PRODUCT_GENDER_LABELS[gender]}
                      slotProps={{ primary: { sx: { fontWeight: 600, fontSize: '0.875rem' } } }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </>
          )}

          {matchingTypes.length > 0 && (
            <>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  px: 2,
                  pt: 1,
                  pb: 0.5,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Product type
              </Typography>
              <List dense disablePadding>
                {matchingTypes.map((type) => (
                  <ListItemButton
                    key={type}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleTypeSelect(type)}
                    sx={{ py: 0.75 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckroomOutlined fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={PRODUCT_TYPE_LABELS[type]}
                      slotProps={{ primary: { sx: { fontWeight: 600, fontSize: '0.875rem' } } }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </>
          )}

          {matchingCategories.length > 0 && (
            <>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  px: 2,
                  pt: 1,
                  pb: 0.5,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Categories
              </Typography>
              <List dense disablePadding>
                {matchingCategories.map((category) => (
                  <ListItemButton
                    key={category._id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleCategorySelect(category)}
                    sx={{ py: 0.75 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CategoryOutlined fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={category.name}
                      secondary={
                        typeof category.productCount === 'number'
                          ? `${category.productCount} product${category.productCount === 1 ? '' : 's'}`
                          : undefined
                      }
                      slotProps={{
                        primary: { sx: { fontWeight: 600, fontSize: '0.875rem' } },
                        secondary: { sx: { fontSize: '0.75rem' } },
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </>
          )}

          <Box sx={{ px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
            <Typography variant="caption" color="text.secondary">
              Press Enter to search with filters for &ldquo;{search.trim()}&rdquo;
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
