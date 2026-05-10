import React from 'react';
import './BlogCard.css';

type BlogCardProps = {
  imageUrl: string;
  title: string;
  excerpt: string;
};

export const BlogCard: React.FC<BlogCardProps> = ({ imageUrl, title, excerpt }) => {
  return (
    <div className="blog-card">
      <div className="image-container">
        <img src={imageUrl} alt={title} />
      </div>
      <div className="content-container">
        <h3>{title}</h3>
        <p>{excerpt}</p>
      </div>
    </div>
  );
};
