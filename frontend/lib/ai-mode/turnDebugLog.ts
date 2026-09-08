import type { Message } from '@ag-ui/core';
import {
  findCatalogComponentNamesInContent,
  isActivityBuilding,
} from '@/lib/a2ui/extractCatalogComponents';

function getTextPreview(content: unknown, maxLen = 120): string | null {
  if (typeof content === 'string') {
    const trimmed = content.trim();
    return trimmed ? trimmed.slice(0, maxLen) : null;
  }

  if (Array.isArray(content)) {
    const text = content
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
    return text ? text.slice(0, maxLen) : null;
  }

  return null;
}

function getToolCallNames(message: Message): string[] {
  if (message.role !== 'assistant' || !Array.isArray(message.toolCalls)) return [];
  return message.toolCalls
    .map((call) => call.function?.name)
    .filter((name): name is string => Boolean(name));
}

export type TurnDebugMessageRow = {
  index: number;
  id: string;
  role: string;
  textPreview: string | null;
  toolCalls: string[];
  activityComponents: string[];
  activityStatus: 'building' | 'retrying' | 'ready' | null;
  toolCallId: string | null;
};

export type TurnDebugTurn = {
  turnIndex: number;
  userIndex: number;
  userText: string | null;
  messages: TurnDebugMessageRow[];
  hasAssistantText: boolean;
  hasActivityUi: boolean;
};

export function summarizeAgentMessages(messages: Message[]): TurnDebugMessageRow[] {
  return messages.map((message, index) => {
    const row: TurnDebugMessageRow = {
      index,
      id: message.id,
      role: message.role,
      textPreview: getTextPreview(message.content),
      toolCalls: getToolCallNames(message),
      activityComponents: [],
      activityStatus: null,
      toolCallId:
        message.role === 'tool' && 'toolCallId' in message && message.toolCallId
          ? String(message.toolCallId)
          : null,
    };

    if (message.role === 'activity') {
      row.activityComponents = findCatalogComponentNamesInContent(message.content);
      if (isActivityBuilding(message.content)) {
        const status = (message.content as { status?: string } | undefined)?.status;
        row.activityStatus = status === 'retrying' ? 'retrying' : 'building';
      } else if (row.activityComponents.length > 0) {
        row.activityStatus = 'ready';
      }
    }

    return row;
  });
}

export function groupMessagesIntoTurns(messages: Message[]): TurnDebugTurn[] {
  const rows = summarizeAgentMessages(messages);
  const turns: TurnDebugTurn[] = [];

  for (let i = 0; i < messages.length; i += 1) {
    if (messages[i]?.role !== 'user') continue;

    const turnMessages: TurnDebugMessageRow[] = [];
    let hasAssistantText = false;
    let hasActivityUi = false;

    for (let j = i + 1; j < messages.length; j += 1) {
      if (messages[j]?.role === 'user') break;
      const row = rows[j];
      if (!row) continue;
      turnMessages.push(row);
      if (row.role === 'assistant' && row.textPreview) hasAssistantText = true;
      if (row.role === 'activity' && row.activityStatus === 'ready') hasActivityUi = true;
    }

    turns.push({
      turnIndex: turns.length,
      userIndex: i,
      userText: rows[i]?.textPreview ?? null,
      messages: turnMessages,
      hasAssistantText,
      hasActivityUi,
    });
  }

  return turns;
}

export function logAgentTurnDebug(
  messages: Message[],
  context: { isRunning: boolean; label?: string },
) {
  const summary = summarizeAgentMessages(messages);
  const turns = groupMessagesIntoTurns(messages);

  const payload = {
    label: context.label ?? 'agent.messages',
    isRunning: context.isRunning,
    messageCount: messages.length,
    turns,
    messages: summary,
  };

  console.groupCollapsed(
    `[AI Mode turn debug] ${payload.label} · ${payload.messageCount} msgs · running=${payload.isRunning}`,
  );
  console.table(summary);
  console.log('turns', turns);
  console.log('raw messages', messages);
  console.groupEnd();

  return payload;
}
