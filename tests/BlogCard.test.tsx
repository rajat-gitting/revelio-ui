import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import BlogCard, { getReadingTime } from '../src/components/BlogCard';

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
  id: 1,
  title: 'Test Post',
  excerpt: 'This is a test post excerpt',
  coverImageUrl: 'https://example.com/image.jpg',
  author: {
    name: 'John Doe',
    avatarUrl: 'https://example.com/avatar.jpg'
  },
  tags: ['test', 'example'],
  publishedAt: '2023-01-01T00:00:00Z',
  body: '',
};

const mockPostWithoutImage = {
  ...mockPost,
  coverImageUrl: null
};

describe('BlogCard', () => {
  it('does not render image container when coverImageUrl is present', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);
    await waitFor(() => {
      const imageContainer = screen.queryByTestId('image-container');
      expect(imageContainer).not.toBeInTheDocument();
    });
  });

  it('does not render image container when coverImageUrl is null', async () => {
    renderWithRouter(<BlogCard post={mockPostWithoutImage} />);
    await waitFor(() => {
      const imageContainer = screen.queryByTestId('image-container');
      expect(imageContainer).not.toBeInTheDocument();
    });
  });

  it('renders all content elements without image container', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);
    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument();
    });
    expect(screen.getByText('This is a test post excerpt')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('example')).toBeInTheDocument();
  });
});

// Helper: build an excerpt with exactly n words
function buildExcerpt(wordCount: number): string {
  return Array.from({ length: wordCount }, (_, i) => `word${i + 1}`).join(' ');
}

describe('getReadingTime', () => {
  it('returns 1 for an excerpt of exactly 200 words', () => {
    const excerpt = buildExcerpt(200);
    expect(getReadingTime(excerpt)).toBe(1);
  });

  it('returns 2 for an excerpt of 201 words', () => {
    const excerpt = buildExcerpt(201);
    expect(getReadingTime(excerpt)).toBe(2);
  });

  it('returns 1 for an empty excerpt', () => {
    expect(getReadingTime('')).toBe(1);
  });
});

describe('BlogCard reading time display', () => {
  it('displays "1 min read" for a body of exactly 200 words', async () => {
    const post = { ...mockPost, body: buildExcerpt(200) };
    renderWithRouter(<BlogCard post={post} />);
    await waitFor(() => {
      expect(screen.getByText('1 min read')).toBeInTheDocument();
    });
  });

  it('displays "2 min read" for a body of 201 words', async () => {
    const post = { ...mockPost, body: buildExcerpt(201) };
    renderWithRouter(<BlogCard post={post} />);
    await waitFor(() => {
      expect(screen.getByText('2 min read')).toBeInTheDocument();
    });
  });

  it('displays "1 min read" for an empty body', async () => {
    const post = { ...mockPost, body: '' };
    renderWithRouter(<BlogCard post={post} />);
    await waitFor(() => {
      expect(screen.getByText('1 min read')).toBeInTheDocument();
    });
  });
});
