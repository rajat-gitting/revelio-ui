import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';

import { Route } from './__root';

// TanStackRouterDevtools relies on internals that are awkward in jsdom; stub it out.
vi.mock('@tanstack/router-devtools', () => ({
  TanStackRouterDevtools: () => null,
}));

describe('RootLayout', () => {
  it('renders child route content via Outlet', async () => {
    const RootLayout = Route.options.component!;

    const rootRoute = createRootRoute({ component: RootLayout });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      component: () => <div data-testid="child-content">Hello World</div>,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const history = createMemoryHistory({ initialEntries: ['/'] });
    const router = createRouter({ routeTree, history });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('wraps content in a Layout (renders the navbar)', async () => {
    const RootLayout = Route.options.component!;

    const rootRoute = createRootRoute({ component: RootLayout });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      component: () => <span data-testid="inner">inner</span>,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });

    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId('inner')).toBeInTheDocument();
    });

    // Layout renders a <nav> via Navbar
    expect(container.querySelector('nav')).toBeInTheDocument();
  });
});
