'use client';

import {
  forwardRef,
  type ComponentProps,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  CopilotChatSuggestionPill,
  CopilotChatSuggestionView,
} from '@copilotkit/react-core/v2';
import CategoryOutlined from '@mui/icons-material/CategoryOutlined';
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined';
import LocalOfferOutlined from '@mui/icons-material/LocalOfferOutlined';
import ShoppingBagOutlined from '@mui/icons-material/ShoppingBagOutlined';

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
>(function AiModeSuggestionPill({ children, icon, className, ...props }, ref) {
  const title = typeof children === 'string' ? children : '';
  const resolvedIcon = icon ?? SUGGESTION_ICONS[title] ?? null;

  return (
    <CopilotChatSuggestionPill
      ref={ref}
      icon={resolvedIcon}
      className={`ai-mode-suggestion-pill${className ? ` ${className}` : ''}`}
      {...props}
    >
      {children}
    </CopilotChatSuggestionPill>
  );
});

const AiModeSuggestionContainer = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function AiModeSuggestionContainer({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`ai-mode-suggestion-list${className ? ` ${className}` : ''}`}
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
