/// <reference types="vitest/config" />

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * TanStack file-based routes are wired through `@tanstack/router-plugin/vite`
 * (the docs also refer to this as the TanStack Router Vite integration).
 */
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        /** Avoid Dart Sass legacy-js-api deprecation (default in Vite 5). */
        api: 'modern-compiler',
        loadPaths: [path.resolve(__dirname, 'src')],
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    // e2e/ holds Playwright specs (run via `npm run smoke`); vitest's default
    // include matches *.spec.ts and would try (and fail) to run them.
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    setupFiles: ['./src/tests/setup.ts'],
    env: {
      VITE_API_BASE_URL: 'http://localhost:8080/api',
    },
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },
});
