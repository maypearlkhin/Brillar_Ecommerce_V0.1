'use client';

import { Box, Paper, Typography, alpha } from '@mui/material';
import { HelpOutlineOutlined } from '@mui/icons-material';
import Link from 'next/link';
import { FAQ } from '@/types';
import { colors } from '@/theme/colors';

interface FaqPreviewCardProps {
  faq: FAQ;
}

export default function FaqPreviewCard({ faq }: FaqPreviewCardProps) {
  return (
    <Paper
      component={Link}
      href="/faq"
      elevation={0}
      sx={{
        display: 'block',
        height: '100%',
        p: 2.5,
        textDecoration: 'none',
        color: 'inherit',
        bgcolor: colors.white,
        border: `1px solid ${colors.divider}`,
        borderRadius: '12px',
        boxShadow: colors.cardShadow,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        willChange: 'transform',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: colors.orange,
          opacity: 0.85,
        },
        '&:hover': {
          transform: 'translateY(-8px)',
          borderColor: alpha(colors.orange, 0.45),
          boxShadow: colors.cardShadowHover,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            bgcolor: alpha(colors.orange, 0.12),
            color: colors.orange,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <HelpOutlineOutlined sx={{ fontSize: 20 }} />
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: colors.textSecondary,
            fontSize: '0.7rem',
          }}
        >
          {faq.category}
        </Typography>
      </Box>

      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.4, color: colors.charcoal }}>
        {faq.question}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          lineHeight: 1.65,
        }}
      >
        {faq.answer}
      </Typography>
    </Paper>
  );
}
