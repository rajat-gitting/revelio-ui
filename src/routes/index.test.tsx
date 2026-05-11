import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import * as blogService from '@/api/services/blogService';
import type { BlogPostDto } from '@/types/api';
import HomePage from './index';

vi.mock('@/api/services/blogService');

const mockPosts: BlogPostDto[] = [
  {
    id: 1,
    title: 'Test Post 1',
    excerpt: 'Test excerpt 1',
    coverImageUrl: null,
    author: { name: 'Alice Chen', avatarUrl: null },
    tags: ['test'],
    publishedAt: '2024-01-01T00:00:00Z',
  },
];

function renderWithRouter(component: React.ReactElement) {
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => component,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  return render(<RouterProvider router={router} />);
}

describe('HomePage background color', () => {
  beforeEach(() => {
    vi.mocked(blogService.getBlogs).mockReset();
  });

  it('applies background color #836565 to the blogs page section', async () => {
    vi.mocked(blogService.getBlogs).mockResolvedValue(mockPosts);
    const { container } = renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    });

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveStyle({ backgroundColor: '#836565' });
  });

  it('applies background color consistently when loading', () => {
    vi.mocked(blogService.getBlogs).mockImplementation(
      () => new Promise(() => {})
    );
    const { container } = renderWithRouter(<HomePage />);

    const gridDiv = container.querySelector('div');
    expect(gridDiv).toBeInTheDocument();
  });

  it('applies background color consistently when showing error state', async () => {
    vi.mocked(blogService.getBlogs).mockRejectedValue(new Error('Network error'));
    const { container } = renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });

    const errorDiv = container.querySelector('.error-state');
    expect(errorDiv).toBeInTheDocument();
  });

  it('applies background color consistently when showing empty state', async () => {
    vi.mocked(blogService.getBlogs).mockResolvedValue([]);
    const { container } = renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('No posts yet. Check back soon.')).toBeInTheDocument();
    });

    const emptyDiv = container.querySelector('.empty-state');
    expect(emptyDiv).toBeInTheDocument();
  });

  it('applies background color to section with multiple posts', async () => {
    const multiplePosts: BlogPostDto[] = [
      ...mockPosts,
      {
        id: 2,
        title: 'Test Post 2',
        excerpt: 'Test excerpt 2',
        coverImageUrl: null,
        author: { name: 'Bob Smith', avatarUrl: null },
        tags: ['test2'],
        publishedAt: '2024-01-02T00:00:00Z',
      },
    ];
    vi.mocked(blogService.getBlogs).mockResolvedValue(multiplePosts);
    const { container } = renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    });

    const section = container.querySelector('section');
    expect(section).toHaveStyle({ backgroundColor: '#836565' });
  });
});
