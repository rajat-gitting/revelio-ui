import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';

import BlogCard, { getReadingTime } from './BlogCard';

function renderWithRouter(ui: React.ReactElement) {
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => ui,
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

const mockPost = {
  id: 42,
  title: 'Design Review',
  excerpt: 'An in-depth look at the new design system.',
  coverImageUrl: null,
  author: { name: 'Jane Smith', avatarUrl: null },
  tags: ['design', 'ux', 'css', 'extra1', 'extra2'],
  publishedAt: '2024-01-15T10:00:00Z',
  body: '',
};

/** Build an excerpt with exactly `wordCount` words. */
function buildExcerpt(wordCount: number): string {
  return Array.from({ length: wordCount }, (_, i) => `word${i + 1}`).join(' ');
}

describe('getReadingTime', () => {
  it('returns 1 for an excerpt of exactly 200 words (boundary)', () => {
    expect(getReadingTime(buildExcerpt(200))).toBe(1);
  });

  it('returns 2 for an excerpt of 201 words', () => {
    expect(getReadingTime(buildExcerpt(201))).toBe(2);
  });

  it('returns 1 for an empty excerpt', () => {
    expect(getReadingTime('')).toBe(1);
  });
});

describe('BlogCard', () => {
  it('renders the title, excerpt, and author', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);
    await waitFor(() => {
      expect(screen.getByText('Design Review')).toBeInTheDocument();
    });
    expect(screen.getByText('An in-depth look at the new design system.')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('links the whole card to the post detail route', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /read design review/i });
      expect(link).toHaveAttribute('href', '/blog/42');
    });
  });

  it('shows only the first three tags plus a "+N more" pill', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);
    await waitFor(() => {
      expect(screen.getByText('design')).toBeInTheDocument();
    });
    expect(screen.getByText('ux')).toBeInTheDocument();
    expect(screen.getByText('css')).toBeInTheDocument();
    expect(screen.queryByText('extra1')).not.toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('omits the "+N more" pill when there are three or fewer tags', async () => {
    renderWithRouter(<BlogCard post={{ ...mockPost, tags: ['design', 'ux'] }} />);
    await waitFor(() => {
      expect(screen.getByText('design')).toBeInTheDocument();
    });
    expect(screen.queryByText(/more$/)).not.toBeInTheDocument();
  });

  it('renders the initials fallback (no image) when the author has no avatar', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);
    await waitFor(() => {
      expect(screen.getByText('JS')).toBeInTheDocument();
    });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders an avatar image when the author has an avatar URL', async () => {
    const post = {
      ...mockPost,
      author: { name: 'Jane Smith', avatarUrl: 'https://example.com/jane.png' },
    };
    renderWithRouter(<BlogCard post={post} />);
    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Jane Smith' })).toHaveAttribute(
        'src',
        'https://example.com/jane.png'
      );
    });
  });

  it('displays the reading time derived from the excerpt length', async () => {
    renderWithRouter(<BlogCard post={{ ...mockPost, excerpt: buildExcerpt(201) }} />);
    await waitFor(() => {
      expect(screen.getByText('2 min read')).toBeInTheDocument();
    });
  });
});
