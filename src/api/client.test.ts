import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiRequestError, apiClient, apiDelete, apiGet, apiPost, apiPut } from '@/api/client';

// Silence console output from the response error interceptor (DEV=true in test mode)
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// ApiRequestError
// ---------------------------------------------------------------------------
describe('ApiRequestError', () => {
  it('is an instance of Error', () => {
    const err = new ApiRequestError('oops', 500, 'ERR');
    expect(err).toBeInstanceOf(Error);
  });

  it('has name ApiRequestError', () => {
    expect(new ApiRequestError('x', null, null).name).toBe('ApiRequestError');
  });

  it('stores status and code', () => {
    const err = new ApiRequestError('Not Found', 404, 'NOT_FOUND');
    expect(err.status).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Not Found');
  });

  it('allows null status and code', () => {
    const err = new ApiRequestError('Unknown', null, null);
    expect(err.status).toBeNull();
    expect(err.code).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// apiGet / apiPost / apiPut / apiDelete — spy on apiClient methods
// ---------------------------------------------------------------------------
describe('apiGet', () => {
  it('calls apiClient.get and returns the data field', async () => {
    const spy = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: { foo: 'bar' } });
    const result = await apiGet<{ foo: string }>('/test');
    expect(spy).toHaveBeenCalledWith('/test', undefined);
    expect(result).toEqual({ foo: 'bar' });
  });

  it('passes through the config object', async () => {
    const spy = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: 'ok' });
    const config = { params: { page: 1 } };
    await apiGet('/test', config);
    expect(spy).toHaveBeenCalledWith('/test', config);
  });
});

describe('apiPost', () => {
  it('calls apiClient.post with body and returns the data field', async () => {
    const spy = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: { id: 1 } });
    const body = { title: 'Hello' };
    const result = await apiPost<{ id: number }, typeof body>('/posts', body);
    expect(spy).toHaveBeenCalledWith('/posts', body, undefined);
    expect(result).toEqual({ id: 1 });
  });
});

describe('apiPut', () => {
  it('calls apiClient.put with body and returns the data field', async () => {
    const spy = vi.spyOn(apiClient, 'put').mockResolvedValue({ data: { updated: true } });
    const body = { title: 'Updated' };
    const result = await apiPut<{ updated: boolean }, typeof body>('/posts/1', body);
    expect(spy).toHaveBeenCalledWith('/posts/1', body, undefined);
    expect(result).toEqual({ updated: true });
  });
});

describe('apiDelete', () => {
  it('calls apiClient.delete and returns the data field', async () => {
    const spy = vi.spyOn(apiClient, 'delete').mockResolvedValue({ data: null });
    const result = await apiDelete<null>('/posts/1');
    expect(spy).toHaveBeenCalledWith('/posts/1', undefined);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Request interceptor — auth token injection
// ---------------------------------------------------------------------------
describe('request interceptor', () => {
  const AUTH_TOKEN_KEY = 'auth_token';

  function getRequestFulfilled(): (config: unknown) => unknown {
    interface ReqHandler { fulfilled: (config: unknown) => unknown }
    const manager = apiClient.interceptors.request as unknown as { handlers: ReqHandler[] };
    return manager.handlers[0]!.fulfilled;
  }

  it('injects Authorization header when token is present', () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'my-secret-token');
    const config = { headers: {} as Record<string, string> };
    const result = getRequestFulfilled()(config) as typeof config;
    expect(result.headers.Authorization).toBe('Bearer my-secret-token');
    localStorage.removeItem(AUTH_TOKEN_KEY);
  });

  it('does not inject header when no token', () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    const config = { headers: {} as Record<string, string> };
    const result = getRequestFulfilled()(config) as typeof config;
    expect(result.headers.Authorization).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Response error interceptor — normalizeError paths
// ---------------------------------------------------------------------------
describe('response error interceptor', () => {
  function getResponseRejected(): (error: unknown) => Promise<never> {
    interface ResHandler { rejected: (error: unknown) => Promise<never> }
    const manager = apiClient.interceptors.response as unknown as { handlers: ResHandler[] };
    return manager.handlers[0]!.rejected;
  }

  it('normalizes an axios error with a body message and code', async () => {
    const axiosErr = {
      isAxiosError: true,
      response: { status: 404, data: { message: 'Not Found', code: 'NOT_FOUND' } },
      message: 'Request failed with status code 404',
    };
    await expect(getResponseRejected()(axiosErr)).rejects.toMatchObject({
      name: 'ApiRequestError',
      status: 404,
      message: 'Not Found',
      code: 'NOT_FOUND',
    });
  });

  it('normalizes an axios error with body message but no code', async () => {
    const axiosErr = {
      isAxiosError: true,
      response: { status: 500, data: { message: 'Server Error' } },
      message: 'Request failed',
    };
    await expect(getResponseRejected()(axiosErr)).rejects.toMatchObject({
      status: 500,
      message: 'Server Error',
      code: null,
    });
  });

  it('falls back to error.message when body is a non-object', async () => {
    const axiosErr = {
      isAxiosError: true,
      response: { status: 503, data: 'plain string body' },
      message: 'Service Unavailable',
    };
    await expect(getResponseRejected()(axiosErr)).rejects.toMatchObject({
      status: 503,
      message: 'Service Unavailable',
      code: null,
    });
  });

  it('normalizes an axios error with no response (network error)', async () => {
    const axiosErr = {
      isAxiosError: true,
      response: undefined,
      message: 'Network Error',
    };
    await expect(getResponseRejected()(axiosErr)).rejects.toMatchObject({
      status: null,
      message: 'Network Error',
      code: null,
    });
  });

  it('normalizes a plain Error', async () => {
    await expect(getResponseRejected()(new Error('Connection refused'))).rejects.toMatchObject({
      status: null,
      message: 'Connection refused',
      code: null,
    });
  });

  it('normalizes an unknown non-error value', async () => {
    await expect(getResponseRejected()('some string')).rejects.toMatchObject({
      status: null,
      message: 'Unknown error',
      code: null,
    });
  });

  it('always rejects with an ApiRequestError instance', async () => {
    const axiosErr = { isAxiosError: true, response: { status: 400, data: {} }, message: 'Bad Request' };
    await expect(getResponseRejected()(axiosErr)).rejects.toBeInstanceOf(ApiRequestError);
  });
});
