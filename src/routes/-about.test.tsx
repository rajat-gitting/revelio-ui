import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';

import { Route } from './about';

function renderAboutPage() {
  const AboutPage = Route.options.component!;
  const rootRoute = createRootRoute();
  const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/about',
    component: AboutPage,
  });
  const routeTree = rootRoute.addChildren([aboutRoute]);
  const history = createMemoryHistory({ initialEntries: ['/about'] });
  const router = createRouter({ routeTree, history });
  return render(<RouterProvider router={router} />);
}

describe('AboutPage', () => {
  it('renders the About heading', async () => {
    renderAboutPage();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /about/i })).toBeInTheDocument();
    });
  });

  it('renders the descriptive body text', async () => {
    renderAboutPage();
    await waitFor(() => {
      expect(screen.getByText(/sample route/i)).toBeInTheDocument();
    });
  });

  it('mentions src/routes/ in the body', async () => {
    renderAboutPage();
    await waitFor(() => {
      expect(screen.getByText(/src\/routes\//)).toBeInTheDocument();
    });
  });
});
