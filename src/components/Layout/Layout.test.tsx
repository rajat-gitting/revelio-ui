import { render, screen } from '@testing-library/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';

import Layout from '@/components/Layout/Layout';

import styles from '@/components/Layout/Layout.module.scss';

function renderLayout() {
  const rootRoute = createRootRoute({
    component: () => <Layout>page content</Layout>,
  });
  const routeTree = rootRoute.addChildren([]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  return render(<RouterProvider router={router} />);
}

describe('Layout', () => {
  it('renders header with logo and navigation', async () => {
    renderLayout();

    expect(await screen.findByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Revelio home' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });

  it('applies the sticky header class', async () => {
    renderLayout();

    const header = await screen.findByTestId('app-header');
    expect(header).toHaveClass(styles.header!);
  });

  it('renders children inside the main element', async () => {
    renderLayout();

    expect(await screen.findByText('page content')).toBeInTheDocument();
  });
});
