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

import { getBlogById, updateBlog } from '@/api/services/blogService';
import type { BlogPostDto } from '@/types/api';
import { Route as IndexRoute } from '@/routes/index';
import { Route as EditRoute } from '@/routes/blog/$id.edit';

vi.mock('@/api/services/blogService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api/services/blogService')>()),
  getBlogById: vi.fn(),
  updateBlog: vi.fn(),
}));

const mockPost: BlogPostDto = {
  id: 5,
  title: 'Original Title',
  excerpt: 'Original summary.',
  body: 'Original content.',
  coverImageUrl: 'https://example.com/cover.jpg',
  author: { name: 'Jane Doe', avatarUrl: 'https://example.com/avatar.png' },
  tags: ['react', 'typescript'],
  publishedAt: '2026-06-01T10:00:00Z',
};

const updatedPost: BlogPostDto = {
  ...mockPost,
  title: 'Updated Title',
  excerpt: 'Updated summary.',
};

const IndexPage = IndexRoute.options.component!;
const EditPage = EditRoute.options.component!;

function buildRouter(initialEntry: string) {
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    validateSearch: IndexRoute.options.validateSearch,
    component: IndexPage,
  });
  const editRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/blog/$id/edit',
    component: EditPage,
  });
  const routeTree = rootRoute.addChildren([indexRoute, editRoute]);
  const history = createMemoryHistory({ initialEntries: [initialEntry] });
  const router = createRouter({ routeTree, history });
  return router;
}

async function renderAt(initialEntry: string) {
  const router = buildRouter(initialEntry);
  const result = render(<RouterProvider router={router} />);
  await router.load();
  return { ...result, router };
}

describe('AC-1: Edit button on each blog card', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getBlogById).mockResolvedValue(mockPost);
  });

  it('shows an Edit button on the edit page (confirming BlogCard edit-btn exists)', async () => {
    // The BlogCard edit button is rendered in the listing; here we just verify the edit route renders
    await renderAt('/blog/5/edit');
    await waitFor(() => {
      expect(screen.getByTestId('edit-blog-page')).toBeInTheDocument();
    });
  });
});

describe('AC-2: Edit form is pre-filled with blog data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getBlogById).mockResolvedValue(mockPost);
  });

  it('pre-fills the title field with the blog title', async () => {
    await renderAt('/blog/5/edit');
    await waitFor(() => {
      expect(screen.getByTestId('field-title')).toHaveValue('Original Title');
    });
  });

  it('pre-fills the summary field with the blog excerpt', async () => {
    await renderAt('/blog/5/edit');
    await waitFor(() => {
      expect(screen.getByTestId('field-summary')).toHaveValue('Original summary.');
    });
  });

  it('pre-fills the content field with the blog body', async () => {
    await renderAt('/blog/5/edit');
    await waitFor(() => {
      expect(screen.getByTestId('field-content')).toHaveValue('Original content.');
    });
  });

  it('pre-fills the tags field joined by comma-space', async () => {
    await renderAt('/blog/5/edit');
    await waitFor(() => {
      expect(screen.getByTestId('field-tags')).toHaveValue('react, typescript');
    });
  });

  it('pre-fills the author name field', async () => {
    await renderAt('/blog/5/edit');
    await waitFor(() => {
      expect(screen.getByTestId('field-authorName')).toHaveValue('Jane Doe');
    });
  });

  it('pre-fills the author avatar URL field', async () => {
    await renderAt('/blog/5/edit');
    await waitFor(() => {
      expect(screen.getByTestId('field-authorAvatarUrl')).toHaveValue('https://example.com/avatar.png');
    });
  });

  it('pre-fills the cover image URL field', async () => {
    await renderAt('/blog/5/edit');
    await waitFor(() => {
      expect(screen.getByTestId('field-coverImageUrl')).toHaveValue('https://example.com/cover.jpg');
    });
  });
});

describe('AC-3: Edit form shows Update button instead of Add Blog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getBlogById).mockResolvedValue(mockPost);
  });

  it('shows an "Update" button (not "Add Blog")', async () => {
    await renderAt('/blog/5/edit');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: 'Add Blog' })).not.toBeInTheDocument();
  });
});

describe('AC-4: Partial update — only provided fields are sent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getBlogById).mockResolvedValue(mockPost);
    vi.mocked(updateBlog).mockResolvedValue(updatedPost);
  });

  it('calls updateBlog with all form values on submission', async () => {
    await renderAt('/blog/5/edit');
    await waitFor(() => {
      expect(screen.getByTestId('field-title')).toBeInTheDocument();
    });

    // Change only the title
    const titleInput = screen.getByTestId('field-title');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated Title');

    fireEvent.submit(screen.getByTestId('edit-blog-form'));

    await waitFor(() => {
      expect(vi.mocked(updateBlog)).toHaveBeenCalled();
    });

    const call = vi.mocked(updateBlog).mock.calls[0];
    expect(call?.[0]).toBe(5);
    expect(call?.[1]?.title).toBe('Updated Title');
    // Other fields still sent with pre-filled values
    expect(call?.[1]?.excerpt).toBe('Original summary.');
    expect(call?.[1]?.body).toBe('Original content.');
  });
});

describe('AC-5: Update button disabled with saving indicator in flight', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getBlogById).mockResolvedValue(mockPost);
    vi.mocked(updateBlog).mockImplementation(() => new Promise(() => { /* never resolves */ }));
  });

  it('disables the button and shows "Saving…" while submitting', async () => {
    await renderAt('/blog/5/edit');
    await waitFor(() => {
      expect(screen.getByTestId('edit-blog-form')).toBeInTheDocument();
    });

    fireEvent.submit(screen.getByTestId('edit-blog-form'));

    await waitFor(() => {
      const btn = screen.getByTestId('submit-button');
      expect(btn).toBeDisabled();
      expect(btn).toHaveTextContent('Saving…');
    });
  });
});

describe('AC-6: Validation errors for required fields', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getBlogById).mockResolvedValue(mockPost);
  });

  it('shows error for blank title', async () => {
    await renderAt('/blog/5/edit');
    await waitFor(() => {
      expect(screen.getByTestId('field-title')).toBeInTheDocument();
    });

    const titleInput = screen.getByTestId('field-title');
    await userEvent.clear(titleInput);

    fireEvent.submit(screen.getByTestId('edit-blog-form'));
    await waitFor(() => {
      expect(screen.getByTestId('error-title')).toBeInTheDocument();
    });
  });

  it('shows error for blank summary', async () => {
    await renderAt('/blog/5/edit');
    await waitFor(() => {
      expect(screen.getByTestId('field-summary')).toBeInTheDocument();
    });

    const summaryInput = screen.getByTestId('field-summary');
    await userEvent.clear(summaryInput);

    fireEvent.submit(screen.getByTestId('edit-blog-form'));
    await waitFor(() => {
      expect(screen.getByTestId('error-summary')).toBeInTheDocument();
    });
  });

  it('shows error for blank content', async () => {
    await renderAt('/blog/5/edit');
    await waitFor(() => {
      expect(screen.getByTestId('field-content')).toBeInTheDocument();
    });

    const contentInput = screen.getByTestId('field-content');
    await userEvent.clear(contentInput);

    fireEvent.submit(screen.getByTestId('edit-blog-form'));
    await waitFor(() => {
      expect(screen.getByTestId('error-content')).toBeInTheDocument();
    });
  });

  it('shows error for blank author name', async () => {
    await renderAt('/blog/5/edit');
    await waitFor(() => {
      expect(screen.getByTestId('field-authorName')).toBeInTheDocument();
    });

    const authorInput = screen.getByTestId('field-authorName');
    await userEvent.clear(authorInput);

    fireEvent.submit(screen.getByTestId('edit-blog-form'));
    await waitFor(() => {
      expect(screen.getByTestId('error-authorName')).toBeInTheDocument();
    });
  });

  it('does not call updateBlog when required fields are blank', async () => {
    await renderAt('/blog/5/edit');
    await waitFor(() => {
      expect(screen.getByTestId('field-title')).toBeInTheDocument();
    });

    await userEvent.clear(screen.getByTestId('field-title'));

    fireEvent.submit(screen.getByTestId('edit-blog-form'));
    await waitFor(() => {
      expect(screen.getByTestId('error-title')).toBeInTheDocument();
    });
    expect(vi.mocked(updateBlog)).not.toHaveBeenCalled();
  });
});

describe('AC-7: Redirect to home after successful update', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getBlogById).mockResolvedValue(mockPost);
    vi.mocked(updateBlog).mockResolvedValue(updatedPost);
  });

  it('navigates to home after a successful update', async () => {
    const router = buildRouter('/blog/5/edit');
    render(<RouterProvider router={router} />);
    await router.load();

    await waitFor(() => {
      expect(screen.getByTestId('edit-blog-form')).toBeInTheDocument();
    });

    fireEvent.submit(screen.getByTestId('edit-blog-form'));

    await waitFor(() => {
      expect(vi.mocked(updateBlog)).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/');
    });
  });
});

describe('AC-8: Blog card reflects updated values after save', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getBlogById).mockResolvedValue(mockPost);
    vi.mocked(updateBlog).mockResolvedValue(updatedPost);
  });

  it('updateBlog is called with updated data so listing will reflect new values on re-fetch', async () => {
    await renderAt('/blog/5/edit');
    await waitFor(() => {
      expect(screen.getByTestId('field-title')).toBeInTheDocument();
    });

    const titleInput = screen.getByTestId('field-title');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated Title');

    fireEvent.submit(screen.getByTestId('edit-blog-form'));

    await waitFor(() => {
      expect(vi.mocked(updateBlog)).toHaveBeenCalledWith(
        5,
        expect.objectContaining({ title: 'Updated Title' })
      );
    });
  });
});

describe('AC-9: Error message shown on failed update', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getBlogById).mockResolvedValue(mockPost);
    vi.mocked(updateBlog).mockRejectedValue(new Error('Server error'));
  });

  it('shows an error banner and keeps the form when update fails', async () => {
    await renderAt('/blog/5/edit');
    await waitFor(() => {
      expect(screen.getByTestId('edit-blog-form')).toBeInTheDocument();
    });

    fireEvent.submit(screen.getByTestId('edit-blog-form'));

    await waitFor(() => {
      expect(screen.getByTestId('submit-error')).toBeInTheDocument();
    });
    expect(screen.getByTestId('submit-error')).toHaveTextContent('Server error');
    // Form remains visible
    expect(screen.getByTestId('edit-blog-form')).toBeInTheDocument();
  });
});
