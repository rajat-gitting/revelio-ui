import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { getPosts, getBlogFilters } from '@/api/services/blogService';
import type { BlogPostDto, PagedResponse } from '@/types/api';
import { Route } from './index';
import styles from '@/routes/index.module.scss';

vi.mock('@/api/services/blogService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api/services/blogService')>()),
  getPosts: vi.fn(),
  getBlogFilters: vi.fn(),
}));

const mockBlogPosts: BlogPostDto[] = [
  {
    id: 1,
    title: 'Test Post',
    excerpt: 'Test excerpt',
    coverImageUrl: null,
    author: { name: 'Alice', avatarUrl: null },
    tags: ['test'],
    publishedAt: '2024-01-01T00:00:00Z',
    body: '',
  },
];

const makePagedResponse = (posts: BlogPostDto[]): PagedResponse<BlogPostDto> => ({
  content: posts,
  totalElements: posts.length,
  totalPages: 1,
  number: 0,
  size: 12,
});

const HomePage = Route.options.component;

const rootRoute = createRootRoute();
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: Route.options.validateSearch,
  component: HomePage,
});

const routeTree = rootRoute.addChildren([indexRoute]);

function renderHomePage() {
  const history = createMemoryHistory({ initialEntries: ['/'] });
  const router = createRouter({ routeTree, history });
  return render(<RouterProvider router={router} />);
}

describe('HomePage styles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse(mockBlogPosts));
    vi.mocked(getBlogFilters).mockResolvedValue({ authors: [], categories: [] });
  });

  it('applies the grid CSS module class when posts are loaded', async () => {
    const { container } = renderHomePage();

    await waitFor(() => {
      expect(container.querySelector('#blog-section')).toBeInTheDocument();
    });

    const section = container.querySelector('#blog-section')!;
    expect(section).toHaveClass(styles.grid!);
  });

  it('defines background color using design tokens (not a hardcoded value) in section styles', () => {
    const scssPath = resolve(dirname(fileURLToPath(import.meta.url)), 'index.module.scss');
    const scss = readFileSync(scssPath, 'utf8');
    // After the design-token redesign, the old hardcoded #836565 is replaced with a token reference
    // Accept either a CSS custom property or an SCSS variable for the background
    const hasTokenBackground =
      scss.includes('var(--color-bg)') ||
      scss.includes('$color-bg') ||
      scss.includes('var(--color-surface)') ||
      scss.includes('$color-surface');
    expect(hasTokenBackground).toBe(true);
    // The old hardcoded color must no longer be present
    expect(scss).not.toContain('background-color: #836565');
  });
});

// CR-37: Home page has search/filter inline; no "Search blogs →" link
describe('HomePage CR-37 — search/filter on Home page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse(mockBlogPosts));
    vi.mocked(getBlogFilters).mockResolvedValue({ authors: [], categories: [] });
  });

  it('does not render a "Search blogs" link', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('search-toggle')).toBeInTheDocument();
    });

    expect(screen.queryByRole('link', { name: /search blogs/i })).not.toBeInTheDocument();
  });

  it('renders a simple page header (not the full hero)', async () => {
    const { container } = renderHomePage();

    await waitFor(() => {
      expect(container.querySelector('header')).toBeInTheDocument();
    });

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    // The simple header should not carry the hero data-testid
    expect(header).not.toHaveAttribute('data-testid', 'hero-section');
  });

  it('renders the Create Blog button on the Home page', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create blog/i })).toBeInTheDocument();
    });
  });

  it('renders the search input above the blog card grid after opening search', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('search-toggle')).toBeInTheDocument();
    });

    // Search input is hidden by default — open it first
    fireEvent.click(screen.getByTestId('search-toggle'));

    await waitFor(() => {
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });
  });

  it('renders a Category / Tag filter after opening filters', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('filter-toggle')).toBeInTheDocument();
    });

    // Filters are hidden by default — open them first
    fireEvent.click(screen.getByTestId('filter-toggle'));

    await waitFor(() => {
      expect(screen.getByTestId('category-filter')).toBeInTheDocument();
    });
  });

  it('renders an Author filter after opening filters', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('filter-toggle')).toBeInTheDocument();
    });

    // Filters are hidden by default — open them first
    fireEvent.click(screen.getByTestId('filter-toggle'));

    await waitFor(() => {
      expect(screen.getByTestId('author-filter')).toBeInTheDocument();
    });
  });

  it('grid uses full width — Layout.module.scss has no max-width on .main', () => {
    const layoutScssPath = resolve(
      dirname(fileURLToPath(import.meta.url)),
      '../components/Layout/Layout.module.scss'
    );
    const scss = readFileSync(layoutScssPath, 'utf8');
    expect(scss).not.toMatch(/max-width:\s*\$breakpoint-desktop/);
  });

  it('index grid adds a 4-column widescreen breakpoint', () => {
    const scssPath = resolve(dirname(fileURLToPath(import.meta.url)), 'index.module.scss');
    const mixinsPath = resolve(dirname(fileURLToPath(import.meta.url)), '../styles/_mixins.scss');
    const indexScss = readFileSync(scssPath, 'utf8');
    const mixinsScss = readFileSync(mixinsPath, 'utf8');
    // index.module.scss uses the widescreen mixin and sets 4 columns
    expect(indexScss).toContain('repeat(4, 1fr)');
    expect(indexScss).toContain('m.widescreen');
    // The mixin itself defines the 1280px threshold
    expect(mixinsScss).toContain('1280px');
  });
});

// ---------------------------------------------------------------------------
// validateSearch — edge-case coercions for single-string category / author
// ---------------------------------------------------------------------------
describe('validateSearch coercions', () => {
  // Cast to a plain callable so TypeScript is happy — the underlying implementation
  // is a function even though the TanStack Router type is a union with non-callable members.
  interface HomeSearch { q: string; category: string[]; author: string[]; page: number }
  const validate = Route.options.validateSearch as unknown as (
    raw: Record<string, unknown>
  ) => HomeSearch;

  it('wraps a single string category into an array', () => {
    const result = validate({ category: 'Tech', author: [], q: '', page: 1 });
    expect(result.category).toEqual(['Tech']);
  });

  it('wraps a single string author into an array', () => {
    const result = validate({ category: [], author: 'Alice', q: '', page: 1 });
    expect(result.author).toEqual(['Alice']);
  });

  it('keeps array category as-is', () => {
    const result = validate({ category: ['React', 'Node'], author: [], q: '', page: 1 });
    expect(result.category).toEqual(['React', 'Node']);
  });

  it('defaults to empty arrays when category / author are absent', () => {
    const result = validate({ q: '', page: 1 });
    expect(result.category).toEqual([]);
    expect(result.author).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// CR-40: Search and filter controls hidden by default; toggleable from header
// ---------------------------------------------------------------------------
describe('CR-40 — search/filter toggle behaviour', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse(mockBlogPosts));
    vi.mocked(getBlogFilters).mockResolvedValue({
      authors: [{ name: 'Alice', avatarUrl: null }],
      categories: ['Tech'],
    });
  });

  // Criterion 1: search input and filter dropdowns hidden by default
  it('does not show search input or filter dropdowns on initial render', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('category-filter')).not.toBeInTheDocument();
    expect(screen.queryByTestId('author-filter')).not.toBeInTheDocument();
  });

  // Criterion 2: clickable search icon in header
  it('renders a clickable search toggle button in the header', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('search-toggle')).toBeInTheDocument();
    });

    const toggle = screen.getByTestId('search-toggle');
    expect(toggle.tagName).toBe('BUTTON');
    // It should be inside the header
    const header = document.querySelector('header');
    expect(header).toContainElement(toggle);
  });

  // Criterion 3: clicking search icon expands the search box
  it('clicking the search toggle reveals the search input', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('search-toggle')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('search-toggle'));
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  // Criterion 4: typing in search box filters posts (debounced URL param)
  it('typing in the expanded search box updates inputValue', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('search-toggle')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('search-toggle'));
    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'react' } });
    expect((input as HTMLInputElement).value).toBe('react');
  });

  // Criterion 5: filter toggle button exists and reveals category/author filters
  it('clicking the filter toggle reveals category and author dropdowns', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('filter-toggle')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('category-filter')).not.toBeInTheDocument();
    expect(screen.queryByTestId('author-filter')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('filter-toggle'));

    expect(screen.getByTestId('category-filter')).toBeInTheDocument();
    expect(screen.getByTestId('author-filter')).toBeInTheDocument();
  });

  // Criterion 6: filter dropdowns hidden by default
  it('filter dropdowns are hidden by default', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('filter-toggle')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('filter-row')).not.toBeInTheDocument();
  });

  // Criterion 7: collapsing search box hides it but preserves query/filters in URL
  it('collapsing the search box hides it but active filter chips remain', async () => {
    // Render with an active query in the URL
    const history = createMemoryHistory({ initialEntries: ['/?q=hello'] });
    const router = createRouter({ routeTree, history });
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId('search-toggle')).toBeInTheDocument();
    });

    // Open search to see the input
    fireEvent.click(screen.getByTestId('search-toggle'));
    expect(screen.getByTestId('search-input')).toBeInTheDocument();

    // Collapse it
    fireEvent.click(screen.getByTestId('search-toggle'));
    expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();

    // Active filter chip for the query should still be visible
    await waitFor(() => {
      expect(screen.getByTestId('chip-query')).toBeInTheDocument();
    });
  });

  // Criterion 8: active filter chips visible even when controls are collapsed
  it('active filter chips are rendered regardless of searchOpen/filtersOpen state', async () => {
    const history = createMemoryHistory({ initialEntries: ['/?q=test'] });
    const router = createRouter({ routeTree, history });
    render(<RouterProvider router={router} />);

    // Controls are collapsed (default), but chip should appear
    await waitFor(() => {
      expect(screen.getByTestId('chip-query')).toBeInTheDocument();
    });

    // search-input should NOT be visible (searchOpen = false)
    expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();
  });

  // Criterion 9: list returns to all posts only when query and filters are cleared
  it('list stays filtered until explicit clear; clearing removes active chips', async () => {
    const history = createMemoryHistory({ initialEntries: ['/?q=hello'] });
    const router = createRouter({ routeTree, history });
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId('chip-query')).toBeInTheDocument();
    });

    // Click the remove button on the chip to clear query
    fireEvent.click(screen.getByRole('button', { name: /remove search term/i }));

    await waitFor(() => {
      expect(screen.queryByTestId('chip-query')).not.toBeInTheDocument();
    });
  });

  // Criterion 10: Create Blog button is present in header (navigation tested in smoke)
  it('renders the Create Blog button in the header', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create blog/i })).toBeInTheDocument();
    });

    const createBtn = screen.getByRole('button', { name: /create blog/i });
    const header = document.querySelector('header');
    expect(header).toContainElement(createBtn);
  });
});
