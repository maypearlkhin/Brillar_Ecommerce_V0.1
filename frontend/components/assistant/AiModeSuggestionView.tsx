'use client';

import {
  forwardRef,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { Box } from '@mui/material';
import {
  CopilotChatSuggestionPill,
  CopilotChatSuggestionView,
} from '@copilotkit/react-core/v2';
import CategoryOutlined from '@mui/icons-material/CategoryOutlined';
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined';
import LocalOfferOutlined from '@mui/icons-material/LocalOfferOutlined';
import ShoppingBagOutlined from '@mui/icons-material/ShoppingBagOutlined';
import { colors } from '@/theme/colors';

type SuggestionViewProps = ComponentProps<typeof CopilotChatSuggestionView>;

const SUGGESTION_ICONS: Record<string, ReactNode> = {
  'Browse products': <CategoryOutlined sx={{ fontSize: 16 }} />,
  'Find deals': <LocalOfferOutlined sx={{ fontSize: 16 }} />,
  'Track my order': <ShoppingBagOutlined sx={{ fontSize: 16 }} />,
  'Shopping help': <HelpOutlineOutlined sx={{ fontSize: 16 }} />,
};

const AiModeSuggestionPill = forwardRef<
  HTMLButtonElement,
  ComponentProps<typeof CopilotChatSuggestionPill>
>(function AiModeSuggestionPill({ children, icon, ...props }, ref) {
  const title = typeof children === 'string' ? children : '';
  const resolvedIcon = icon ?? SUGGESTION_ICONS[title] ?? null;

  return (
    <Box
      component={CopilotChatSuggestionPill}
      ref={ref}
      icon={resolvedIcon}
      sx={{
        '&&': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          height: 'auto',
          minHeight: 36,
          m: 0,
          py: 1,
          px: 1.75,
          borderRadius: '12px',
          border: `1px solid ${colors.orangePaleBorder}`,
          bgcolor: colors.white,
          color: colors.textPrimary,
          fontSize: '0.8125rem',
          fontWeight: 500,
          lineHeight: 1.2,
          boxShadow: 'none',
          pointerEvents: 'auto',
          transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
          '&:hover:not(:disabled)': {
            bgcolor: colors.orangePale,
            borderColor: colors.orangeLight,
            color: colors.charcoalDark,
          },
          '& svg': { color: colors.textSecondary },
        },
      }}
      {...props}
    >
      {children}
    </Box>
  );
});

const AiModeSuggestionContainer = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(function AiModeSuggestionContainer(props, ref) {
  return (
    <Box
      ref={ref}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.75,
        width: '100%',
        pointerEvents: 'none',
      }}
      {...props}
    />
  );
});

export default forwardRef<HTMLDivElement, SuggestionViewProps>(
  function AiModeSuggestionView(props, ref) {
    return (
      <CopilotChatSuggestionView
        ref={ref}
        {...props}
        container={AiModeSuggestionContainer}
        suggestion={AiModeSuggestionPill}
      />
    );
  },
);
