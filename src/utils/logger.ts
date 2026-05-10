const isProd = import.meta.env.PROD;

const noop = (): undefined => undefined;

export const logger = {
  debug: isProd ? noop : (...args: unknown[]) => console.debug(...args),
  info: isProd ? noop : (...args: unknown[]) => console.info(...args),
  warn: (...args: unknown[]) => console.warn(...args),
  error: (...args: unknown[]) => console.error(...args),
};
