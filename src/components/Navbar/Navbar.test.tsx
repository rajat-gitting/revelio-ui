import { render, screen } from '@testing-library/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';

import Navbar from '@/components/Navbar/Navbar';

describe('Navbar', () => {
  it('renders navigation links', async () => {
    const rootRoute = createRootRoute({
      component: Navbar,
    });
    const routeTree = rootRoute.addChildren([]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'About' })).toBeInTheDocument();
  });
});
