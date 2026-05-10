import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorState from './ErrorState';

describe('ErrorState', () => {
  test('renders error message', () => {
    const message = 'Something went wrong. Please try again.';
    const mockRetry = jest.fn();
    render(<ErrorState message={message} onRetry={mockRetry} />);

    const messageElement = screen.getByText(message);
    expect(messageElement).toBeInTheDocument();
  });

  test('renders retry button', () => {
    const message = 'Something went wrong. Please try again.';
    const mockRetry = jest.fn();
    render(<ErrorState message={message} onRetry={mockRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  test('calls onRetry when retry button is clicked', () => {
    const message = 'Something went wrong. Please try again.';
    const mockRetry = jest.fn();
    render(<ErrorState message={message} onRetry={mockRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  test('calls onRetry multiple times when button clicked multiple times', () => {
    const message = 'Something went wrong. Please try again.';
    const mockRetry = jest.fn();
    render(<ErrorState message={message} onRetry={mockRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    fireEvent.click(retryButton);
    fireEvent.click(retryButton);

    expect(mockRetry).toHaveBeenCalledTimes(3);
  });

  test('renders with custom error message', () => {
    const customMessage = 'Network error occurred.';
    const mockRetry = jest.fn();
    render(<ErrorState message={customMessage} onRetry={mockRetry} />);

    const messageElement = screen.getByText(customMessage);
    expect(messageElement).toBeInTheDocument();
  });

  test('applies correct CSS class to container', () => {
    const message = 'Something went wrong. Please try again.';
    const mockRetry = jest.fn();
    const { container } = render(<ErrorState message={message} onRetry={mockRetry} />);

    const errorStateDiv = container.querySelector('.error-state');
    expect(errorStateDiv).toBeInTheDocument();
  });

  test('applies correct CSS class to message', () => {
    const message = 'Something went wrong. Please try again.';
    const mockRetry = jest.fn();
    render(<ErrorState message={message} onRetry={mockRetry} />);

    const messageElement = screen.getByText(message);
    expect(messageElement).toHaveClass('error-state__message');
  });

  test('applies correct CSS class to retry button', () => {
    const message = 'Something went wrong. Please try again.';
    const mockRetry = jest.fn();
    render(<ErrorState message={message} onRetry={mockRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toHaveClass('error-state__retry-button');
  });

  test('renders message and button inside content wrapper', () => {
    const message = 'Something went wrong. Please try again.';
    const mockRetry = jest.fn();
    const { container } = render(<ErrorState message={message} onRetry={mockRetry} />);

    const contentDiv = container.querySelector('.error-state__content');
    expect(contentDiv).toBeInTheDocument();
    expect(contentDiv).toContainElement(screen.getByText(message));
    expect(contentDiv).toContainElement(screen.getByRole('button', { name: /retry/i }));
  });
});
