/**
 * Tests for CR-36 acceptance criteria:
 *
 * AC-1  – A 'Create Blog' button is visible on the blogs listing page.
 * AC-2  – Clicking 'Create Blog' navigates the user to a dedicated create-blog page.
 * AC-3  – The create-blog page contains fields for title, summary, content, tags, and author.
 * AC-4  – The page contains an 'Add Blog' button that submits the form.
 * AC-5  – Submitting the form without filling in required fields shows a validation error
 *          and does not submit.
 * AC-6  – On successful submission, the new blog is persisted to the backend's data/data.json
 *          (verified by asserting createBlog is called with the correct payload).
 * AC-7  – The newly created blog appears as a card in the blogs listing immediately after saving.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';

import { getBlogs, createBlog } from '@/api/services/blogService';
import type { BlogPostDto } from '@/types/api';
import { Route as IndexRoute } from '@/routes/index';
import { Route as CreateRoute } from '@/routes/blog/create';

// ---------------------------------------------------------------------------
// Mock blogService
// ---------------------------------------------------------------------------
vi.mock('@/api/services/blogService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api/services/blogService')>()),
  getBlogs: vi.fn(),
  createBlog: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------
const mockPost: BlogPostDto = {
  id: 1,
  title: 'Existing Post',
  excerpt: 'An existing post excerpt.',
  coverImageUrl: null,
  author: { name: 'Alice Chen', avatarUrl: null },
  tags: ['tag1'],
  publishedAt: '2026-06-18T10:00:00Z',
  body: 'Body text.',
};

const newPost: BlogPostDto = {
  id: 11,
  title: 'My New Blog',
  excerpt: 'A new summary.',
  coverImageUrl: null,
  author: { name: 'Bob Smith', avatarUrl: null },
  tags: ['react', 'typescript'],
  publishedAt: '2026-06-19T10:00:00Z',
  body: 'The full content of my new blog post.',
};

// ---------------------------------------------------------------------------
// Router helpers
// ---------------------------------------------------------------------------
const IndexPage = IndexRoute.options.component!;
const CreatePage = CreateRoute.options.component!;

function buildRouter(initialEntry: string) {
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: IndexPage,
  });
  const createRoute_ = createRoute({
    getParentRoute: () => rootRoute,
    path: '/blog/create',
    component: CreatePage,
  });
  const blogsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/blogs',
    component: () => <div>blogs page</div>,
  });
  const routeTree = rootRoute.addChildren([indexRoute, createRoute_, blogsRoute]);
  const history = createMemoryHistory({ initialEntries: [initialEntry] });
  const router = createRouter({ routeTree, history });
  return router;
}

async function renderAt(initialEntry: string) {
  const router = buildRouter(initialEntry);
  const result = render(<RouterProvider router={router} />);
  // Wait for router to stabilize
  await router.load();
  return { ...result, router };
}

// ---------------------------------------------------------------------------
// AC-1: 'Create Blog' button visible on the blogs listing (home) page
// ---------------------------------------------------------------------------
describe('AC-1: Create Blog button on listing page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getBlogs).mockResolvedValue([mockPost]);
  });

  it('shows a "Create Blog" button on the home page', async () => {
    await renderAt('/');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Create Blog' })).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// AC-2: Clicking 'Create Blog' navigates to /blog/create
// ---------------------------------------------------------------------------
describe('AC-2: Create Blog navigates to create-blog page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getBlogs).mockResolvedValue([mockPost]);
  });

  it('clicking Create Blog renders the create-blog page', async () => {
    await renderAt('/');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Create Blog' })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Create Blog' }));

    await waitFor(() => {
      expect(screen.getByTestId('create-blog-page')).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// AC-3: Create-blog page contains fields for title, summary, content, tags, author
// ---------------------------------------------------------------------------
describe('AC-3: Create-blog page has all required fields', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a field for title', async () => {
    await renderAt('/blog/create');
    await waitFor(() => {
      expect(screen.getByTestId('field-title')).toBeInTheDocument();
    });
  });

  it('renders a field for summary', async () => {
    await renderAt('/blog/create');
    await waitFor(() => {
      expect(screen.getByTestId('field-summary')).toBeInTheDocument();
    });
  });

  it('renders a field for content', async () => {
    await renderAt('/blog/create');
    await waitFor(() => {
      expect(screen.getByTestId('field-content')).toBeInTheDocument();
    });
  });

  it('renders a field for tags', async () => {
    await renderAt('/blog/create');
    await waitFor(() => {
      expect(screen.getByTestId('field-tags')).toBeInTheDocument();
    });
  });

  it('renders a field for author', async () => {
    await renderAt('/blog/create');
    await waitFor(() => {
      expect(screen.getByTestId('field-authorName')).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// AC-4: Page contains an 'Add Blog' submit button
// ---------------------------------------------------------------------------
describe('AC-4: Add Blog submit button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders an "Add Blog" button on the create page', async () => {
    await renderAt('/blog/create');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add Blog' })).toBeInTheDocument();
    });
  });

  it('Add Blog button is of type submit', async () => {
    await renderAt('/blog/create');
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: 'Add Blog' });
      expect(btn).toHaveAttribute('type', 'submit');
    });
  });
});

// ---------------------------------------------------------------------------
// AC-5: Submitting without required fields shows validation errors, no API call
// ---------------------------------------------------------------------------
describe('AC-5: Validation errors on empty submit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error for missing title when form submitted empty', async () => {
    await renderAt('/blog/create');
    await waitFor(() => {
      expect(screen.getByTestId('create-blog-form')).toBeInTheDocument();
    });
    fireEvent.submit(screen.getByTestId('create-blog-form'));
    await waitFor(() => {
      expect(screen.getByTestId('error-title')).toBeInTheDocument();
    });
  });

  it('shows error for missing summary when form submitted empty', async () => {
    await renderAt('/blog/create');
    await waitFor(() => {
      expect(screen.getByTestId('create-blog-form')).toBeInTheDocument();
    });
    fireEvent.submit(screen.getByTestId('create-blog-form'));
    await waitFor(() => {
      expect(screen.getByTestId('error-summary')).toBeInTheDocument();
    });
  });

  it('shows error for missing content when form submitted empty', async () => {
    await renderAt('/blog/create');
    await waitFor(() => {
      expect(screen.getByTestId('create-blog-form')).toBeInTheDocument();
    });
    fireEvent.submit(screen.getByTestId('create-blog-form'));
    await waitFor(() => {
      expect(screen.getByTestId('error-content')).toBeInTheDocument();
    });
  });

  it('shows error for missing author when form submitted empty', async () => {
    await renderAt('/blog/create');
    await waitFor(() => {
      expect(screen.getByTestId('create-blog-form')).toBeInTheDocument();
    });
    fireEvent.submit(screen.getByTestId('create-blog-form'));
    await waitFor(() => {
      expect(screen.getByTestId('error-authorName')).toBeInTheDocument();
    });
  });

  it('does not call createBlog when required fields are missing', async () => {
    await renderAt('/blog/create');
    await waitFor(() => {
      expect(screen.getByTestId('create-blog-form')).toBeInTheDocument();
    });
    fireEvent.submit(screen.getByTestId('create-blog-form'));
    await waitFor(() => {
      expect(screen.getByTestId('error-title')).toBeInTheDocument();
    });
    expect(vi.mocked(createBlog)).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// AC-6: On successful submission, createBlog is called with the correct payload
// (backend persists to data/data.json — we verify the API call is made)
// ---------------------------------------------------------------------------
describe('AC-6: createBlog called on successful submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createBlog).mockResolvedValue(newPost);
    vi.mocked(getBlogs).mockResolvedValue([mockPost]);
  });

  it('calls createBlog with the form data on valid submission', async () => {
    await renderAt('/blog/create');
    await waitFor(() => {
      expect(screen.getByTestId('field-title')).toBeInTheDocument();
    });

    await userEvent.type(screen.getByTestId('field-title'), 'My New Blog');
    await userEvent.type(screen.getByTestId('field-summary'), 'A new summary.');
    await userEvent.type(screen.getByTestId('field-content'), 'The full content of my new blog post.');
    await userEvent.type(screen.getByTestId('field-tags'), 'react, typescript');
    await userEvent.type(screen.getByTestId('field-authorName'), 'Bob Smith');

    fireEvent.submit(screen.getByTestId('create-blog-form'));

    await waitFor(() => {
      expect(vi.mocked(createBlog)).toHaveBeenCalled();
    });

    const call = vi.mocked(createBlog).mock.calls[0]?.[0];
    expect(call?.title).toBe('My New Blog');
    expect(call?.excerpt).toBe('A new summary.');
    expect(call?.body).toBe('The full content of my new blog post.');
    expect(call?.tags).toEqual(['react', 'typescript']);
    expect(call?.author.name).toBe('Bob Smith');
  });
});

// ---------------------------------------------------------------------------
// AC-7: After successful submission, home page shows the new card
// ---------------------------------------------------------------------------
describe('AC-7: New blog card appears on listing after save', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createBlog).mockResolvedValue(newPost);
    // After creation, getBlogs returns both the existing post and the new one
    vi.mocked(getBlogs).mockResolvedValue([mockPost, newPost]);
  });

  it('navigates to home and shows the new blog card title after saving', async () => {
    await renderAt('/blog/create');
    await waitFor(() => {
      expect(screen.getByTestId('field-title')).toBeInTheDocument();
    });

    await userEvent.type(screen.getByTestId('field-title'), 'My New Blog');
    await userEvent.type(screen.getByTestId('field-summary'), 'A new summary.');
    await userEvent.type(screen.getByTestId('field-content'), 'The full content of my new blog post.');
    await userEvent.type(screen.getByTestId('field-authorName'), 'Bob Smith');

    fireEvent.submit(screen.getByTestId('create-blog-form'));

    await waitFor(() => {
      expect(vi.mocked(createBlog)).toHaveBeenCalled();
    });

    // After navigation back to '/', the new blog's title should appear
    await waitFor(() => {
      expect(screen.getByText('My New Blog')).toBeInTheDocument();
    });
  });
});
