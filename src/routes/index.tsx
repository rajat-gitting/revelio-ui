import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import { useApi } from '@/hooks/useApi';
import { getBlogs } from '@/api/services/blogService';
import type { BlogPostDto } from '@/types/api';
import BlogCard from '@/components/BlogCard';
import SkeletonCard from '@/components/SkeletonCard';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import styles from '@/routes/index.module.scss';

const PAGE_SIZE = 10;

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const [extraPosts, setExtraPosts] = useState<BlogPostDto[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data: firstPage, loading, error, refetch } = useApi<BlogPostDto[]>(() => getBlogs(0, PAGE_SIZE));

  const posts = [...(firstPage ?? []), ...extraPosts];

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const more = await getBlogs(nextPage, PAGE_SIZE);
      setExtraPosts((prev) => [...prev, ...more]);
      setPage(nextPage);
      setHasMore(more.length === PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.grid}>
        {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Something went wrong. Please try again." onRetry={refetch} />;
  }

  if (posts.length === 0) {
    return <EmptyState message="No posts yet. Check back soon." />;
  }

  const showLoadMore = hasMore && (firstPage?.length ?? 0) === PAGE_SIZE;

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {posts.map((post) => <BlogCard key={post.id} post={post} />)}
      </div>
      {showLoadMore && (
        <div className={styles.loadMore}>
          <button
            className={styles.loadMoreButton}
            onClick={() => {
              void loadMore();
            }}
            disabled={loadingMore}
          >
            {loadingMore ? <span className={styles.spinner} /> : 'Load More'}
          </button>
        </div>
      )}
    </section>
  );
}
