'use client';

import { useAgent } from '@copilotkit/react-core/v2';
import type { Message } from '@ag-ui/core';
import AiModeCatalogUsageBadge from '@/components/assistant/AiModeCatalogUsageBadge';
import {
  collectCatalogComponentsForTurn,
  isResponseTerminalMessage,
} from '@/lib/a2ui/extractCatalogComponents';

type AiModeCatalogUsageRendererProps = {
  message: Message;
  position: 'before' | 'after';
  messageIndex: number;
};

export default function AiModeCatalogUsageRenderer({
  message,
  position,
  messageIndex,
}: AiModeCatalogUsageRendererProps) {
  const { agent } = useAgent();
  const messages = agent.messages;

  if (position !== 'after') return null;
  if (message.role === 'user') return null;
  if (!isResponseTerminalMessage(messages, messageIndex)) return null;

  const { components, isBuilding } = collectCatalogComponentsForTurn(
    messages,
    messageIndex,
  );

  if (components.length > 0) {
    return <AiModeCatalogUsageBadge mode="components" components={components} />;
  }

  if (isBuilding) {
    return <AiModeCatalogUsageBadge mode="building" />;
  }

  return <AiModeCatalogUsageBadge mode="text-only" />;
}
