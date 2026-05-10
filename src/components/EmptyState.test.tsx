import React from 'react';
import { render, screen } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  test('renders empty state with provided message', () => {
    const message = 'No posts yet. Check back soon.';
    render(<EmptyState message={message} />);

    const emptyStateElement = screen.getByTestId('empty-state');
    expect(emptyStateElement).toBeInTheDocument();

    const messageElement = screen.getByText(message);
    expect(messageElement).toBeInTheDocument();
  });

  test('renders empty state with custom message', () => {
    const customMessage = 'No results found.';
    render(<EmptyState message={customMessage} />);

    const messageElement = screen.getByText(customMessage);
    expect(messageElement).toBeInTheDocument();
  });

  test('applies correct CSS class to container', () => {
    render(<EmptyState message="Test message" />);

    const emptyStateElement = screen.getByTestId('empty-state');
    expect(emptyStateElement).toHaveClass('empty-state');
  });

  test('applies correct CSS class to message', () => {
    render(<EmptyState message="Test message" />);

    const messageElement = screen.getByText('Test message');
    expect(messageElement).toHaveClass('empty-state__message');
  });

  test('renders with empty string message', () => {
    render(<EmptyState message="" />);

    const emptyStateElement = screen.getByTestId('empty-state');
    expect(emptyStateElement).toBeInTheDocument();
  });

  test('renders with long message text', () => {
    const longMessage = 'This is a very long message that should still render correctly in the empty state component without breaking the layout or causing any visual issues.';
    render(<EmptyState message={longMessage} />);

    const messageElement = screen.getByText(longMessage);
    expect(messageElement).toBeInTheDocument();
  });

  test('renders content wrapper with correct class', () => {
    render(<EmptyState message="Test" />);

    const contentElement = screen.getByText('Test').parentElement;
    expect(contentElement).toHaveClass('empty-state__content');
  });
});
