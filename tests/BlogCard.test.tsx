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

describe('BlogCard', () => {
  it('renders horizontal layout on desktop', () => {
    render(<BlogCard post={mockPost} />);
    const card = screen.getByRole('link');
    expect(card).toHaveStyle('flex-direction: row');
  });

  it('renders image in correct proportion', () => {
    render(<BlogCard post={mockPost} />);
    const imageContainer = screen.getByTestId('image-container');
    expect(imageContainer).toHaveStyle('flex: 0 0 35%');
  });

  it('renders content in correct proportion', () => {
    render(<BlogCard post={mockPost} />);
    const content = screen.getByTestId('content');
    expect(content).toHaveStyle('flex: 1');
  });

  it('renders vertical layout on mobile', () => {
    window.innerWidth = 500;
    render(<BlogCard post={mockPost} />);
    const card = screen.getByRole('link');
    expect(card).toHaveStyle('flex-direction: column');
  });

  it('renders all content elements', () => {
    render(<BlogCard post={mockPost} />);
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('This is a test post excerpt')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('example')).toBeInTheDocument();
  });
});
