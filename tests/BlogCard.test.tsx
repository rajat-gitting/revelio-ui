import React from 'react';
import { render, screen } from '@testing-library/react';
import { BlogCard } from '../components/BlogCard';

const mockProps = {
  coverImage: 'https://example.com/image.jpg',
  title: 'Test Blog Post',
  excerpt: 'This is a test blog post excerpt'
};

describe('BlogCard', () => {
  it('renders horizontal layout with image on left and content on right', () => {
    render(<BlogCard {...mockProps} />);
    const card = screen.getByRole('article');
    expect(card).toHaveStyle('display: flex');
    expect(card.firstChild).toHaveClass('card-image-container');
    expect(card.lastChild).toHaveClass('card-content');
  });

  it('renders vertical layout on mobile', () => {
    window.innerWidth = 767;
    render(<BlogCard {...mockProps} />);
    const card = screen.getByRole('article');
    expect(card).toHaveStyle('flex-direction: column');
  });
});
