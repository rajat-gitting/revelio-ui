/**
 * Tests for BlogCard component — CR-32: Show estimated reading time on each blog post
 *
 * One focused test per acceptance criterion:
 *
 * AC-1 – Each blog post card shows an estimated reading time label (e.g. "4 min read").
 * AC-2 – The reading time is derived from the API-supplied value, not calculated from excerpt.
 * AC-3 – A post whose readingTimeMinutes is absent/null falls back gracefully (no crash).
 * AC-4 – The reading-time label is visually consistent (uses blog-card__reading-time class).
 * AC-5 – The listing renders correctly when the API does not supply a reading time value.
 */

import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import BlogCard, { getReadingTime } from './BlogCard';
import type { BlogPost } from './BlogCard';

// ---------------------------------------------------------------------------
// Helper: wrap BlogCard in a minimal TanStack Router context (it renders Links)
// Mirrors the pattern used in tests/BlogCardCSS.test.tsx
// ---------------------------------------------------------------------------
function renderBlogCard(post: BlogPost) {
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <BlogCard post={post} />,
  });
  const blogDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/blog/$id',
    component: () => null,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, blogDetailRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  return render(<RouterProvider router={router} />);
}

// ---------------------------------------------------------------------------
// Base test fixture
// ---------------------------------------------------------------------------
const makePost = (overrides?: Partial<BlogPost>): BlogPost => ({
  id: 1,
  title: 'Test Post',
  excerpt: 'A short excerpt.',
  coverImageUrl: null,
  author: { name: 'Alice', avatarUrl: null },
  tags: ['tech'],
  publishedAt: '2024-01-01T00:00:00Z',
  readingTimeMinutes: 4,
  ...overrides,
});

// ---------------------------------------------------------------------------
// AC-1: Each blog post card shows an estimated reading time label (e.g. "4 min read")
// ---------------------------------------------------------------------------
describe('AC-1: Reading time label is shown on the blog card', () => {
  it('renders "4 min read" when readingTimeMinutes is 4', async () => {
    renderBlogCard(makePost({ readingTimeMinutes: 4 }));
    await waitFor(() => expect(screen.getByText('4 min read')).toBeInTheDocument());
  });

  it('renders "1 min read" when readingTimeMinutes is 1', async () => {
    renderBlogCard(makePost({ readingTimeMinutes: 1 }));
    await waitFor(() => expect(screen.getByText('1 min read')).toBeInTheDocument());
  });
});

// ---------------------------------------------------------------------------
// AC-2: Reading time is derived from API-supplied value, not calculated from excerpt
// ---------------------------------------------------------------------------
describe('AC-2: Reading time uses the API-supplied readingTimeMinutes value', () => {
  it('uses the API-supplied value even when it differs from excerpt-derived estimate', async () => {
    // The excerpt is very short (client-side would compute 1 min), but API says 7
    renderBlogCard(makePost({ excerpt: 'Short.', readingTimeMinutes: 7 }));
    await waitFor(() => expect(screen.getByText('7 min read')).toBeInTheDocument());
    // Make sure the excerpt-derived value is NOT shown instead
    expect(screen.queryByText('1 min read')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// AC-3: A post with absent/null readingTimeMinutes falls back to excerpt-derived value
// ---------------------------------------------------------------------------
describe('AC-3: Fallback when readingTimeMinutes is null', () => {
  it('falls back to getReadingTime(excerpt) and renders without crashing when readingTimeMinutes is null', async () => {
    // excerpt has ~10 words → getReadingTime → 1 min read
    const excerpt = 'word '.repeat(10).trim();
    renderBlogCard(makePost({ excerpt, readingTimeMinutes: null }));
    const expected = getReadingTime(excerpt);
    await waitFor(() => expect(screen.getByText(`${expected} min read`)).toBeInTheDocument());
  });
});

// ---------------------------------------------------------------------------
// AC-4: The reading-time label is visually consistent with BlogCard styling
// ---------------------------------------------------------------------------
describe('AC-4: Reading-time label uses the blog-card__reading-time CSS class', () => {
  it('renders the reading-time inside the blog-card__reading-time element', async () => {
    const { container } = renderBlogCard(makePost({ readingTimeMinutes: 3 }));
    await waitFor(() => {
      const wrapper = container.querySelector('.blog-card__reading-time');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveTextContent('3 min read');
    });
  });
});

// ---------------------------------------------------------------------------
// AC-5: The listing renders correctly when the API does not supply a reading time value
// ---------------------------------------------------------------------------
describe('AC-5: Listing renders correctly when API does not supply readingTimeMinutes', () => {
  it('renders the card without crashing when readingTimeMinutes is null', async () => {
    renderBlogCard(makePost({ readingTimeMinutes: null }));
    // The post title should appear — card rendered correctly
    await waitFor(() => expect(screen.getByText('Test Post')).toBeInTheDocument());
    // A min read label should still be visible (fallback)
    expect(screen.getByText(/\d+ min read/)).toBeInTheDocument();
  });
});
