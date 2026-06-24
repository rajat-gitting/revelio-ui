import { describe, expect, it } from 'vitest';

import { ApiRequestError } from '@/api/client';
import { isApiRequestError, toApiProblem } from '@/api/problem';

describe('isApiRequestError', () => {
  it('returns true for an ApiRequestError', () => {
    const err = new ApiRequestError('oops', 500, 'INTERNAL');
    expect(isApiRequestError(err)).toBe(true);
  });

  it('returns false for a plain Error', () => {
    expect(isApiRequestError(new Error('plain'))).toBe(false);
  });

  it('returns false for null', () => {
    expect(isApiRequestError(null)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isApiRequestError('error string')).toBe(false);
  });

  it('returns false for a number', () => {
    expect(isApiRequestError(42)).toBe(false);
  });
});

describe('toApiProblem', () => {
  it('maps ApiRequestError to an ErrorResponse with all fields', () => {
    const err = new ApiRequestError('Not Found', 404, 'NOT_FOUND');
    expect(toApiProblem(err)).toEqual({
      status: 404,
      message: 'Not Found',
      code: 'NOT_FOUND',
    });
  });

  it('maps ApiRequestError with null status and code', () => {
    const err = new ApiRequestError('Network error', null, null);
    expect(toApiProblem(err)).toEqual({
      status: null,
      message: 'Network error',
      code: null,
    });
  });

  it('maps a plain Error to ErrorResponse with null status and code', () => {
    expect(toApiProblem(new Error('boom'))).toEqual({
      status: null,
      message: 'boom',
      code: null,
    });
  });

  it('maps an unknown value to a generic ErrorResponse', () => {
    expect(toApiProblem('unexpected')).toEqual({
      status: null,
      message: 'Unknown error',
      code: null,
    });
  });

  it('maps undefined to a generic ErrorResponse', () => {
    expect(toApiProblem(undefined)).toEqual({
      status: null,
      message: 'Unknown error',
      code: null,
    });
  });
});
