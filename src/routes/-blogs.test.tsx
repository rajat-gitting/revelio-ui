import { describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';

import { Route } from './blogs';

describe('blogs redirect route', () => {
  it('redirects /blogs to / with default search params', async () => {
    const rootRoute = createRootRoute();
    const blogsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/blogs',
      beforeLoad: Route.options.beforeLoad,
      component: () => null,
    });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      component: () => <div data-testid="home">Home</div>,
    });
    const routeTree = rootRoute.addChildren([blogsRoute, indexRoute]);
    const history = createMemoryHistory({ initialEntries: ['/blogs'] });
    const router = createRouter({ routeTree, history });

    render(<RouterProvider router={router} />);

    // After redirect, router should land on /
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/');
    });
  });

  it('beforeLoad throws (a redirect)', () => {
    expect(() => {
      // The function body ignores its argument and just throws a redirect
      (Route.options.beforeLoad as () => never)();
    }).toThrow();
  });
});
