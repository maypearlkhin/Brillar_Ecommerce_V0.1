'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Paper, TextField, Checkbox, FormControlLabel, Button,
  Slider, Divider, InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { Category } from '@/types';
import { colors } from '@/theme/colors';
import { formatPrice } from '@/utils/format';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

const PRICE_SLIDER_MAX = 500;
const PRICE_FILTER_DEBOUNCE_MS = 400;

const clampPrice = (value: number, lower = 0, upper = PRICE_SLIDER_MAX) =>
  Math.min(upper, Math.max(lower, value));

const parsePriceInput = (raw: string): number => {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return 0;
  return clampPrice(parseInt(digits, 10));
};

const priceSliderSx = {
  mx: 0.5,
  height: 22,
  py: 0,
  '& .MuiSlider-rail': {
    opacity: 1,
    height: 4,
    borderRadius: 999,
    bgcolor: colors.divider,
  },
  '& .MuiSlider-track': {
    height: 4,
    borderRadius: 999,
    border: 'none',
    bgcolor: colors.orange,
  },
  '& .MuiSlider-thumb': {
    width: 16,
    height: 16,
    bgcolor: colors.orange,
    border: `2px solid ${colors.white}`,
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.18)',
    '&:hover, &.Mui-focusVisible, &.Mui-active': {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.22)',
    },
    '&::before': { boxShadow: 'none' },
  },
};

const preventNumberInputWheelChange = (event: React.WheelEvent<HTMLInputElement>) => {
  event.currentTarget.blur();
};

const categoryScrollSx = {
  mb: 2,
  '& .simplebar-track.simplebar-vertical': {
    width: 6,
    background: 'transparent',
    right: 0,
  },
  '& .simplebar-scrollbar::before': {
    background: colors.divider,
    borderRadius: 999,
    opacity: 0.85,
    left: 1,
    right: 1,
  },
  '& .simplebar-scrollbar:hover::before, & .simplebar-scrollbar.simplebar-visible::before': {
    background: colors.textSecondary,
    opacity: 1,
  },
  '& .simplebar-content-wrapper': {
    paddingRight: '12px !important',
  },
} as const;

const priceInputSlotProps = {
  htmlInput: {
    inputMode: 'numeric' as const,
    pattern: '[0-9]*',
    onWheel: preventNumberInputWheelChange,
  },
};

interface ProductsFilterSidebarProps {
  categories: Category[];
  categoryCounts: Record<string, number>;
  selectedCategory: string;
  inStock: boolean;
  minPrice: string;
  maxPrice: string;
  onCategoryChange: (slug: string) => void;
  onInStockChange: (checked: boolean) => void;
  onPriceChange: (min: string, max: string) => void;
  onClearAll: () => void;
}

export default function ProductsFilterSidebar({
  categories,
  categoryCounts,
  selectedCategory,
  inStock,
  minPrice,
  maxPrice,
  onCategoryChange,
  onInStockChange,
  onPriceChange,
  onClearAll,
}: ProductsFilterSidebarProps) {
  const [categorySearch, setCategorySearch] = useState('');
  const [sliderMin, setSliderMin] = useState(Number(minPrice) || 0);
  const [sliderMax, setSliderMax] = useState(Number(maxPrice) || PRICE_SLIDER_MAX);
  const sliderMinRef = useRef(sliderMin);
  const sliderMaxRef = useRef(sliderMax);

  useEffect(() => {
    sliderMinRef.current = sliderMin;
  }, [sliderMin]);

  useEffect(() => {
    sliderMaxRef.current = sliderMax;
  }, [sliderMax]);

  const applyPrice = useCallback(() => {
    const min = sliderMinRef.current;
    const max = sliderMaxRef.current;
    onPriceChange(
      min > 0 ? String(min) : '',
      max < PRICE_SLIDER_MAX ? String(max) : '',
    );
  }, [onPriceChange]);

  const { debounced: debouncedApplyPrice, cancel: cancelDebouncedApplyPrice, flush: flushApplyPrice } =
    useDebouncedCallback(applyPrice, PRICE_FILTER_DEBOUNCE_MS);

  useEffect(() => {
    setSliderMin(Number(minPrice) || 0);
    setSliderMax(Number(maxPrice) || PRICE_SLIDER_MAX);
    cancelDebouncedApplyPrice();
  }, [minPrice, maxPrice, cancelDebouncedApplyPrice]);

  const filteredCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, categorySearch]);

  const handleSliderChange = (_: unknown, value: number | number[]) => {
    const [min, max] = value as number[];
    setSliderMin(min);
    setSliderMax(max);
    debouncedApplyPrice();
  };

  const handleMinInputChange = (raw: string) => {
    const next = parsePriceInput(raw);
    setSliderMin(Math.min(next, sliderMax));
    debouncedApplyPrice();
  };

  const handleMaxInputChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    const next = digits ? clampPrice(parseInt(digits, 10)) : PRICE_SLIDER_MAX;
    setSliderMax(Math.max(next, sliderMin));
    debouncedApplyPrice();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        py: 2.5,
        px: 2.5,
        position: 'sticky',
        top: 72,
        border: `1px solid ${colors.divider}`,
        borderRadius: '12px',
        bgcolor: colors.white,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Filters</Typography>
        <Button size="small" color="primary" onClick={onClearAll} sx={{ fontWeight: 600, minWidth: 'auto' }}>
          Clear All
        </Button>
      </Box>

      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Category</Typography>
      <TextField
        fullWidth
        size="small"
        placeholder="Search categories..."
        value={categorySearch}
        onChange={(e) => setCategorySearch(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
      />

      <Box sx={categoryScrollSx}>
        <SimpleBar style={{ maxHeight: 220 }}>
          {filteredCategories.map((cat) => (
            <Box
              key={cat._id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 0.35,
              }}
            >
              <FormControlLabel
                sx={{ flex: 1, mr: 1 }}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedCategory === cat.slug}
                    onChange={() => onCategoryChange(selectedCategory === cat.slug ? '' : cat.slug)}
                    color="primary"
                  />
                }
                label={<Typography variant="body2">{cat.name}</Typography>}
              />
              <Typography variant="caption" color="text.secondary">
                ({categoryCounts[cat.slug] ?? 0})
              </Typography>
            </Box>
          ))}
        </SimpleBar>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Price Range</Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: colors.orange }}>
            {formatPrice(sliderMin)} – {formatPrice(sliderMax)}
          </Typography>
        </Box>
        <Slider
          value={[sliderMin, sliderMax]}
          min={0}
          max={PRICE_SLIDER_MAX}
          onChange={handleSliderChange}
          onChangeCommitted={flushApplyPrice}
          color="primary"
          size="small"
          sx={{ ...priceSliderSx, mb: 0.75 }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            label="Min"
            size="small"
            type="text"
            placeholder="0"
            value={sliderMin === 0 ? '' : String(sliderMin)}
            slotProps={priceInputSlotProps}
            onChange={(e) => handleMinInputChange(e.target.value)}
            onBlur={flushApplyPrice}
            sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
          <TextField
            label="Max"
            size="small"
            type="text"
            value={String(sliderMax)}
            slotProps={priceInputSlotProps}
            onChange={(e) => handleMaxInputChange(e.target.value)}
            onBlur={flushApplyPrice}
            sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
        </Box>
      </Box>

      <Divider sx={{ mb: 1.5, mt: 2.5 }} />

      <FormControlLabel
        control={
          <Checkbox
            checked={inStock}
            onChange={(e) => onInStockChange(e.target.checked)}
            color="primary"
          />
        }
        label={<Typography variant="body2">In stock only</Typography>}
      />
    </Paper>
  );
}
