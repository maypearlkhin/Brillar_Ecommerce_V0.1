'use client';

import type { Message } from '@ag-ui/core';
import AiModeCatalogUsageRenderer from '@/components/assistant/AiModeCatalogUsageRenderer';
import AiModeUiCompanionRenderer from '@/components/assistant/AiModeUiCompanionRenderer';

type AiModeCustomMessageRendererProps = {
  message: Message;
  position: 'before' | 'after';
  messageIndex: number;
};

/**
 * CopilotKit only invokes the first custom message renderer entry; combine ours here.
 */
export default function AiModeCustomMessageRenderer(props: AiModeCustomMessageRendererProps) {
  if (props.position !== 'after') return null;

  return (
    <>
      <AiModeUiCompanionRenderer {...props} />
      <AiModeCatalogUsageRenderer {...props} />
    </>
  );
}
