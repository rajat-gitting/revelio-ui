import React from 'react';
import { render, screen } from '@testing-library/react';
import SkeletonCard from './SkeletonCard';

describe('SkeletonCard', () => {
  it('renders skeleton card with all structural elements', () => {
    render(<SkeletonCard />);

    const skeletonCard = screen.getByTestId('skeleton-card');
    expect(skeletonCard).toBeInTheDocument();
    expect(skeletonCard).toHaveClass('skeleton-card');
  });

  it('renders skeleton image placeholder', () => {
    const { container } = render(<SkeletonCard />);

    const imageElement = container.querySelector('.skeleton-card__image');
    expect(imageElement).toBeInTheDocument();
  });

  it('renders skeleton title placeholder', () => {
    const { container } = render(<SkeletonCard />);

    const titleElement = container.querySelector('.skeleton-card__title');
    expect(titleElement).toBeInTheDocument();
  });

  it('renders skeleton excerpt with three lines', () => {
    const { container } = render(<SkeletonCard />);

    const excerptLines = container.querySelectorAll('.skeleton-card__excerpt-line');
    expect(excerptLines).toHaveLength(3);
  });

  it('renders skeleton author section with avatar and name', () => {
    const { container } = render(<SkeletonCard />);

    const avatar = container.querySelector('.skeleton-card__avatar');
    const authorName = container.querySelector('.skeleton-card__author-name');

    expect(avatar).toBeInTheDocument();
    expect(authorName).toBeInTheDocument();
  });

  it('renders skeleton tags section with three tag placeholders', () => {
    const { container } = render(<SkeletonCard />);

    const tags = container.querySelectorAll('.skeleton-card__tag');
    expect(tags).toHaveLength(3);
  });

  it('applies custom className when provided', () => {
    render(<SkeletonCard className="custom-class" />);

    const skeletonCard = screen.getByTestId('skeleton-card');
    expect(skeletonCard).toHaveClass('skeleton-card');
    expect(skeletonCard).toHaveClass('custom-class');
  });

  it('renders without custom className', () => {
    render(<SkeletonCard />);

    const skeletonCard = screen.getByTestId('skeleton-card');
    expect(skeletonCard).toHaveClass('skeleton-card');
    expect(skeletonCard.className).toBe('skeleton-card ');
  });

  it('renders content section with proper structure', () => {
    const { container } = render(<SkeletonCard />);

    const contentSection = container.querySelector('.skeleton-card__content');
    expect(contentSection).toBeInTheDocument();
  });

  it('renders footer section with author and meta', () => {
    const { container } = render(<SkeletonCard />);

    const footer = container.querySelector('.skeleton-card__footer');
    const author = container.querySelector('.skeleton-card__author');
    const meta = container.querySelector('.skeleton-card__meta');

    expect(footer).toBeInTheDocument();
    expect(author).toBeInTheDocument();
    expect(meta).toBeInTheDocument();
  });

  it('renders short excerpt line with correct class', () => {
    const { container } = render(<SkeletonCard />);

    const shortLine = container.querySelector('.skeleton-card__excerpt-line--short');
    expect(shortLine).toBeInTheDocument();
    expect(shortLine).toHaveClass('skeleton-card__excerpt-line');
    expect(shortLine).toHaveClass('skeleton-card__excerpt-line--short');
  });
});
