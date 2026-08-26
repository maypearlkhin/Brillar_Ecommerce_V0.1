export interface OpenApiSchema {
  type?: string;
  format?: string;
  enum?: unknown[];
  properties?: Record<string, OpenApiSchema>;
  required?: string[];
  items?: OpenApiSchema;
  minimum?: number;
  maximum?: number;
  default?: unknown;
  description?: string;
  $ref?: string;
}

export interface OpenApiParameter {
  name: string;
  in: 'query' | 'path' | 'header';
  required?: boolean;
  description?: string;
  schema?: OpenApiSchema;
}

export interface OpenApiOperation {
  summary?: string;
  description?: string;
  tags?: string[];
  security?: Record<string, unknown>[];
  parameters?: OpenApiParameter[];
  requestBody?: {
    required?: boolean;
    content?: {
      'application/json'?: {
        schema?: OpenApiSchema;
      };
    };
  };
}

export interface OpenApiDocument {
  openapi: string;
  paths: Record<string, Record<string, OpenApiOperation>>;
  components?: {
    schemas?: Record<string, OpenApiSchema>;
  };
}

export interface OpenApiOperationRef {
  path: string;
  method: string;
  operation: OpenApiOperation;
}

export interface ToolContext {
  token?: string;
}
