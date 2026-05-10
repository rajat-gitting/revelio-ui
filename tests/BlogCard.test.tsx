import React from 'react';
import { render } from '@testing-library/react';
import { BlogCardSkeleton } from '../src/components/BlogCard';

describe('BlogCardSkeleton', () => {
  it('renders horizontal skeleton layout', () => {
    const { container } = render(<BlogCardSkeleton />);
    const skeleton = container.firstChild;
    expect(skeleton).toHaveClass('blog-card-skeleton');
    expect(skeleton).toHaveStyle('display: flex');
  });

  it('renders vertical layout on mobile', () => {
    window.innerWidth = 500;
    const { container } = render(<BlogCardSkeleton />);
    const skeleton = container.firstChild;
    expect(skeleton).toHaveStyle('flex-direction: column');
  });
});
