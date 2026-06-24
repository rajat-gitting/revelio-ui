import { test, expect, type Page } from '@playwright/test';

/**
 * Smoke: every route must actually RENDER in a real browser — no uncaught
 * exceptions, no console errors, no error boundary. Unit tests run against
 * mocks and cannot catch e.g. "(x ?? []) is not iterable" when the API
 * response is mishandled; this can.
 *
 * The API is stubbed at the network level with fixtures that mirror the REAL
 * backend contract (revelio-api): ApiResponse wraps every payload in `data`,
 * and GET /api/blogs pages posts as PagedResponse — the array is at
 * `data.content`. Keep these fixtures in sync with the backend DTOs; a fixture
 * that drifts from the real contract makes this gate lie.
 */

const post = (id: number) => ({
  id,
  title: `Smoke Post ${id}`,
  excerpt: 'A post served by the smoke-test API stub.',
  coverImageUrl: null,
  author: { name: 'Smoke Author', avatarUrl: null },
  tags: ['smoke'],
  publishedAt: '2026-01-01T00:00:00Z',
  body: 'This is the full article body for smoke testing. It contains several sentences of topically relevant placeholder prose to verify the detail page renders correctly without crashing.',
});

const POSTS = [post(1), post(2), post(3)];

/** Spring Data Page shape (PagedResponse<T> on the backend). */
const paged = (content: unknown[]) => ({
  content,
  totalElements: content.length,
  totalPages: 1,
  number: 0,
  size: 12,
});

/** ApiResponse<T> wrapper used by every revelio-api endpoint. */
const apiResponse = (data: unknown) => ({
  success: true,
  message: null,
  data,
  timestamp: '2026-01-01T00:00:00Z',
});

async function stubApi(page: Page): Promise<void> {
  // GET /api/blogs/:id → ApiResponse<BlogPostDto>
  await page.route(/\/blogs\/\d+/, (route) => {
    const url = route.request().url();
    const id = parseInt(url.split('/blogs/')[1]?.split('?')[0] ?? '1', 10);
    const found = POSTS.find((p) => p.id === id);
    if (found) {
      route.fulfill({ json: apiResponse(found) });
    } else {
      route.fulfill({ status: 404, json: { success: false, message: 'Not found' } });
    }
  });
  // GET /api/blogs → ApiResponse<PagedResponse<BlogPostDto>>
  await page.route(/\/blogs(\?|$)/, (route) =>
    route.fulfill({ json: apiResponse(paged(POSTS)) }),
  );
  // GET /api/posts → PagedResponse<BlogPostDto> (unwrapped)
  await page.route(/\/posts(\?|$)/, (route) =>
    route.fulfill({ json: paged(POSTS) }),
  );
  // GET /api/v1/posts/search → BlogSearchResponse
  await page.route(/\/posts\/search/, (route) =>
    route.fulfill({
      json: { total: POSTS.length, page: 0, size: 12, results: POSTS },
    }),
  );
  // GET /api/v1/posts/filters → BlogFiltersDto
  await page.route(/\/posts\/filters/, (route) =>
    route.fulfill({
      json: {
        authors: [{ name: 'Smoke Author', avatarUrl: null }],
        categories: ['smoke'],
      },
    }),
  );
}

const ROUTES = ['/', '/blogs', '/about', '/blog/1', '/blog/create'];

for (const path of ROUTES) {
  test(`renders ${path} without crashing`, async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    await stubApi(page);
    await page.goto(path, { waitUntil: 'networkidle' });

    expect(pageErrors, `uncaught exceptions on ${path}`).toEqual([]);
    expect(consoleErrors, `console errors on ${path}`).toEqual([]);
    await expect(
      page.getByText(/something went wrong/i),
      `error boundary rendered on ${path}`,
    ).toHaveCount(0);
  });
}

test('the blog list actually shows posts from the API', async ({ page }) => {
  await stubApi(page);
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.getByText('Smoke Post 1')).toBeVisible();
});

// CR-39: Search and filter controls are hidden by default, revealed by header buttons

test('CR-39: search input hidden by default, revealed by clicking search icon button', async ({ page }) => {
  await stubApi(page);
  await page.goto('/', { waitUntil: 'networkidle' });

  // Search input should not be visible initially
  await expect(page.getByTestId('search-input')).toHaveCount(0);

  // Click the search toggle button
  await page.getByTestId('search-toggle').click();

  // Search input should now be visible
  await expect(page.getByTestId('search-input')).toBeVisible();
});

test('CR-39: typing in revealed search input filters blog posts', async ({ page }) => {
  await stubApi(page);
  await page.goto('/', { waitUntil: 'networkidle' });

  // Open search
  await page.getByTestId('search-toggle').click();
  await expect(page.getByTestId('search-input')).toBeVisible();

  // Type a search term
  await page.getByTestId('search-input').fill('Smoke');

  // The search chip should appear (debounce)
  await expect(page.getByTestId('active-filters')).toBeVisible({ timeout: 2000 });
});

test('CR-39: filter dropdowns hidden by default, revealed by clicking filter icon button', async ({ page }) => {
  await stubApi(page);
  await page.goto('/', { waitUntil: 'networkidle' });

  // Filter dropdowns should not be visible initially
  await expect(page.getByTestId('category-filter')).toHaveCount(0);
  await expect(page.getByTestId('author-filter')).toHaveCount(0);

  // Click the filters toggle button
  await page.getByTestId('filters-toggle').click();

  // Both filter dropdowns should now be visible
  await expect(page.getByTestId('category-filter')).toBeVisible();
  await expect(page.getByTestId('author-filter')).toBeVisible();
});

test('CR-39: Create Blog button navigates to blog creation page', async ({ page }) => {
  await stubApi(page);
  await page.goto('/', { waitUntil: 'networkidle' });

  await page.getByRole('button', { name: /create blog/i }).click();

  // Should navigate to /blog/create
  await expect(page).toHaveURL(/\/blog\/create/);
});
