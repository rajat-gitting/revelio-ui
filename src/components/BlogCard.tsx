import React from 'react';
import './BlogCard.css';

type BlogCardProps = {
  coverImage: string;
  title: string;
  excerpt: string;
};

export const BlogCard: React.FC<BlogCardProps> = ({ coverImage, title, excerpt }) => {
  return (
    <div className="blog-card">
      <div className="card-image-container">
        <img src={coverImage} alt={title} className="card-image" />
      </div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-excerpt">{excerpt}</p>
      </div>
    </div>
  );
};
