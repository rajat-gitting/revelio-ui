import { render, screen } from '@testing-library/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';

import Navbar from '@/components/Navbar/Navbar';

import styles from '@/components/Navbar/Navbar.module.scss';

function renderNavbarAt(path: string) {
  const rootRoute = createRootRoute({
    component: Navbar,
  });
  const blogsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/blogs',
    component: () => null,
  });
  const routeTree = rootRoute.addChildren([blogsRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  return render(<RouterProvider router={router} />);
}

describe('Navbar', () => {
  it('renders navigation links', async () => {
    renderNavbarAt('/');

    expect(await screen.findByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'About' })).toBeInTheDocument();
  });

  it('applies the active class to the link matching the current route', async () => {
    renderNavbarAt('/');

    const homeLink = await screen.findByRole('link', { name: 'Home' });
    expect(homeLink).toHaveClass(styles.active!);
  });

  it('exposes an accessible name on the nav landmark', async () => {
    renderNavbarAt('/');

    expect(
      await screen.findByRole('navigation', { name: 'Main navigation' }),
    ).toBeInTheDocument();
  });

  it('renders a Blogs link pointing to /blogs', async () => {
    renderNavbarAt('/');

    const blogsLink = await screen.findByRole('link', { name: 'Blogs' });
    expect(blogsLink).toBeInTheDocument();
    // href includes search params serialised by TanStack Router
    expect(blogsLink.getAttribute('href')).toMatch(/^\/blogs/);
  });

  it('applies the active class to the Blogs link when the current route is /blogs', async () => {
    renderNavbarAt('/blogs?q=&category=%5B%5D&author=%5B%5D&page=1');

    const blogsLink = await screen.findByRole('link', { name: 'Blogs' });
    expect(blogsLink).toHaveClass(styles.active!);
  });
});
