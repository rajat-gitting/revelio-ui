import React from 'react';
import './BlogCard.css';

export const BlogCardSkeleton: React.FC = () => {
  return (
    <div className="blog-card-skeleton">
      <div className="skeleton-image" />
      <div className="skeleton-content">
        <div className="skeleton-title" />
        <div className="skeleton-text" />
        <div className="skeleton-text" />
        <div className="skeleton-text" />
      </div>
    </div>
  );
};
