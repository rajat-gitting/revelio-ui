import React from 'react';
import BlogCard from './BlogCard';
import './BlogListing.css';

type BlogListingProps = {
  posts: Array<{
    id: string;
    title: string;
    excerpt: string;
    imageUrl: string;
  }>;
};

const BlogListing: React.FC<BlogListingProps> = ({ posts }) => {
  return (
    <div className="blog-listing">
      {posts.map((post) => (
        <BlogCard
          key={post.id}
          title={post.title}
          excerpt={post.excerpt}
          imageUrl={post.imageUrl}
        />
      ))}
    </div>
  );
};

export default BlogListing;
