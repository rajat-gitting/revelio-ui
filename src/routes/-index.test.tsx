import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { getPosts, searchPosts } from '@/api/services/blogService';
import type { BlogPostDto, PagedResponse } from '@/types/api';
import { Route } from './index';
import styles from '@/routes/index.module.scss';

vi.mock('@/api/services/blogService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api/services/blogService')>()),
  getPosts: vi.fn(),
  searchPosts: vi.fn(),
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

// CR-37: Home page has search inline in header; no "Search blogs →" link
describe('HomePage CR-37 — search on Home page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse(mockBlogPosts));
  });

  it('does not render a "Search blogs" link', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('search-icon-button')).toBeInTheDocument();
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
// CR-41: Collapsible header search, no standalone search/filter rows
// ---------------------------------------------------------------------------
describe('CR-41 — collapsible header search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse(mockBlogPosts));
    vi.mocked(searchPosts).mockResolvedValue({ total: 1, page: 0, size: 12, results: mockBlogPosts });
  });

  // AC1: On initial page load, no standalone search input row is visible below the page header.
  it('does not render a standalone search input on initial load', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });

    // search-input only appears after icon click
    expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();
  });

  // AC2: On initial page load, no category or author filter row is visible.
  it('does not render category or author filter rows on initial load', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('category-filter')).not.toBeInTheDocument();
    expect(screen.queryByTestId('author-filter')).not.toBeInTheDocument();
    expect(screen.queryByTestId('filter-row')).not.toBeInTheDocument();
  });

  // AC3: The page header shows a search icon button alongside the Create Blog button.
  it('renders a search icon button in the page header', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('search-icon-button')).toBeInTheDocument();
    });

    // Both the icon button and Create Blog are in the header
    expect(screen.getByRole('button', { name: /create blog/i })).toBeInTheDocument();
  });

  // AC4: Clicking the search icon reveals a text input inside the header.
  it('clicking the search icon reveals a text input', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('search-icon-button')).toBeInTheDocument();
    });

    // Initially no input
    expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('search-icon-button'));

    await waitFor(() => {
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });
  });

  // AC5: Typing in the expanded header input filters the blog list.
  it('typing in the header input triggers search (calls searchPosts)', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('search-icon-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('search-icon-button'));

    await waitFor(() => {
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'hello' } });

    // After debounce (300ms) the URL param updates and triggers searchPosts
    await waitFor(() => {
      expect(vi.mocked(searchPosts)).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  // AC6: When the search input is cleared and collapsed, the full unfiltered blog list is shown.
  it('clearing the input collapses the search and shows unfiltered list', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('search-icon-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('search-icon-button'));

    await waitFor(() => {
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    // Type then clear
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'hello' } });
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: '' } });
    // Blur with empty input triggers collapse
    fireEvent.blur(screen.getByTestId('search-input'));

    // After collapse the input should be gone and getPosts should have been called
    await waitFor(() => {
      expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();
    }, { timeout: 500 });

    expect(vi.mocked(getPosts)).toHaveBeenCalled();
  });

  // AC7: The Create Blog button remains visible and clickable while the search input is expanded.
  it('Create Blog button is visible while search is expanded', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('search-icon-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('search-icon-button'));

    await waitFor(() => {
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /create blog/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create blog/i })).not.toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// validateSearch — edge-case coercions (category/author removed from schema)
// ---------------------------------------------------------------------------
describe('validateSearch coercions', () => {
  // Cast to a plain callable so TypeScript is happy
  interface HomeSearch { q: string; page: number }
  const validate = Route.options.validateSearch as unknown as (
    raw: Record<string, unknown>
  ) => HomeSearch;

  it('defaults q to empty string when absent', () => {
    const result = validate({ page: 1 });
    expect(result.q).toBe('');
  });

  it('preserves the q value', () => {
    const result = validate({ q: 'hello', page: 1 });
    expect(result.q).toBe('hello');
  });

  it('defaults page to 1 when absent', () => {
    const result = validate({});
    expect(result.page).toBe(1);
  });

  it('clamps page to minimum 1', () => {
    const result = validate({ page: 0 });
    expect(result.page).toBe(1);
  });
});
