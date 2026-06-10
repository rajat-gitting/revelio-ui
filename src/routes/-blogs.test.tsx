import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';

import { searchPosts, getBlogFilters, getPosts } from '@/api/services/blogService';
import type { BlogPostDto, BlogSearchResponse, BlogFiltersDto, PagedResponse } from '@/types/api';
import { Route } from './blogs';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock('@/api/services/blogService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api/services/blogService')>()),
  searchPosts: vi.fn(),
  getBlogFilters: vi.fn(),
  getPosts: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------
const makePosts = (count: number, overrides?: Partial<BlogPostDto>): BlogPostDto[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Post ${i + 1}`,
    excerpt: `Excerpt for post ${i + 1}`,
    coverImageUrl: null,
    author: { name: 'Alice', avatarUrl: null },
    tags: ['test'],
    publishedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }));

const makeSearchResponse = (
  posts: BlogPostDto[],
  total?: number
): BlogSearchResponse => ({
  total: total ?? posts.length,
  page: 0,
  size: 20,
  results: posts,
});

const makePagedResponse = (
  posts: BlogPostDto[],
  totalElements?: number,
  totalPages?: number
): PagedResponse<BlogPostDto> => ({
  content: posts,
  totalElements: totalElements ?? posts.length,
  totalPages: totalPages ?? 1,
  number: 0,
  size: 12,
});

const makeFilters = (): BlogFiltersDto => ({
  categories: ['Tech', 'Design'],
  authors: [
    { name: 'Alice', avatarUrl: null },
    { name: 'Bob', avatarUrl: null },
  ],
});

// ---------------------------------------------------------------------------
// Router helper
// ---------------------------------------------------------------------------
const BlogsPage = Route.options.component!;

function renderBlogsPage(initialSearch = '') {
  const rootRoute = createRootRoute();
  const blogsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/blogs',
    validateSearch: Route.options.validateSearch,
    component: BlogsPage,
  });
  const routeTree = rootRoute.addChildren([blogsRoute]);
  const history = createMemoryHistory({
    initialEntries: [`/blogs${initialSearch}`],
  });
  const router = createRouter({ routeTree, history });
  return { ...render(<RouterProvider router={router} />), router };
}

// ---------------------------------------------------------------------------
// CR-1: Search input is visible without a click
// ---------------------------------------------------------------------------
describe('CR-1: Search input is always visible', () => {
  beforeEach(() => {
    vi.mocked(searchPosts).mockResolvedValue(makeSearchResponse(makePosts(3)));
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse(makePosts(3)));
    vi.mocked(getBlogFilters).mockResolvedValue(makeFilters());
  });

  it('renders the search input immediately on page load (no click required)', async () => {
    renderBlogsPage();
    // Input must be present without any user interaction
    await waitFor(() => expect(screen.getByTestId('search-input')).toBeInTheDocument());
  });
});

// ---------------------------------------------------------------------------
// CR-2: Typing queries posts with ≤300 ms debounce
// ---------------------------------------------------------------------------
describe('CR-2: Search with debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse([]));
    vi.mocked(getBlogFilters).mockResolvedValue(makeFilters());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does NOT call searchPosts before the debounce window elapses', async () => {
    vi.mocked(searchPosts).mockResolvedValue(makeSearchResponse([]));
    renderBlogsPage();

    // Wait for TanStack Router to mount the page and initial fetch to settle
    await act(() => vi.runAllTimersAsync());
    const initialCallCount = vi.mocked(searchPosts).mock.calls.length;

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'react' } });

    // Still within debounce window — no new call yet
    act(() => { vi.advanceTimersByTime(200); });
    expect(vi.mocked(searchPosts).mock.calls.length).toBe(initialCallCount);
  });

  it('calls searchPosts after the 300 ms debounce', async () => {
    vi.mocked(searchPosts).mockResolvedValue(makeSearchResponse([]));
    renderBlogsPage();

    // Wait for TanStack Router to mount
    await act(() => vi.runAllTimersAsync());

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'react' } });

    // Advance past debounce and flush promises
    act(() => { vi.advanceTimersByTime(350); });
    await act(() => vi.runAllTimersAsync());

    // searchPosts must have been called with the query
    const calls = vi.mocked(searchPosts).mock.calls;
    const calledWithQuery = calls.some(([params]) => params.q === 'react');
    expect(calledWithQuery).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// CR-3: Category/Tag multi-select and Author filter are present
// ---------------------------------------------------------------------------
describe('CR-3: Filter controls', () => {
  beforeEach(() => {
    vi.mocked(searchPosts).mockResolvedValue(makeSearchResponse(makePosts(2)));
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse(makePosts(2)));
    vi.mocked(getBlogFilters).mockResolvedValue(makeFilters());
  });

  it('renders Category / Tag multi-select', async () => {
    renderBlogsPage();
    await waitFor(() => expect(screen.getByTestId('category-filter')).toBeInTheDocument());
    expect(screen.getByLabelText(/category \/ tag/i)).toBeInTheDocument();
  });

  it('renders Author filter', async () => {
    renderBlogsPage();
    await waitFor(() => expect(screen.getByTestId('author-filter')).toBeInTheDocument());
    expect(screen.getByLabelText(/author/i)).toBeInTheDocument();
  });

  it('populates category options from getBlogFilters', async () => {
    renderBlogsPage();
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Tech' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Design' })).toBeInTheDocument();
    });
  });

  it('populates author options from getBlogFilters', async () => {
    renderBlogsPage();
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Alice' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Bob' })).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// CR-4: Filters and search can be combined
// ---------------------------------------------------------------------------
describe('CR-4: Combined search + filters', () => {
  beforeEach(() => {
    vi.mocked(getBlogFilters).mockResolvedValue(makeFilters());
    vi.mocked(searchPosts).mockResolvedValue(makeSearchResponse(makePosts(1)));
  });

  it('passes both q and category to searchPosts', async () => {
    renderBlogsPage('?q=hello&category=Tech');

    await waitFor(() => {
      const calls = vi.mocked(searchPosts).mock.calls;
      const combined = calls.some(
        ([params]) => params.q === 'hello' && params.category?.includes('Tech')
      );
      expect(combined).toBe(true);
    });
  });

  it('passes both q and author to searchPosts', async () => {
    renderBlogsPage('?q=world&author=Alice');

    await waitFor(() => {
      const calls = vi.mocked(searchPosts).mock.calls;
      const combined = calls.some(
        ([params]) => params.q === 'world' && params.author?.includes('Alice')
      );
      expect(combined).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// CR-5: Result count is displayed and updates
// ---------------------------------------------------------------------------
describe('CR-5: Result count', () => {
  beforeEach(() => {
    vi.mocked(getBlogFilters).mockResolvedValue(makeFilters());
  });

  it('displays the total result count returned by the API', async () => {
    // No active filters → getPosts is used; pass 14 as totalElements
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse(makePosts(12), 14, 2));
    renderBlogsPage();

    await waitFor(() => {
      expect(screen.getByTestId('result-count')).toHaveTextContent('14 results');
    });
  });

  it('displays "1 result" in singular when total is 1', async () => {
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse(makePosts(1), 1, 1));
    renderBlogsPage();

    await waitFor(() => {
      expect(screen.getByTestId('result-count')).toHaveTextContent('1 result');
    });
  });

  it('displays "0 results" when there are no matches', async () => {
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse([], 0, 0));
    renderBlogsPage();

    await waitFor(() => {
      expect(screen.getByTestId('result-count')).toHaveTextContent('0 results');
    });
  });
});

// ---------------------------------------------------------------------------
// CR-6: Active filter chips are visible
// ---------------------------------------------------------------------------
describe('CR-6: Active filter chips', () => {
  beforeEach(() => {
    vi.mocked(searchPosts).mockResolvedValue(makeSearchResponse(makePosts(2)));
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse(makePosts(2)));
    vi.mocked(getBlogFilters).mockResolvedValue(makeFilters());
  });

  it('shows a chip for the current search query', async () => {
    renderBlogsPage('?q=typescript');

    await waitFor(() => {
      expect(screen.getByTestId('chip-query')).toBeInTheDocument();
      expect(screen.getByTestId('chip-query')).toHaveTextContent('typescript');
    });
  });

  it('shows a chip for each active category', async () => {
    renderBlogsPage('?category=Tech');

    await waitFor(() => {
      expect(screen.getByTestId('chip-category-Tech')).toBeInTheDocument();
    });
  });

  it('shows a chip for each active author', async () => {
    renderBlogsPage('?author=Alice');

    await waitFor(() => {
      expect(screen.getByTestId('chip-author-Alice')).toBeInTheDocument();
    });
  });

  it('does NOT show the active-filters section when nothing is active', async () => {
    renderBlogsPage();

    // Wait for results to appear (post-loading)
    await waitFor(() => screen.getByTestId('result-count'));
    expect(screen.queryByTestId('active-filters')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// CR-7: Clear all and individual chip removal
// ---------------------------------------------------------------------------
describe('CR-7: Clear all and individual chip removal', () => {
  beforeEach(() => {
    vi.mocked(searchPosts).mockResolvedValue(makeSearchResponse(makePosts(2)));
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse(makePosts(2)));
    vi.mocked(getBlogFilters).mockResolvedValue(makeFilters());
  });

  it('clicking Clear all removes all chips', async () => {
    renderBlogsPage('?q=test&category=Tech&author=Alice');

    await waitFor(() => {
      expect(screen.getByTestId('chip-query')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('clear-all'));

    await waitFor(() => {
      expect(screen.queryByTestId('active-filters')).not.toBeInTheDocument();
    });
  });

  it('clicking the × on a query chip removes only that chip', async () => {
    renderBlogsPage('?q=hello&category=Tech');

    await waitFor(() => {
      expect(screen.getByTestId('chip-query')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText(/remove search term/i));

    await waitFor(() => {
      expect(screen.queryByTestId('chip-query')).not.toBeInTheDocument();
      // Category chip should still be there
      expect(screen.getByTestId('chip-category-Tech')).toBeInTheDocument();
    });
  });

  it('clicking the × on a category chip removes only that category', async () => {
    renderBlogsPage('?category=Tech&author=Alice');

    await waitFor(() => {
      expect(screen.getByTestId('chip-category-Tech')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText(/remove category filter "Tech"/i));

    await waitFor(() => {
      expect(screen.queryByTestId('chip-category-Tech')).not.toBeInTheDocument();
      // Author chip remains
      expect(screen.getByTestId('chip-author-Alice')).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// CR-8: Empty state
// ---------------------------------------------------------------------------
describe('CR-8: Empty state', () => {
  beforeEach(() => {
    vi.mocked(getBlogFilters).mockResolvedValue(makeFilters());
  });

  it('shows a friendly empty state when no results are found', async () => {
    vi.mocked(searchPosts).mockResolvedValue(makeSearchResponse([], 0));
    renderBlogsPage('?q=zxqvbnm');

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state')).toHaveTextContent(/no posts found/i);
    });
  });

  it('empty state includes a prompt to reset filters', async () => {
    vi.mocked(searchPosts).mockResolvedValue(makeSearchResponse([], 0));
    renderBlogsPage('?q=zxqvbnm');

    await waitFor(() => {
      expect(screen.getByTestId('empty-state-reset')).toBeInTheDocument();
    });
  });

  it('empty-state reset button triggers a cleared search', async () => {
    vi.mocked(searchPosts).mockResolvedValue(makeSearchResponse([], 0));
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse(makePosts(3)));
    renderBlogsPage('?q=zxqvbnm');

    await waitFor(() => {
      expect(screen.getByTestId('empty-state-reset')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('empty-state-reset'));

    // After clearing all filters, getPosts is called (no active filters)
    await waitFor(() => {
      expect(vi.mocked(getPosts)).toHaveBeenCalled();
    });
  });
});

// ---------------------------------------------------------------------------
// CR-9: Mobile-first DOM structure
// ---------------------------------------------------------------------------
describe('CR-9: Responsive structure', () => {
  beforeEach(() => {
    vi.mocked(searchPosts).mockResolvedValue(makeSearchResponse(makePosts(2)));
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse(makePosts(2)));
    vi.mocked(getBlogFilters).mockResolvedValue(makeFilters());
  });

  it('renders search input, filter controls, result count and post list in one page', async () => {
    renderBlogsPage();

    await waitFor(() => screen.getByTestId('result-count'));

    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('category-filter')).toBeInTheDocument();
    expect(screen.getByTestId('author-filter')).toBeInTheDocument();
    expect(screen.getByTestId('result-count')).toBeInTheDocument();
    expect(screen.getByTestId('results-grid')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// CR-10: "/" key focuses search input
// ---------------------------------------------------------------------------
describe('CR-10: Keyboard shortcut "/"', () => {
  beforeEach(() => {
    vi.mocked(searchPosts).mockResolvedValue(makeSearchResponse(makePosts(2)));
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse(makePosts(2)));
    vi.mocked(getBlogFilters).mockResolvedValue(makeFilters());
  });

  it('pressing "/" focuses the search input when focus is on body', async () => {
    renderBlogsPage();

    await waitFor(() => screen.getByTestId('search-input'));

    const input = screen.getByTestId('search-input');
    // Ensure focus is NOT inside an input
    document.body.focus();

    fireEvent.keyDown(document, { key: '/', target: document.body });

    expect(document.activeElement).toBe(input);
  });

  it('pressing "/" when focus is already inside an input does NOT move focus', async () => {
    renderBlogsPage();

    await waitFor(() => screen.getByTestId('search-input'));

    const otherInput = document.createElement('input');
    document.body.appendChild(otherInput);
    otherInput.focus();

    // Fire the keydown event directly on the focused input element
    fireEvent.keyDown(otherInput, { key: '/' });

    // Focus must remain on the other input
    expect(document.activeElement).toBe(otherInput);

    document.body.removeChild(otherInput);
  });
});

// ---------------------------------------------------------------------------
// CR-11: No full page reload — results update in-place
// ---------------------------------------------------------------------------
describe('CR-11: In-place updates', () => {
  beforeEach(() => {
    vi.mocked(getBlogFilters).mockResolvedValue(makeFilters());
  });

  it('re-renders results without unmounting the page container', async () => {
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse(makePosts(3)));
    vi.mocked(searchPosts).mockResolvedValue(makeSearchResponse(makePosts(3)));
    renderBlogsPage();

    await waitFor(() => screen.getByTestId('results-grid'));

    // Simulate a new query
    vi.mocked(searchPosts).mockResolvedValue(makeSearchResponse(makePosts(1)));
    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'new query' } });

    // Page container (same DOM node) remains mounted
    expect(screen.getByTestId('blogs-page')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// CR-12: Non-blocking error handling
// ---------------------------------------------------------------------------
describe('CR-12: Non-blocking error handling', () => {
  beforeEach(() => {
    vi.mocked(getBlogFilters).mockResolvedValue(makeFilters());
  });

  it('shows an error banner when the backend request fails', async () => {
    // Without active filters, getPosts is called — make it reject
    vi.mocked(getPosts).mockRejectedValue(new Error('Network error'));
    vi.mocked(searchPosts).mockRejectedValue(new Error('Network error'));
    renderBlogsPage();

    await waitFor(() => {
      expect(screen.getByTestId('error-banner')).toBeInTheDocument();
    });
  });

  it('keeps last valid results visible when a subsequent request fails', async () => {
    // First call (no filters): getPosts succeeds
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse(makePosts(3), 3));
    // First call succeeds
    vi.mocked(searchPosts).mockResolvedValue(makeSearchResponse(makePosts(3), 3));
    renderBlogsPage();

    await waitFor(() => screen.getByTestId('results-grid'));

    // Second call fails
    vi.mocked(searchPosts).mockRejectedValue(new Error('500 Internal Server Error'));
    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'crash' } });

    await waitFor(() => {
      expect(screen.getByTestId('error-banner')).toBeInTheDocument();
      // Results grid still present (last valid results)
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });
  });

  it('error banner can be dismissed independently', async () => {
    vi.mocked(getPosts).mockRejectedValue(new Error('Network error'));
    vi.mocked(searchPosts).mockRejectedValue(new Error('Network error'));
    renderBlogsPage();

    await waitFor(() => screen.getByTestId('error-banner'));

    fireEvent.click(screen.getByLabelText(/dismiss error/i));

    await waitFor(() => {
      expect(screen.queryByTestId('error-banner')).not.toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// useDebounce hook unit tests
// ---------------------------------------------------------------------------
describe('useDebounce', () => {
  it('returns initial value immediately', async () => {
    const { useDebounce } = await import('@/hooks/useDebounce');
    const { renderHook } = await import('@testing-library/react');
    vi.useFakeTimers();
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
    vi.useRealTimers();
  });

  it('updates value after delay elapses', async () => {
    const { useDebounce } = await import('@/hooks/useDebounce');
    const { renderHook, act: hookAct } = await import('@testing-library/react');
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 300), {
      initialProps: { val: 'a' },
    });
    rerender({ val: 'b' });
    expect(result.current).toBe('a'); // still old value before delay
    await hookAct(() => vi.runAllTimersAsync());
    expect(result.current).toBe('b');
    vi.useRealTimers();
  });
});
