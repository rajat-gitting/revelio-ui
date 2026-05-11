import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMemoryHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { RouterProvider } from '@tanstack/react-router';
import * as blogService from '@/api/services/blogService';
import type { BlogPostDto } from '@/types/api';
import { Route as IndexRoute } from './index';

vi.mock('@/api/services/blogService');

const mockBlogs: BlogPostDto[] = [
  {
    id: 1,
    title: 'Test Blog 1',
    excerpt: 'Test excerpt 1',
    coverImageUrl: null,
    author: { name: 'Author 1', avatarUrl: null },
    tags: ['test'],
    publishedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'Test Blog 2',
    excerpt: 'Test excerpt 2',
    coverImageUrl: null,
    author: { name: 'Author 2', avatarUrl: null },
    tags: ['test'],
    publishedAt: '2024-01-02T00:00:00Z',
  },
];

function createTestRouter() {
  const rootRoute = createRootRoute({
    component: () => (
      <div>
        <IndexRoute.options.component />
      </div>
    ),
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: IndexRoute.options.component,
  });

  const routeTree = rootRoute.addChildren([indexRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

  return router;
}

describe('HomePage (index route)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('applies the container class from index.module.scss', async () => {
    vi.mocked(blogService.getBlogs).mockResolvedValue(mockBlogs);

    const router = createTestRouter();
    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('Test Blog 1')).toBeInTheDocument();
    });

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section?.className).toContain('section');
  });

  it('renders the grid container with correct class', async () => {
    vi.mocked(blogService.getBlogs).mockResolvedValue(mockBlogs);

    const router = createTestRouter();
    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('Test Blog 1')).toBeInTheDocument();
    });

    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
  });

  it('renders loading state with skeleton cards', () => {
    vi.mocked(blogService.getBlogs).mockImplementation(
      () => new Promise(() => {})
    );

    const router = createTestRouter();
    const { container } = render(<RouterProvider router={router} />);

    const skeletonCards = container.querySelectorAll('[data-testid="skeleton-card"]');
    expect(skeletonCards.length).toBeGreaterThan(0);
  });

  it('renders error state when fetch fails', async () => {
    vi.mocked(blogService.getBlogs).mockRejectedValue(new Error('Network error'));

    const router = createTestRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });
  });

  it('renders empty state when no posts are returned', async () => {
    vi.mocked(blogService.getBlogs).mockResolvedValue([]);

    const router = createTestRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('No posts yet. Check back soon.')).toBeInTheDocument();
    });
  });

  it('renders blog posts when data is loaded', async () => {
    vi.mocked(blogService.getBlogs).mockResolvedValue(mockBlogs);

    const router = createTestRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('Test Blog 1')).toBeInTheDocument();
      expect(screen.getByText('Test Blog 2')).toBeInTheDocument();
    });
  });

  it('renders load more button when there are more posts', async () => {
    const tenPosts = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      title: `Test Blog ${i + 1}`,
      excerpt: `Test excerpt ${i + 1}`,
      coverImageUrl: null,
      author: { name: `Author ${i + 1}`, avatarUrl: null },
      tags: ['test'],
      publishedAt: '2024-01-01T00:00:00Z',
    }));

    vi.mocked(blogService.getBlogs).mockResolvedValue(tenPosts);

    const router = createTestRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('Test Blog 1')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument();
  });

  it('does not render load more button when fewer than page size posts', async () => {
    vi.mocked(blogService.getBlogs).mockResolvedValue(mockBlogs);

    const router = createTestRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('Test Blog 1')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
  });
});
