import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { logger } from '@/utils/logger';

describe('logger in dev/test mode (PROD=false)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logger.debug forwards to console.debug', () => {
    logger.debug('debug message', { key: 'val' });
    expect(console.debug).toHaveBeenCalledWith('debug message', { key: 'val' });
  });

  it('logger.info forwards to console.info', () => {
    logger.info('info message');
    expect(console.info).toHaveBeenCalledWith('info message');
  });

  it('logger.warn forwards to console.warn', () => {
    logger.warn('warning text');
    expect(console.warn).toHaveBeenCalledWith('warning text');
  });

  it('logger.error forwards to console.error', () => {
    logger.error('[api]', 'something failed', { status: 500 });
    expect(console.error).toHaveBeenCalledWith('[api]', 'something failed', { status: 500 });
  });
});

describe('logger in prod mode (PROD=true)', () => {
  // Directly mutate import.meta.env before resetting modules so the module-level
  // `isProd` constant is evaluated with PROD=true on re-import.
  const env = import.meta.env as Record<string, unknown>;

  afterEach(() => {
    env.PROD = false;
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('logger.debug is a no-op in prod', async () => {
    env.PROD = true;
    vi.resetModules();
    const { logger: prodLogger } = await import('@/utils/logger');
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    prodLogger.debug('should not appear');
    expect(console.debug).not.toHaveBeenCalled();
  });

  it('logger.info is a no-op in prod', async () => {
    env.PROD = true;
    vi.resetModules();
    const { logger: prodLogger } = await import('@/utils/logger');
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
    prodLogger.info('should not appear');
    expect(console.info).not.toHaveBeenCalled();
  });
});
