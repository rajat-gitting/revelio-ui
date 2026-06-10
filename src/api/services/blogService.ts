import { apiGet } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { ApiResponse, BlogFiltersDto, BlogPostDto, BlogSearchParams, BlogSearchResponse, PagedResponse } from '@/types/api';

export async function getBlogs(page = 0, size = 10): Promise<BlogPostDto[]> {
  // GET /api/blogs returns ApiResponse<PagedResponse<...>>: the posts array
  // lives at data.content, not data itself.
  const response = await apiGet<{ data: PagedResponse<BlogPostDto> }>(ENDPOINTS.BLOGS, {
    params: { page, size },
  });
  return response.data.content;
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

/**
 * Fetches a single published blog post by id from GET /api/blogs/:id.
 * Unwraps the ApiResponse envelope and returns the BlogPostDto (including body).
 * Throws ApiRequestError with status 404 if the post is not found or not published.
 */
export async function getBlogById(id: number): Promise<BlogPostDto> {
  const response = await apiGet<ApiResponse<BlogPostDto>>(`${ENDPOINTS.BLOG_BY_ID}/${id}`);
  return response.data;
}
