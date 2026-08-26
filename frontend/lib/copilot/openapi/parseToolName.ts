const COPILOT_TOOL_RE = /Copilot tool:\s*`([^`]+)`/i;

/** Operations without an explicit copilot hint but included in the agent. */
export const FALLBACK_TOOL_NAMES: Record<string, string> = {
  'POST /api/checkout': 'checkout',
};

export function parseToolName(
  method: string,
  path: string,
  description?: string,
): string | null {
  if (description) {
    const match = description.match(COPILOT_TOOL_RE);
    if (match?.[1]) return match[1].trim();
  }

  const key = `${method.toUpperCase()} ${path}`;
  return FALLBACK_TOOL_NAMES[key] ?? null;
}

/** Map OpenAPI path param names to agent-friendly parameter names. */
export const PATH_PARAM_ALIASES: Record<string, Record<string, string>> = {
  get_product_details: { id: 'productId' },
  get_order_details: { id: 'orderId' },
  buy_again: { id: 'orderId' },
};

export function getAgentParamName(toolName: string, pathParam: string): string {
  return PATH_PARAM_ALIASES[toolName]?.[pathParam] ?? pathParam;
}

export function getPathParamName(toolName: string, agentParam: string): string {
  const aliases = PATH_PARAM_ALIASES[toolName];
  if (!aliases) return agentParam;
  const entry = Object.entries(aliases).find(([, alias]) => alias === agentParam);
  return entry?.[0] ?? agentParam;
}
