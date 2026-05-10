import axios, { type AxiosRequestConfig, isAxiosError } from 'axios';

import type { ErrorResponse } from '@/types/api';
import { getApiBaseUrl } from '@/utils/env';
import { logger } from '@/utils/logger';

const AUTH_TOKEN_KEY = 'auth_token';

export class ApiRequestError extends Error implements ErrorResponse {
  override readonly name = 'ApiRequestError';

  constructor(
    message: string,
    readonly status: number | null,
    readonly code: string | null
  ) {
    super(message);
  }
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = globalThis.localStorage?.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const normalized = normalizeError(error);
    if (import.meta.env.DEV) {
      logger.error('[api]', normalized.message, {
        status: normalized.status,
        code: normalized.code,
      });
    }
    return Promise.reject(normalized);
  }
);

function normalizeError(error: unknown): ApiRequestError {
  if (isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const body: unknown = error.response?.data;
    const fromBody =
      isRecord(body) && typeof body.message === 'string' ? body.message : error.message;
    const code = isRecord(body) && typeof body.code === 'string' ? body.code : null;
    return new ApiRequestError(fromBody, status, code);
  }

  if (error instanceof Error) {
    return new ApiRequestError(error.message, null, null);
  }

  return new ApiRequestError('Unknown error', null, null);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await apiClient.get<T>(url, config);
  return data;
}

export async function apiPost<T, B = unknown>(
  url: string,
  body: B,
  config?: AxiosRequestConfig
): Promise<T> {
  const { data } = await apiClient.post<T>(url, body, config);
  return data;
}

export async function apiPut<T, B = unknown>(
  url: string,
  body: B,
  config?: AxiosRequestConfig
): Promise<T> {
  const { data } = await apiClient.put<T>(url, body, config);
  return data;
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await apiClient.delete<T>(url, config);
  return data;
}
