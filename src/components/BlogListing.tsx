import React from 'react';
import './BlogListing.css';

interface BlogListingProps {
  posts: Array<any>;
  error: boolean;
  loading: boolean;
}

const EmptyState = () => (
  <div className="empty-state">
    <p>No blog posts available.</p>
  </div>
);

const ErrorState = () => (
  <div className="error-state">
    <p>Failed to load blog posts. Please try again later.</p>
  </div>
);

export const BlogListing = ({ posts, error, loading }: BlogListingProps) => {
  if (error) {
    return <ErrorState />;
  }

  if (!loading && posts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="blog-listing">
      {posts.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
};
