import type { ActivityMessage, Message } from '@ag-ui/core';
import {
  findCatalogComponentNamesInContent,
  isActivityBuilding,
} from '@/lib/a2ui/extractCatalogComponents';

export type RenderActivityFn = (message: ActivityMessage) => unknown;

function getAssistantText(content: unknown): string {
  if (typeof content === 'string') return content.trim();

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (
          part &&
          typeof part === 'object' &&
          'type' in part &&
          (part as { type: string }).type === 'text' &&
          'text' in part
        ) {
          return String((part as { text: unknown }).text);
        }
        return '';
      })
      .join('')
      .trim();
  }

  return '';
}

export function getTurnActivityMessages(
  messages: Message[],
  userIndex: number,
): ActivityMessage[] {
  const activities: ActivityMessage[] = [];

  for (let j = userIndex + 1; j < messages.length; j += 1) {
    if (messages[j]?.role === 'user') break;
    if (messages[j]?.role === 'activity') {
      activities.push(messages[j] as ActivityMessage);
    }
  }

  return activities;
}

/** Same signal as AiModeUiPane: latest activity in the turn that actually renders. */
export function turnHasRenderableUi(
  messages: Message[],
  userIndex: number,
  renderActivityMessage?: RenderActivityFn,
): boolean {
  const activities = getTurnActivityMessages(messages, userIndex);

  for (let i = activities.length - 1; i >= 0; i -= 1) {
    const activity = activities[i];
    if (isActivityBuilding(activity.content)) continue;

    if (renderActivityMessage) {
      try {
        if (renderActivityMessage(activity)) return true;
      } catch {
        // fall through
      }
    }

    if (findCatalogComponentNamesInContent(activity.content).length > 0) {
      return true;
    }
  }

  return false;
}

function analyzeTurn(
  messages: Message[],
  userIndex: number,
  renderActivityMessage?: RenderActivityFn,
) {
  let hasAssistantText = false;
  const componentNames = new Set<string>();

  for (let j = userIndex + 1; j < messages.length; j += 1) {
    if (messages[j]?.role === 'user') break;
    if (messages[j]?.role === 'assistant' && getAssistantText(messages[j].content)) {
      hasAssistantText = true;
    }
    if (messages[j]?.role === 'activity') {
      for (const name of findCatalogComponentNamesInContent(messages[j].content)) {
        componentNames.add(name);
      }
    }
  }

  return {
    hasAssistantText,
    hasRenderableUi: turnHasRenderableUi(messages, userIndex, renderActivityMessage),
    componentNames: [...componentNames],
  };
}

export type TurnAnalysis = ReturnType<typeof analyzeTurn>;

/** Dev-only: inspect whether the latest turn has UI and/or model text. */
export function debugCompanionTurn(
  messages: Message[],
  userIndex: number,
  options: { renderActivityMessage?: RenderActivityFn } = {},
): TurnAnalysis & { userIndex: number; activityCount: number } {
  const idx =
    userIndex >= 0 ? userIndex : messages.findLastIndex((m) => m.role === 'user');
  const turn = analyzeTurn(messages, idx, options.renderActivityMessage);

  const payload = {
    userIndex: idx,
    activityCount: getTurnActivityMessages(messages, idx).length,
    ...turn,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('[AiMode companion debug]', payload);
  }

  return payload;
}

