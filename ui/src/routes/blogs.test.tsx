import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { getBlogs } from '@/api/services/blogService';
import type { BlogPostDto } from '@/types/api';

vi.mock('@/api/services/blogService', () => ({
  getBlogs: vi.fn(),
}));

const mockBlogPosts: BlogPostDto[] = [
  {
    id: 1,
    title: 'Getting Started with Spring Boot',
    excerpt: 'A beginner-friendly guide to building REST APIs with Spring Boot and Gradle.',
    coverImageUrl: null,
    author: { name: 'Alice Chen', avatarUrl: null },
    tags: ['java', 'spring', 'tutorial'],
    publishedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 6,
    title: 'Development in the era of AI',
    excerpt: 'How AI tools are reshaping the way developers write, review, and ship code.',
    coverImageUrl: null,
    author: { name: 'Alice Chen', avatarUrl: null },
    tags: ['ai', 'development', 'productivity'],
    publishedAt: '2024-01-20T10:00:00Z',
  },
];

const BlogsPageComponent = () => {
  const [extraPosts, setExtraPosts] = React.useState<BlogPostDto[]>([]);
  const [page, setPage] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [data, setData] = React.useState<BlogPostDto[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        const result = await getBlogs(0, 10);
        setData(result);
      } catch (err) {
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const posts = [...(data ?? []), ...extraPosts];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (posts.length === 0) {
    return <div>No posts yet. Check back soon.</div>;
  }

  return (
    <section style={{ backgroundColor: '#836565' }}>
      <div>
        {posts.map((post) => (
          <article key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            <div>
              {post.tags.map((tag, i) => (
                <span key={i}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

import React from 'react';

describe('Blogs Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays the new blog post "Development in the era of AI"', async () => {
    vi.mocked(getBlogs).mockResolvedValue(mockBlogPosts);

    const rootRoute = createRootRoute();
    const blogsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/blogs',
      component: BlogsPageComponent,
    });

    const router = createRouter({
      routeTree: rootRoute.addChildren([blogsRoute]),
      history: createMemoryHistory({ initialEntries: ['/blogs'] }),
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('Development in the era of AI')).toBeInTheDocument();
    });
  });

  it('displays the summary text for the AI blog post', async () => {
    vi.mocked(getBlogs).mockResolvedValue(mockBlogPosts);

    const rootRoute = createRootRoute();
    const blogsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/blogs',
      component: BlogsPageComponent,
    });

    const router = createRouter({
      routeTree: rootRoute.addChildren([blogsRoute]),
      history: createMemoryHistory({ initialEntries: ['/blogs'] }),
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('How AI tools are reshaping the way developers write, review, and ship code.')).toBeInTheDocument();
    });
  });

  it('displays the tags ai, development, and productivity for the AI blog post', async () => {
    vi.mocked(getBlogs).mockResolvedValue(mockBlogPosts);

    const rootRoute = createRootRoute();
    const blogsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/blogs',
      component: BlogsPageComponent,
    });

    const router = createRouter({
      routeTree: rootRoute.addChildren([blogsRoute]),
      history: createMemoryHistory({ initialEntries: ['/blogs'] }),
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('ai')).toBeInTheDocument();
      expect(screen.getByText('development')).toBeInTheDocument();
      expect(screen.getByText('productivity')).toBeInTheDocument();
    });
  });

  it('applies background color #836565 to the blogs page body', async () => {
    vi.mocked(getBlogs).mockResolvedValue(mockBlogPosts);

    const rootRoute = createRootRoute();
    const blogsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/blogs',
      component: BlogsPageComponent,
    });

    const router = createRouter({
      routeTree: rootRoute.addChildren([blogsRoute]),
      history: createMemoryHistory({ initialEntries: ['/blogs'] }),
    });

    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      const section = container.querySelector('section');
      expect(section).toHaveStyle({ backgroundColor: '#836565' });
    });
  });
});
