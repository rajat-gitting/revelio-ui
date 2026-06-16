import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import BlogCard, { getReadingTime } from './BlogCard';
import type { BlogPost } from './BlogCard';

// BlogCard renders a TanStack Router <Link> which needs a router context.
// We stub it out with a plain <a> so we can unit-test the component in isolation.
vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  Link: ({ children, className, 'aria-label': ariaLabel }: React.PropsWithChildren<{ className?: string; 'aria-label'?: string; to?: string; params?: unknown }>) => (
    <a className={className} aria-label={ariaLabel}>{children}</a>
  ),
}));

const basePost: BlogPost = {
  id: 1,
  title: 'Test Post',
  excerpt: 'A short excerpt.',
  coverImageUrl: null,
  author: { name: 'Alice', avatarUrl: null },
  tags: ['test'],
  publishedAt: '2020-01-01T00:00:00Z',
};

// CR-32 AC-1: Each blog card shows an estimated reading time label in '4 min read' format
describe('CR-32 AC-1: reading time label is displayed on BlogCard', () => {
  it('renders a reading time label in the format "N min read"', () => {
    const body = Array(800).fill('word').join(' '); // 800 words → 4 min
    render(<BlogCard post={{ ...basePost, body }} />);
    expect(screen.getByText('4 min read')).toBeInTheDocument();
  });
});

// CR-32 AC-2: Reading time reflects the full post body, not the excerpt
describe('CR-32 AC-2: reading time is derived from post body', () => {
  it('shows higher reading time when body is longer than the excerpt', () => {
    const body = Array(1200).fill('word').join(' '); // 1200 words → 6 min
    const excerpt = 'Short excerpt with very few words.';
    render(<BlogCard post={{ ...basePost, body, excerpt }} />);
    // 6 min is from body (1200/200=6), not from excerpt (~7 words → 1 min)
    expect(screen.getByText('6 min read')).toBeInTheDocument();
  });
});

// CR-32 AC-3: Empty or missing body shows '1 min read'
describe('CR-32 AC-3: empty or missing body shows "1 min read"', () => {
  it('shows "1 min read" when body is an empty string', () => {
    render(<BlogCard post={{ ...basePost, body: '' }} />);
    expect(screen.getByText('1 min read')).toBeInTheDocument();
  });

  it('shows "1 min read" when body is undefined (field absent)', () => {
    // body?: string — omitting it simulates a post without body
    const postWithoutBody: BlogPost = { ...basePost };
    delete (postWithoutBody as Partial<BlogPost>).body;
    render(<BlogCard post={postWithoutBody} />);
    expect(screen.getByText('1 min read')).toBeInTheDocument();
  });

  it('getReadingTime returns 1 for empty string', () => {
    expect(getReadingTime('')).toBe(1);
  });

  it('getReadingTime returns 1 for whitespace-only string', () => {
    expect(getReadingTime('   ')).toBe(1);
  });
});

// CR-32 AC-4: Reading time label uses the blog-card__reading-time CSS class
describe('CR-32 AC-4: reading time label is styled with blog-card__reading-time', () => {
  it('wraps the reading time in an element with class blog-card__reading-time', () => {
    render(<BlogCard post={{ ...basePost, body: 'some content' }} />);
    // The <span> is inside a <div class="blog-card__reading-time">
    const container = document.querySelector('.blog-card__reading-time');
    expect(container).toBeInTheDocument();
    expect(container).toHaveTextContent(/min read/);
  });
});

// CR-32 AC-5: Listing renders all cards without error even when body is absent or empty
describe('CR-32 AC-5: listing renders without error when body is absent or empty', () => {
  it('renders the card without crashing when body is undefined', () => {
    const post: BlogPost = { ...basePost };
    delete (post as Partial<BlogPost>).body;
    expect(() => render(<BlogCard post={post} />)).not.toThrow();
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });

  it('renders the card without crashing when body is empty string', () => {
    expect(() => render(<BlogCard post={{ ...basePost, body: '' }} />)).not.toThrow();
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });
});
