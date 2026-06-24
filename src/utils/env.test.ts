import { afterEach, describe, expect, it, vi } from 'vitest';

import { getApiBaseUrl } from '@/utils/env';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getApiBaseUrl', () => {
  it('returns the base URL from VITE_API_BASE_URL', () => {
    const url = getApiBaseUrl();
    expect(url).toBe('http://localhost:8080/api');
  });

  it('strips trailing slashes', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8080/api///');
    expect(getApiBaseUrl()).toBe('http://localhost:8080/api');
  });

  it('throws when VITE_API_BASE_URL is empty', () => {
    vi.stubEnv('VITE_API_BASE_URL', '');
    expect(() => getApiBaseUrl()).toThrow('VITE_API_BASE_URL is not set');
  });
});
