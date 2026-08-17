export declare const WIDGET_SCRIPT_REQUIRED_MESSAGE = "Widget script must be a script tag, for example <script src=\"https://example.com/widget.js\"></script>.";
export declare const WIDGET_SCRIPT_SRC_MESSAGE = "Widget script must include a src URL.";
export declare const WIDGET_TOKEN_SCRIPT_MESSAGE = "Access token must not be a script. Paste the access token only.";
export declare function isWidgetConfigType(type: string): boolean;
export declare function isScriptType(value: string): boolean;
export declare function validateWidgetScript(value: string): string | null;
export declare function validateWidgetToken(value: string): string | null;
//# sourceMappingURL=widgetConfig.d.ts.map