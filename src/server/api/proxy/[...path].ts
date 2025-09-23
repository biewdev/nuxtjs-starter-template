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
  const targetUrl = `${import.meta.env.URL_API}/${Array.isArray(path) ? path.join('/') : path}`
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
      },
      query: queryToSend,
    });

    const info = removeUndefinedKeys({
      user: headers.get('user') || undefined,
      body: removeUndefinedKeys(body),
      query: removeUndefinedKeys(queryToSend),
    });

    logger.success(
      `[${method}] - ${targetUrl}`,
      !isEmpty(info) ? '-' : '',
      !isEmpty(info) ? info : '',
    );

    return response;
  } catch (err) {
    const info = removeUndefinedKeys({
      user: headers.get('user') || undefined,
      body: removeUndefinedKeys(body),
      query: removeUndefinedKeys(queryToSend),
      response: normalizeFetchErrorServer(event, err) || undefined,
    });

    logger.error(
      `[${method}] - ${targetUrl.replaceAll('//', '/').replaceAll(':/', '://')}`,
      !isEmpty(info) ? '-' : '',
      !isEmpty(info) ? info : '',
    );

    return normalizeFetchErrorServer(event, err);
  }
});

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
