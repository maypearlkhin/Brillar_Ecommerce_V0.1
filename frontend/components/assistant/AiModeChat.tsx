'use client';

import {
  CopilotChat,
  CopilotChatMessageView,
  useConfigureSuggestions,
  useFrontendTool,
} from '@copilotkit/react-core/v2';
import { Box } from '@mui/material';
import { useMemo } from 'react';
import { z } from 'zod';
import AiModeChatInput from '@/components/assistant/AiModeChatInput';
import AiModeConversationLayout from '@/components/assistant/AiModeConversationLayout';
import AiModeSuggestionView from '@/components/assistant/AiModeSuggestionView';
import AiModeTextMessageView from '@/components/assistant/AiModeTextMessageView';
import AiModeWelcomeScreen from '@/components/assistant/AiModeWelcomeScreen';
import { useCart } from '@/contexts/CartContext';
import { AI_MODE_SUGGESTIONS } from '@/lib/copilot/suggestions';

function CartSyncTool() {
  const { refreshCart } = useCart();

  useFrontendTool({
    name: 'sync_cart_context',
    description:
      'Refresh the storefront cart badge and local cart state after cart mutations or checkout in chat.',
    parameters: z.object({}),
    handler: async () => {
      await refreshCart();
      return { synced: true };
    },
  });

  return null;
}

function AiModeSuggestionsConfig() {
  const suggestions = useMemo(
    () =>
      AI_MODE_SUGGESTIONS.map((item) => ({
        title: item.title,
        message: item.message,
      })),
    [],
  );

  useConfigureSuggestions({
    suggestions,
    available: 'before-first-message',
  });

  return null;
}

export default function AiModeChat() {
  return (
    <Box
      className="ai-mode-chat-shell"
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        minHeight: 0,
        overflow: 'hidden',
        '& .ai-mode-chat': {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          height: '100%',
          maxHeight: '100%',
          width: '100%',
          overflow: 'hidden',
        },
      }}
    >
      <CartSyncTool />
      <AiModeSuggestionsConfig />

      <CopilotChat
        className="ai-mode-chat"
        welcomeScreen={AiModeWelcomeScreen}
        input={AiModeChatInput}
        suggestionView={AiModeSuggestionView}
        messageView={
          AiModeTextMessageView as unknown as typeof CopilotChatMessageView
        }
        labels={{
          welcomeMessageText: 'Ready when you are.',
          chatInputPlaceholder: 'Ask anything...',
          chatDisclaimerText: 'AI can make mistakes. Please verify important information.',
        }}
      >
        {({ scrollView, input, suggestionView }) => (
          <AiModeConversationLayout
            scrollView={scrollView}
            input={input}
            suggestionView={suggestionView}
          />
        )}
      </CopilotChat>
    </Box>
  );
}
