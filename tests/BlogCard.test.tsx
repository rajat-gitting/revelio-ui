import { render, screen } from '@testing-library/react';
import BlogCard from '../src/components/BlogCard';
import '@testing-library/jest-dom';

const mockBlogPost = {
  title: 'Test Blog Post',
  excerpt: 'This is a test blog post excerpt.',
  coverImage: 'https://example.com/image.jpg',
  slug: 'test-blog-post'
};

describe('BlogCard', () => {
  it('renders as a horizontal card with image on left and content on right', () => {
    render(<BlogCard post={mockBlogPost} />);
    const card = screen.getByRole('article');
    expect(card).toHaveClass('horizontal-card');
    const imageContainer = screen.getByRole('img').parentElement;
    expect(imageContainer).toHaveClass('image-container');
    const contentContainer = screen.getByText(mockBlogPost.title).parentElement;
    expect(contentContainer).toHaveClass('content-container');
  });

  it('allocates 30-40% width to image and 60-70% to content', () => {
    render(<BlogCard post={mockBlogPost} />);
    const imageContainer = screen.getByRole('img').parentElement;
    const contentContainer = screen.getByText(mockBlogPost.title).parentElement;
    
    const imageWidth = parseFloat(window.getComputedStyle(imageContainer).width);
    const contentWidth = parseFloat(window.getComputedStyle(contentContainer).width);
    const totalWidth = imageWidth + contentWidth;
    
    const imagePercentage = (imageWidth / totalWidth) * 100;
    const contentPercentage = (contentWidth / totalWidth) * 100;
    
    expect(imagePercentage).toBeGreaterThanOrEqual(30);
    expect(imagePercentage).toBeLessThanOrEqual(40);
    expect(contentPercentage).toBeGreaterThanOrEqual(60);
    expect(contentPercentage).toBeLessThanOrEqual(70);
  });

  it('renders vertically on mobile view', () => {
    window.innerWidth = 480;
    render(<BlogCard post={mockBlogPost} />);
    const card = screen.getByRole('article');
    expect(card).toHaveClass('vertical-card');
    const imageContainer = screen.getByRole('img').parentElement;
    expect(imageContainer).toHaveClass('mobile-image-container');
    const contentContainer = screen.getByText(mockBlogPost.title).parentElement;
    expect(contentContainer).toHaveClass('mobile-content-container');
  });
});
