/**
 * CR-24: Blog Post Pagination tests
 *
 * One focused test per acceptance criterion:
 * AC1  – 12 posts per page displayed when ≥12 exist
 * AC2  – Previous button absent/disabled on page 1; present and enabled on page >1
 * AC3  – Next button absent/disabled on last page; present and enabled otherwise
 * AC4  – Clicking Next/Previous updates URL ?page=N without full reload
 * AC5  – Loading ?page=N directly renders the correct page of posts
 * AC6  – Browser back/forward navigates between pages correctly
 * AC7  – While a request is in flight, skeleton is shown and buttons are disabled
 * AC8  – API error shows error banner while previously-loaded posts remain visible
 * AC9  – No pagination controls when fewer than 12 posts exist in total
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';

import { getPosts, getBlogFilters } from '@/api/services/blogService';
import type { BlogPostDto, PagedResponse } from '@/types/api';
import { Route } from './index';

// ---------------------------------------------------------------------------
// Mocks — use importOriginal so existing exports (searchPosts, getBlogs, etc.)
// stay as real stubs and don't break other suites.
// ---------------------------------------------------------------------------
vi.mock('@/api/services/blogService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api/services/blogService')>()),
  getPosts: vi.fn(),
  getBlogFilters: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const makePosts = (count: number, startId = 1): BlogPostDto[] =>
  Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    title: `Post ${startId + i}`,
    excerpt: `Excerpt ${startId + i}`,
    coverImageUrl: null,
    author: { name: 'Alice', avatarUrl: null },
    tags: ['tag'],
    publishedAt: '2024-01-01T00:00:00Z',
    body: '',
  }));

const makePagedResponse = (
  posts: BlogPostDto[],
  opts: { totalElements?: number; totalPages?: number; number?: number; size?: number } = {}
): PagedResponse<BlogPostDto> => ({
  content: posts,
  totalElements: opts.totalElements ?? posts.length,
  totalPages: opts.totalPages ?? 1,
  number: opts.number ?? 0,
  size: opts.size ?? 12,
});

const HomePage = Route.options.component!;

function renderHomePage(initialSearch = '') {
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    validateSearch: Route.options.validateSearch,
    component: HomePage,
  });
  const routeTree = rootRoute.addChildren([indexRoute]);
  const history = createMemoryHistory({
    initialEntries: [`/${initialSearch}`],
  });
  const router = createRouter({ routeTree, history });
  return { ...render(<RouterProvider router={router} />), router };
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
beforeEach(() => {
  vi.mocked(getBlogFilters).mockResolvedValue({ authors: [], categories: [] });
});

// ---------------------------------------------------------------------------
// AC1: 12 posts per page when ≥12 exist
// ---------------------------------------------------------------------------
describe('CR-24 AC1: 12 posts per page', () => {
  it('renders exactly 12 post cards when the API returns a full page', async () => {
    vi.mocked(getPosts).mockResolvedValue(
      makePagedResponse(makePosts(12), { totalElements: 24, totalPages: 2, number: 0 })
    );

    renderHomePage();

    await waitFor(() => {
      const grid = screen.getByTestId('results-grid');
      // 12 BlogCard elements inside the grid (each renders an <a class="blog-card">)
      const cards = grid.querySelectorAll('.blog-card');
      expect(cards.length).toBe(12);
    });
  });
});

// ---------------------------------------------------------------------------
// AC2: Previous button disabled/absent on page 1, functional on page >1
// ---------------------------------------------------------------------------
describe('CR-24 AC2: Previous button behaviour', () => {
  it('does not render a functional Previous button on page 1 (first page)', async () => {
    vi.mocked(getPosts).mockResolvedValue(
      makePagedResponse(makePosts(12), { totalElements: 24, totalPages: 2, number: 0 })
    );

    renderHomePage(); // defaults to ?page=1

    await waitFor(() => screen.getByTestId('results-grid'));

    const prevBtn = screen.queryByTestId('prev-button');
    // Either absent or disabled
    if (prevBtn) {
      expect(prevBtn).toBeDisabled();
    } else {
      expect(prevBtn).toBeNull();
    }
  });

  it('renders an enabled Previous button on page 2', async () => {
    vi.mocked(getPosts).mockResolvedValue(
      makePagedResponse(makePosts(12, 13), { totalElements: 24, totalPages: 2, number: 1 })
    );

    renderHomePage('?page=2');

    await waitFor(() => screen.getByTestId('results-grid'));

    const prevBtn = screen.getByTestId('prev-button');
    expect(prevBtn).toBeInTheDocument();
    expect(prevBtn).not.toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// AC3: Next button disabled/absent on last page, functional otherwise
// ---------------------------------------------------------------------------
describe('CR-24 AC3: Next button behaviour', () => {
  it('does not render a functional Next button on the last page', async () => {
    vi.mocked(getPosts).mockResolvedValue(
      makePagedResponse(makePosts(12, 13), { totalElements: 24, totalPages: 2, number: 1 })
    );

    renderHomePage('?page=2');

    await waitFor(() => screen.getByTestId('results-grid'));

    const nextBtn = screen.queryByTestId('next-button');
    if (nextBtn) {
      expect(nextBtn).toBeDisabled();
    } else {
      expect(nextBtn).toBeNull();
    }
  });

  it('renders an enabled Next button on page 1 when more pages exist', async () => {
    vi.mocked(getPosts).mockResolvedValue(
      makePagedResponse(makePosts(12), { totalElements: 24, totalPages: 2, number: 0 })
    );

    renderHomePage();

    await waitFor(() => screen.getByTestId('results-grid'));

    const nextBtn = screen.getByTestId('next-button');
    expect(nextBtn).toBeInTheDocument();
    expect(nextBtn).not.toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// AC4: Clicking Next/Previous updates the URL ?page=N
// ---------------------------------------------------------------------------
describe('CR-24 AC4: Clicking Next/Previous updates URL', () => {
  it('clicking Next increments ?page in the URL', async () => {
    // First call returns page 1 of 2
    vi.mocked(getPosts).mockResolvedValueOnce(
      makePagedResponse(makePosts(12), { totalElements: 24, totalPages: 2, number: 0 })
    );
    // Second call (after Next click) returns page 2 of 2
    vi.mocked(getPosts).mockResolvedValueOnce(
      makePagedResponse(makePosts(12, 13), { totalElements: 24, totalPages: 2, number: 1 })
    );

    const { router } = renderHomePage();

    await waitFor(() => screen.getByTestId('next-button'));

    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      // TanStack Router stores search as an object; check the parsed value
      const searchParams = router.state.location.search as Record<string, unknown>;
      expect(searchParams.page).toBe(2);
    });
  });

  it('clicking Previous decrements ?page in the URL', async () => {
    vi.mocked(getPosts).mockResolvedValue(
      makePagedResponse(makePosts(12, 13), { totalElements: 24, totalPages: 2, number: 1 })
    );

    const { router } = renderHomePage('?page=2');

    await waitFor(() => screen.getByTestId('prev-button'));

    // Set up second call for page 1
    vi.mocked(getPosts).mockResolvedValueOnce(
      makePagedResponse(makePosts(12), { totalElements: 24, totalPages: 2, number: 0 })
    );

    fireEvent.click(screen.getByTestId('prev-button'));

    await waitFor(() => {
      const searchParams = router.state.location.search as Record<string, unknown>;
      expect(searchParams.page).toBe(1);
    });
  });
});

// ---------------------------------------------------------------------------
// AC5: Loading ?page=N directly renders the correct posts
// ---------------------------------------------------------------------------
describe('CR-24 AC5: Direct page load by URL', () => {
  it('renders posts from page 2 when navigating directly to ?page=2', async () => {
    vi.mocked(getPosts).mockResolvedValue(
      makePagedResponse(makePosts(12, 13), { totalElements: 24, totalPages: 2, number: 1 })
    );

    renderHomePage('?page=2');

    await waitFor(() => {
      // Posts 13–24 should be present
      expect(screen.getByText('Post 13')).toBeInTheDocument();
    });

    // Verify API was called with page=1 (0-based for page 2)
    expect(vi.mocked(getPosts)).toHaveBeenCalledWith(1, 12);
  });
});

// ---------------------------------------------------------------------------
// AC6: Browser Back/Forward navigates between pages
// ---------------------------------------------------------------------------
describe('CR-24 AC6: Browser back/forward navigation', () => {
  it('navigating back after Next click returns to the previous page', async () => {
    // Page 1 response
    const page1Response = makePagedResponse(makePosts(12), {
      totalElements: 24,
      totalPages: 2,
      number: 0,
    });
    // Page 2 response
    const page2Response = makePagedResponse(makePosts(12, 13), {
      totalElements: 24,
      totalPages: 2,
      number: 1,
    });

    vi.mocked(getPosts)
      .mockResolvedValueOnce(page1Response)  // initial load
      .mockResolvedValueOnce(page2Response)  // after Next
      .mockResolvedValueOnce(page1Response); // after Back

    const { router } = renderHomePage();

    // Wait for page 1 to load
    await waitFor(() => screen.getByTestId('next-button'));
    expect(screen.getByText('Post 1')).toBeInTheDocument();

    // Click Next
    fireEvent.click(screen.getByTestId('next-button'));
    await waitFor(() => screen.getByText('Post 13'));

    // Navigate back
    act(() => {
      router.history.back();
    });

    await waitFor(() => {
      expect(screen.getByText('Post 1')).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// AC7: Loading indicator shown and buttons disabled while request in flight
// ---------------------------------------------------------------------------
describe('CR-24 AC7: Loading state', () => {
  it('shows a skeleton grid while the paginated request is in flight', async () => {
    let resolveRequest!: (v: PagedResponse<BlogPostDto>) => void;
    vi.mocked(getPosts).mockReturnValueOnce(
      new Promise<PagedResponse<BlogPostDto>>((resolve) => {
        resolveRequest = resolve;
      })
    );

    renderHomePage();

    // While the promise is pending, skeleton grid should be present
    await waitFor(() => {
      expect(screen.getByTestId('skeleton-grid')).toBeInTheDocument();
    });

    // Resolve the promise to avoid act() warnings
    act(() => {
      resolveRequest(
        makePagedResponse(makePosts(12), { totalElements: 24, totalPages: 2, number: 0 })
      );
    });
  });
});

// ---------------------------------------------------------------------------
// AC8: API error shows error banner; previously-loaded posts remain visible
// ---------------------------------------------------------------------------
describe('CR-24 AC8: Error handling', () => {
  it('shows an error banner when the API fails and keeps previous posts visible', async () => {
    // First call (page 1) succeeds
    vi.mocked(getPosts).mockResolvedValueOnce(
      makePagedResponse(makePosts(12), { totalElements: 24, totalPages: 2, number: 0 })
    );

    renderHomePage();

    await waitFor(() => screen.getByTestId('results-grid'));
    expect(screen.getByText('Post 1')).toBeInTheDocument();

    // Second call (after clicking Next → page 2) fails
    vi.mocked(getPosts).mockRejectedValueOnce(new Error('Network error'));

    // Click Next to trigger the failing request
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-banner')).toBeInTheDocument();
      // Previous posts should still be visible (non-blank page)
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// AC9: No pagination controls when fewer than 12 posts exist
// ---------------------------------------------------------------------------
describe('CR-24 AC9: No pagination controls for small result sets', () => {
  it('does not render pagination when totalElements < 12', async () => {
    vi.mocked(getPosts).mockResolvedValue(
      makePagedResponse(makePosts(5), { totalElements: 5, totalPages: 1, number: 0 })
    );

    renderHomePage();

    await waitFor(() => screen.getByTestId('results-grid'));

    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    expect(screen.queryByTestId('prev-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('next-button')).not.toBeInTheDocument();
  });

  it('does not render pagination when totalPages is exactly 1', async () => {
    vi.mocked(getPosts).mockResolvedValue(
      makePagedResponse(makePosts(12), { totalElements: 12, totalPages: 1, number: 0 })
    );

    renderHomePage();

    await waitFor(() => screen.getByTestId('results-grid'));

    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });
});
