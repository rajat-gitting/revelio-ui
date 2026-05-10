import React from 'react';
import './BlogListing.css';
import { BlogCard } from './BlogCard';

type BlogListingProps = {
  posts: Array<{
    id: string;
    imageUrl: string;
    title: string;
    excerpt: string;
  }>;
};

export const BlogListing: React.FC<BlogListingProps> = ({ posts }) => {
  return (
    <div className="blog-listing">
      {posts.map(post => (
        <BlogCard
          key={post.id}
          imageUrl={post.imageUrl}
          title={post.title}
          excerpt={post.excerpt}
        />
      ))}
    </div>
  );
};
