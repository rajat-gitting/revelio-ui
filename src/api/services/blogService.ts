import { apiGet } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { BlogFiltersDto, BlogPostDto, BlogSearchParams, BlogSearchResponse, PagedResponse } from '@/types/api';

export async function getBlogs(page = 0, size = 10): Promise<BlogPostDto[]> {
  const response = await apiGet<{ data: BlogPostDto[] }>(ENDPOINTS.BLOGS, {
    params: { page, size },
  });
  return response.data;
}

export async function searchPosts(params: BlogSearchParams): Promise<BlogSearchResponse> {
  return apiGet<BlogSearchResponse>(ENDPOINTS.BLOGS_SEARCH, { params });
}

export async function getBlogFilters(): Promise<BlogFiltersDto> {
  return apiGet<BlogFiltersDto>(ENDPOINTS.BLOGS_FILTERS);
}

/** Fetches a single page of posts from GET /api/posts using Spring Data Page response shape. */
export async function getPosts(page = 0, size = 12): Promise<PagedResponse<BlogPostDto>> {
  return apiGet<PagedResponse<BlogPostDto>>(ENDPOINTS.POSTS, {
    params: { page, size },
  });
}
