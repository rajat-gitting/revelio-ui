import { render, screen } from '@testing-library/react';
import {
  createMemoryHistory,
  createRootRoute,
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
  const routeTree = rootRoute.addChildren([]);
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

  it('does NOT render a Blogs link (CR-37)', async () => {
    renderNavbarAt('/');

    // Wait for navigation to render
    await screen.findByRole('link', { name: 'Home' });

    expect(screen.queryByRole('link', { name: 'Blogs' })).not.toBeInTheDocument();
  });
});
