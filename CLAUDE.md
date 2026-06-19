# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`revelio-ui` is a React 18 + Vite 5 SPA (TanStack Router file-based routing, Axios, Vitest, strict TypeScript). It is the frontend of a blog app whose backend is a separate Spring service. The README covers day-to-day usage (scripts, env vars, how to add routes/components); this file captures the architecture and conventions that aren't obvious from a single file.

## Commands

- `npm run dev` — dev server at http://localhost:5173 (strict port)
- `npm run build` — `vite build` then `tsc --noEmit`
- `npm run lint` / `npm run lint:fix` — ESLint over `.ts`/`.tsx`
- `npm run typecheck` — `tsc --noEmit`
- `npm test` — Vitest (watch); `npm run test:coverage` for one-off + coverage
- `npm run smoke` — Playwright browser smoke test (boots the dev server, loads every route, catches render crashes unit tests can't). Run `npm run smoke:install` once first.
- Run a single Vitest file: `npx vitest run src/path/to/file.test.tsx`
- Run tests matching a name: `npx vitest run -t "partial test name"`

**Route generation is automatic.** `src/routeTree.gen.ts` is gitignored. Every relevant script has a `pre*` hook (`prelint`, `pretest`, `prebuild`, `pretypecheck`) that runs `scripts/generate-routes.mjs` first, so lint/test/build/typecheck all work from a fresh clone without a manual generate step. Add a route by creating a file under `src/routes/`; the tree regenerates on the next dev save or script run.

## Architecture

**API layer is strictly tiered — UI never touches Axios directly.**
- `src/api/client.ts` — the single Axios instance plus `apiGet`/`apiPost`/`apiPut`/`apiDelete` helpers. A request interceptor injects `Authorization: Bearer <token>` from `localStorage['auth_token']`. A response interceptor normalizes every failure into an `ApiRequestError` (status/code/message) via `normalizeError`, so callers never see raw Axios errors.
- `src/api/endpoints.ts` — all paths as constants. Paths are **relative to `VITE_API_BASE_URL`, which already includes the backend's `/api` context path** — do not repeat `/api` in endpoint constants.
- `src/api/services/*.ts` — typed functions per resource. UI/hooks call these; they never import `apiClient` or `axios`.
- `src/api/problem.ts` — `toApiProblem` / `isApiRequestError` for converting unknown errors to the shared `ErrorResponse` shape.

**The backend `ApiResponse<T>` envelope is the #1 source of bugs here.** The backend wraps responses, and the wrapping is inconsistent across endpoints, so unwrapping is done per-service in `blogService.ts`:
- `GET /blogs` returns `ApiResponse<PagedResponse<BlogPostDto>>` — posts live at `response.data.content`, not `response.data`.
- `GET /blogs/:id`, `/blogs/search`, `/blogs/filters` return `ApiResponse<T>` — unwrap `response.data`.
- `PagedResponse.number` is **0-based**.
When adding a service call, confirm the exact envelope and mirror the existing unwrap pattern; the response generic on `apiGet<...>` must match the real wire shape.

**Data fetching uses the `useApi` hook** (`src/hooks/useApi.ts`), not a data library. It runs the fetcher on mount and whenever the optional `watch` value changes, is race-safe (a `versionRef` discards stale responses), and returns `{ data, loading, error, refetch }`. Pass a fetcher closure over a service function.

**URL is the source of truth for list state.** `src/routes/blogs.tsx` defines a `validateSearch` schema (`q`, `category[]`, `author[]`, `page`) so search/filter/pagination state lives in the URL. Note the page is **1-based in the URL but 0-based for the API** — subtract 1 before calling the service.

**Routing root:** `src/routes/__root.tsx` wraps everything in `Layout` and mounts the TanStack Router devtools only in dev. The `@/` alias maps to `src/`.

## Conventions worth knowing

- **Styling is SCSS modules, everywhere.** Each component imports its styles as `import styles from './Component.module.scss'` and applies them via the `styles` object — never global side-effect `.css` imports. Folder components (`Button`, `Layout`) use short camelCase class names (`styles.primary`); the blog components (`BlogCard`, `SkeletonCard`, `EmptyState`, `ErrorState`) keep BEM-style names accessed by key (`styles['blog-card__content']`). Tests rely on `vite.config.ts`'s `css.modules.classNameStrategy: 'non-scoped'`, which emits the local class name verbatim in jsdom, so a query like `querySelector('.blog-card')` still matches. Pull colors/spacing/type from `src/styles/_variables.scss` (or the `var(--color-*)` custom properties); the full token reference and editorial dark theme are documented in `src/styles/DESIGN_SYSTEM.md`.
- **Test locations & globals.** Tests are colocated as `*.test.tsx` next to source and run by Vitest in jsdom; setup is `src/tests/setup.ts` (loads `@testing-library/jest-dom/vitest` matchers and `global.scss`). **Import the test API explicitly — `import { describe, expect, it } from 'vitest'`.** Even though `vite.config.ts` sets `test.globals: true`, `tsconfig.json`'s `types` is `["vite/client", "node"]` (no `vitest/globals`), so relying on bare globals leaves them untyped and the type-checked ESLint rules fail with "unsafe call of an `error` type"; the jest-dom matcher types (`toBeInTheDocument`, etc.) also only resolve through that import. `e2e/*.spec.ts` are Playwright specs, excluded from Vitest's include — never run them with `npm test`.
- **Env access is centralized.** Read `VITE_*` vars through `src/utils/env.ts` (`getApiBaseUrl`), which throws on a missing/empty value rather than failing silently. Tests get `VITE_API_BASE_URL` from `vite.config.ts` (`test.env`), so they never depend on a real `.env`.
- **ESLint runs type-checked rules** (`recommended-type-checked` + `stylistic-type-checked`) and needs `tsconfig.json`'s project graph, so lint can surface type errors. This is intentionally ESLint 8 with `.eslintrc.cjs`.

## CI / review

`.github/workflows/reviewer.yml` runs an agentic reviewer (`anthropics/claude-code-action`) on every PR. It reviews the diff **against this CLAUDE.md and the linked Jira ticket's acceptance criteria** (fetched via the Atlassian MCP server) and posts a GitHub review as a separate reviewer identity. Keep this file accurate — it is used as live review criteria.
