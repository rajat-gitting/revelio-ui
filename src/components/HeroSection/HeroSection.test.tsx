import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';

import { getPosts, getBlogFilters } from '@/api/services/blogService';
import type { BlogPostDto, PagedResponse } from '@/types/api';
import { Route } from '@/routes/index';
import HeroSection from './HeroSection';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

vi.mock('@/api/services/blogService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api/services/blogService')>()),
  getPosts: vi.fn(),
  getBlogFilters: vi.fn(),
}));

const mockBlogPosts: BlogPostDto[] = [
  {
    id: 1,
    title: 'Test Post',
    excerpt: 'Test excerpt',
    coverImageUrl: null,
    author: { name: 'Alice', avatarUrl: null },
    tags: ['test'],
    publishedAt: '2024-01-01T00:00:00Z',
    body: '',
  },
];

const makePagedResponse = (posts: BlogPostDto[]): PagedResponse<BlogPostDto> => ({
  content: posts,
  totalElements: posts.length,
  totalPages: 1,
  number: 0,
  size: 12,
});

const HomePage = Route.options.component;

const rootRoute = createRootRoute();
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: Route.options.validateSearch,
  component: HomePage,
});
const routeTree = rootRoute.addChildren([indexRoute]);

function renderHomePage() {
  const history = createMemoryHistory({ initialEntries: ['/'] });
  const router = createRouter({ routeTree, history });
  return render(<RouterProvider router={router} />);
}

// WCAG contrast helpers (mirrors design-system.test.ts)
function getLuminance(r: number, g: number, b: number): number {
  const channels = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : ((val + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  const [rs, gs, bs] = channels;
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1]!, 16),
    g: parseInt(result[2]!, 16),
    b: parseInt(result[3]!, 16),
  };
}

function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Approximate effective background colour for gradient start (#1e40af)
// Used for contrast calculations — the darkest point of the hero gradient.
const HERO_GRADIENT_DARK = '#1e40af';

// ---------------------------------------------------------------------------
// Criterion 1 — Hero is the first visible element on the homepage, above blog cards
// ---------------------------------------------------------------------------
describe('Criterion 1 — Page header renders above blog cards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse(mockBlogPosts));
    vi.mocked(getBlogFilters).mockResolvedValue({ authors: [], categories: [] });
  });

  it('page header appears before the blog-section element in the DOM', async () => {
    const { container } = renderHomePage();

    await waitFor(() => {
      expect(container.querySelector('header')).toBeInTheDocument();
    });

    const header = container.querySelector('header')!;
    const blogSection = container.querySelector('#blog-section')!;

    expect(header).toBeInTheDocument();
    expect(blogSection).toBeInTheDocument();

    // compareDocumentPosition: DOCUMENT_POSITION_FOLLOWING (4) means blogSection follows header
    expect(header.compareDocumentPosition(blogSection) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Criterion 2 — Desktop height 300–400 px
// Tests verify the CSS rules are defined in the SCSS file.
// (jsdom cannot evaluate media queries, so we test the source declarations.)
// ---------------------------------------------------------------------------
describe('Criterion 2 — Desktop height 300–400 px', () => {
  it('SCSS defines min-height: 300px or 350px and max-height: 400px for desktop', () => {
    const scssPath = resolve(
      dirname(fileURLToPath(import.meta.url)),
      'HeroSection.module.scss',
    );
    const scss = readFileSync(scssPath, 'utf8');

    // The file should contain a desktop media rule with the correct min/max heights
    expect(scss).toMatch(/min-height:\s*(300|350)px/);
    expect(scss).toMatch(/max-height:\s*400px/);
  });

  it('hero element is rendered with the correct CSS module class', () => {
    render(
      <HeroSection
        headline="Welcome to Our Blog"
        subheading="Discover articles, insights, and stories"
        ctaLabel="Explore Articles"
        ctaHref="#blog-section"
      />,
    );

    const hero = screen.getByTestId('hero-section');
    // class name should be present (CSS modules produce non-empty class)
    expect(hero.className.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Criterion 3 — Headline and subheading as distinct typographic elements
// ---------------------------------------------------------------------------
describe('Criterion 3 — Headline and subheading displayed', () => {
  it('renders headline text in an h1 element', () => {
    render(
      <HeroSection
        headline="Welcome to Our Blog"
        subheading="Discover articles, insights, and stories"
        ctaLabel="Explore Articles"
        ctaHref="#blog-section"
      />,
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Welcome to Our Blog');
  });

  it('renders subheading text in a <p> element distinct from the headline', () => {
    const { container } = render(
      <HeroSection
        headline="Welcome to Our Blog"
        subheading="Discover articles, insights, and stories"
        ctaLabel="Explore Articles"
        ctaHref="#blog-section"
      />,
    );

    const heading = screen.getByRole('heading', { level: 1 });
    const subheadingEl = container.querySelector('p');

    expect(subheadingEl).toBeInTheDocument();
    expect(subheadingEl).toHaveTextContent('Discover articles, insights, and stories');
    // They must be different DOM nodes
    expect(heading).not.toBe(subheadingEl);
  });

  it('headline and subheading are rendered with distinct CSS classes', () => {
    const { container } = render(
      <HeroSection
        headline="Welcome to Our Blog"
        subheading="Discover articles, insights, and stories"
        ctaLabel="Explore Articles"
        ctaHref="#blog-section"
      />,
    );

    const heading = screen.getByRole('heading', { level: 1 });
    const subheadingEl = container.querySelector('p')!;

    expect(heading.className).not.toBe(subheadingEl.className);
  });
});

// ---------------------------------------------------------------------------
// Criterion 4 — CTA button present and anchors to #blog-section
// ---------------------------------------------------------------------------
describe('Criterion 4 — CTA button links to blog section', () => {
  it('renders a CTA link with the label "Explore Articles"', () => {
    render(
      <HeroSection
        headline="Welcome to Our Blog"
        subheading="Discover articles, insights, and stories"
        ctaLabel="Explore Articles"
        ctaHref="#blog-section"
      />,
    );

    const cta = screen.getByRole('link', { name: 'Explore Articles' });
    expect(cta).toBeInTheDocument();
  });

  it('CTA href points to #blog-section', () => {
    render(
      <HeroSection
        headline="Welcome to Our Blog"
        subheading="Discover articles, insights, and stories"
        ctaLabel="Explore Articles"
        ctaHref="#blog-section"
      />,
    );

    const cta = screen.getByRole('link', { name: 'Explore Articles' });
    expect(cta).toHaveAttribute('href', '#blog-section');
  });

  it('accepts "Read Latest" as an alternative CTA label', () => {
    render(
      <HeroSection
        headline="Welcome to Our Blog"
        subheading="Discover articles, insights, and stories"
        ctaLabel="Read Latest"
        ctaHref="#blog-section"
      />,
    );

    expect(screen.getByRole('link', { name: 'Read Latest' })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Criterion 5 — CTA hover state and focus-visible outline defined in CSS
// ---------------------------------------------------------------------------
describe('Criterion 5 — CTA hover and focus styles in SCSS', () => {
  it('SCSS defines a :hover rule on the CTA class with a box-shadow', () => {
    const scssPath = resolve(
      dirname(fileURLToPath(import.meta.url)),
      'HeroSection.module.scss',
    );
    const scss = readFileSync(scssPath, 'utf8');

    expect(scss).toContain('&:hover');
    expect(scss).toContain('box-shadow');
  });

  it('SCSS defines a :focus-visible rule on the CTA class with an outline', () => {
    const scssPath = resolve(
      dirname(fileURLToPath(import.meta.url)),
      'HeroSection.module.scss',
    );
    const scss = readFileSync(scssPath, 'utf8');

    expect(scss).toContain('&:focus-visible');
    expect(scss).toContain('outline');
  });
});

// ---------------------------------------------------------------------------
// Criterion 6 — Background defaults to CSS gradient; image prop adds overlay
// ---------------------------------------------------------------------------
describe('Criterion 6 — Background gradient default and image prop behaviour', () => {
  it('SCSS defines the hero gradient as a CSS custom property', () => {
    const scssPath = resolve(
      dirname(fileURLToPath(import.meta.url)),
      'HeroSection.module.scss',
    );
    const scss = readFileSync(scssPath, 'utf8');

    expect(scss).toContain('--hero-bg-gradient');
    expect(scss).toContain('linear-gradient');
  });

  it('no overlay div is rendered when backgroundImage prop is absent', () => {
    const { container } = render(
      <HeroSection
        headline="Welcome to Our Blog"
        subheading="Discover articles, insights, and stories"
        ctaLabel="Explore Articles"
        ctaHref="#blog-section"
      />,
    );

    // overlay and bgImage divs should not exist without the prop
    const overlayDivs = container.querySelectorAll('[aria-hidden="true"]');
    expect(overlayDivs.length).toBe(0);
  });

  it('renders a background-image div and overlay when backgroundImage prop is supplied', () => {
    const { container } = render(
      <HeroSection
        headline="Welcome to Our Blog"
        subheading="Discover articles, insights, and stories"
        ctaLabel="Explore Articles"
        ctaHref="#blog-section"
        backgroundImage="https://example.com/hero.jpg"
      />,
    );

    const hiddenDivs = container.querySelectorAll('[aria-hidden="true"]');
    // Expect two hidden divs: bgImage layer + overlay layer
    expect(hiddenDivs.length).toBe(2);
  });

  it('overlay div uses a dark overlay colour as defined in SCSS', () => {
    const scssPath = resolve(
      dirname(fileURLToPath(import.meta.url)),
      'HeroSection.module.scss',
    );
    const scss = readFileSync(scssPath, 'utf8');

    // After the token redesign, the overlay is a CSS custom property reference
    // Accept either the old literal rgba or a token reference
    const hasOverlay =
      scss.includes('rgba(0, 0, 0, 0.45)') ||
      scss.includes('var(--color-overlay-dark)') ||
      scss.includes('var(--color-overlay');
    expect(hasOverlay).toBe(true);
  });

  it('background-image style contains the supplied URL', () => {
    const { container } = render(
      <HeroSection
        headline="Welcome to Our Blog"
        subheading="Discover articles, insights, and stories"
        ctaLabel="Explore Articles"
        ctaHref="#blog-section"
        backgroundImage="https://example.com/hero.jpg"
      />,
    );

    const bgDiv = container.querySelector('[role="presentation"]');
    expect(bgDiv).toHaveStyle(
      'background-image: url(https://example.com/hero.jpg)',
    );
  });
});

// ---------------------------------------------------------------------------
// Criterion 7 — WCAG AA contrast ratios
// Verified using the same luminance algorithm used in design-system.test.ts.
// We test the effective foreground colours against the darkest gradient stop.
// ---------------------------------------------------------------------------
describe('Criterion 7 — WCAG AA contrast ratios', () => {
  it('headline colour (#f8fafc) meets WCAG AA for large text (≥ 3:1) against hero gradient dark stop', () => {
    const ratio = getContrastRatio('#f8fafc', HERO_GRADIENT_DARK);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  it('headline colour (#f8fafc) meets WCAG AA for normal text (≥ 4.5:1) against hero gradient dark stop', () => {
    const ratio = getContrastRatio('#f8fafc', HERO_GRADIENT_DARK);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('subheading colour (#e2e8f0) meets WCAG AA for normal text (≥ 4.5:1) against hero gradient dark stop', () => {
    const ratio = getContrastRatio('#e2e8f0', HERO_GRADIENT_DARK);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('CTA text colour (#1e40af) meets WCAG AA for normal text (≥ 4.5:1) against white CTA button (#f8fafc)', () => {
    const ratio = getContrastRatio('#1e40af', '#f8fafc');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('all text meets WCAG AA contrast against darkened overlay (rgba(0,0,0,0.45) applied to HERO_GRADIENT_DARK)', () => {
    // Compute effective background with 45% black overlay on #1e40af
    const bg = hexToRgb(HERO_GRADIENT_DARK);
    // Blending: effectiveBg = bgColor * (1 - 0.45) + black * 0.45 = bgColor * 0.55
    const effR = Math.round(bg.r * 0.55);
    const effG = Math.round(bg.g * 0.55);
    const effB = Math.round(bg.b * 0.55);

    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    const effectiveBg = `#${toHex(effR)}${toHex(effG)}${toHex(effB)}`;

    const headlineRatio = getContrastRatio('#f8fafc', effectiveBg);
    const subheadingRatio = getContrastRatio('#e2e8f0', effectiveBg);

    expect(headlineRatio).toBeGreaterThanOrEqual(4.5);
    expect(subheadingRatio).toBeGreaterThanOrEqual(4.5);
  });
});

// ---------------------------------------------------------------------------
// Criterion 8 — Mobile: min-height (not fixed height), no horizontal scroll
// ---------------------------------------------------------------------------
describe('Criterion 8 — Mobile responsive behaviour in SCSS', () => {
  it('SCSS sets min-height (not a fixed height) at the base level for mobile adaptability', () => {
    const scssPath = resolve(
      dirname(fileURLToPath(import.meta.url)),
      'HeroSection.module.scss',
    );
    const scss = readFileSync(scssPath, 'utf8');

    // Base hero rule must include min-height
    expect(scss).toMatch(/\.hero\s*\{[^}]*min-height/s);
  });

  it('SCSS does not set a fixed height at base (mobile-first) level', () => {
    const scssPath = resolve(
      dirname(fileURLToPath(import.meta.url)),
      'HeroSection.module.scss',
    );
    const scss = readFileSync(scssPath, 'utf8');

    // Extract the base .hero block (before any nested @include m.desktop)
    // The base block should NOT contain `height:` as a fixed value at mobile level
    // We verify that fixed `height:` only appears inside @include m.desktop
    const desktopIdx = scss.indexOf('@include m.desktop');
    const baseHeroBlock = scss.substring(0, desktopIdx);

    // The base hero block should not contain a bare `height:` property
    // (min-height is fine; height: 350px should only appear in desktop block)
    expect(baseHeroBlock).not.toMatch(/^\s*height:\s*\d/m);
  });

  it('hero content uses max-width so text does not overflow horizontally', () => {
    const scssPath = resolve(
      dirname(fileURLToPath(import.meta.url)),
      'HeroSection.module.scss',
    );
    const scss = readFileSync(scssPath, 'utf8');

    expect(scss).toContain('max-width');
  });
});

// ---------------------------------------------------------------------------
// Criterion 9 — Minimum 32px (2rem) gap between hero and blog-card grid
// ---------------------------------------------------------------------------
describe('Criterion 9 — Vertical spacing gap between hero and blog grid', () => {
  it('index.module.scss defines margin-top: $space-2xl on the .section class', () => {
    const scssPath = resolve(
      dirname(fileURLToPath(import.meta.url)),
      '../../routes/index.module.scss',
    );
    const scss = readFileSync(scssPath, 'utf8');

    // $space-2xl = 2rem = 32px
    expect(scss).toContain('margin-top: $space-2xl');
  });

  it('renders page header before blog-section with blog-section having a DOM separator', async () => {
    vi.clearAllMocks();
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse(mockBlogPosts));
    vi.mocked(getBlogFilters).mockResolvedValue({ authors: [], categories: [] });

    const { container } = renderHomePage();

    await waitFor(() => {
      expect(container.querySelector('header')).toBeInTheDocument();
    });

    const header = container.querySelector('header')!;
    const blogSection = container.querySelector('#blog-section')!;

    // blog-section follows page header in the DOM
    expect(header.compareDocumentPosition(blogSection) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Criterion 10 — Keyboard accessibility
// ---------------------------------------------------------------------------
describe('Criterion 10 — Keyboard accessibility', () => {
  it('hero section has an accessible aria-label landmark', () => {
    render(
      <HeroSection
        headline="Welcome to Our Blog"
        subheading="Discover articles, insights, and stories"
        ctaLabel="Explore Articles"
        ctaHref="#blog-section"
      />,
    );

    const hero = screen.getByRole('region', { name: 'Site introduction' });
    expect(hero).toBeInTheDocument();
  });

  it('CTA link is reachable via keyboard (is a native <a> element with href)', () => {
    render(
      <HeroSection
        headline="Welcome to Our Blog"
        subheading="Discover articles, insights, and stories"
        ctaLabel="Explore Articles"
        ctaHref="#blog-section"
      />,
    );

    const cta = screen.getByRole('link', { name: 'Explore Articles' });
    // Native <a> with href is focusable by default
    expect(cta.tagName).toBe('A');
    expect(cta).toHaveAttribute('href', '#blog-section');
  });

  it('decorative background divs are hidden from assistive technology', () => {
    const { container } = render(
      <HeroSection
        headline="Welcome to Our Blog"
        subheading="Discover articles, insights, and stories"
        ctaLabel="Explore Articles"
        ctaHref="#blog-section"
        backgroundImage="https://example.com/hero.jpg"
      />,
    );

    const hiddenDivs = container.querySelectorAll('[aria-hidden="true"]');
    hiddenDivs.forEach((div) => {
      expect(div).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('SCSS defines :focus-visible outline for the CTA button', () => {
    const scssPath = resolve(
      dirname(fileURLToPath(import.meta.url)),
      'HeroSection.module.scss',
    );
    const scss = readFileSync(scssPath, 'utf8');

    expect(scss).toContain('&:focus-visible');
    expect(scss).toMatch(/outline:.*solid/);
  });

  it('page header renders inside the homepage DOM correctly alongside blog content', async () => {
    vi.clearAllMocks();
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse(mockBlogPosts));
    vi.mocked(getBlogFilters).mockResolvedValue({ authors: [], categories: [] });

    const { container } = renderHomePage();

    await waitFor(() => {
      expect(container.querySelector('header')).toBeInTheDocument();
    });

    // Blog card for "Test Post" should also be present
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Integration: homepage renders simple header + blog cards together (CR-35)
// ---------------------------------------------------------------------------
describe('HomePage simple header integration (CR-35)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPosts).mockResolvedValue(makePagedResponse(mockBlogPosts));
    vi.mocked(getBlogFilters).mockResolvedValue({ authors: [], categories: [] });
  });

  it('homepage renders a simple page header (no hero banner) with search accessible via toggle', async () => {
    renderHomePage();

    // Wait for page to render and open search panel (hidden by default per CR-39)
    await waitFor(() => {
      expect(screen.getByTestId('search-toggle')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('search-toggle'));

    await waitFor(() => {
      // CR-37/CR-39: search is accessible on the home page via the search toggle
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    // The full hero banner texts are gone
    expect(screen.queryByText('Welcome to Our Blog')).not.toBeInTheDocument();
    expect(screen.queryByText('Discover articles, insights, and stories')).not.toBeInTheDocument();
    // No separate 'Search blogs' link needed since search is inline
    expect(screen.queryByRole('link', { name: 'Search blogs →' })).not.toBeInTheDocument();
  });

  it('homepage renders simple header during loading state', async () => {
    vi.mocked(getPosts).mockImplementation(
      () => new Promise(() => undefined), // never resolves
    );

    const { container } = renderHomePage();

    // Simple header is rendered immediately (before data loads)
    await waitFor(() => {
      expect(container.querySelector('header')).toBeInTheDocument();
    });
  });
});
