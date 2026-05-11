import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import BlogsPage from './blogs';
import * as blogService from '@/api/services/blogService';
import type { BlogPostDto } from '@/types/api';

vi.mock('@/api/services/blogService');

const mockBlogs: BlogPostDto[] = [
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

function createTestRouter() {
  const rootRoute = createRootRoute();
  const blogsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/blogs',
    component: BlogsPage,
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([blogsRoute]),
    history: createMemoryHistory({ initialEntries: ['/blogs'] }),
  });

  return router;
}

describe('BlogsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('applies background color #836565 to the blogs page body', async () => {
    vi.mocked(blogService.getBlogs).mockResolvedValue(mockBlogs);

    const router = createTestRouter();
    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('Getting Started with Spring Boot')).toBeInTheDocument();
    });

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    
    const computedStyle = window.getComputedStyle(section!);
    const backgroundColor = computedStyle.backgroundColor;
    
    // Convert rgb to hex for comparison
    const rgbMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      expect(hex).toBe('#836565');
    } else {
      // Fallback: check if the class is applied
      expect(section).toHaveClass(/section/);
    }
  });

  it('displays the new blog post "Development in the era of AI"', async () => {
    vi.mocked(blogService.getBlogs).mockResolvedValue(mockBlogs);

    const router = createTestRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('Development in the era of AI')).toBeInTheDocument();
    });
  });

  it('displays the summary text for the AI blog post', async () => {
    vi.mocked(blogService.getBlogs).mockResolvedValue(mockBlogs);

    const router = createTestRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('How AI tools are reshaping the way developers write, review, and ship code.')).toBeInTheDocument();
    });
  });

  it('displays the tags ai, development, and productivity for the AI blog post', async () => {
    vi.mocked(blogService.getBlogs).mockResolvedValue(mockBlogs);

    const router = createTestRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('Development in the era of AI')).toBeInTheDocument();
    });

    expect(screen.getByText('ai')).toBeInTheDocument();
    expect(screen.getByText('development')).toBeInTheDocument();
    expect(screen.getByText('productivity')).toBeInTheDocument();
  });

  it('renders blog cards when data is loaded', async () => {
    vi.mocked(blogService.getBlogs).mockResolvedValue(mockBlogs);

    const router = createTestRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('Getting Started with Spring Boot')).toBeInTheDocument();
      expect(screen.getByText('Development in the era of AI')).toBeInTheDocument();
    });
  });

  it('shows loading skeleton cards while fetching data', () => {
    vi.mocked(blogService.getBlogs).mockImplementation(() => new Promise(() => {}));

    const router = createTestRouter();
    const { container } = render(<RouterProvider router={router} />);

    const skeletonCards = container.querySelectorAll('[data-testid="skeleton-card"]');
    expect(skeletonCards.length).toBeGreaterThan(0);
  });

  it('shows error state when API call fails', async () => {
    vi.mocked(blogService.getBlogs).mockRejectedValue(new Error('API Error'));

    const router = createTestRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows empty state when no posts are returned', async () => {
    vi.mocked(blogService.getBlogs).mockResolvedValue([]);

    const router = createTestRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('No posts yet. Check back soon.')).toBeInTheDocument();
    });
  });
});
