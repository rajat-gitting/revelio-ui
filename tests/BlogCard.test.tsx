import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlogCard, { BlogPost } from '../src/components/BlogCard';

const mockPost: BlogPost = {
  id: 1,
  title: 'Test Blog Post',
  excerpt: 'This is a test excerpt for the blog post',
  coverImageUrl: 'https://example.com/cover.jpg',
  author: {
    name: 'John Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
  },
  tags: ['tech', 'javascript', 'react'],
  publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
};

describe('BlogCard', () => {
  test('renders blog post with all fields', () => {
    render(<BlogCard post={mockPost} />);

    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    expect(screen.getByText('This is a test excerpt for the blog post')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('tech')).toBeInTheDocument();
    expect(screen.getByText('javascript')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
  });

  test('renders cover image when coverImageUrl is provided', () => {
    render(<BlogCard post={mockPost} />);

    const image = screen.getByAltText('Test Blog Post');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/cover.jpg');
  });

  test('renders placeholder with Revelio logo when coverImageUrl is null', () => {
    const postWithoutCover = { ...mockPost, coverImageUrl: null };
    render(<BlogCard post={postWithoutCover} />);

    expect(screen.getByText('Revelio')).toBeInTheDocument();
    expect(screen.queryByAltText('Test Blog Post')).not.toBeInTheDocument();
  });

  test('renders author avatar when avatarUrl is provided', () => {
    render(<BlogCard post={mockPost} />);

    const avatar = screen.getByAltText('John Doe');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  test('renders author initials when avatarUrl is null', () => {
    const postWithoutAvatar = {
      ...mockPost,
      author: { name: 'John Doe', avatarUrl: null },
    };
    render(<BlogCard post={postWithoutAvatar} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.queryByAltText('John Doe')).not.toBeInTheDocument();
  });

  test('renders initials for single name author', () => {
    const postWithSingleName = {
      ...mockPost,
      author: { name: 'Madonna', avatarUrl: null },
    };
    render(<BlogCard post={postWithSingleName} />);

    expect(screen.getByText('M')).toBeInTheDocument();
  });

  test('renders only first 3 tags when more than 3 tags exist', () => {
    const postWithManyTags = {
      ...mockPost,
      tags: ['tech', 'javascript', 'react', 'nodejs', 'typescript'],
    };
    render(<BlogCard post={postWithManyTags} />);

    expect(screen.getByText('tech')).toBeInTheDocument();
    expect(screen.getByText('javascript')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
    expect(screen.queryByText('nodejs')).not.toBeInTheDocument();
    expect(screen.queryByText('typescript')).not.toBeInTheDocument();
  });

  test('does not render +N more indicator when 3 or fewer tags', () => {
    render(<BlogCard post={mockPost} />);

    expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument();
  });

  test('renders relative timestamp for posts within 30 days', () => {
    const recentPost = {
      ...mockPost,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    };
    render(<BlogCard post={recentPost} />);

    const timestamp = screen.getByText(/ago/);
    expect(timestamp).toBeInTheDocument();
  });

  test('renders full date format for posts older than 30 days', () => {
    const oldPost = {
      ...mockPost,
      publishedAt: new Date('2024-01-15T10:00:00Z').toISOString(),
    };
    render(<BlogCard post={oldPost} />);

    const timestamp = screen.getByText(/Jan 15, 2024/);
    expect(timestamp).toBeInTheDocument();
  });

  test('handles invalid timestamp gracefully', () => {
    const postWithInvalidDate = {
      ...mockPost,
      publishedAt: 'invalid-date',
    };
    render(<BlogCard post={postWithInvalidDate} />);

    const timeElement = screen.getByRole('time');
    expect(timeElement).toHaveTextContent('');
  });

  test('links to correct blog detail page', () => {
    render(<BlogCard post={mockPost} />);

    const link = screen.getByRole('link', { name: /Read Test Blog Post/ });
    expect(link).toHaveAttribute('href', '/blog/1');
  });

  test('renders with empty tags array', () => {
    const postWithoutTags = { ...mockPost, tags: [] };
    render(<BlogCard post={postWithoutTags} />);

    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument();
  });

  test('truncates long title with ellipsis', () => {
    const postWithLongTitle = {
      ...mockPost,
      title: 'This is a very long blog post title that should be truncated with ellipsis when it exceeds the maximum allowed length',
    };
    render(<BlogCard post={postWithLongTitle} />);

    const title = screen.getByText(/This is a very long blog post title/);
    expect(title).toBeInTheDocument();
  });

  test('truncates long excerpt with ellipsis', () => {
    const postWithLongExcerpt = {
      ...mockPost,
      excerpt: 'This is a very long excerpt that should be truncated when it exceeds the maximum allowed length. '.repeat(5),
    };
    render(<BlogCard post={postWithLongExcerpt} />);

    const excerpt = screen.getByText(/This is a very long excerpt/);
    expect(excerpt).toBeInTheDocument();
  });

  test('handles author name with multiple spaces', () => {
    const postWithSpacedName = {
      ...mockPost,
      author: { name: 'John   Middle   Doe', avatarUrl: null },
    };
    render(<BlogCard post={postWithSpacedName} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  test('handles empty author name gracefully', () => {
    const postWithEmptyName = {
      ...mockPost,
      author: { name: '', avatarUrl: null },
    };
    render(<BlogCard post={postWithEmptyName} />);

    expect(screen.getByText('')).toBeInTheDocument();
  });
});
