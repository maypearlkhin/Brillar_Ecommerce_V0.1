import { Request } from 'express';

export const getParam = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0];
  return value || '';
};

export const getQuery = (value: unknown): string => {
  if (Array.isArray(value)) return String(value[0]);
  if (value === undefined || value === null) return '';
  return String(value);
};
