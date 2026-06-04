import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorState from './ErrorState';

describe('ErrorState', () => {
  it('renders error message', () => {
    const message = 'Something went wrong. Please try again.';
    const mockRetry = vi.fn();
    render(<ErrorState message={message} onRetry={mockRetry} />);

    const messageElement = screen.getByText(message);
    expect(messageElement).toBeInTheDocument();
  });

  it('renders retry button', () => {
    const message = 'Something went wrong. Please try again.';
    const mockRetry = vi.fn();
    render(<ErrorState message={message} onRetry={mockRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const message = 'Something went wrong. Please try again.';
    const mockRetry = vi.fn();
    render(<ErrorState message={message} onRetry={mockRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('calls onRetry multiple times when button clicked multiple times', () => {
    const message = 'Something went wrong. Please try again.';
    const mockRetry = vi.fn();
    render(<ErrorState message={message} onRetry={mockRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    fireEvent.click(retryButton);
    fireEvent.click(retryButton);

    expect(mockRetry).toHaveBeenCalledTimes(3);
  });

  it('renders with custom error message', () => {
    const customMessage = 'Network error occurred.';
    const mockRetry = vi.fn();
    render(<ErrorState message={customMessage} onRetry={mockRetry} />);

    const messageElement = screen.getByText(customMessage);
    expect(messageElement).toBeInTheDocument();
  });

  it('applies correct CSS class to container', () => {
    const message = 'Something went wrong. Please try again.';
    const mockRetry = vi.fn();
    const { container } = render(<ErrorState message={message} onRetry={mockRetry} />);

    const errorStateDiv = container.querySelector('.error-state');
    expect(errorStateDiv).toBeInTheDocument();
  });

  it('applies correct CSS class to message', () => {
    const message = 'Something went wrong. Please try again.';
    const mockRetry = vi.fn();
    render(<ErrorState message={message} onRetry={mockRetry} />);

    const messageElement = screen.getByText(message);
    expect(messageElement).toHaveClass('error-state__message');
  });

  it('applies correct CSS class to retry button', () => {
    const message = 'Something went wrong. Please try again.';
    const mockRetry = vi.fn();
    render(<ErrorState message={message} onRetry={mockRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toHaveClass('error-state__retry-button');
  });

  it('renders message and button inside content wrapper', () => {
    const message = 'Something went wrong. Please try again.';
    const mockRetry = vi.fn();
    const { container } = render(<ErrorState message={message} onRetry={mockRetry} />);

    const contentDiv = container.querySelector('.error-state__content');
    expect(contentDiv).toBeInTheDocument();
    expect(contentDiv).toContainElement(screen.getByText(message));
    expect(contentDiv).toContainElement(screen.getByRole('button', { name: /retry/i }));
  });
});
