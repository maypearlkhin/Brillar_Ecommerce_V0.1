'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Paper, TextField, Checkbox, FormControlLabel, Button,
  Slider, Divider, InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { Category } from '@/types';
import { colors } from '@/theme/colors';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

const PRICE_SLIDER_MAX = 500;
const PRICE_FILTER_DEBOUNCE_MS = 400;

const preventNumberInputWheelChange = (event: React.WheelEvent<HTMLInputElement>) => {
  event.currentTarget.blur();
};

const priceInputSlotProps = {
  htmlInput: {
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

  return (
    <Paper
      elevation={0}
      sx={{
        py: 2.5,
        px: { xs: 3, md: 3.5 },
        position: 'sticky',
        top: 72,
        border: `1px solid ${colors.divider}`,
        borderRadius: '12px',
        bgcolor: colors.white,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Filters</Typography>
        <Button size="small" color="primary" onClick={onClearAll} sx={{ fontWeight: 600, minWidth: 'auto' }}>
          Clear All
        </Button>
      </Box>

      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Category</Typography>
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

      <Box sx={{ mb: 2, maxHeight: 220, overflowY: 'auto' }}>
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
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Price Range</Typography>
      <Slider
        value={[sliderMin, sliderMax]}
        min={0}
        max={PRICE_SLIDER_MAX}
        onChange={handleSliderChange}
        onChangeCommitted={flushApplyPrice}
        color="primary"
        size="small"
        sx={{ mb: 2, px: 0.5 }}
      />
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          label="Min"
          size="small"
          type="number"
          value={sliderMin}
          slotProps={priceInputSlotProps}
          onChange={(e) => {
            setSliderMin(Number(e.target.value) || 0);
            debouncedApplyPrice();
          }}
          onBlur={flushApplyPrice}
          sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
        />
        <TextField
          label="Max"
          size="small"
          type="number"
          value={sliderMax}
          slotProps={priceInputSlotProps}
          onChange={(e) => {
            setSliderMax(Number(e.target.value) || PRICE_SLIDER_MAX);
            debouncedApplyPrice();
          }}
          onBlur={flushApplyPrice}
          sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

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
