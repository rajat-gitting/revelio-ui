import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { getBlogFilters, searchPosts } from '@/api/services/blogService';
import BlogCard from '@/components/BlogCard';
import SkeletonCard from '@/components/SkeletonCard';
import type { BlogAuthorDto, BlogFiltersDto, BlogPostDto } from '@/types/api';
import { useDebounce } from '@/hooks/useDebounce';
import styles from './blogs.module.scss';

// ---------------------------------------------------------------------------
// Route search-params schema (URL state — CR-11)
// ---------------------------------------------------------------------------
interface BlogsSearch {
  q: string;
  category: string[];
  author: string[];
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
    page: typeof raw.page === 'number' ? Math.max(0, Math.floor(raw.page)) : 0,
  };
}

export const Route = createFileRoute('/blogs')({
  validateSearch: validateBlogsSearch,
  component: BlogsPage,
});

const PAGE_SIZE = 20;

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

  // Search result state
  const [results, setResults] = useState<BlogPostDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Debounced query — ≤300 ms (CR-2)
  const debouncedQ = useDebounce(inputValue, 300);

  // ---------------------------------------------------------------------------
  // Sync inputValue → URL param after debounce
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Only navigate if the debounced value differs from the URL param
    if (debouncedQ !== q) {
      void navigate({
        search: (prev) => ({ ...prev, q: debouncedQ, page: 0 }),
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
  // Fetch search results whenever URL params change (CR-2, CR-4, CR-11)
  // ---------------------------------------------------------------------------
  const fetchResults = useCallback(
    async (append = false) => {
      try {
        if (!append) setLoading(true);
        else setLoadingMore(true);

        const data = await searchPosts({
          q: q || undefined,
          category: category.length ? category : undefined,
          author: author.length ? author : undefined,
          page: append ? page : 0,
          size: PAGE_SIZE,
        });

        const newResults = data.results;

        if (append) {
          setResults((prev) => {
            const merged = [...prev, ...newResults];
            setLastValidResults(merged);
            return merged;
          });
        } else {
          setResults(newResults);
          setLastValidResults(newResults);
        }
        setTotal(data.total);
        setLastValidTotal(data.total);
        setHasMore(newResults.length === PAGE_SIZE);
        setErrorBanner(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Search failed. Please try again.';
        setErrorBanner(msg);
        // Keep last valid results visible (CR-12)
        setResults(lastValidResults);
        setTotal(lastValidTotal);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, category, author, page]
  );

  useEffect(() => {
    void fetchResults(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, author]);

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
    void navigate({ search: (prev) => ({ ...prev, category: selected, page: 0 }), replace: true });
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (o) => o.value).filter(Boolean);
    void navigate({ search: (prev) => ({ ...prev, author: selected, page: 0 }), replace: true });
  };

  const removeCategory = (cat: string) => {
    void navigate({
      search: (prev) => ({ ...prev, category: category.filter((c) => c !== cat), page: 0 }),
      replace: true,
    });
  };

  const removeAuthor = (a: string) => {
    void navigate({
      search: (prev) => ({ ...prev, author: author.filter((au) => au !== a), page: 0 }),
      replace: true,
    });
  };

  const removeSearchQuery = () => {
    setInputValue('');
    void navigate({ search: (prev) => ({ ...prev, q: '', page: 0 }), replace: true });
  };

  // Clear all — CR-7
  const clearAll = () => {
    setInputValue('');
    void navigate({ search: () => ({ q: '', category: [], author: [], page: 0 }), replace: true });
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    void navigate({ search: (prev) => ({ ...prev, page: nextPage }), replace: true });
    void fetchResults(true);
  };

  const hasActiveFilters = !!q || category.length > 0 || author.length > 0;

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
          {hasMore && (
            <div className={styles.loadMore}>
              <button
                className={styles.loadMoreButton}
                onClick={handleLoadMore}
                disabled={loadingMore}
                data-testid="load-more"
              >
                {loadingMore ? <span className={styles.spinner} /> : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
