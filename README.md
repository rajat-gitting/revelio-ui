# revelio-ui

Production-oriented React SPA skeleton: **React 18**, **Vite 5**, **TanStack Router** (file-based routes), **SCSS modules**, **Axios**, **Vitest**, **TypeScript (strict)**, **ESLint**, and **Prettier**.

## Prerequisites

- **Node.js 20+** (see `.nvmrc`)
- **npm**

## Install

```bash
npm install
```

## Scripts

| Command                 | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| `npm run dev`           | Dev server at **http://localhost:5173**                    |
| `npm run build`         | Production bundle **then TypeScript `tsc --noEmit`**       |
| `npm run preview`       | Preview the production build                               |
| `npm test`              | Vitest in watch mode                                       |
| `npm run test:ui`       | Vitest UI                                                  |
| `npm run test:coverage` | One-off tests + coverage report                            |
| `npm run lint`          | ESLint for `.ts` / `.tsx`                                  |
| `npm run lint:fix`      | ESLint with `--fix`                                        |
| `npm run format`        | Prettier write                                             |
| `npm run typecheck`     | `tsc --noEmit` (requires generated route tree — see below) |

**Route tree:** `src/routeTree.gen.ts` is **gitignored** and produced by the TanStack Router Vite plugin. Run `npm run dev` or `npm run build` once so the file exists. The `build` script runs **`vite build` before `tsc --noEmit`** so typechecking succeeds in CI. For a standalone `npm run typecheck` after a fresh clone, run `npm run dev` (and stop it) or `npm run build` first.

**ESLint:** The template uses **ESLint 8** with **`.eslintrc.cjs`** so classic config works cleanly with **`@typescript-eslint/*` v7**. ESLint 9+ defaults to flat config; upgrading is optional.

## Environment variables

Public variables must use the **`VITE_`** prefix. Defaults live in:

- **`.env.development`** — `VITE_API_BASE_URL=http://localhost:8080/api`
- **`.env.production`** — `VITE_API_BASE_URL=/api`
- **`.env.example`** — same as development for documentation
- **`.env.test`** — Vitest defaults; `vite.config.ts` also sets `test.env.VITE_API_BASE_URL` so tests never depend on a missing variable

Override locally with **`.env.local`** (gitignored by Vite convention where applicable).

The landing page calls **`GET ${VITE_API_BASE_URL}/ping`**. Your backend should expose **`http://localhost:8080/api/ping`** in dev and return JSON like:

```json
{ "message": "pong" }
```

so the UI can show **“Backend says: pong”**.

Typed access is centralized in `src/utils/env.ts` (e.g. `getApiBaseUrl()` used by the Axios instance).

## How to add a route

1. Add a file under **`src/routes/`** using TanStack Router file conventions (e.g. `routes/settings.tsx` for `/settings`).
2. Optionally use a nested folder such as **`src/routes/_layout/`** for route-group style organization.
3. Restart dev (or save) so **`src/routeTree.gen.ts`** regenerates.

## How to add an API call

1. Add a path constant in **`src/api/endpoints.ts`** (no hardcoded URLs in components).
2. Add DTO / envelope types in **`src/types/api.ts`** if needed.
3. Implement a function in **`src/api/services/`** using **`apiGet` / `apiPost` / …** from **`src/api/client.ts`**.
4. Call the service from hooks or route components — **do not** call `axios` or `apiClient` directly from UI components.

## How to add a component

Create a folder under **`src/components/`**:

- **`ComponentName.tsx`** — default export, props as an `interface`
- **`ComponentName.module.scss`** — styles using tokens from **`src/styles/_variables.scss`** (and mixins from **`_mixins.scss`**)
- **`ComponentName.test.tsx`** — colocated tests

Import with the **`@/`** alias, e.g. `import Button from '@/components/Button/Button'`.

## Project structure

```text
src/
  api/           Axios client, endpoints, services
  components/    UI building blocks (Navbar, Button, Layout, …)
  hooks/         useApi and other shared hooks
  routes/        File-based TanStack routes + generated routeTree.gen.ts (local only)
  styles/        SCSS tokens, mixins, reset, global entry
  tests/         Vitest setup
  types/         Shared TS types (API DTOs, etc.)
  utils/         env helpers, logger
```

## Verification checklist

From the repo root after `npm install`:

- `npm run build`
- `npm run typecheck` (after `routeTree.gen.ts` exists — see above)
- `npm run lint`
- `npm test` (Vitest)
- `npm run dev` and open **http://localhost:5173** with API on **http://localhost:8080/api** serving **`GET /ping`** as described.

## License

Private / internal — adjust as needed.
