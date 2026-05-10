import React from 'react';
import { render } from '@testing-library/react';
import { BlogCard } from '../src/components/BlogCard';

describe('BlogCard', () => {
  const mockProps = {
    imageUrl: 'https://example.com/image.jpg',
    title: 'Test Title',
    excerpt: 'Test excerpt content'
  };

  it('renders horizontal layout correctly', () => {
    const { container } = render(<BlogCard {...mockProps} />);
    const card = container.querySelector('.blog-card');
    expect(card).toHaveStyle('flex-direction: row');
  });

  it('renders image in correct proportion', () => {
    const { container } = render(<BlogCard {...mockProps} />);
    const imageContainer = container.querySelector('.image-container');
    expect(imageContainer).toHaveStyle('flex: 0 0 35%');
  });

  it('renders content in correct proportion', () => {
    const { container } = render(<BlogCard {...mockProps} />);
    const contentContainer = container.querySelector('.content-container');
    expect(contentContainer).toHaveStyle('flex: 0 0 65%');
  });
});
