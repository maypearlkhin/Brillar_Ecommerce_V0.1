import { defineTool } from '@copilotkit/runtime/v2';
import { z } from 'zod';
import { loadMergedSpec, listOperations, resolveSchema } from './loadSpecs';
import {
  getAgentParamName,
  parseToolName,
} from './parseToolName';
import {
  buildToolParameters,
  parametersToZod,
  requestBodyToZod,
} from './schemaToZod';
import { applyToolParameterCoercions } from './toolParameterCoercions';
import {
  customerFetch,
  isAuthRequired,
  logOpenApi,
  substitutePathParams,
  toToolError,
} from './customerApiClient';
import type { OpenApiOperation, OpenApiParameter, ToolContext } from './types';

const BODY_FIELDS_BY_TOOL: Record<string, string[]> = {
  add_to_cart: ['productId', 'quantity'],
  update_cart_item: ['quantity'],
  checkout: ['deliveryAddress', 'paymentMethod'],
};

function buildDescription(operation: OpenApiOperation): string {
  const parts = [operation.summary, operation.description].filter(Boolean);
  return parts.join(' — ').replace(/\s+/g, ' ').trim();
}

function renamePathParamShape(
  toolName: string,
  pathShape: Record<string, z.ZodTypeAny>,
): Record<string, z.ZodTypeAny> {
  const renamed: Record<string, z.ZodTypeAny> = {};
  for (const [pathParam, schema] of Object.entries(pathShape)) {
    renamed[getAgentParamName(toolName, pathParam)] = schema;
  }
  return renamed;
}

function splitExecuteArgs(
  toolName: string,
  pathTemplate: string,
  pathParamNames: string[],
  queryParamNames: string[],
  bodyFieldNames: string[],
  args: Record<string, unknown>,
) {
  const pathValues: Record<string, string | number> = {};
  for (const pathParam of pathParamNames) {
    const agentKey = getAgentParamName(toolName, pathParam);
    const value = args[agentKey];
    if (value !== undefined && value !== '') {
      pathValues[pathParam] = value as string | number;
    }
  }

  const params: Record<string, string | number | boolean> = {};
  for (const name of queryParamNames) {
    const value = args[name];
    if (value !== undefined && value !== '') {
      params[name] = value as string | number | boolean;
    }
  }

  const body: Record<string, unknown> = {};
  for (const name of bodyFieldNames) {
    if (args[name] !== undefined) {
      body[name] = args[name];
    }
  }

  const apiPath = substitutePathParams(pathTemplate, pathValues);

  return { apiPath, params, body: Object.keys(body).length ? body : undefined };
}

function createToolFromOperation(
  path: string,
  method: string,
  operation: OpenApiOperation,
  spec: ReturnType<typeof loadMergedSpec>,
  context: ToolContext,
) {
  const toolName = parseToolName(method, path, operation.description);
  if (!toolName) return null;

  const parameters = operation.parameters ?? [];
  const pathParams = parameters.filter((p: OpenApiParameter) => p.in === 'path');
  const queryParams = parameters.filter((p: OpenApiParameter) => p.in === 'query');

  const bodySchema = operation.requestBody?.content?.['application/json']?.schema;
  const resolvedBody = bodySchema ? resolveSchema(bodySchema, spec) : undefined;

  const pathShape = renamePathParamShape(
    toolName,
    parametersToZod(pathParams, spec, 'path'),
  );
  const queryShape = parametersToZod(queryParams, spec, 'query');
  const bodyShape = requestBodyToZod(resolvedBody, spec);

  let parametersSchema = buildToolParameters(pathShape, queryShape, bodyShape);
  parametersSchema = applyToolParameterCoercions(toolName, parametersSchema);
  const requireAuth = isAuthRequired(operation.security);

  const pathParamNames = pathParams.map((p) => p.name);
  const queryParamNames = queryParams.map((p) => p.name);
  const bodyFieldNames =
    BODY_FIELDS_BY_TOOL[toolName] ?? Object.keys(bodyShape);

  const httpMethod = method.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE';

  return defineTool({
    name: toolName,
    description: buildDescription(operation),
    parameters: parametersSchema,
    execute: async (args) => {
      logOpenApi('Tool invoked', { tool: toolName, args });

      try {
        const { apiPath, params, body } = splitExecuteArgs(
          toolName,
          path,
          pathParamNames,
          queryParamNames,
          bodyFieldNames,
          args as Record<string, unknown>,
        );

        const result = await customerFetch(apiPath, {
          token: context.token,
          method: httpMethod,
          params,
          body,
          requireAuth,
          toolName,
        });

        logOpenApi('Tool returned', { tool: toolName, result });
        return result;
      } catch (error) {
        const toolError = toToolError(error);
        logOpenApi('Tool error', { tool: toolName, error: toolError });
        return toolError;
      }
    },
  });
}

export function createOpenApiTools(context: ToolContext = {}) {
  const spec = loadMergedSpec();
  const operations = listOperations(spec);
  const tools = [];

  for (const { path, method, operation } of operations) {
    const tool = createToolFromOperation(path, method, operation, spec, context);
    if (tool) tools.push(tool);
  }

  return tools;
}
