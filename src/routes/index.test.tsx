import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import HomePage from './index';

const rootRoute = createRootRoute();
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const routeTree = rootRoute.addChildren([indexRoute]);

function renderWithRouter(component: React.ReactElement) {
  const history = createMemoryHistory({ initialEntries: ['/'] });
  const router = createRouter({ routeTree, history });
  return render(<RouterProvider router={router}>{component}</RouterProvider>);
}

describe('HomePage styles', () => {
  it('applies background color #836565 to the section element', () => {
    const { container } = renderWithRouter(<HomePage />);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    
    const computedStyle = window.getComputedStyle(section!);
    expect(computedStyle.backgroundColor).toBe('rgb(131, 101, 101)');
  });

  it('section element has the correct CSS class', () => {
    const { container } = renderWithRouter(<HomePage />);
    const section = container.querySelector('section');
    expect(section).toHaveClass(/section/);
  });
});
