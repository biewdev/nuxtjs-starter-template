import { isEmpty, isPlainObject } from 'lodash-es';
import { normalizeFetchErrorServer, removeUndefinedKeys } from '~/utils';
import { createConsola } from 'consola';

const logger = createConsola({
  formatOptions: {
    columns: 120,
    colors: true,
    compact: false,
    date: true,
  },
});

export default defineEventHandler(async event => {
  const path = event.context.params?.path || [];
  const targetUrl = `${process.env.URL_API}/${Array.isArray(path) ? path.join('/') : path}`
    .replaceAll('//', '/')
    .replaceAll(':/', '://');

  const method = event.method;
  const query = getQuery(event);
  const body = ['POST', 'PUT', 'PATCH'].includes(method) ? await readBody(event) : undefined;
  const headers = event.headers;
  const queryToSend = query.ignoreSerialize ? query : flattenObject(query);

  try {
    const response = await $fetch(targetUrl, {
      method,
      body,
      headers: {
        authorization: headers.get('Authorization') || '',
        'x-forward-for': headers.get('x-forward-for') || '',
        'Content-Type': headers.get('Content-Type') || 'application/json',
      },
      query: queryToSend,
    });

    const contentType = headers.get('Content-Type') || '';

    const info = removeUndefinedKeys({
      user: headers.get('user') || undefined,
      body: processBodyForLog(body, headers),
      query: removeUndefinedKeys(queryToSend),
      ...(contentType.includes('multipart/form-data') ? { contentType } : {}),
    });

    logger.success(
      `[${method}] - ${targetUrl}`,
      !isEmpty(info) ? '-' : '',
      !isEmpty(info) ? info : '',
    );

    return response;
  } catch (err) {
    const contentType = headers.get('Content-Type') || '';

    const info = removeUndefinedKeys({
      user: headers.get('user') || undefined,
      body: processBodyForLog(body, headers),
      query: removeUndefinedKeys(queryToSend),
      response: normalizeFetchErrorServer(event, err) || undefined,
      ...(contentType.includes('multipart/form-data') ? { contentType } : {}),
    });

    logger.error(
      `[${method}] - ${targetUrl.replaceAll('//', '/').replaceAll(':/', '://')}`,
      !isEmpty(info) ? '-' : '',
      !isEmpty(info) ? info : '',
    );

    return normalizeFetchErrorServer(event, err);
  }
});

function processBodyForLog(body: any, headers: Headers): any {
  if (!body) return body;

  const contentType = headers.get('Content-Type') || '';

  if (typeof body === 'string' && contentType.includes('multipart/form-data')) {
    return parseMultipartForLog(body);
  }

  if (isPlainObject(body)) {
    return sanitizeObjectBody(body);
  }

  return body;
}

function sanitizeObjectBody(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (isBinary(obj)) return '(binary)';

  if (Array.isArray(obj)) {
    return obj.map(item => (isBinary(item) ? '(binary)' : sanitizeObjectBody(item)));
  }

  const clean: Record<string, any> = {};
  for (const key in obj) {
    const value = obj[key];
    clean[key] = isBinary(value) ? '(binary)' : sanitizeObjectBody(value);
  }
  return clean;
}

function isBinary(value: any): boolean {
  if (!value) return false;
  return (
    value instanceof ArrayBuffer ||
    value instanceof Uint8Array ||
    (typeof Buffer !== 'undefined' && value instanceof Buffer) ||
    (typeof File !== 'undefined' && value instanceof File) ||
    (typeof Blob !== 'undefined' && value instanceof Blob)
  );
}

function parseMultipartForLog(body: string): Record<string, string> {
  const result: Record<string, string> = {};

  const boundaryMatch = body.match(/^-+WebKitFormBoundary[^\r\n]+/m);
  const boundary = boundaryMatch ? boundaryMatch[0] : null;
  if (!boundary) return { raw: '(binary multipart/form-data)' };

  const parts = body.split(boundary).filter(p => p.trim() && p.trim() !== '--');

  for (const part of parts) {
    const nameMatch = part.match(/name="([^"]+)"/);
    if (!nameMatch || !nameMatch[1]) continue;

    const fieldName: string = nameMatch[1];
    const isFile = /filename="[^"]*"/.test(part);

    if (isFile) {
      result[fieldName] = '(binary)';
    } else {
      const valueMatch = part.match(/\r\n\r\n([\s\S]*?)\r\n$/);
      result[fieldName] = valueMatch?.[1] ?? '';
    }
  }

  return result;
}

function isJsonString(str: string): boolean {
  try {
    const parsed = JSON.parse(str);
    return isPlainObject(parsed);
  } catch {
    return false;
  }
}

export function flattenObject(
  obj: Record<string, unknown>,
  parentKey = '',
  result: Record<string, string> = {},
): Record<string, string> {
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    let value = obj[key];

    if (typeof value === 'string' && isJsonString(value)) {
      value = JSON.parse(value);
    }

    const newKey = parentKey ? `${parentKey}[${key}]` : key;

    if (isPlainObject(value)) {
      flattenObject(value as Record<string, unknown>, newKey, result);
    } else if (typeof value !== 'undefined') {
      result[newKey] = String(value);
    }
  }
  return result;
}
