import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SkeletonCard from './SkeletonCard';

describe('SkeletonCard', () => {
  it('renders skeleton card component', () => {
    render(<SkeletonCard />);
    const skeletonCard = screen.getByTestId('skeleton-card');
    expect(skeletonCard).toBeInTheDocument();
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

  it('renders skeleton tags section with three tags', () => {
    const { container } = render(<SkeletonCard />);
    const tags = container.querySelectorAll('.skeleton-card__tag');
    expect(tags).toHaveLength(3);
  });

  it('renders skeleton timestamp placeholder', () => {
    const { container } = render(<SkeletonCard />);
    const timestamp = container.querySelector('.skeleton-card__timestamp');
    expect(timestamp).toBeInTheDocument();
  });

  it('renders skeleton reading-time placeholder (matches BlogCard meta)', () => {
    const { container } = render(<SkeletonCard />);
    const readingTime = container.querySelector('.skeleton-card__reading-time');
    expect(readingTime).toBeInTheDocument();
  });

  it('applies correct CSS classes for styling', () => {
    const { container } = render(<SkeletonCard />);
    const skeletonCard = container.querySelector('.skeleton-card');
    expect(skeletonCard).toHaveClass('skeleton-card');
  });

  it('renders content section with proper structure', () => {
    const { container } = render(<SkeletonCard />);
    const content = container.querySelector('.skeleton-card__content');
    expect(content).toBeInTheDocument();
  });

  it('renders footer section with author and tags', () => {
    const { container } = render(<SkeletonCard />);
    const footer = container.querySelector('.skeleton-card__footer');
    expect(footer).toBeInTheDocument();
  });

  it('third excerpt line has short modifier class', () => {
    const { container } = render(<SkeletonCard />);
    const excerptLines = container.querySelectorAll('.skeleton-card__excerpt-line');
    expect(excerptLines[2]).toHaveClass('skeleton-card__excerpt-line--short');
  });
});
