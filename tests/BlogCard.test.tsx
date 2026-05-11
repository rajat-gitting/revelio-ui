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
  it('renders horizontal layout with correct proportions on desktop', () => {
    render(<BlogCard post={mockPost} />);
    const card = screen.getByRole('link');
    const imageContainer = screen.getByTestId('image-container');
    const content = screen.getByTestId('content');
    
    expect(card).toHaveStyle('flex-direction: row');
    expect(imageContainer).toHaveStyle('flex: 0 0 35%');
    expect(content).toHaveStyle('flex: 1');
  });

  it('renders vertical layout on mobile viewport', () => {
    window.innerWidth = 500;
    render(<BlogCard post={mockPost} />);
    const card = screen.getByRole('link');
    
    expect(card).toHaveStyle('flex-direction: column');
    expect(card).toHaveStyle('gap: 16px');
  });

  it('renders image with correct aspect ratio on mobile', () => {
    window.innerWidth = 500;
    render(<BlogCard post={mockPost} />);
    const imageContainer = screen.getByTestId('image-container');
    
    expect(imageContainer).toHaveStyle('aspect-ratio: 16/9');
  });

  it('maintains all content elements in both layouts', () => {
    render(<BlogCard post={mockPost} />);
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('This is a test post excerpt')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('example')).toBeInTheDocument();
  });
});
