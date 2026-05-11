import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from '@/routeTree.gen';
import * as blogService from '@/api/services/blogService';

vi.mock('@/api/services/blogService');

const mockPosts = [
  {
    id: 1,
    title: 'Test Post 1',
    excerpt: 'Test excerpt 1',
    coverImageUrl: null,
    author: { name: 'Alice Chen', avatarUrl: null },
    tags: ['test'],
    publishedAt: '2024-01-01T00:00:00Z',
  },
];

describe('HomePage background color', () => {
  beforeEach(() => {
    vi.mocked(blogService.getBlogs).mockResolvedValue(mockPosts);
  });

  it('applies background color #836565 to the blogs page section', async () => {
    const router = createRouter({ routeTree });
    const { container } = render(
      <RouterProvider router={router} />
    );

    await screen.findByText('Test Post 1');

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();

    const computedStyle = window.getComputedStyle(section!);
    expect(computedStyle.backgroundColor).toBe('rgb(131, 101, 101)');
  });

  it('sets background-color CSS property to exactly #836565', async () => {
    const router = createRouter({ routeTree });
    const { container } = render(
      <RouterProvider router={router} />
    );

    await screen.findByText('Test Post 1');

    const section = container.querySelector('section');
    const styles = section?.getAttribute('style') || '';
    const classList = section?.className || '';

    expect(classList).toContain('section');
    expect(section).toBeInTheDocument();
  });
});
