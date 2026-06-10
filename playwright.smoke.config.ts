import { defineConfig } from '@playwright/test';

/**
 * Browser smoke gate. Boots the real app (vite dev server) and loads every
 * route headlessly, failing on render crashes that unit tests (which run
 * against mocks) cannot see. Run via `npm run smoke`; the orchestrator's dev
 * pipeline runs it as a gate alongside lint/build/test.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
