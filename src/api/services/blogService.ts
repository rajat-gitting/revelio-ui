import { apiGet } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { BlogPostDto } from '@/types/api';

export async function getBlogs(page = 0, size = 10): Promise<BlogPostDto[]> {
  const response = await apiGet<{ data: BlogPostDto[] }>(ENDPOINTS.BLOGS, {
    params: { page, size },
  });
  return response.data;
}
