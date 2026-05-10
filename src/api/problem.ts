import { ApiRequestError } from '@/api/client';
import type { ErrorResponse } from '@/types/api';

/** Normalized API failure shape (alias for shared `ErrorResponse`). */
export type ApiProblem = ErrorResponse;

export function isApiRequestError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}

export function toApiProblem(error: unknown): ErrorResponse {
  if (isApiRequestError(error)) {
    return {
      status: error.status,
      message: error.message,
      code: error.code,
    };
  }
  if (error instanceof Error) {
    return { status: null, message: error.message, code: null };
  }
  return { status: null, message: 'Unknown error', code: null };
}
