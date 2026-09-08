'use client';

import { useAgent, useRenderActivityMessage } from '@copilotkit/react-core/v2';
import type { ActivityMessage, Message } from '@ag-ui/core';
import StopRounded from '@mui/icons-material/StopRounded';
import { Box, Button, Typography } from '@mui/material';
import { useMemo, type ReactNode } from 'react';
import AiModeGeneratingLoader from '@/components/assistant/AiModeGeneratingLoader';
import { useStopAgentRun } from '@/lib/copilot/useStopAgentRun';
import { colors } from '@/theme/colors';

function getLastUserMessageIndex(messages: Message[]): number {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === 'user') return i;
  }
  return -1;
}

function getPreviousUserMessageIndex(messages: Message[], beforeIndex: number): number {
  for (let i = beforeIndex - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === 'user') return i;
  }
  return -1;
}

function getTurnActivityMessages(
  messages: Message[],
  afterUserIndex: number,
  beforeUserIndex?: number,
): ActivityMessage[] {
  const start = afterUserIndex + 1;
  const end = beforeUserIndex ?? messages.length;

  return messages
    .slice(start, end)
    .filter((message): message is ActivityMessage => message.role === 'activity');
}

function getLatestRenderableSurfaces(
  messages: ActivityMessage[],
  renderActivityMessage: (message: ActivityMessage) => ReactNode,
  options?: { usePrevious?: boolean },
) {
  const surfaces = messages
    .map((message) => ({
      id: message.id,
      node: renderActivityMessage(message),
    }))
    .filter((entry) => entry.node);

  if (surfaces.length === 0) return [];

  if (options?.usePrevious && surfaces.length > 1) {
    return [surfaces[surfaces.length - 2]];
  }

  return [surfaces[surfaces.length - 1]];
}

export default function AiModeUiPane() {
  const { agent } = useAgent();
  const { renderActivityMessage } = useRenderActivityMessage();
  const { stopRun, isRunning } = useStopAgentRun();

  const { currentTurnMessages, previousTurnMessages } = useMemo(() => {
    const lastUserIndex = getLastUserMessageIndex(agent.messages);
    if (lastUserIndex === -1) {
      return { currentTurnMessages: [], previousTurnMessages: [] };
    }

    const previousUserIndex = getPreviousUserMessageIndex(agent.messages, lastUserIndex);

    return {
      currentTurnMessages: getTurnActivityMessages(agent.messages, lastUserIndex),
      previousTurnMessages:
        previousUserIndex === -1
          ? []
          : getTurnActivityMessages(agent.messages, previousUserIndex, lastUserIndex),
    };
  }, [agent.messages]);

  // Only block the UI pane while the agent is actively running. Stale activity
  // messages can remain in building/retrying after RUN_FINISHED (e.g. truncated
  // generate_a2ui JSON) — tying the overlay to isRunning prevents infinite spinners.
  const isGenerating = isRunning;

  const currentLatestSurfaces = useMemo(
    () => getLatestRenderableSurfaces(currentTurnMessages, renderActivityMessage),
    [currentTurnMessages, renderActivityMessage],
  );

  const currentPreviousInTurnSurfaces = useMemo(
    () =>
      getLatestRenderableSurfaces(currentTurnMessages, renderActivityMessage, {
        usePrevious: true,
      }),
    [currentTurnMessages, renderActivityMessage],
  );

  const previousTurnLatestSurfaces = useMemo(
    () => getLatestRenderableSurfaces(previousTurnMessages, renderActivityMessage),
    [previousTurnMessages, renderActivityMessage],
  );

  const isNewUiReady = currentLatestSurfaces.length > 0 && !isGenerating;

  const displayedSurfaces = isNewUiReady
    ? currentLatestSurfaces
    : isGenerating && currentPreviousInTurnSurfaces.length > 0
      ? currentPreviousInTurnSurfaces
      : isGenerating && previousTurnLatestSurfaces.length > 0
        ? previousTurnLatestSurfaces
        : currentLatestSurfaces;

  return (
    <Box
      component="section"
      aria-label="UI response"
      data-testid="ai-mode-ui-pane"
      sx={{
        position: 'relative',
        flex: '1 1 auto',
        minWidth: 0,
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: colors.white,
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          p: { xs: '1.25rem 1.5rem', md: '1.5rem 2rem' },
        }}
      >
        {displayedSurfaces.length > 0 ? (
          displayedSurfaces.map((entry) => (
            <Box key={entry.id} sx={{ width: '100%', maxWidth: 960, mx: 'auto' }}>
              {entry.node}
            </Box>
          ))
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100%',
              textAlign: 'center',
              color: colors.textSecondary,
              fontSize: '0.9375rem',
              '& p': { m: 0 },
            }}
          >
            <Typography component="p">Interactive results will appear here.</Typography>
          </Box>
        )}
      </Box>

      {isGenerating ? (
        <Box
          role="status"
          aria-live="polite"
          aria-label="Building your view"
          data-testid="ai-mode-ui-generating-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            bgcolor: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            textAlign: 'center',
            color: colors.textSecondary,
            fontSize: '0.9375rem',
            '& p': { m: 0 },
          }}
        >
          <AiModeGeneratingLoader />
          <Typography component="p">Building your view…</Typography>
          <Button
            type="button"
            data-testid="copilot-stop-button-overlay"
            aria-label="Stop generating"
            onClick={stopRun}
            startIcon={<StopRounded sx={{ fontSize: 18 }} />}
            sx={{
              mt: 0.5,
              borderRadius: '999px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: colors.white,
              bgcolor: colors.charcoal,
              px: 2,
              py: 0.75,
              boxShadow: 'none',
              pointerEvents: 'auto',
              '&:hover': {
                bgcolor: colors.charcoalDark,
                boxShadow: 'none',
              },
            }}
          >
            Stop
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}
