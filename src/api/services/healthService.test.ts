import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiGet } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { getHealth } from '@/api/services/healthService';

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

describe('getHealth', () => {
  beforeEach(() => vi.mocked(apiGet).mockReset());

  it('calls the HEALTH endpoint', async () => {
    vi.mocked(apiGet).mockResolvedValue({ status: 'UP' });
    await getHealth();
    expect(apiGet).toHaveBeenCalledWith(ENDPOINTS.HEALTH);
  });

  it('returns the health DTO directly', async () => {
    vi.mocked(apiGet).mockResolvedValue({ status: 'UP' });
    const result = await getHealth();
    expect(result).toEqual({ status: 'UP' });
  });

});
