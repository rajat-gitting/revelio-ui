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

describe('HomePage hero CTA — CR-34', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getBlogs).mockResolvedValue(mockBlogPosts);
  });

  it('hero CTA is labelled "Search blogs →" and links to /blogs', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });

    const cta = screen.getByRole('link', { name: 'Search blogs →' });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/blogs');
  });
});
