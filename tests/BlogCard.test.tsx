import React from 'react';
import { render } from '@testing-library/react';
import BlogListing from '../src/components/BlogListing';

describe('BlogListing', () => {
  const mockPosts = [
    {
      id: '1',
      title: 'Test Post 1',
      excerpt: 'This is a test post',
      imageUrl: 'https://example.com/image1.jpg'
    },
    {
      id: '2',
      title: 'Test Post 2',
      excerpt: 'This is another test post',
      imageUrl: 'https://example.com/image2.jpg'
    }
  ];

  it('renders posts in a single column', () => {
    const { container } = render(<BlogListing posts={mockPosts} />);
    const listing = container.querySelector('.blog-listing');
    expect(listing).toHaveStyle('flex-direction: column');
  });

  it('renders posts with consistent height', () => {
    const { container } = render(<BlogListing posts={mockPosts} />);
    const cards = container.querySelectorAll('.blog-listing > *');
    cards.forEach((card) => {
      expect(card).toHaveStyle('min-height: 200px');
    });
  });
});
