'use client';

import {
  CopilotChat,
  CopilotChatMessageView,
  useConfigureSuggestions,
  useFrontendTool,
} from '@copilotkit/react-core/v2';
import { Box, GlobalStyles } from '@mui/material';
import { useMemo } from 'react';
import { z } from 'zod';
import AiModeChatInput from '@/components/assistant/AiModeChatInput';
import AiModeConversationLayout from '@/components/assistant/AiModeConversationLayout';
import AiModeSuggestionView from '@/components/assistant/AiModeSuggestionView';
import AiModeTextMessageView from '@/components/assistant/AiModeTextMessageView';
import AiModeWelcomeScreen from '@/components/assistant/AiModeWelcomeScreen';
import AiModePageReadySignal from '@/components/assistant/AiModePageReadySignal';
import { AiModeAuthUiProvider } from '@/contexts/AiModeAuthUiContext';
import { useCart } from '@/contexts/CartContext';
import { AI_MODE_SUGGESTIONS } from '@/lib/copilot/suggestions';
import { colors } from '@/theme/colors';

const CHAT_PADDING_X = '12vw';
const CHAT_INPUT_MAX_WIDTH = 760;

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
    <>
      <GlobalStyles
        styles={{
          'html:has([data-ai-mode-shell]), body:has([data-ai-mode-shell])': {
            overflow: 'hidden',
            height: '100%',
          },
        }}
      />
      <Box
        data-ai-mode-shell
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          maxHeight: '100%',
          minHeight: 0,
          overflow: 'hidden',
          '--a2ui-primary-color': colors.orange,
          '& .ai-mode-chat': {
            '--copilot-kit-background-color': colors.white,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            height: '100%',
            maxHeight: '100%',
            width: '100%',
            overflow: 'hidden',
          },
          /* Shared copilotKitChat base — no flexDirection here (welcome vs conversation differ) */
          '& .copilotKitChat': {
            flex: 1,
            width: '100%',
            maxWidth: '100%',
            height: '100%',
            maxHeight: '100%',
            minHeight: 0,
            overflow: 'hidden',
            position: 'relative',
          },
          /* State 1 — welcome */
          '& .copilotKitChat:has([data-testid="copilot-welcome-screen"])': {
            display: 'flex',
            flexDirection: 'column',
          },
          '& .copilotKitChat:has([data-testid="copilot-welcome-screen"]) [class*="overflow-y-auto"]':
            {
              flex: '1 1 auto',
              minHeight: 0,
              maxHeight: '100%',
              height: '100%',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
            },
          '& .copilotKitChat:has([data-testid="copilot-welcome-screen"]) [data-testid="copilot-scroll-content"]':
            {
              width: '100%',
              flex: '1 1 auto',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              px: CHAT_PADDING_X,
              pt: 2,
              boxSizing: 'border-box',
            },
          '& .copilotKitChat:has([data-testid="copilot-welcome-screen"]) [data-testid="copilot-input-overlay"]':
            {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 30,
              flex: 'none',
              width: '100%',
              height: 'auto',
              maxHeight: 'none',
              minHeight: 0,
              overflow: 'visible',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 0,
              bgcolor: 'transparent',
              pointerEvents: 'none',
            },
          '& .copilotKitChat:has([data-testid="copilot-welcome-screen"]) [data-testid="copilot-input-overlay"] > *':
            {
              width: '100%',
              maxWidth: CHAT_INPUT_MAX_WIDTH,
            },
          /* State 2 — split conversation (row layout owned by AiModeConversationLayout) */
          '& .copilotKitChat[data-ai-mode-conversation="true"]': {
            display: 'flex',
            flexDirection: 'row',
          },
          '& .copilotKitChat[data-ai-mode-conversation="true"] [data-testid="copilot-input-overlay"]':
            {
              position: 'relative',
              bottom: 'auto',
              left: 'auto',
              right: 'auto',
              flex: '0 0 auto',
              width: '100%',
              maxWidth: 'none',
              p: 0,
              pointerEvents: 'none',
            },
          '& .copilotKitChat [class*="max-w-3xl"]': {
            maxWidth: 'none',
            width: '100%',
            mx: 0,
          },
          '& .copilotKitChat [class*="max-w-3xl"] [class*="max-w-3xl"]': {
            px: 0,
          },
          '& [data-testid="copilot-loading-cursor"]': {
            alignSelf: 'flex-start',
            ml: 0,
          },
        }}
      >
        <AiModeAuthUiProvider>
          <AiModePageReadySignal />
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
        </AiModeAuthUiProvider>
      </Box>
    </>
  );
}
