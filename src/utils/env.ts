function requireEnv(name: keyof ImportMetaEnv): string {
  const envRecord: Record<string, string | undefined> = import.meta.env as Record<
    string,
    string | undefined
  >;
  const value = envRecord[name];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${String(name)} is not set`);
  }
  return value;
}

/** Base URL for API calls (no trailing slash). */
export function getApiBaseUrl(): string {
  return requireEnv('VITE_API_BASE_URL').replace(/\/+$/, '');
}
