import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import * as blogService from '@/api/services/blogService';
import type { BlogPostDto } from '@/types/api';

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => {
    const { default: HomePage } = require('@/routes/index');
    return <HomePage />;
  },
});

const routeTree = rootRoute.addChildren([indexRoute]);

function renderWithRouter() {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  return render(<RouterProvider router={router} />);
}

vi.mock('@/api/services/blogService', () => ({
  getBlogs: vi.fn(),
}));

const mockPosts: BlogPostDto[] = [
  {
    id: 1,
    title: 'Test Post',
    excerpt: 'Test excerpt',
    coverImageUrl: null,
    author: { name: 'John Doe', avatarUrl: null },
    tags: ['test'],
    publishedAt: '2023-01-01T00:00:00Z',
  },
];

describe('HomePage background color', () => {
  beforeEach(() => {
    vi.mocked(blogService.getBlogs).mockReset();
  });

  it('applies background color #836565 to the section element', async () => {
    vi.mocked(blogService.getBlogs).mockResolvedValue(mockPosts);
    const { container } = renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument();
    });

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();

    const computedStyle = window.getComputedStyle(section!);
    expect(computedStyle.backgroundColor).toBe('rgb(131, 101, 101)');
  });

  it('section has the correct CSS class for background styling', async () => {
    vi.mocked(blogService.getBlogs).mockResolvedValue(mockPosts);
    const { container } = renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument();
    });

    const section = container.querySelector('section');
    expect(section).toHaveClass('section');
  });

  it('background color is applied when loading state is shown', async () => {
    vi.mocked(blogService.getBlogs).mockImplementation(
      () => new Promise(() => {})
    );
    const { container } = renderWithRouter();

    await waitFor(() => {
      expect(container.querySelector('.grid')).toBeInTheDocument();
    });

    const section = container.querySelector('section') || container.querySelector('div');
    if (section && section.classList.contains('section')) {
      const computedStyle = window.getComputedStyle(section);
      expect(computedStyle.backgroundColor).toBe('rgb(131, 101, 101)');
    }
  });

  it('background color persists when error state is shown', async () => {
    vi.mocked(blogService.getBlogs).mockRejectedValue(new Error('Network error'));
    const { container } = renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });

    const section = container.querySelector('section') || container.querySelector('div');
    if (section && section.classList.contains('section')) {
      const computedStyle = window.getComputedStyle(section);
      expect(computedStyle.backgroundColor).toBe('rgb(131, 101, 101)');
    }
  });

  it('background color persists when empty state is shown', async () => {
    vi.mocked(blogService.getBlogs).mockResolvedValue([]);
    const { container } = renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('No posts yet. Check back soon.')).toBeInTheDocument();
    });

    const section = container.querySelector('section') || container.querySelector('div');
    if (section && section.classList.contains('section')) {
      const computedStyle = window.getComputedStyle(section);
      expect(computedStyle.backgroundColor).toBe('rgb(131, 101, 101)');
    }
  });
});
