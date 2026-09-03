'use client';

import { CopilotChatInput } from '@copilotkit/react-core/v2';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import { useCallback, useState, type ComponentProps, type MouseEvent, type Ref } from 'react';
import AiModeShopPill from '@/components/assistant/AiModeShopPill';
import ChatModelPill from '@/components/assistant/ChatModelPill';

type CopilotChatInputProps = ComponentProps<typeof CopilotChatInput>;
type AiModeChatInputSlots = Parameters<NonNullable<CopilotChatInputProps['children']>>[0];

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
  return (
    <CopilotChatInput.SendButton {...props}>
      {props.children ?? <ArrowForwardRounded sx={{ fontSize: 18 }} />}
    </CopilotChatInput.SendButton>
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
  positioning = 'static',
  keyboardHeight = 0,
  bottomAnchored = false,
}: AiModeChatInputSlots) {
  const isConversationInput = positioning === 'absolute' || bottomAnchored;
  const [isWelcomeInput, setIsWelcomeInput] = useState(true);

  const handleContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      assignRef(containerRef as Ref<HTMLDivElement>, node);
      setIsWelcomeInput(!node?.closest('[data-testid="copilot-input-overlay"]'));
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
      const textarea = document.querySelector<HTMLTextAreaElement>(
        '[data-testid="copilot-chat-textarea"]',
      );
      textarea?.focus();
    }
  };

  const toolbarStart = (
    <div className="ai-mode-input-toolbar-start">
      {addMenuButton}
      <AiModeShopPill />
    </div>
  );

  const centerContent =
    mode === 'transcribe' ? (
      audioRecorder
    ) : mode === 'processing' ? (
      <div className="ai-mode-input-processing">
        <span className="ai-mode-input-spinner" aria-hidden="true" />
      </div>
    ) : (
      textArea
    );

  const toolbarEnd =
    mode === 'transcribe' ? (
      <>
        {cancelTranscribeButton}
        {finishTranscribeButton}
      </>
    ) : (
      <>
        <ChatModelPill variant="toolbar" />
        {startTranscribeButton}
        {sendButton}
      </>
    );

  return (
    <div
      data-copilotkit
      ref={handleContainerRef}
      className="ai-mode-input-container"
      style={{
        transform: keyboardHeight > 0 ? `translateY(-${keyboardHeight}px)` : undefined,
        transition: 'transform 0.2s ease-out',
        ...(isConversationInput
          ? { paddingBottom: 'var(--copilotkit-license-banner-offset, 0px)' }
          : {}),
      }}
    >
      <div className="ai-mode-input-inner">
        <div
          data-testid="copilot-chat-input"
          className="ai-mode-input-pill copilotKitInput"
          data-layout="expanded"
          onClick={handleContainerClick}
        >
          <div className="ai-mode-input-grid" data-layout="expanded">
            <div className="ai-mode-input-textarea-wrap">{centerContent}</div>
            <div className="ai-mode-input-bottom-row">
              {toolbarStart}
              <div className="ai-mode-input-actions">{toolbarEnd}</div>
            </div>
          </div>
        </div>
      </div>
      {showDisclaimer && isWelcomeInput ? disclaimer : null}
    </div>
  );
}

export default Object.assign(function AiModeChatInput(props: CopilotChatInputProps) {
  return (
    <CopilotChatInput {...props} sendButton={PerplexitySendButton}>
      {(slots) => <AiModeChatInputLayout {...slots} />}
    </CopilotChatInput>
  );
}, CopilotChatInput);
