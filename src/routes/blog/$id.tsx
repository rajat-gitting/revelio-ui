import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { format } from 'date-fns';

import { getBlogById } from '@/api/services/blogService';
import { useApi } from '@/hooks/useApi';
import styles from './$id.module.scss';

export const Route = createFileRoute('/blog/$id')({
  component: BlogDetailPage,
});

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '';
  const first = parts[0];
  if (!first) return '';
  if (parts.length === 1) return first.charAt(0).toUpperCase();
  const last = parts[parts.length - 1];
  if (!last) return first.charAt(0).toUpperCase();
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

function getReadingTimeFromBody(body: string): number {
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function formatDate(publishedAt: string): string {
  try {
    return format(new Date(publishedAt), 'MMMM d, yyyy');
  } catch {
    return '';
  }
}

function BlogDetailPage(): React.JSX.Element {
  const { id } = Route.useParams();
  const numericId = parseInt(id, 10);

  const { data: post, loading, error } = useApi(
    () => getBlogById(numericId),
    numericId
  );

  if (loading) {
    return (
      <div className={styles.page} data-testid="blog-detail-loading">
        <div className={styles.skeleton}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonMeta} />
          <div className={styles.skeletonBody} />
        </div>
      </div>
    );
  }

  // Check if it's a 404 error
  const is404 =
    error != null &&
    ((error.includes('404') || error.toLowerCase().includes('not found')));

  if (error != null || !post) {
    return (
      <div className={styles.page} data-testid="blog-detail-not-found">
        <div className={styles.notFound}>
          <h1 className={styles.notFoundTitle}>
            {is404 ? 'Post Not Found' : 'Failed to Load Post'}
          </h1>
          <p className={styles.notFoundMessage}>
            {is404
              ? 'The blog post you are looking for does not exist or is no longer available.'
              : error ?? 'Something went wrong while loading this post.'}
          </p>
          <Link to="/" search={{ q: '', category: [], author: [], page: 1 }} className={styles.backLink}>
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const readingTime = getReadingTimeFromBody(post.body);

  return (
    <article className={styles.page} data-testid="blog-detail-page">
      {/* Back link */}
      <Link to="/" search={{ q: '', category: [], author: [], page: 1 }} className={styles.backLink} data-testid="back-to-blogs">
        ← Back to Blog
      </Link>

      {/* Cover image (optional) */}
      {post.coverImageUrl && (
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className={styles.coverImage}
          data-testid="blog-detail-cover"
        />
      )}

      {/* Title */}
      <h1 className={styles.title} data-testid="blog-detail-title">
        {post.title}
      </h1>

      {/* Meta row */}
      <div className={styles.meta} data-testid="blog-detail-meta">
        {/* Author */}
        <div className={styles.author} data-testid="blog-detail-author">
          {post.author.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt={post.author.name}
              className={styles.avatar}
              data-testid="blog-detail-avatar-img"
            />
          ) : (
            <div className={styles.avatarInitials} data-testid="blog-detail-avatar-initials">
              {getInitials(post.author.name)}
            </div>
          )}
          <span className={styles.authorName} data-testid="blog-detail-author-name">
            {post.author.name}
          </span>
        </div>

        {/* Read time (derived from body) */}
        <span className={styles.readTime} data-testid="blog-detail-read-time">
          {readingTime} min read
        </span>

        {/* Posted date */}
        <time
          className={styles.date}
          dateTime={post.publishedAt}
          data-testid="blog-detail-date"
        >
          {formatDate(post.publishedAt)}
        </time>
      </div>

      {/* Tags (all tags, no cap) */}
      <div className={styles.tags} data-testid="blog-detail-tags">
        {post.tags.map((tag) => (
          <span key={tag} className={styles.tag} data-testid={`blog-detail-tag-${tag}`}>
            {tag}
          </span>
        ))}
      </div>

      {/* Excerpt / summary */}
      <p className={styles.excerpt} data-testid="blog-detail-excerpt">
        {post.excerpt}
      </p>

      {/* Full article body */}
      <div className={styles.body} data-testid="blog-detail-body">
        {post.body.split('\n\n').map((paragraph, i) => (
          <p key={i} className={styles.paragraph}>
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
