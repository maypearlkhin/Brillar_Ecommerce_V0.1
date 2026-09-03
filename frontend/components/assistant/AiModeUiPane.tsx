'use client';

import { useAgent, useRenderActivityMessage } from '@copilotkit/react-core/v2';
import type { ActivityMessage, Message } from '@ag-ui/core';
import { useMemo } from 'react';
import { isActivityBuilding } from '@/lib/a2ui/extractCatalogComponents';

function getLatestTurnActivityMessages(messages: Message[]): ActivityMessage[] {
  let lastUserIndex = -1;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === 'user') {
      lastUserIndex = i;
      break;
    }
  }

  if (lastUserIndex === -1) return [];

  return messages
    .slice(lastUserIndex + 1)
    .filter((message): message is ActivityMessage => message.role === 'activity');
}

export default function AiModeUiPane() {
  const { agent } = useAgent();
  const { renderActivityMessage } = useRenderActivityMessage();

  const activityMessages = useMemo(
    () => getLatestTurnActivityMessages(agent.messages),
    [agent.messages],
  );

  const isBuilding = activityMessages.some((message) =>
    isActivityBuilding(message.content),
  );

  const renderedSurfaces = activityMessages
    .map((message) => ({
      id: message.id,
      node: renderActivityMessage(message),
    }))
    .filter((entry) => entry.node);

  return (
    <section
      className="ai-mode-ui-pane"
      aria-label="UI response"
      data-testid="ai-mode-ui-pane"
    >
      <div className="ai-mode-ui-pane-inner">
        {renderedSurfaces.length > 0 ? (
          renderedSurfaces.map((entry) => (
            <div key={entry.id} className="ai-mode-ui-surface">
              {entry.node}
            </div>
          ))
        ) : (
          <div className="ai-mode-ui-empty">
            {agent.isRunning || isBuilding ? (
              <>
                <span className="ai-mode-ui-empty-spinner" aria-hidden="true" />
                <p>Building your view…</p>
              </>
            ) : (
              <p>Interactive results will appear here.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
