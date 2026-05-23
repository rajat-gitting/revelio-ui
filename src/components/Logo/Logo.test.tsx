import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Logo from '@/components/Logo/Logo';

describe('Logo', () => {
  it('renders the default wordmark', () => {
    render(<Logo />);
    expect(screen.getByText('Revelio')).toBeInTheDocument();
  });

  it('exposes an accessible label for assistive tech', () => {
    render(<Logo />);
    expect(screen.getByRole('img', { name: 'Revelio home' })).toBeInTheDocument();
  });

  it('renders an inline SVG icon marked as decorative', () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('supports overriding the label and aria-label', () => {
    render(<Logo label="Revelio Cloud" ariaLabel="Revelio Cloud home" />);
    expect(screen.getByText('Revelio Cloud')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Revelio Cloud home' })).toBeInTheDocument();
  });
});
