import { beforeEach, describe, expect, it, vi } from 'vitest';

const axiosCreate = vi.fn(() => ({
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('axios', () => ({
  default: {
    create: axiosCreate,
    isAxiosError: vi.fn(() => false),
  },
  isAxiosError: vi.fn(() => false),
}));

describe('axios client wiring', () => {
  beforeEach(async () => {
    vi.resetModules();
    axiosCreate.mockClear();
    await import('@/api/client');
  });

  it('builds an axios instance with timeout and JSON defaults', () => {
    expect(axiosCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        timeout: 10_000,
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }) as Record<string, unknown>,
      })
    );
  });
});
