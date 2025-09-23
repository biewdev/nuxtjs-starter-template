import { twMerge, type ClassNameValue } from 'tailwind-merge';
import type { H3Event } from 'h3';
import type { IFetchNativeResponseError, IFetchResponseError } from '~/server/types';

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function mergeClasses(...classString: ClassNameValue[]) {
  return twMerge(classString);
}

export const normalizeFetchErrorServer = (
  event: H3Event,
  err: unknown,
  returnUndefined?: boolean,
) => {
  if (typeof err === 'object' && err !== null && 'statusCode' in err) {
    const error = err as IFetchNativeResponseError;

    setResponseStatus(event, error.statusCode);

    if (!error.data || typeof error.data === 'string') {
      const filteredError: IFetchResponseError = {
        statusCode: error.statusCode,
        message: error.statusMessage,
      };

      return filteredError;
    }

    return error.data;
  }

  if (err instanceof Error) {
    setResponseStatus(event, 500);

    return {
      statusCode: 500,
      message: err.message?.replaceAll(import.meta.env.URL_API, '**') || 'Internal error',
    };
  }

  console.error('Internal error [...path.ts]', err);

  return returnUndefined
    ? undefined
    : {
        statusCode: 500,
        message: 'Internal error',
      };
};

export const removeUndefinedKeys = <T>(obj: T): T => {
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefinedKeys(item)).filter(item => item !== undefined) as T;
  }

  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};

    Object.entries(obj).forEach(([key, value]) => {
      const cleanedValue = removeUndefinedKeys(value);

      const isEmptyObject =
        cleanedValue &&
        typeof cleanedValue === 'object' &&
        !Array.isArray(cleanedValue) &&
        Object.keys(cleanedValue).length === 0;

      if (cleanedValue !== undefined && !isEmptyObject) {
        result[key] = cleanedValue;
      }
    });

    return result as T;
  }

  return obj;
};
