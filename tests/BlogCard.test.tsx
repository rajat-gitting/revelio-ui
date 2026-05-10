import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BlogListing from '../src/components/BlogListing';

const mockPosts = [
  {
    id: '1',
    title: 'Test Post',
    image: 'test.jpg',
    content: 'Test content'
  }
];

const mockLoadMorePosts = jest.fn(() =>
  Promise.resolve([
    {
      id: '2',
      title: 'New Post',
      image: 'new.jpg',
      content: 'New content'
    }
  ])
);

describe('BlogListing', () => {
  test('loads more posts when Load More button is clicked', async () => {
    render(
      <BlogListing
        initialPosts={mockPosts}
        loadMorePosts={mockLoadMorePosts}
      />
    );

    fireEvent.click(screen.getByText('Load More'));
    expect(mockLoadMorePosts).toHaveBeenCalled();
    expect(await screen.findByText('Loading...')).toBeInTheDocument();
    expect(await screen.findByText('New Post')).toBeInTheDocument();
  });

  test('disables Load More button while loading', async () => {
    render(
      <BlogListing
        initialPosts={mockPosts}
        loadMorePosts={mockLoadMorePosts}
      />
    );

    const button = screen.getByText('Load More');
    fireEvent.click(button);
    expect(button).toBeDisabled();
    await screen.findByText('New Post');
    expect(button).toBeEnabled();
  });
});
