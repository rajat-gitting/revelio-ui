import React from 'react';
import { render, screen } from '@testing-library/react';
import BlogCard from '../src/components/BlogCard';

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
