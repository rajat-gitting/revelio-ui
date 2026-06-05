import React from 'react';
import { render, screen } from '@testing-library/react';
import BlogCard, { getReadingTime } from '../src/components/BlogCard';

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
  publishedAt: '2023-01-01T00:00:00Z'
};

const mockPostWithoutImage = {
  ...mockPost,
  coverImageUrl: null
};

describe('BlogCard', () => {
  it('does not render image container when coverImageUrl is present', () => {
    render(<BlogCard post={mockPost} />);
    const imageContainer = screen.queryByTestId('image-container');
    expect(imageContainer).not.toBeInTheDocument();
  });

  it('does not render image container when coverImageUrl is null', () => {
    render(<BlogCard post={mockPostWithoutImage} />);
    const imageContainer = screen.queryByTestId('image-container');
    expect(imageContainer).not.toBeInTheDocument();
  });

  it('renders all content elements without image container', () => {
    render(<BlogCard post={mockPost} />);
    expect(screen.getByText('Test Post')).toBeInTheDocument();
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
  it('displays "1 min read" for an excerpt of exactly 200 words', () => {
    const post = { ...mockPost, excerpt: buildExcerpt(200) };
    render(<BlogCard post={post} />);
    expect(screen.getByText('1 min read')).toBeInTheDocument();
  });

  it('displays "2 min read" for an excerpt of 201 words', () => {
    const post = { ...mockPost, excerpt: buildExcerpt(201) };
    render(<BlogCard post={post} />);
    expect(screen.getByText('2 min read')).toBeInTheDocument();
  });

  it('displays "1 min read" for an empty excerpt', () => {
    const post = { ...mockPost, excerpt: '' };
    render(<BlogCard post={post} />);
    expect(screen.getByText('1 min read')).toBeInTheDocument();
  });
});
