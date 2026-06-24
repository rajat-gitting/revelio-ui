import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { getPosts, searchPosts } from '@/api/services/blogService';
import BlogCard from '@/components/BlogCard';
import SkeletonCard from '@/components/SkeletonCard';
import Button from '@/components/Button/Button';
import type { BlogPostDto, PagedResponse } from '@/types/api';
import { useDebounce } from '@/hooks/useDebounce';
import styles from '@/routes/index.module.scss';

// ---------------------------------------------------------------------------
// Route search-params schema
// ---------------------------------------------------------------------------
interface HomeSearch {
  q: string;
  /** 1-based page number as displayed in the URL (subtract 1 before calling API) */
  page: number;
}

function validateHomeSearch(raw: Record<string, unknown>): HomeSearch {
  return {
    q: typeof raw.q === 'string' ? raw.q : '',
    // 1-based in URL; default 1 (= API page 0)
    page: typeof raw.page === 'number' ? Math.max(1, Math.floor(raw.page)) : 1,
  };
}

export const Route = createFileRoute('/')({
  validateSearch: validateHomeSearch,
  component: HomePage,
});

const PAGE_SIZE = 12;

// ---------------------------------------------------------------------------
// HomePage
// ---------------------------------------------------------------------------
function HomePage() {
  const navigate = useNavigate({ from: '/' });
  const { q, page } = Route.useSearch();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Local controlled value for the search input (instant UI feedback)
  const [inputValue, setInputValue] = useState(q);
  // Whether the header search input is expanded
  const [searchOpen, setSearchOpen] = useState(false);
  // Error banner state (non-blocking)
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [lastValidResults, setLastValidResults] = useState<BlogPostDto[]>([]);
  const [lastValidTotal, setLastValidTotal] = useState(0);

  // Pagination state
  const [pagedData, setPagedData] = useState<PagedResponse<BlogPostDto> | null>(null);

  // Search result state
  const [results, setResults] = useState<BlogPostDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Debounced query — ≤300 ms
  const debouncedQ = useDebounce(inputValue, 300);

  // ---------------------------------------------------------------------------
  // Sync inputValue → URL param after debounce
  // ---------------------------------------------------------------------------
  useEffect(() => {
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
  // Fetch results whenever URL params change
  // ---------------------------------------------------------------------------
  const fetchResults = useCallback(
    async () => {
      try {
        setLoading(true);

        // Convert 1-based URL page to 0-based API page
        const apiPage = page - 1;

        const hasFilters = !!q;

        if (hasFilters) {
          // Use search endpoint when filters are active
          const data = await searchPosts({
            q: q || undefined,
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
          // Use paginated posts endpoint for plain listing
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
        // Keep last valid results visible
        setResults(lastValidResults);
        setTotal(lastValidTotal);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, page]
  );

  useEffect(() => {
    void fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearchIconClick = () => {
    setSearchOpen(true);
    // Focus the input after it becomes visible
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  const handleSearchBlur = () => {
    // Collapse only if the input is empty; use a short timeout to avoid
    // conflicting with the icon-click handler
    setTimeout(() => {
      if (!inputValue) {
        setSearchOpen(false);
      }
    }, 150);
  };

  const clearAll = () => {
    setInputValue('');
    void navigate({ search: () => ({ q: '', page: 1 }), replace: true });
  };

  // Pagination handlers
  const handlePrevPage = () => {
    const prevPage = Math.max(1, page - 1);
    void navigate({ search: (prev) => ({ ...prev, page: prevPage }) });
  };

  const handleNextPage = () => {
    void navigate({ search: (prev) => ({ ...prev, page: page + 1 }) });
  };

  const hasActiveFilters = !!q;

  // For pagination controls — use pagedData when available, else derive from total
  const totalPages = pagedData ? pagedData.totalPages : Math.ceil(total / PAGE_SIZE);
  // Only show pagination controls when there are multiple pages
  const showPagination = !hasActiveFilters && totalPages > 1;
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className={styles.page} data-testid="blogs-page">
      {/* ── Page header with Create Blog button ── */}
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Blog</h1>
        <div className={styles.headerActions}>
          {searchOpen && (
            <input
              ref={searchInputRef}
              type="search"
              className={styles.headerSearchInput}
              placeholder="Search posts…"
              value={inputValue}
              onChange={handleSearchChange}
              onBlur={handleSearchBlur}
              aria-label="Search posts"
              data-testid="search-input"
            />
          )}
          <button
            className={styles.searchIconButton}
            onClick={handleSearchIconClick}
            aria-label="Open search"
            data-testid="search-icon-button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <Button variant="primary" onClick={() => { void navigate({ to: '/blog/create' }); }}>
            Create Blog
          </Button>
        </div>
      </header>

      {/* ── Non-blocking error banner ── */}
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

      {/* ── Result count ── */}
      {!loading && (
        <p className={styles.resultCount} aria-live="polite" data-testid="result-count">
          {total} {total === 1 ? 'result' : 'results'}
        </p>
      )}

      {/* ── Post list — in-place update ── */}
      {loading ? (
        <div className={styles.grid} data-testid="skeleton-grid">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : results.length === 0 ? (
        /* ── Empty state ── */
        <div className={styles.emptyState} data-testid="empty-state">
          <h2 className={styles.emptyStateTitle}>No posts found</h2>
          <p className={styles.emptyStateText}>
            No posts match your current search — try a different search or clear it.
          </p>
          <button className={styles.emptyStateReset} onClick={clearAll} data-testid="empty-state-reset">
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div id="blog-section" className={styles.grid} data-testid="results-grid">
            {results.map((post) => <BlogCard key={post.id} post={post} />)}
          </div>

          {/* ── Pagination controls ── */}
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
    </div>
  );
}
