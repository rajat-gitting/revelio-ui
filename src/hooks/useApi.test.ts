import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ApiRequestError } from '@/api/client';
import { useApi } from '@/hooks/useApi';

vi.mock('@/api/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api/client')>()),
}));

describe('useApi', () => {
  it('returns data on success', async () => {
    const fetcher = vi.fn().mockResolvedValue({ id: 1, title: 'Hello' });
    const { result } = renderHook(() => useApi(fetcher));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ id: 1, title: 'Hello' });
    expect(result.current.error).toBeNull();
  });

  it('starts in loading state', () => {
    const fetcher = vi.fn().mockResolvedValue(null);
    const { result } = renderHook(() => useApi(fetcher));
    expect(result.current.loading).toBe(true);
  });

  it('sets error message from ApiRequestError', async () => {
    const fetcher = vi.fn().mockRejectedValue(new ApiRequestError('Not Found', 404, null));
    const { result } = renderHook(() => useApi(fetcher));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Not Found');
    expect(result.current.data).toBeNull();
  });

  it('falls back to "Something went wrong" for non-ApiRequestError', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('Network failure'));
    const { result } = renderHook(() => useApi(fetcher));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Something went wrong');
  });

  it('re-runs fetcher when watch value changes', async () => {
    let watchVal = 1;
    const fetcher = vi.fn().mockResolvedValue('ok');
    const { result, rerender } = renderHook(() => useApi(fetcher, watchVal));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetcher).toHaveBeenCalledTimes(1);

    watchVal = 2;
    rerender();
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  });

  it('exposes a refetch function that re-runs the fetcher', async () => {
    const fetcher = vi.fn().mockResolvedValue('data');
    const { result } = renderHook(() => useApi(fetcher));

    await waitFor(() => expect(result.current.loading).toBe(false));
    result.current.refetch();
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  });
});
