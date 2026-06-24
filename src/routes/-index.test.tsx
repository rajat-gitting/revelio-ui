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

    // Open search panel first so we can confirm the element exists but no "Search blogs" link
    await waitFor(() => {
      expect(screen.getByTestId('search-toggle')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('search-toggle'));

    await waitFor(() => {
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
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

    // Wait for page to load, then open search
    await waitFor(() => {
      expect(screen.getByTestId('search-toggle')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('search-toggle'));

    await waitFor(() => {
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });
  });

  it('renders a Category / Tag filter after opening filters', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('filters-toggle')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('filters-toggle'));

    await waitFor(() => {
      expect(screen.getByTestId('category-filter')).toBeInTheDocument();
    });
  });

  it('renders an Author filter after opening filters', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('filters-toggle')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('filters-toggle'));

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

// CR-39: Search and filter hidden by default, revealed by header icon buttons
describe('HomePage CR-39 — search/filter hidden by default', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse(mockBlogPosts));
    vi.mocked(getBlogFilters).mockResolvedValue({ authors: [{ name: 'Alice', avatarUrl: null }], categories: ['tech'] });
  });

  // AC1: search input and filter dropdowns are hidden on first load
  it('hides search input and filter dropdowns on initial render', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('blogs-page')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('category-filter')).not.toBeInTheDocument();
    expect(screen.queryByTestId('author-filter')).not.toBeInTheDocument();
  });

  // AC2: header contains a search icon button
  it('renders a search icon button in the page header', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('search-toggle')).toBeInTheDocument();
    });

    const searchBtn = screen.getByTestId('search-toggle');
    expect(searchBtn).toHaveAttribute('aria-label', 'Toggle search');
  });

  // AC3: clicking search icon reveals search input
  it('reveals search input when search icon button is clicked', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('search-toggle')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('search-toggle'));

    await waitFor(() => {
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });
  });

  // AC5: header contains a second control for filters
  it('renders a filters toggle button in the page header', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('filters-toggle')).toBeInTheDocument();
    });

    const filtersBtn = screen.getByTestId('filters-toggle');
    expect(filtersBtn).toHaveAttribute('aria-label', 'Toggle filters');
  });

  // AC6: clicking filter control reveals category and author filters
  it('reveals category and author filter dropdowns when filter button is clicked', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('filters-toggle')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('category-filter')).not.toBeInTheDocument();
    expect(screen.queryByTestId('author-filter')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('filters-toggle'));

    await waitFor(() => {
      expect(screen.getByTestId('category-filter')).toBeInTheDocument();
      expect(screen.getByTestId('author-filter')).toBeInTheDocument();
    });
  });

  // AC8: clearing/closing search collapses search panel
  it('collapses search input when search is cleared (inputValue empty)', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('search-toggle')).toBeInTheDocument();
    });

    // Open search
    fireEvent.click(screen.getByTestId('search-toggle'));
    await waitFor(() => {
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    // Type something then clear
    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'hello' } });
    fireEvent.change(input, { target: { value: '' } });

    // Panel should collapse
    await waitFor(() => {
      expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();
    });
  });

  // AC10: active filter chips appear regardless of panel state
  it('shows active filter chips even when filter panel is collapsed', async () => {
    // Render with active search param in URL
    const history = createMemoryHistory({ initialEntries: ['/?q=react'] });
    const router = createRouter({ routeTree, history });
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId('active-filters')).toBeInTheDocument();
    });

    // Filter panel (filtersOpen) is not open
    expect(screen.queryByTestId('category-filter')).not.toBeInTheDocument();
    // But chips are still visible
    expect(screen.getByTestId('chip-query')).toBeInTheDocument();
  });

  // AC11: Create Blog button navigates to creation page (navigation tested via smoke; unit check it's present)
  it('renders the Create Blog button in the header', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create blog/i })).toBeInTheDocument();
    });
  });

  // AC9: removing all active filters collapses filter controls
  it('collapses filter panel when all filter chips are removed via URL params clearing', async () => {
    // Start with author filter active
    const history = createMemoryHistory({ initialEntries: ['/?author=Alice'] });
    const router = createRouter({ routeTree, history });
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId('active-filters')).toBeInTheDocument();
    });

    // Open filter panel manually
    fireEvent.click(screen.getByTestId('filters-toggle'));
    await waitFor(() => {
      expect(screen.getByTestId('author-filter')).toBeInTheDocument();
    });

    // Remove the author chip
    const removeBtn = screen.getByRole('button', { name: /remove author filter "Alice"/i });
    fireEvent.click(removeBtn);

    // Filter panel should collapse since no active filters remain
    await waitFor(() => {
      expect(screen.queryByTestId('author-filter')).not.toBeInTheDocument();
    });
  });
});
