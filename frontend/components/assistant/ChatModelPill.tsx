'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  InputBase,
  Popover,
  Popper,
  Typography,
} from '@mui/material';
import CheckRounded from '@mui/icons-material/CheckRounded';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import { useCopilotModels } from '@/lib/copilot/modelContext';
import type { CopilotModel } from '@/lib/copilot/models';
import {
  formatTokenLimit,
  getModelDescription,
} from '@/lib/copilot/models';
import { colors } from '@/theme/colors';

type ChatModelPillProps = {
  variant?: 'pill' | 'toolbar';
};

const VISIBLE_ROWS = 10;
const ROW_HEIGHT = 36;
const LIST_MAX_HEIGHT = VISIBLE_ROWS * ROW_HEIGHT;

function filterModels(models: CopilotModel[], query: string): CopilotModel[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return models;

  return models.filter((model) => {
    const haystack = [
      model.label,
      model.id,
      model.description ?? '',
      ...(model.tags ?? []),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

function ModelDetailIsland({ model }: { model: CopilotModel }) {
  const contextLabel = formatTokenLimit(model.inputTokenLimit);
  const description = getModelDescription(model);
  const modelSlug = model.id.includes('/') ? model.id.split('/').slice(1).join('/') : model.id;

  return (
    <Box
      className="ai-mode-model-detail-island"
      sx={{
        width: 248,
        p: 1.5,
        borderRadius: '12px',
        border: `1px solid ${colors.orangePaleBorder}`,
        bgcolor: colors.white,
        boxShadow: `0 12px 40px ${colors.orangeShadow}, 0 0 0 1px rgba(244, 145, 33, 0.06)`,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
        pointerEvents: 'none',
      }}
    >
      <Typography
        sx={{ fontSize: '0.875rem', fontWeight: 600, color: colors.textPrimary }}
      >
        {model.label}
      </Typography>
      <Typography
        sx={{ fontSize: '0.8125rem', lineHeight: 1.45, color: colors.textSecondary }}
      >
        {description}
      </Typography>
      {contextLabel ? (
        <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>
          {contextLabel}
        </Typography>
      ) : null}
      <Typography
        sx={{
          pt: 0.5,
          fontSize: '0.6875rem',
          fontStyle: 'italic',
          color: colors.textSecondary,
          wordBreak: 'break-all',
        }}
      >
        {modelSlug}
      </Typography>
    </Box>
  );
}

export default function ChatModelPill({ variant = 'toolbar' }: ChatModelPillProps) {
  const {
    models,
    selectedModelId,
    loading,
    error,
    setSelectedModelId,
    getLabel,
    getShortLabel,
  } = useCopilotModels();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [search, setSearch] = useState('');
  const [hoveredModelId, setHoveredModelId] = useState<string | null>(null);
  const [hoveredRowEl, setHoveredRowEl] = useState<HTMLElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const open = Boolean(anchorEl);
  const isToolbar = variant === 'toolbar';
  const displayLabel = loading
    ? 'Loading models...'
    : models.length === 0
      ? 'No models available'
      : isToolbar
        ? getShortLabel(selectedModelId)
        : getLabel(selectedModelId);

  const filteredModels = useMemo(
    () => filterModels(models, search),
    [models, search],
  );

  const hoveredModel = useMemo(
    () => models.find((model) => model.id === hoveredModelId) ?? null,
    [hoveredModelId, models],
  );

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setSearch('');
    setHoveredModelId(selectedModelId || null);
    setHoveredRowEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearch('');
    setHoveredModelId(null);
    setHoveredRowEl(null);
  };

  const handleSelect = (nextModelId: string) => {
    setSelectedModelId(nextModelId);
    handleClose();
  };

  const handleRowHover = (modelId: string, rowEl: HTMLElement) => {
    setHoveredModelId(modelId);
    setHoveredRowEl(rowEl);
  };

  return (
    <>
      <Button
        type="button"
        aria-label="Select AI model"
        aria-haspopup="listbox"
        aria-expanded={open ? 'true' : 'false'}
        disabled={loading || models.length === 0}
        onClick={handleOpen}
        endIcon={
          loading ? (
            <CircularProgress size={14} sx={{ color: colors.textSecondary }} />
          ) : (
            <KeyboardArrowDownOutlined
              sx={{
                fontSize: 16,
                color: colors.textSecondary,
                transition: 'transform 0.2s ease',
                transform: open ? 'rotate(180deg)' : 'none',
              }}
            />
          )
        }
        className={isToolbar ? 'ai-mode-model-toolbar-trigger' : undefined}
        sx={
          isToolbar
            ? {
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                lineHeight: 1.2,
                color: colors.textPrimary,
                bgcolor: open ? colors.orangePale : 'transparent',
                border: 'none',
                px: 0.75,
                py: 0.5,
                minHeight: 32,
                flexShrink: 0,
                mr: 0.125,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: colors.orangePale,
                  color: colors.textPrimary,
                  boxShadow: 'none',
                },
                '&[aria-expanded="true"]': {
                  bgcolor: colors.orangePale,
                  color: colors.textPrimary,
                },
                '& .MuiButton-endIcon': { ml: 0.25, mr: 0 },
              }
            : {
                borderRadius: '999px',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.8125rem',
                lineHeight: 1.2,
                color: colors.textPrimary,
                bgcolor: open ? colors.orangePaleDeep : colors.orangePale,
                border: `1px solid ${colors.orangePaleBorder}`,
                px: 1.25,
                py: 0.5,
                minHeight: 32,
                flexShrink: 0,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: colors.orangePaleDeep,
                  borderColor: colors.orangeLight,
                  boxShadow: 'none',
                },
                '& .MuiButton-endIcon': { ml: 0.25, mr: -0.25 },
              }
        }
      >
        {displayLabel}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: isToolbar ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: isToolbar ? 'right' : 'left' }}
        slotProps={{
          paper: {
            elevation: 0,
            className: 'ai-mode-model-selector-popover',
            sx: {
              mt: 0.5,
              width: 280,
              borderRadius: '12px',
              border: `1px solid ${colors.orangePaleBorder}`,
              bgcolor: colors.white,
              boxShadow: `0 12px 40px ${colors.orangeShadow}, 0 0 0 1px rgba(244, 145, 33, 0.06)`,
              overflow: 'hidden',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.25,
              py: 1,
              borderBottom: `1px solid ${colors.orangePaleBorder}`,
            }}
          >
            <InputBase
              inputRef={searchInputRef}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search models"
              fullWidth
              sx={{
                fontSize: '0.875rem',
                color: colors.textPrimary,
                '& input::placeholder': {
                  color: colors.textSecondary,
                  opacity: 1,
                },
              }}
            />
          </Box>

          {error ? (
            <Box sx={{ px: 1.25, py: 1.25 }}>
              <Typography sx={{ fontSize: '0.8125rem', color: colors.textSecondary }}>
                {error}
              </Typography>
            </Box>
          ) : (
            <Box
              role="listbox"
              aria-label="AI models"
              sx={{
                maxHeight: LIST_MAX_HEIGHT,
                overflowY: 'auto',
                py: 0.5,
                scrollbarWidth: 'thin',
                scrollbarColor: `${colors.orangePaleBorder} transparent`,
                '&::-webkit-scrollbar': { width: 8 },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: colors.orangePaleBorder,
                  borderRadius: '999px',
                },
                '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
              }}
            >
              {filteredModels.length === 0 ? (
                <Box sx={{ px: 1.25, py: 1.25 }}>
                  <Typography sx={{ fontSize: '0.8125rem', color: colors.textSecondary }}>
                    {models.length === 0 ? 'No models available.' : 'No models match your search.'}
                  </Typography>
                </Box>
              ) : (
                filteredModels.map((model) => {
                  const selected = model.id === selectedModelId;
                  const hovered = model.id === hoveredModelId;
                  const tagLabel = model.tags?.join(' ') ?? '';

                  return (
                    <Box
                      key={model.id}
                      role="option"
                      aria-selected={selected}
                      onMouseEnter={(event) =>
                        handleRowHover(model.id, event.currentTarget)
                      }
                      onClick={() => handleSelect(model.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        px: 1.25,
                        minHeight: ROW_HEIGHT,
                        cursor: 'pointer',
                        bgcolor: hovered
                          ? colors.orangePale
                          : selected
                            ? colors.orangePaleDeep
                            : 'transparent',
                        transition: 'background-color 0.12s ease',
                      }}
                    >
                      <Typography
                        noWrap
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          fontSize: '0.875rem',
                          fontWeight: selected ? 600 : 500,
                          color: colors.textPrimary,
                        }}
                      >
                        {model.label}
                      </Typography>
                      {tagLabel ? (
                        <Typography
                          noWrap
                          sx={{
                            fontSize: '0.75rem',
                            color: colors.textSecondary,
                            flexShrink: 0,
                          }}
                        >
                          {tagLabel}
                        </Typography>
                      ) : null}
                      <Box
                        sx={{
                          width: 18,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          color: selected ? colors.textPrimary : 'transparent',
                        }}
                      >
                        {selected ? <CheckRounded sx={{ fontSize: 16 }} /> : null}
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>
          )}
        </Box>
      </Popover>

      <Popper
        open={open && Boolean(hoveredModel && hoveredRowEl)}
        anchorEl={hoveredRowEl}
        placement="right-start"
        modifiers={[
          { name: 'offset', options: { offset: [10, -6] } },
          { name: 'preventOverflow', options: { padding: 12 } },
        ]}
        sx={{ zIndex: 1400 }}
      >
        {hoveredModel ? <ModelDetailIsland model={hoveredModel} /> : null}
      </Popper>
    </>
  );
}
