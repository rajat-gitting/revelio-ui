import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { getBlogs } from '@/api/services/blogService';
import type { BlogPostDto } from '@/types/api';
import { Route } from './index';
import styles from '@/routes/index.module.scss';

vi.mock('@/api/services/blogService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api/services/blogService')>()),
  getBlogs: vi.fn(),
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

const HomePage = Route.options.component;

const rootRoute = createRootRoute();
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
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
    vi.mocked(getBlogs).mockResolvedValue(mockBlogPosts);
  });

  it('applies the section CSS module class when posts are loaded', async () => {
    const { container } = renderHomePage();

    await waitFor(() => {
      expect(container.querySelector('#blog-section')).toBeInTheDocument();
    });

    // The blog-card section carries the .section module class and the id="blog-section"
    // The hero section (also a <section>) is rendered first but does not have this class.
    const section = container.querySelector('#blog-section')!;
    expect(section).toHaveClass(styles.section!);
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

// CR-35: hero removed, simple header with CTA
describe('HomePage simple header — CR-35', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getBlogs).mockResolvedValue(mockBlogPosts);
  });

  it('does not render the Welcome to Our Blog hero banner', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Search blogs →' })).toBeInTheDocument();
    });

    expect(screen.queryByText('Welcome to Our Blog')).not.toBeInTheDocument();
    expect(screen.queryByText('Discover articles, insights, and stories')).not.toBeInTheDocument();
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

  it('CTA is labelled "Search blogs →" and links to /blogs', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Search blogs →' })).toBeInTheDocument();
    });

    const cta = screen.getByRole('link', { name: 'Search blogs →' });
    expect(cta).toBeInTheDocument();
    // TanStack Router may append search params; the href must start with /blogs
    const href = cta.getAttribute('href') ?? '';
    expect(href.startsWith('/blogs')).toBe(true);
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
