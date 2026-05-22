import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Logo from '@/components/Logo/Logo';

describe('Logo', () => {
  it('renders the wordmark text', () => {
    render(<Logo />);
    expect(screen.getByText('Revelio')).toBeInTheDocument();
  });

  it('renders with accessible label', () => {
    render(<Logo />);
    expect(screen.getByLabelText('Revelio home')).toBeInTheDocument();
  });

  it('hides the decorative icon from assistive technology', () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
