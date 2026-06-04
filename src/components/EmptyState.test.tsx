import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('renders empty state message', () => {
    const message = 'No posts yet. Check back soon.';
    render(<EmptyState message={message} />);

    const messageElement = screen.getByText(message);
    expect(messageElement).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const customMessage = 'No results found.';
    render(<EmptyState message={customMessage} />);

    const messageElement = screen.getByText(customMessage);
    expect(messageElement).toBeInTheDocument();
  });

  it('applies correct CSS class to container', () => {
    const message = 'No posts yet. Check back soon.';
    const { container } = render(<EmptyState message={message} />);

    const emptyStateDiv = container.querySelector('.empty-state');
    expect(emptyStateDiv).toBeInTheDocument();
  });

  it('applies correct CSS class to message', () => {
    const message = 'No posts yet. Check back soon.';
    render(<EmptyState message={message} />);

    const messageElement = screen.getByText(message);
    expect(messageElement).toHaveClass('empty-state__message');
  });

  it('renders message inside content wrapper', () => {
    const message = 'No posts yet. Check back soon.';
    const { container } = render(<EmptyState message={message} />);

    const contentDiv = container.querySelector('.empty-state__content');
    expect(contentDiv).toBeInTheDocument();
    expect(contentDiv).toContainElement(screen.getByText(message));
  });
});
