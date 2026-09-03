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
