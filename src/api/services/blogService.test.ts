import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiGet, apiPost } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import {
  createBlog,
  getBlogById,
  getBlogFilters,
  getBlogs,
  getPosts,
  searchPosts,
} from '@/api/services/blogService';
import type { BlogFiltersDto, BlogPostDto, BlogSearchResponse, PagedResponse } from '@/types/api';

vi.mock('@/api/client', () => ({
  ApiRequestError: class ApiRequestError extends Error {
    constructor(
      message: string,
      public status: number | null,
      public code: string | null
    ) {
      super(message);
    }
  },
  apiClient: {},
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

const mockPost: BlogPostDto = {
  id: 1,
  title: 'Test Post',
  excerpt: 'Test excerpt',
  coverImageUrl: null,
  author: { name: 'Alice', avatarUrl: null },
  tags: ['react'],
  publishedAt: '2024-01-01T00:00:00Z',
  body: 'Full body text.',
};

const mockPaged: PagedResponse<BlogPostDto> = {
  content: [mockPost],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 10,
};

describe('getBlogs', () => {
  beforeEach(() => vi.mocked(apiGet).mockReset());

  it('calls BLOGS endpoint with page and size', async () => {
    vi.mocked(apiGet).mockResolvedValue({ data: mockPaged });
    await getBlogs(2, 5);
    expect(apiGet).toHaveBeenCalledWith(ENDPOINTS.BLOGS, { params: { page: 2, size: 5 } });
  });

  it('uses defaults of page=0 and size=10', async () => {
    vi.mocked(apiGet).mockResolvedValue({ data: mockPaged });
    await getBlogs();
    expect(apiGet).toHaveBeenCalledWith(ENDPOINTS.BLOGS, { params: { page: 0, size: 10 } });
  });

  it('returns the content array from the paged response', async () => {
    vi.mocked(apiGet).mockResolvedValue({ data: mockPaged });
    const result = await getBlogs();
    expect(result).toEqual([mockPost]);
  });
});

describe('searchPosts', () => {
  beforeEach(() => vi.mocked(apiGet).mockReset());

  it('calls BLOGS_SEARCH with params and returns search response data', async () => {
    const searchResponse: BlogSearchResponse = {
      total: 1,
      page: 0,
      size: 10,
      results: [mockPost],
    };
    vi.mocked(apiGet).mockResolvedValue({ data: searchResponse });
    const params = { q: 'react', page: 0, size: 10 };

    const result = await searchPosts(params);

    expect(apiGet).toHaveBeenCalledWith(ENDPOINTS.BLOGS_SEARCH, { params });
    expect(result).toEqual(searchResponse);
  });

  it('passes empty params correctly', async () => {
    const empty: BlogSearchResponse = { total: 0, page: 0, size: 10, results: [] };
    vi.mocked(apiGet).mockResolvedValue({ data: empty });
    await searchPosts({});
    expect(apiGet).toHaveBeenCalledWith(ENDPOINTS.BLOGS_SEARCH, { params: {} });
  });
});

describe('getBlogFilters', () => {
  beforeEach(() => vi.mocked(apiGet).mockReset());

  it('calls BLOGS_FILTERS endpoint', async () => {
    const filters: BlogFiltersDto = { authors: [], categories: ['Tech', 'React'] };
    vi.mocked(apiGet).mockResolvedValue({ data: filters });

    const result = await getBlogFilters();

    expect(apiGet).toHaveBeenCalledWith(ENDPOINTS.BLOGS_FILTERS);
    expect(result).toEqual(filters);
  });
});

describe('getPosts', () => {
  beforeEach(() => vi.mocked(apiGet).mockReset());

  it('calls BLOGS endpoint and returns the full paged response', async () => {
    vi.mocked(apiGet).mockResolvedValue({ data: mockPaged });

    const result = await getPosts(0, 12);

    expect(apiGet).toHaveBeenCalledWith(ENDPOINTS.BLOGS, { params: { page: 0, size: 12 } });
    expect(result).toEqual(mockPaged);
  });

  it('uses defaults of page=0 and size=12', async () => {
    vi.mocked(apiGet).mockResolvedValue({ data: mockPaged });
    await getPosts();
    expect(apiGet).toHaveBeenCalledWith(ENDPOINTS.BLOGS, { params: { page: 0, size: 12 } });
  });
});

describe('getBlogById', () => {
  beforeEach(() => vi.mocked(apiGet).mockReset());

  it('calls BLOG_BY_ID/id and returns the unwrapped post', async () => {
    vi.mocked(apiGet).mockResolvedValue({ data: mockPost });

    const result = await getBlogById(42);

    expect(apiGet).toHaveBeenCalledWith(`${ENDPOINTS.BLOG_BY_ID}/42`);
    expect(result).toEqual(mockPost);
  });

});

describe('createBlog', () => {
  beforeEach(() => vi.mocked(apiPost).mockReset());

  it('posts to BLOGS endpoint with the payload and returns created post', async () => {
    vi.mocked(apiPost).mockResolvedValue({ data: mockPost });
    const payload = {
      title: 'New Post',
      excerpt: 'Short summary',
      body: 'Full content goes here.',
      tags: ['react', 'frontend'],
      author: { name: 'Alice', avatarUrl: null },
      coverImageUrl: null,
    };

    const result = await createBlog(payload);

    expect(apiPost).toHaveBeenCalledWith(ENDPOINTS.BLOGS, payload);
    expect(result).toEqual(mockPost);
  });

});
