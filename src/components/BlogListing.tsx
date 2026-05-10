import React, { useState } from 'react';
import BlogCard from './BlogCard';
import './BlogListing.css';

interface BlogListingProps {
  initialPosts: Array<{ id: string; title: string; image: string; content: string }>;
  loadMorePosts: () => Promise<Array<{ id: string; title: string; image: string; content: string }>>;
}

const BlogListing: React.FC<BlogListingProps> = ({ initialPosts, loadMorePosts }) => {
  const [posts, setPosts] = useState(initialPosts);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = async () => {
    setIsLoading(true);
    try {
      const newPosts = await loadMorePosts();
      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="blog-listing">
      {posts.map((post) => (
        <BlogCard key={post.id} {...post} />
      ))}
      <button
        className="load-more-button"
        onClick={handleLoadMore}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Load More'}
      </button>
    </div>
  );
};

export default BlogListing;
