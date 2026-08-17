const SCRIPT_OPEN_RE = /<\s*script\b|&lt;\s*script\b/i;
const SCRIPT_SRC_RE = /<\s*script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/i;

const WIDGET_TYPES = new Set(['admin_widget', 'customer_widget', 'supplier_widget']);

export const WIDGET_SCRIPT_REQUIRED_MESSAGE =
  'Widget script must be a script tag, for example <script src="https://example.com/widget.js"></script>.';
export const WIDGET_SCRIPT_SRC_MESSAGE = 'Widget script must include a src URL.';
export const WIDGET_TOKEN_SCRIPT_MESSAGE =
  'Access token must not be a script. Paste the access token only.';

export function isWidgetConfigType(type: string): boolean {
  return WIDGET_TYPES.has(type);
}

export function isScriptType(value: string): boolean {
  return SCRIPT_OPEN_RE.test(value.trim());
}

export function validateWidgetScript(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Widget script is required.';
  if (!isScriptType(trimmed)) return WIDGET_SCRIPT_REQUIRED_MESSAGE;
  if (!trimmed.match(SCRIPT_SRC_RE)?.[1]?.trim()) return WIDGET_SCRIPT_SRC_MESSAGE;
  return null;
}

export function validateWidgetToken(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Access token is required.';
  if (isScriptType(trimmed)) return WIDGET_TOKEN_SCRIPT_MESSAGE;
  return null;
}

export function validateWidgetScriptLive(value: string): string | null {
  if (!value.trim()) return null;
  return validateWidgetScript(value);
}

export function validateWidgetTokenLive(value: string): string | null {
  if (!value.trim()) return null;
  return validateWidgetToken(value);
}
