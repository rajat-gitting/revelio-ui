import { apiGet, apiPost } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { ApiResponse, BlogAuthorDto, BlogFiltersDto, BlogPostDto, BlogSearchParams, BlogSearchResponse, PagedResponse } from '@/types/api';

export interface CreateBlogPayload {
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  author: BlogAuthorDto;
  coverImageUrl: string | null;
}

export async function getBlogs(page = 0, size = 10): Promise<BlogPostDto[]> {
  // GET /api/blogs returns ApiResponse<PagedResponse<...>>: the posts array
  // lives at data.content, not data itself.
  const response = await apiGet<{ data: PagedResponse<BlogPostDto> }>(ENDPOINTS.BLOGS, {
    params: { page, size },
  });
  return response.data.content;
}

export async function searchPosts(params: BlogSearchParams): Promise<BlogSearchResponse> {
  // GET /api/blogs/search returns ApiResponse<{ total, page, size, results }>.
  const response = await apiGet<ApiResponse<BlogSearchResponse>>(ENDPOINTS.BLOGS_SEARCH, { params });
  return response.data;
}

export async function getBlogFilters(): Promise<BlogFiltersDto> {
  // GET /api/blogs/filters returns ApiResponse<{ categories, authors }>.
  const response = await apiGet<ApiResponse<BlogFiltersDto>>(ENDPOINTS.BLOGS_FILTERS);
  return response.data;
}

/**
 * Fetches a single page of published posts from GET /api/blogs.
 * The backend wraps the Spring Data Page in an ApiResponse envelope, so unwrap `data`.
 */
export async function getPosts(page = 0, size = 12): Promise<PagedResponse<BlogPostDto>> {
  const response = await apiGet<ApiResponse<PagedResponse<BlogPostDto>>>(ENDPOINTS.BLOGS, {
    params: { page, size },
  });
  return response.data;
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

/**
 * Creates a new blog post via POST /api/blogs.
 * Unwraps the ApiResponse<BlogPostDto> envelope and returns the created BlogPostDto.
 */
export async function createBlog(payload: CreateBlogPayload): Promise<BlogPostDto> {
  const response = await apiPost<ApiResponse<BlogPostDto>, CreateBlogPayload>(
    ENDPOINTS.BLOGS,
    payload
  );
  return response.data;
}
