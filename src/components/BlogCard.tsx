import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Link } from '@tanstack/react-router';
import './BlogCard.css';

interface Author {
  name: string;
  avatarUrl: string | null;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  author: Author;
  tags: string[];
  publishedAt: string;
  readingTimeMinutes: number | null;
}

interface BlogCardProps {
  post: BlogPost;
}

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

function formatTimestamp(publishedAt: string): string {
  try {
    const date = new Date(publishedAt);
    const daysDiff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 30
      ? formatDistanceToNow(date, { addSuffix: true })
      : format(date, 'MMM d, yyyy');
  } catch {
    return '';
  }
}

export function getReadingTime(excerpt: string): number {
  const wordCount = excerpt.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function BlogCard({ post }: BlogCardProps): React.JSX.Element {
  const displayTags = post.tags.slice(0, 3);
  const extraTags = post.tags.length - 3;
  const readingTime = post.readingTimeMinutes ?? getReadingTime(post.excerpt);

  return (
    <Link to="/blog/$id" params={{ id: String(post.id) }} className="blog-card" aria-label={`Read ${post.title}`}>
      <div className="blog-card__content">
        <h2 className="blog-card__title">{post.title}</h2>
        <p className="blog-card__excerpt">{post.excerpt}</p>
        <div className="blog-card__meta">
          <div className="blog-card__author">
            {post.author.avatarUrl ? (
              <img src={post.author.avatarUrl} alt={post.author.name} className="blog-card__avatar" />
            ) : (
              <div className="blog-card__avatar-initials">{getInitials(post.author.name)}</div>
            )}
            <span className="blog-card__author-name">{post.author.name}</span>
          </div>
          <div className="blog-card__tags">
            {displayTags.map((tag, i) => (
              <span key={i} className="blog-card__tag">{tag}</span>
            ))}
            {extraTags > 0 && <span className="blog-card__tag-more">+{extraTags} more</span>}
          </div>
          <div className="blog-card__reading-time">
            <span aria-label={`${readingTime} minute read`}>{readingTime} min read</span>
          </div>
          <time className="blog-card__timestamp" dateTime={post.publishedAt}>
            {formatTimestamp(post.publishedAt)}
          </time>
        </div>
      </div>
    </Link>
  );
}

export default BlogCard;
