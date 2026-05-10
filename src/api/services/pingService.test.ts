import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiGet } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { ping } from '@/api/services/pingService';

vi.mock('@/api/client', () => ({
  ApiRequestError: class ApiRequestError extends Error {
    constructor(
      message: string,
      public status: number | null,
      public code: string | null
    ) {
      super(message);
    }
  },
  apiClient: {},
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

describe('pingService', () => {
  beforeEach(() => {
    vi.mocked(apiGet).mockReset();
  });

  it('loads pong from the ping endpoint', async () => {
    vi.mocked(apiGet).mockResolvedValue({ message: 'pong' });
    const result = await ping();
    expect(apiGet).toHaveBeenCalledWith(ENDPOINTS.PING);
    expect(result.message).toBe('pong');
  });
});
