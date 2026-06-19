import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

  it('renders the search input above the blog card grid', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });
  });

  it('renders a Category / Tag filter', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('category-filter')).toBeInTheDocument();
    });
  });

  it('renders an Author filter', async () => {
    renderHomePage();

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
