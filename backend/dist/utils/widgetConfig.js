"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WIDGET_TOKEN_SCRIPT_MESSAGE = exports.WIDGET_SCRIPT_SRC_MESSAGE = exports.WIDGET_SCRIPT_REQUIRED_MESSAGE = void 0;
exports.isWidgetConfigType = isWidgetConfigType;
exports.isScriptType = isScriptType;
exports.validateWidgetScript = validateWidgetScript;
exports.validateWidgetToken = validateWidgetToken;
const SCRIPT_OPEN_RE = /<\s*script\b|&lt;\s*script\b/i;
const SCRIPT_SRC_RE = /<\s*script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/i;
const WIDGET_TYPES = new Set(['admin_widget', 'customer_widget', 'supplier_widget']);
exports.WIDGET_SCRIPT_REQUIRED_MESSAGE = 'Widget script must be a script tag, for example <script src="https://example.com/widget.js"></script>.';
exports.WIDGET_SCRIPT_SRC_MESSAGE = 'Widget script must include a src URL.';
exports.WIDGET_TOKEN_SCRIPT_MESSAGE = 'Access token must not be a script. Paste the access token only.';
function isWidgetConfigType(type) {
    return WIDGET_TYPES.has(type);
}
function isScriptType(value) {
    return SCRIPT_OPEN_RE.test(value.trim());
}
function validateWidgetScript(value) {
    const trimmed = value.trim();
    if (!trimmed)
        return 'Widget script is required.';
    if (!isScriptType(trimmed))
        return exports.WIDGET_SCRIPT_REQUIRED_MESSAGE;
    if (!trimmed.match(SCRIPT_SRC_RE)?.[1]?.trim())
        return exports.WIDGET_SCRIPT_SRC_MESSAGE;
    return null;
}
function validateWidgetToken(value) {
    const trimmed = value.trim();
    if (!trimmed)
        return 'Access token is required.';
    if (isScriptType(trimmed))
        return exports.WIDGET_TOKEN_SCRIPT_MESSAGE;
    return null;
}
//# sourceMappingURL=widgetConfig.js.map