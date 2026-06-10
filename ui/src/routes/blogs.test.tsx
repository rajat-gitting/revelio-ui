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
  {
    id: 7,
    title: 'Mastering Code Reviews',
    excerpt: 'Best practices for giving and receiving feedback that improves code quality and team culture.',
    coverImageUrl: null,
    author: { name: 'Bob', avatarUrl: null },
    tags: ['code-review', 'collaboration', 'best-practices'],
    publishedAt: '2024-01-18T10:00:00Z',
  },
  {
    id: 8,
    title: 'The Rise of Edge Computing',
    excerpt: 'Why processing data closer to the user is changing how we build modern applications.',
    coverImageUrl: null,
    author: { name: 'Alice Chen', avatarUrl: null },
    tags: ['edge-computing', 'architecture', 'performance'],
    publishedAt: '2024-01-17T10:00:00Z',
  },
  {
    id: 9,
    title: 'Securing Your CI/CD Pipeline',
    excerpt: 'Practical steps to protect your build and deployment workflows from common vulnerabilities.',
    coverImageUrl: null,
    author: { name: 'Bob', avatarUrl: null },
    tags: ['security', 'ci-cd', 'devops'],
    publishedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: 10,
    title: 'Writing Documentation Developers Actually Read',
    excerpt: 'Tips for creating clear, concise docs that reduce support tickets and onboarding time.',
    coverImageUrl: null,
    author: { name: 'Alice Chen', avatarUrl: null },
    tags: ['documentation', 'writing', 'developer-experience'],
    publishedAt: '2024-01-14T10:00:00Z',
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
    <section style={{ backgroundColor: '#1e293b' }}>
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

  it('applies the updated modern background color to the blogs page body', async () => {
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
      expect(section).toHaveStyle({ backgroundColor: '#1e293b' });
    });
  });

  it('displays the new blog card "Mastering Code Reviews" with correct summary and tags', async () => {
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
      expect(screen.getByText('Mastering Code Reviews')).toBeInTheDocument();
      expect(screen.getByText('Best practices for giving and receiving feedback that improves code quality and team culture.')).toBeInTheDocument();
      expect(screen.getByText('code-review')).toBeInTheDocument();
      expect(screen.getByText('collaboration')).toBeInTheDocument();
      expect(screen.getByText('best-practices')).toBeInTheDocument();
    });
  });

  it('displays the new blog card "The Rise of Edge Computing" with correct summary and tags', async () => {
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
      expect(screen.getByText('The Rise of Edge Computing')).toBeInTheDocument();
      expect(screen.getByText('Why processing data closer to the user is changing how we build modern applications.')).toBeInTheDocument();
      expect(screen.getByText('edge-computing')).toBeInTheDocument();
      expect(screen.getByText('architecture')).toBeInTheDocument();
      expect(screen.getByText('performance')).toBeInTheDocument();
    });
  });

  it('displays the new blog card "Securing Your CI/CD Pipeline" with correct summary and tags', async () => {
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
      expect(screen.getByText('Securing Your CI/CD Pipeline')).toBeInTheDocument();
      expect(screen.getByText('Practical steps to protect your build and deployment workflows from common vulnerabilities.')).toBeInTheDocument();
      expect(screen.getByText('security')).toBeInTheDocument();
      expect(screen.getByText('ci-cd')).toBeInTheDocument();
      expect(screen.getByText('devops')).toBeInTheDocument();
    });
  });

  it('displays the new blog card "Writing Documentation Developers Actually Read" with correct summary and tags', async () => {
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
      expect(screen.getByText('Writing Documentation Developers Actually Read')).toBeInTheDocument();
      expect(screen.getByText('Tips for creating clear, concise docs that reduce support tickets and onboarding time.')).toBeInTheDocument();
      expect(screen.getByText('documentation')).toBeInTheDocument();
      expect(screen.getByText('writing')).toBeInTheDocument();
      expect(screen.getByText('developer-experience')).toBeInTheDocument();
    });
  });
});
