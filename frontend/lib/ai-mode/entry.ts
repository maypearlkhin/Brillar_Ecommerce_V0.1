export const AI_MODE_LOADING_FLAG = 'ai-mode-show-loading';
export const AI_MODE_LOADING_DURATION_MS = 7000;

export function markAiModeLoadingEntry() {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(AI_MODE_LOADING_FLAG, String(Date.now()));
}

export function getAiModeLoadingDeadline(): number | null {
  if (typeof window === 'undefined') return null;

  const raw = sessionStorage.getItem(AI_MODE_LOADING_FLAG);
  if (!raw) return null;

  const startedAt = Number(raw);
  if (!Number.isFinite(startedAt)) {
    sessionStorage.removeItem(AI_MODE_LOADING_FLAG);
    return null;
  }

  return startedAt + AI_MODE_LOADING_DURATION_MS;
}

export function clearAiModeLoadingEntry() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(AI_MODE_LOADING_FLAG);
}

export function isAiModeReloadNavigation(): boolean {
  if (typeof window === 'undefined') return false;

  const nav = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined;

  return nav?.type === 'reload';
}

/** Active deadline, or start a new loading window after a full page reload on /ai-mode. */
export function ensureAiModeLoadingDeadline(): number | null {
  let deadline = getAiModeLoadingDeadline();

  if (!deadline && isAiModeReloadNavigation()) {
    markAiModeLoadingEntry();
    deadline = getAiModeLoadingDeadline();
  }

  return deadline;
}
