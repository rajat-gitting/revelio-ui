// Paths are relative to VITE_API_BASE_URL, which already includes the backend's
// `/api` context path (e.g. http://localhost:8083/api). Do NOT repeat `/api` here.
export const ENDPOINTS = {
  HEALTH: '/health',
  PING: '/ping',
  BLOGS: '/blogs',
  BLOG_BY_ID: '/blogs',
  BLOGS_SEARCH: '/blogs/search',
  BLOGS_FILTERS: '/blogs/filters',
} as const;
