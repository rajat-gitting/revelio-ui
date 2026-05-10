import React from 'react';
import { render } from '@testing-library/react';
import { BlogListing } from '../components/BlogListing';

describe('BlogListing', () => {
  it('displays empty state when no posts', () => {
    const { getByText } = render(
      <BlogListing posts={[]} error={false} loading={false} />
    );
    expect(getByText('No blog posts available.')).toBeInTheDocument();
  });

  it('displays error state when error occurs', () => {
    const { getByText } = render(
      <BlogListing posts={[]} error={true} loading={false} />
    );
    expect(getByText('Failed to load blog posts. Please try again later.')).toBeInTheDocument();
  });
});
