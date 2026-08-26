import { createOpenApiTools, type ToolContext } from '../openapi';

export function createAllTools(context: ToolContext = {}) {
  return createOpenApiTools(context);
}
