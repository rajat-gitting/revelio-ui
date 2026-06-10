import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { getBlogFilters, getPosts, searchPosts } from '@/api/services/blogService';
import BlogCard from '@/components/BlogCard';
import SkeletonCard from '@/components/SkeletonCard';
import type { BlogAuthorDto, BlogFiltersDto, BlogPostDto, PagedResponse } from '@/types/api';
import { useDebounce } from '@/hooks/useDebounce';
import styles from './blogs.module.scss';

// ---------------------------------------------------------------------------
// CR-29: Static blog cards (hardcoded, always visible alongside API-fetched posts)
// ---------------------------------------------------------------------------
const STATIC_BLOG_POSTS: BlogPostDto[] = [
  {
    id: -1,
    title: 'Development in the era of AI',
    excerpt: 'How AI tools are reshaping the way developers write, review, and ship code.',
    coverImageUrl: null,
    author: { name: 'Editorial Team', avatarUrl: null },
    tags: ['ai', 'development', 'productivity'],
    publishedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: -2,
    title: 'Mastering Code Reviews',
    excerpt: 'Best practices for giving and receiving feedback that improves code quality and team culture.',
    coverImageUrl: null,
    author: { name: 'Editorial Team', avatarUrl: null },
    tags: ['code-review', 'collaboration', 'best-practices'],
    publishedAt: '2025-01-02T00:00:00Z',
  },
  {
    id: -3,
    title: 'The Rise of Edge Computing',
    excerpt: 'Why processing data closer to the user is changing how we build modern applications.',
    coverImageUrl: null,
    author: { name: 'Editorial Team', avatarUrl: null },
    tags: ['edge-computing', 'architecture', 'performance'],
    publishedAt: '2025-01-03T00:00:00Z',
  },
  {
    id: -4,
    title: 'Securing Your CI/CD Pipeline',
    excerpt: 'Practical steps to protect your build and deployment workflows from common vulnerabilities.',
    coverImageUrl: null,
    author: { name: 'Editorial Team', avatarUrl: null },
    tags: ['security', 'ci-cd', 'devops'],
    publishedAt: '2025-01-04T00:00:00Z',
  },
  {
    id: -5,
    title: 'Writing Documentation Developers Actually Read',
    excerpt: 'Tips for creating clear, concise docs that reduce support tickets and onboarding time.',
    coverImageUrl: null,
    author: { name: 'Editorial Team', avatarUrl: null },
    tags: ['documentation', 'writing', 'developer-experience'],
    publishedAt: '2025-01-05T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Route search-params schema (URL state — CR-11, CR-24)
// ---------------------------------------------------------------------------
interface BlogsSearch {
  q: string;
  category: string[];
  author: string[];
  /** 1-based page number as displayed in the URL (subtract 1 before calling API) */
  page: number;
}

function validateBlogsSearch(raw: Record<string, unknown>): BlogsSearch {
  return {
    q: typeof raw.q === 'string' ? raw.q : '',
    category: Array.isArray(raw.category)
      ? (raw.category as unknown[]).filter((v): v is string => typeof v === 'string')
      : typeof raw.category === 'string'
        ? [raw.category]
        : [],
    author: Array.isArray(raw.author)
      ? (raw.author as unknown[]).filter((v): v is string => typeof v === 'string')
      : typeof raw.author === 'string'
        ? [raw.author]
        : [],
    // 1-based in URL; default 1 (= API page 0)
    page: typeof raw.page === 'number' ? Math.max(1, Math.floor(raw.page)) : 1,
  };
}

export const Route = createFileRoute('/blogs')({
  validateSearch: validateBlogsSearch,
  component: BlogsPage,
});

const PAGE_SIZE = 12;

// ---------------------------------------------------------------------------
// BlogsPage
// ---------------------------------------------------------------------------
function BlogsPage() {
  const navigate = useNavigate({ from: '/blogs' });
  const { q, category, author, page } = Route.useSearch();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Local controlled value for the search input (instant UI feedback)
  const [inputValue, setInputValue] = useState(q);
  // Error banner state (non-blocking — CR-12)
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [lastValidResults, setLastValidResults] = useState<BlogPostDto[]>([]);
  const [lastValidTotal, setLastValidTotal] = useState(0);

  // Filter options (fetched once on mount — see Technical Notes)
  const [filterOptions, setFilterOptions] = useState<BlogFiltersDto>({ authors: [], categories: [] });

  // Pagination state (CR-24)
  const [pagedData, setPagedData] = useState<PagedResponse<BlogPostDto> | null>(null);

  // Search result state
  const [results, setResults] = useState<BlogPostDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Debounced query — ≤300 ms (CR-2)
  const debouncedQ = useDebounce(inputValue, 300);

  // ---------------------------------------------------------------------------
  // Sync inputValue → URL param after debounce
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Only navigate if the debounced value differs from the URL param
    if (debouncedQ !== q) {
      void navigate({
        search: (prev) => ({ ...prev, q: debouncedQ, page: 1 }),
        replace: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  // Keep inputValue in sync when URL param changes externally (e.g. back-button)
  useEffect(() => {
    setInputValue(q);
  }, [q]);

  // ---------------------------------------------------------------------------
  // Fetch filter options once on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    getBlogFilters()
      .then(setFilterOptions)
      .catch(() => {
        // Non-critical; filters just won't be populated from server
      });
  }, []);

  // ---------------------------------------------------------------------------
  // Fetch results whenever URL params change (CR-2, CR-4, CR-11, CR-24)
  // ---------------------------------------------------------------------------
  const fetchResults = useCallback(
    async () => {
      try {
        setLoading(true);

        // Convert 1-based URL page to 0-based API page
        const apiPage = page - 1;

        const hasFilters = !!q || category.length > 0 || author.length > 0;

        if (hasFilters) {
          // Use search endpoint when filters are active
          const data = await searchPosts({
            q: q || undefined,
            category: category.length ? category : undefined,
            author: author.length ? author : undefined,
            page: apiPage,
            size: PAGE_SIZE,
          });

          const newResults = data.results;
          setResults(newResults);
          setLastValidResults(newResults);
          setTotal(data.total);
          setLastValidTotal(data.total);
          setPagedData(null);
        } else {
          // Use paginated posts endpoint for plain listing (CR-24)
          const data = await getPosts(apiPage, PAGE_SIZE);
          setResults(data.content);
          setLastValidResults(data.content);
          setTotal(data.totalElements);
          setLastValidTotal(data.totalElements);
          setPagedData(data);
        }

        setErrorBanner(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load posts. Please try again.';
        setErrorBanner(msg);
        // Keep last valid results visible (CR-12, CR-24)
        setResults(lastValidResults);
        setTotal(lastValidTotal);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, category, author, page]
  );

  useEffect(() => {
    void fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, author, page]);

  // ---------------------------------------------------------------------------
  // Keyboard shortcut: "/" focuses the search input (CR-10)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/') return;
      const target = e.target as HTMLElement;
      const tag = target.tagName;
      const isEditable =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target.isContentEditable;
      if (isEditable) return;
      e.preventDefault();
      searchInputRef.current?.focus();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (o) => o.value).filter(Boolean);
    void navigate({ search: (prev) => ({ ...prev, category: selected, page: 1 }), replace: true });
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (o) => o.value).filter(Boolean);
    void navigate({ search: (prev) => ({ ...prev, author: selected, page: 1 }), replace: true });
  };

  const removeCategory = (cat: string) => {
    void navigate({
      search: (prev) => ({ ...prev, category: category.filter((c) => c !== cat), page: 1 }),
      replace: true,
    });
  };

  const removeAuthor = (a: string) => {
    void navigate({
      search: (prev) => ({ ...prev, author: author.filter((au) => au !== a), page: 1 }),
      replace: true,
    });
  };

  const removeSearchQuery = () => {
    setInputValue('');
    void navigate({ search: (prev) => ({ ...prev, q: '', page: 1 }), replace: true });
  };

  // Clear all — CR-7
  const clearAll = () => {
    setInputValue('');
    void navigate({ search: () => ({ q: '', category: [], author: [], page: 1 }), replace: true });
  };

  // Pagination handlers — CR-24: use pushState-style navigation (not replace)
  const handlePrevPage = () => {
    const prevPage = Math.max(1, page - 1);
    void navigate({ search: (prev) => ({ ...prev, page: prevPage }) });
  };

  const handleNextPage = () => {
    void navigate({ search: (prev) => ({ ...prev, page: page + 1 }) });
  };

  const hasActiveFilters = !!q || category.length > 0 || author.length > 0;

  // For pagination controls — use pagedData when available, else derive from total
  const totalPages = pagedData ? pagedData.totalPages : Math.ceil(total / PAGE_SIZE);
  // Only show pagination controls when there are multiple pages (CR-24: not when < 12 posts total)
  const showPagination = !hasActiveFilters && totalPages > 1;
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className={styles.page} data-testid="blogs-page">
      <h1 className={styles.heading}>Blog</h1>

      {/* ── Controls ── */}
      <div className={styles.controls}>
        {/* Search input — always visible (CR-1) */}
        <div className={styles.searchRow}>
          <div className={styles.searchInputWrapper}>
            <span className={styles.searchIcon} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              ref={searchInputRef}
              type="search"
              className={styles.searchInput}
              placeholder="Search posts… (press / to focus)"
              value={inputValue}
              onChange={handleSearchChange}
              aria-label="Search posts"
              data-testid="search-input"
            />
          </div>
        </div>

        {/* Filter row — CR-3 */}
        <div className={styles.filterRow} data-testid="filter-row">
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="category-filter">Category / Tag</label>
            <select
              id="category-filter"
              className={styles.filterSelect}
              multiple
              size={1}
              value={category}
              onChange={handleCategoryChange}
              aria-label="Filter by Category / Tag"
              data-testid="category-filter"
            >
              {filterOptions.categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="author-filter">Author</label>
            <select
              id="author-filter"
              className={styles.filterSelect}
              multiple
              size={1}
              value={author}
              onChange={handleAuthorChange}
              aria-label="Filter by Author"
              data-testid="author-filter"
            >
              {filterOptions.authors.map((a: BlogAuthorDto) => (
                <option key={a.name} value={a.name}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filter chips — CR-6 */}
        {hasActiveFilters && (
          <div className={styles.activeFilters} data-testid="active-filters">
            {q && (
              <span className={styles.chip} data-testid="chip-query">
                Search: {q}
                <button
                  className={styles.chipRemove}
                  onClick={removeSearchQuery}
                  aria-label={`Remove search term "${q}"`}
                >
                  ×
                </button>
              </span>
            )}
            {category.map((cat) => (
              <span key={cat} className={styles.chip} data-testid={`chip-category-${cat}`}>
                {cat}
                <button
                  className={styles.chipRemove}
                  onClick={() => removeCategory(cat)}
                  aria-label={`Remove category filter "${cat}"`}
                >
                  ×
                </button>
              </span>
            ))}
            {author.map((a) => (
              <span key={a} className={styles.chip} data-testid={`chip-author-${a}`}>
                {a}
                <button
                  className={styles.chipRemove}
                  onClick={() => removeAuthor(a)}
                  aria-label={`Remove author filter "${a}"`}
                >
                  ×
                </button>
              </span>
            ))}
            {/* Clear all — CR-7 */}
            <button className={styles.clearAll} onClick={clearAll} data-testid="clear-all">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Non-blocking error banner — CR-12 ── */}
      {errorBanner && (
        <div className={styles.errorBanner} role="alert" data-testid="error-banner">
          <span>{errorBanner}</span>
          <button
            className={styles.errorBannerClose}
            onClick={() => setErrorBanner(null)}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Result count — CR-5 ── */}
      {!loading && (
        <p className={styles.resultCount} aria-live="polite" data-testid="result-count">
          {total} {total === 1 ? 'result' : 'results'}
        </p>
      )}

      {/* ── Post list — in-place update (CR-11) ── */}
      {loading ? (
        <div className={styles.grid} data-testid="skeleton-grid">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : results.length === 0 ? (
        /* ── Empty state — CR-8 ── */
        <div className={styles.emptyState} data-testid="empty-state">
          <h2 className={styles.emptyStateTitle}>No posts found</h2>
          <p className={styles.emptyStateText}>
            No posts match your current search or filters — try a different search or clear your filters.
          </p>
          <button className={styles.emptyStateReset} onClick={clearAll} data-testid="empty-state-reset">
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className={styles.grid} data-testid="results-grid">
            {results.map((post) => <BlogCard key={post.id} post={post} />)}
          </div>

          {/* ── Pagination controls — CR-24 ── */}
          {showPagination && (
            <div className={styles.pagination} data-testid="pagination">
              <button
                className={styles.paginationButton}
                onClick={handlePrevPage}
                disabled={loading || isFirstPage}
                aria-disabled={isFirstPage}
                data-testid="prev-button"
              >
                Previous
              </button>
              <span className={styles.paginationInfo} data-testid="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                className={styles.paginationButton}
                onClick={handleNextPage}
                disabled={loading || isLastPage}
                aria-disabled={isLastPage}
                data-testid="next-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* ── CR-29: Static blog cards — always rendered below API results ── */}
      <div className={styles.grid} data-testid="static-cards-grid">
        {STATIC_BLOG_POSTS.map((post) => <BlogCard key={post.id} post={post} />)}
      </div>
    </div>
  );
}
