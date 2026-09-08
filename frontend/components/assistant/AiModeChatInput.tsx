'use client';

import { CopilotChatInput } from '@copilotkit/react-core/v2';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import StopRounded from '@mui/icons-material/StopRounded';
import { Box, Button } from '@mui/material';
import { keyframes } from '@mui/system';
import { useCallback, useLayoutEffect, useRef, useState, type ComponentProps, type MouseEvent, type ReactElement, type Ref } from 'react';
// import AiModeShopPill from '@/components/assistant/AiModeShopPill';
import ChatModelPill from '@/components/assistant/ChatModelPill';
import { useStopAgentRun } from '@/lib/copilot/useStopAgentRun';
import { colors } from '@/theme/colors';

const CHAT_INPUT_MAX_WIDTH = 760;
const CHAT_PADDING_X = '12vw';
const TEXTAREA_MAX_LINES = 6;

const inputSpin = keyframes`
  to { transform: rotate(360deg); }
`;

type CopilotChatInputProps = ComponentProps<typeof CopilotChatInput>;
type AiModeChatInputSlots = Parameters<NonNullable<CopilotChatInputProps['children']>>[0];

type InputPlacement = 'welcome' | 'overlay' | 'column';

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') {
    ref(node);
  } else if (ref) {
    ref.current = node;
  }
}

function PerplexitySendButton(
  props: ComponentProps<typeof CopilotChatInput.SendButton>,
) {
  const isStop = props['aria-label'] === 'Stop generating' || Boolean(props.children);

  return (
    <CopilotChatInput.SendButton
      {...props}
      aria-label={isStop ? 'Stop generating' : 'Send message'}
    >
      {isStop ? (
        props.children ?? <StopRounded sx={{ fontSize: 18 }} />
      ) : (
        <ArrowForwardRounded sx={{ fontSize: 18 }} />
      )}
    </CopilotChatInput.SendButton>
  );
}

function StopRunButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      data-testid="copilot-stop-button"
      aria-label="Stop generating"
      onClick={onClick}
      startIcon={<StopRounded sx={{ fontSize: 16 }} />}
      sx={{
        borderRadius: '999px',
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.8125rem',
        lineHeight: 1.2,
        color: colors.white,
        bgcolor: colors.charcoal,
        px: 1.25,
        py: 0.5,
        minHeight: 32,
        flexShrink: 0,
        boxShadow: 'none',
        '&:hover': {
          bgcolor: colors.charcoalDark,
          boxShadow: 'none',
        },
      }}
    >
      Stop
    </Button>
  );
}

function adjustTextareaGrowth(textarea: HTMLTextAreaElement) {
  const computed = window.getComputedStyle(textarea);
  const paddingTop = parseFloat(computed.paddingTop) || 0;
  const paddingBottom = parseFloat(computed.paddingBottom) || 0;
  const previousValue = textarea.value;

  textarea.style.height = 'auto';
  textarea.value = '';
  const singleLineHeight = textarea.scrollHeight;
  textarea.value = previousValue;

  const contentLineHeight = Math.max(singleLineHeight - paddingTop - paddingBottom, 1);
  const maxHeight =
    contentLineHeight * TEXTAREA_MAX_LINES + paddingTop + paddingBottom;

  textarea.style.maxHeight = `${maxHeight}px`;
  textarea.style.height = 'auto';
  const scrollHeight = textarea.scrollHeight;
  textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
}

function AutoGrowTextarea({ children }: { children: ReactElement }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const textarea = wrapRef.current?.querySelector<HTMLTextAreaElement>(
      '[data-testid="copilot-chat-textarea"]',
    );
    if (!textarea) return;

    const scheduleAdjust = () => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => adjustTextareaGrowth(textarea));
      });
    };

    scheduleAdjust();
    textarea.addEventListener('input', scheduleAdjust);
    const observer = new ResizeObserver(scheduleAdjust);
    observer.observe(textarea);

    return () => {
      textarea.removeEventListener('input', scheduleAdjust);
      observer.disconnect();
    };
  }, [children]);

  return (
    <Box ref={wrapRef} sx={{ width: '100%', display: 'flex', alignItems: 'flex-start' }}>
      {children}
    </Box>
  );
}

function AiModeChatInputLayout({
  addMenuButton,
  textArea,
  sendButton,
  startTranscribeButton,
  cancelTranscribeButton,
  finishTranscribeButton,
  audioRecorder,
  disclaimer,
  mode,
  showDisclaimer,
  containerRef,
  keyboardHeight = 0,
  isRunning = false,
  onStop,
}: AiModeChatInputSlots) {
  const { stopRun, isRunning: agentIsRunning } = useStopAgentRun();
  const generationActive = isRunning || agentIsRunning;
  const handleStop = onStop ?? stopRun;
  const [placement, setPlacement] = useState<InputPlacement>('welcome');

  const handleContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      assignRef(containerRef as Ref<HTMLDivElement>, node);
      if (!node) return;

      if (node.closest('[data-testid="ai-mode-conversation-input"]')) {
        setPlacement('column');
      } else if (node.closest('[data-testid="copilot-input-overlay"]')) {
        setPlacement('overlay');
      } else {
        setPlacement('welcome');
      }
    },
    [containerRef],
  );

  const handleContainerClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (
      target.tagName !== 'BUTTON' &&
      !target.closest('button') &&
      mode === 'input'
    ) {
      const textarea = event.currentTarget.querySelector<HTMLTextAreaElement>(
        '[data-testid="copilot-chat-textarea"]',
      );
      textarea?.focus();
    }
  };

  const isColumnInput = placement === 'column';
  const showWelcomeDisclaimer = showDisclaimer && placement === 'welcome';

  const toolbarStart = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
      {addMenuButton}
      {/* <AiModeShopPill /> */}
    </Box>
  );

  const centerContent =
    mode === 'transcribe' ? (
      audioRecorder
    ) : mode === 'processing' ? (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          py: 1.5,
          px: 2.5,
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            width: 26,
            height: 26,
            border: `2px solid ${colors.orangePaleBorder}`,
            borderTopColor: colors.orange,
            borderRadius: '50%',
            animation: `${inputSpin} 0.8s linear infinite`,
          }}
        />
      </Box>
    ) : (
      <AutoGrowTextarea>{textArea}</AutoGrowTextarea>
    );

  const toolbarEnd =
    mode === 'transcribe' ? (
      <>
        {cancelTranscribeButton}
        {finishTranscribeButton}
      </>
    ) : generationActive ? (
      <>
        <ChatModelPill variant="toolbar" />
        <StopRunButton onClick={handleStop} />
      </>
    ) : (
      <>
        <ChatModelPill variant="toolbar" />
        {startTranscribeButton}
        {sendButton}
      </>
    );

  return (
    <Box
      data-copilotkit
      ref={handleContainerRef}
      className="ai-mode-input-container"
      sx={[
        {
          pointerEvents: 'none',
          position: 'relative',
          zIndex: 20,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        },
        placement === 'overlay'
          ? {
              width: '100%',
              py: 1.5,
              px: `max(1rem, ${CHAT_PADDING_X})`,
              pb: 'calc(0.75rem + var(--copilotkit-license-banner-offset, 0px))',
              boxSizing: 'border-box',
              bgcolor: 'transparent',
              pointerEvents: 'none',
            }
          : null,
      ]}
      style={{
        transform: keyboardHeight > 0 ? `translateY(-${keyboardHeight}px)` : undefined,
        transition: 'transform 0.2s ease-out',
      }}
    >
      <Box
        className="ai-mode-input-inner"
        sx={[
          {
            width: '100%',
            maxWidth: CHAT_INPUT_MAX_WIDTH,
            mx: 'auto',
            p: 0,
            pointerEvents: 'auto',
          },
          isColumnInput ? { maxWidth: 'none' } : null,
        ]}
      >
        <Box
          data-testid="copilot-chat-input"
          className="ai-mode-input-pill copilotKitInput"
          data-layout="expanded"
          onClick={handleContainerClick}
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'text',
            overflow: 'visible',
            border: `1px solid ${colors.orangePaleBorder}`,
            borderRadius: '26px',
            bgcolor: colors.white,
            boxShadow: `0 2px 8px rgba(244, 145, 33, 0.06), 0 12px 32px rgba(244, 145, 33, 0.08)`,
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            '&:focus-within': {
              borderColor: 'rgba(244, 145, 33, 0.45)',
              boxShadow:
                '0 2px 8px rgba(244, 145, 33, 0.1), 0 12px 32px rgba(244, 145, 33, 0.12), 0 0 0 3px rgba(244, 145, 33, 0.12)',
            },
            '& [data-testid="copilot-chat-input"]': { width: '100%' },
            '&&& [data-testid="copilot-chat-textarea"]': {
              width: '100%',
              color: colors.textPrimary,
              px: isColumnInput ? 0.25 : 0.875,
              pt: isColumnInput ? 0.125 : 0,
              pb: isColumnInput ? 0.125 : 0,
              minHeight: isColumnInput ? 32 : 28,
              border: 'none',
              outline: 'none',
              resize: 'none',
              bgcolor: 'transparent',
              fontSize: '16px',
              lineHeight: 1.55,
              overflowY: 'hidden',
              boxSizing: 'border-box',
              '&::placeholder': {
                color: 'rgba(0, 0, 0, 0.47)',
                opacity: 1,
              },
            },
            '& [data-testid="copilot-add-menu-button"]': {
              border: 'none',
              borderRadius: '999px',
              bgcolor: 'transparent',
              color: colors.textSecondary,
              width: 32,
              height: 32,
              minWidth: 32,
              p: 0,
              ml: 0,
              '&:hover:not(:disabled)': {
                bgcolor: colors.orangePale,
                color: colors.textPrimary,
              },
            },
            '& [data-testid="copilot-start-transcribe-button"], & [data-testid="copilot-cancel-transcribe-button"], & [data-testid="copilot-finish-transcribe-button"]':
              {
                border: 'none',
                bgcolor: 'transparent',
                color: colors.textSecondary,
                width: 32,
                height: 32,
                minWidth: 32,
                p: 0,
                mr: 0.35,
                '&:hover:not(:disabled)': {
                  bgcolor: colors.orangePale,
                  color: colors.textPrimary,
                },
              },
            '& [data-testid="copilot-send-button"]': {
              borderRadius: '999px',
              width: 36,
              height: 36,
              minWidth: 36,
              p: 0,
              m: 0,
              transition: 'background-color 0.15s ease, color 0.15s ease, opacity 0.15s ease',
              '&:not(:disabled)': {
                bgcolor: colors.orange,
                color: '#fff',
                opacity: 1,
                '&:hover': {
                  bgcolor: colors.orangeDark,
                  opacity: 1,
                },
              },
              '&[aria-label="Stop generating"]:not(:disabled)': {
                bgcolor: colors.charcoal,
                '&:hover': {
                  bgcolor: colors.charcoalDark,
                },
              },
              '&:disabled': {
                bgcolor: 'rgba(0, 0, 0, 0.06)',
                color: 'rgba(0, 0, 0, 0.28)',
                opacity: 1,
                cursor: 'not-allowed',
              },
            },
          }}
        >
          <Box
            data-layout="expanded"
            sx={[
              {
                display: 'flex',
                flexDirection: 'column',
                gap: 1.6,
                width: '100%',
                p: '1rem 0.875rem 0.75rem',
              },
              isColumnInput
                ? { gap: 0.625, p: '1.125rem 1.125rem 0.875rem' }
                : null,
            ]}
          >
            <Box sx={{ width: '100%', display: 'flex', alignItems: 'flex-start' }}>
              {centerContent}
            </Box>
            <Box
              sx={[
                {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 0.75,
                  width: '100%',
                },
                isColumnInput ? { gap: 0.5, pt: 0.125 } : null,
              ]}
            >
              {toolbarStart}
              <Box
                sx={[
                  {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 0.125,
                    flexShrink: 0,
                    '& > div:has([data-testid="copilot-send-button"])': { mr: 0 },
                  },
                  isColumnInput ? { gap: 0.25 } : null,
                ]}
              >
                {toolbarEnd}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      {showWelcomeDisclaimer ? (
        <Box
          sx={{
            width: '100%',
            maxWidth: CHAT_INPUT_MAX_WIDTH,
            mx: 'auto',
            mt: 1,
            textAlign: 'center',
            pointerEvents: 'auto',
          }}
        >
          {disclaimer}
        </Box>
      ) : null}
    </Box>
  );
}

export default Object.assign(function AiModeChatInput(props: CopilotChatInputProps) {
  return (
    <CopilotChatInput {...props} sendButton={PerplexitySendButton}>
      {(slots) => <AiModeChatInputLayout {...slots} />}
    </CopilotChatInput>
  );
}, CopilotChatInput);
