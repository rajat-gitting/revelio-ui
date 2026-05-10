import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import './BlogCard.css';

interface Author {
  name: string;
  avatarUrl: string | null;
}

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  author: Author;
  tags: string[];
  publishedAt: string;
}

interface BlogCardProps {
  post: BlogPost;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function formatTimestamp(publishedAt: string): string {
  try {
    const date = new Date(publishedAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 30) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return format(date, 'MMM d, yyyy');
    }
  } catch (error) {
    return '';
  }
}

function BlogCard({ post }: BlogCardProps): JSX.Element {
  const displayTags = post.tags.slice(0, 3);
  const remainingTagsCount = post.tags.length - 3;

  return (
    <a href={`/blog/${post.id}`} className="blog-card" aria-label={`Read ${post.title}`}>
      <div className="blog-card__image-container">
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="blog-card__image"
          />
        ) : (
          <div className="blog-card__image-placeholder">
            <div className="blog-card__logo">Revelio</div>
          </div>
        )}
      </div>

      <div className="blog-card__content">
        <h2 className="blog-card__title">{post.title}</h2>
        <p className="blog-card__excerpt">{post.excerpt}</p>

        <div className="blog-card__meta">
          <div className="blog-card__author">
            {post.author.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.name}
                className="blog-card__avatar"
              />
            ) : (
              <div className="blog-card__avatar-initials">
                {getInitials(post.author.name)}
              </div>
            )}
            <span className="blog-card__author-name">{post.author.name}</span>
          </div>

          <div className="blog-card__tags">
            {displayTags.map((tag, index) => (
              <span key={index} className="blog-card__tag">
                {tag}
              </span>
            ))}
            {remainingTagsCount > 0 && (
              <span className="blog-card__tag-more">+{remainingTagsCount} more</span>
            )}
          </div>

          <time className="blog-card__timestamp" dateTime={post.publishedAt}>
            {formatTimestamp(post.publishedAt)}
          </time>
        </div>
      </div>
    </a>
  );
}

export default BlogCard;
export type { BlogPost, Author };
