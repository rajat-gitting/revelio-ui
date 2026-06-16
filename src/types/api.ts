/** Standard JSON envelope when the backend wraps payloads (adjust fields to match your API). */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ErrorResponse {
  status: number | null;
  message: string;
  code: string | null;
}

export interface PingDto {
  message: string;
}

export interface HealthDto {
  status: string;
}

export interface BlogAuthorDto {
  name: string;
  avatarUrl: string | null;
}

export interface BlogPostDto {
  id: number;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  author: BlogAuthorDto;
  tags: string[];
  publishedAt: string;
  body: string;
  readingTimeMinutes: number | null;
}

export interface BlogListDto {
  data: BlogPostDto[];
}

/** Search / filter response envelope */
export interface BlogSearchResponse {
  total: number;
  page: number;
  size: number;
  results: BlogPostDto[];
}

/** Available filter options returned by GET /api/v1/posts/filters */
export interface BlogFiltersDto {
  authors: BlogAuthorDto[];
  categories: string[];
}

/** Query params for the search endpoint */
export interface BlogSearchParams {
  q?: string;
  category?: string[];
  author?: string[];
  page?: number;
  size?: number;
}

/** Spring Data Page<T> response shape */
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  /** 0-based current page index */
  number: number;
  size: number;
}
