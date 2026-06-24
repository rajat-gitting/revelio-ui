import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { getBlogFilters, getPosts, searchPosts } from '@/api/services/blogService';
import BlogCard from '@/components/BlogCard';
import SkeletonCard from '@/components/SkeletonCard';
import Button from '@/components/Button/Button';
import type { BlogAuthorDto, BlogFiltersDto, BlogPostDto, PagedResponse } from '@/types/api';
import { useDebounce } from '@/hooks/useDebounce';
import styles from '@/routes/index.module.scss';

// ---------------------------------------------------------------------------
// Route search-params schema
// ---------------------------------------------------------------------------
interface HomeSearch {
  q: string;
  category: string[];
  author: string[];
  /** 1-based page number as displayed in the URL (subtract 1 before calling API) */
  page: number;
}

function validateHomeSearch(raw: Record<string, unknown>): HomeSearch {
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
  const { q, category, author, page } = Route.useSearch();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Local controlled value for the search input (instant UI feedback)
  const [inputValue, setInputValue] = useState(q);
  // Error banner state (non-blocking)
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [lastValidResults, setLastValidResults] = useState<BlogPostDto[]>([]);
  const [lastValidTotal, setLastValidTotal] = useState(0);

  // Filter options (fetched once on mount)
  const [filterOptions, setFilterOptions] = useState<BlogFiltersDto>({ authors: [], categories: [] });

  // Pagination state
  const [pagedData, setPagedData] = useState<PagedResponse<BlogPostDto> | null>(null);

  // Search result state
  const [results, setResults] = useState<BlogPostDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // UI visibility state — does NOT affect q/category/author URL params
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

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
  // Fetch results whenever URL params change
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
    [q, category, author, page]
  );

  useEffect(() => {
    void fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, author, page]);

  // ---------------------------------------------------------------------------
  // Keyboard shortcut: "/" focuses the search input (and expands it if collapsed)
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
      setSearchOpen(true);
      // focus is handled by the useEffect below that watches searchOpen
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus the search input whenever the search panel opens (handles async state update)
  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

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

  const clearAll = () => {
    setInputValue('');
    void navigate({ search: () => ({ q: '', category: [], author: [], page: 1 }), replace: true });
  };

  // Pagination handlers
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
  // Only show pagination controls when there are multiple pages
  const showPagination = !hasActiveFilters && totalPages > 1;
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className={styles.page} data-testid="blogs-page">
      {/* ── Page header with Create Blog button and search/filter toggles ── */}
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Blog</h1>
        <div className={styles.headerActions}>
          {/* Search toggle button */}
          <button
            className={styles.iconButton}
            onClick={() => { setSearchOpen((prev) => !prev); }}
            aria-label={searchOpen ? 'Collapse search' : 'Expand search'}
            aria-expanded={searchOpen}
            data-testid="search-toggle"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* Filter toggle button */}
          <button
            className={styles.iconButton}
            onClick={() => { setFiltersOpen((prev) => !prev); }}
            aria-label={filtersOpen ? 'Hide filters' : 'Show filters'}
            aria-expanded={filtersOpen}
            data-testid="filter-toggle"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
          </button>

          <Button variant="primary" onClick={() => { void navigate({ to: '/blog/create' }); }}>
            Create Blog
          </Button>
        </div>
      </header>

      {/* ── Controls ── */}
      <div className={styles.controls}>
        {/* Search input — only visible when searchOpen */}
        {searchOpen && (
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
        )}

        {/* Filter row — only visible when filtersOpen */}
        {filtersOpen && (
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
        )}

        {/* Active filter chips — always visible so users can see and clear active filters */}
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
            {/* Clear all */}
            <button className={styles.clearAll} onClick={clearAll} data-testid="clear-all">
              Clear all
            </button>
          </div>
        )}
      </div>

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
            No posts match your current search or filters — try a different search or clear your filters.
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
