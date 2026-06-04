import './BlogListing.css';
import BlogCard, { type BlogPost } from './BlogCard';

interface BlogListingProps {
  posts: BlogPost[];
}

export function BlogListing({ posts }: BlogListingProps) {
  return (
    <div className="blog-listing">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}
