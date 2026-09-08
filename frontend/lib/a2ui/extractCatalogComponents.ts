import { catalogDefinitions } from '@/lib/a2ui/definitions';

const CATALOG_COMPONENT_NAMES = new Set(Object.keys(catalogDefinitions));

type ChatMessage = {
  role: string;
  content?: unknown;
};

function extractComponentName(component: unknown): string | null {
  if (!component || typeof component !== 'object') return null;

  const record = component as Record<string, unknown>;
  const comp = record.component;

  if (typeof comp === 'string') return comp;

  if (comp && typeof comp === 'object') {
    const keys = Object.keys(comp);
    if (keys.length === 1) return keys[0] ?? null;
  }

  return null;
}

function collectNamesFromComponents(components: unknown, names: Set<string>) {
  if (!Array.isArray(components)) return;

  for (const component of components) {
    const name = extractComponentName(component);
    if (name && CATALOG_COMPONENT_NAMES.has(name)) {
      names.add(name);
    }
  }
}

export function extractComponentNamesFromActivityContent(content: unknown): string[] {
  const fromLegacy = extractLegacyComponentNames(content);
  const fromV9 = findCatalogComponentNamesInContent(content);
  return [...new Set([...fromLegacy, ...fromV9])];
}

function extractLegacyComponentNames(content: unknown): string[] {
  if (!content || typeof content !== 'object') return [];

  const record = content as Record<string, unknown>;
  const ops = record.a2ui_operations;
  if (!Array.isArray(ops)) return [];

  const names = new Set<string>();

  for (const op of ops) {
    if (!op || typeof op !== 'object') continue;

    const operation = op as Record<string, unknown>;
    const updateComponents = operation.updateComponents as Record<string, unknown> | undefined;
    collectNamesFromComponents(updateComponents?.components, names);

    const surfaceUpdate = operation.surfaceUpdate as Record<string, unknown> | undefined;
    collectNamesFromComponents(surfaceUpdate?.components, names);
  }

  return [...names];
}

/** Walk parsed A2UI activity JSON for catalog component names (v0.9 + nested props). */
export function findCatalogComponentNamesInContent(content: unknown): string[] {
  const found = new Set<string>();
  const catalogNames = Object.keys(catalogDefinitions);

  const visit = (value: unknown) => {
    if (!value || typeof value !== 'object') return;

    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }

    const record = value as Record<string, unknown>;

    for (const name of catalogNames) {
      if (name in record) found.add(name);
    }

    if (typeof record.component === 'string' && catalogNames.includes(record.component)) {
      found.add(record.component);
    }

    if (record.component && typeof record.component === 'object') {
      const keys = Object.keys(record.component as object);
      if (keys.length === 1 && catalogNames.includes(keys[0])) {
        found.add(keys[0]);
      }
    }

    for (const val of Object.values(record)) visit(val);
  };

  visit(content);
  return [...found];
}

export function findTitleInActivityContent(content: unknown): string | null {
  let title: string | null = null;

  const visit = (value: unknown) => {
    if (title || !value || typeof value !== 'object') return;

    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }

    const record = value as Record<string, unknown>;
    const rawTitle = record.title;
    if (typeof rawTitle === 'string' && rawTitle.trim()) {
      title = rawTitle.trim();
      return;
    }

    for (const val of Object.values(record)) visit(val);
  };

  visit(content);
  return title;
}

export function isActivityBuilding(content: unknown): boolean {
  if (!content || typeof content !== 'object') return false;

  const status = (content as Record<string, unknown>).status;
  return status === 'building' || status === 'retrying';
}

export function isResponseTerminalMessage(messages: ChatMessage[], index: number): boolean {
  for (let i = index + 1; i < messages.length; i += 1) {
    if (messages[i]?.role === 'user') return true;
    return false;
  }

  return true;
}

function getTurnStartIndex(messages: ChatMessage[], terminalIndex: number): number {
  for (let i = terminalIndex; i >= 0; i -= 1) {
    if (messages[i]?.role === 'user') return i + 1;
  }

  return 0;
}

export function collectCatalogComponentsForTurn(
  messages: ChatMessage[],
  terminalIndex: number,
): { components: string[]; isBuilding: boolean } {
  const start = getTurnStartIndex(messages, terminalIndex);
  const names = new Set<string>();
  let isBuilding = false;

  for (let i = start; i <= terminalIndex; i += 1) {
    const msg = messages[i];
    if (!msg || msg.role !== 'activity') continue;

    if (isActivityBuilding(msg.content)) {
      isBuilding = true;
    }

    for (const name of extractComponentNamesFromActivityContent(msg.content)) {
      names.add(name);
    }
  }

  return {
    components: [...names],
    isBuilding,
  };
}
