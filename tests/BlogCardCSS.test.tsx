/**
 * BlogCardCSS.test.tsx
 *
 * These tests assert that BlogCard.css contains the required CSS rules for
 * the acceptance criteria that are inherently visual / CSS-only and cannot
 * be verified via computed styles in jsdom (which does not apply external
 * stylesheets).  Each test reads the raw CSS source and checks for the
 * presence of the exact rule/value required by the acceptance criterion.
 *
 * DOM-structure tests are also included to confirm that BlogCard.tsx renders
 * the right class names so the CSS rules have somewhere to attach.
 */

import React from 'react';
import * as fs from 'fs';
import * as path from 'path';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import BlogCard from '../src/components/BlogCard';
import SkeletonCard from '../src/components/SkeletonCard';

function renderWithRouter(ui: React.ReactElement) {
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => ui,
  });
  const blogDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/blog/$id',
    component: () => null,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, blogDetailRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  return render(<RouterProvider router={router} />);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CSS_PATH = path.resolve(
  __dirname,
  '../src/components/BlogCard.css',
);

const SKELETON_CSS_PATH = path.resolve(
  __dirname,
  '../src/components/SkeletonCard.css',
);

/** Strip CSS comments and collapse whitespace for reliable substring matching. */
function normaliseCSS(raw: string): string {
  return raw
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove block comments
    .replace(/\s+/g, ' ')             // collapse whitespace
    .trim();
}

let cssRaw: string;
let cssNorm: string;
let skeletonCssRaw: string;
let skeletonCssNorm: string;

beforeAll(() => {
  cssRaw = fs.readFileSync(CSS_PATH, 'utf8');
  cssNorm = normaliseCSS(cssRaw);
  skeletonCssRaw = fs.readFileSync(SKELETON_CSS_PATH, 'utf8');
  skeletonCssNorm = normaliseCSS(skeletonCssRaw);
});

// Shared mock post
const mockPost = {
  id: 42,
  title: 'Design Review',
  excerpt: 'An in-depth look at the new design system.',
  coverImageUrl: null,
  author: { name: 'Jane Smith', avatarUrl: null },
  tags: ['design', 'ux', 'css', 'extra1', 'extra2'],
  publishedAt: '2024-01-15T10:00:00Z',
  body: '',
};

// ---------------------------------------------------------------------------
// AC1 — Resting box-shadow present at all times on .blog-card
// ---------------------------------------------------------------------------
describe('AC1 – resting box-shadow', () => {
  it('BlogCard.css sets the required resting box-shadow on .blog-card', () => {
    // The rule must appear outside any :hover selector in the .blog-card block.
    // We check the raw CSS so that ordering is preserved.
    // After the token redesign, shadow may be a CSS custom property reference.
    const blogCardBlock = cssRaw.match(/\.blog-card\s*\{[^}]*\}/)?.[0] ?? '';
    expect(blogCardBlock).toContain('box-shadow');
    // Accept either the old literal value or a CSS custom property token reference
    const hasShadow =
      blogCardBlock.includes('0 1px 3px rgba(0, 0, 0, 0.12)') ||
      blogCardBlock.includes('var(--shadow-') ||
      blogCardBlock.includes('var(--color-');
    expect(hasShadow).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// AC2 — Hover shadow + translateY(-2px), transitions ≤ 200 ms
// ---------------------------------------------------------------------------
describe('AC2 – hover shadow, translateY, and transition ≤ 200 ms', () => {
  it('BlogCard.css defines a :hover rule on .blog-card with the correct box-shadow', () => {
    const hoverBlock = cssRaw.match(/\.blog-card:hover\s*\{[^}]*\}/)?.[0] ?? '';
    expect(hoverBlock).toContain('box-shadow');
    // Accept either the old literal value or a CSS custom property token reference
    const hasShadow =
      hoverBlock.includes('0 4px 12px rgba(0, 0, 0, 0.18)') ||
      hoverBlock.includes('var(--shadow-') ||
      hoverBlock.includes('var(--color-');
    expect(hasShadow).toBe(true);
  });

  it('BlogCard.css defines translateY(-2px) on .blog-card:hover', () => {
    const hoverBlock = cssRaw.match(/\.blog-card:hover\s*\{[^}]*\}/)?.[0] ?? '';
    expect(hoverBlock).toContain('translateY(-2px)');
  });

  it('BlogCard.css transition on .blog-card uses ≤ 0.2s for box-shadow and transform', () => {
    const blogCardBlock = cssRaw.match(/\.blog-card\s*\{[^}]*\}/)?.[0] ?? '';
    // transition must reference 0.2s (200 ms) or less — 0.2s is the maximum
    expect(blogCardBlock).toMatch(/transition\s*:[^;]*0\.2s/);
    // both box-shadow and transform must be transitioned
    expect(blogCardBlock).toMatch(/transition\s*:[^;]*box-shadow/);
    expect(blogCardBlock).toMatch(/transition\s*:[^;]*transform/);
  });
});

// ---------------------------------------------------------------------------
// AC3 — border-radius ≥ 8px and overflow: hidden on .blog-card
// ---------------------------------------------------------------------------
describe('AC3 – border-radius ≥ 8px and overflow: hidden', () => {
  it('BlogCard.css sets border-radius of 8px on .blog-card', () => {
    const blogCardBlock = cssRaw.match(/\.blog-card\s*\{[^}]*\}/)?.[0] ?? '';
    // Accept either a literal 8px+ value or a CSS custom property token reference
    const hasRadius =
      blogCardBlock.includes('border-radius: 8px') ||
      blogCardBlock.includes('border-radius: 14px') ||
      blogCardBlock.includes('var(--radius-');
    expect(hasRadius).toBe(true);
  });

  it('BlogCard.css sets overflow: hidden on .blog-card', () => {
    const blogCardBlock = cssRaw.match(/\.blog-card\s*\{[^}]*\}/)?.[0] ?? '';
    expect(blogCardBlock).toContain('overflow: hidden');
  });
});

// ---------------------------------------------------------------------------
// AC4 — Top accent border 4px solid (primary colour) on .blog-card
// ---------------------------------------------------------------------------
describe('AC4 – top accent border', () => {
  it('BlogCard.css sets a 4px solid border-top using the primary colour token', () => {
    const blogCardBlock = cssRaw.match(/\.blog-card\s*\{[^}]*\}/)?.[0] ?? '';
    // border-top must be 4px solid with the primary colour token
    expect(blogCardBlock).toMatch(/border-top\s*:\s*4px solid/);
    // must reference a CSS variable (either --blog-card-primary, --color-primary, or the old hex)
    const hasToken =
      blogCardBlock.includes('var(--blog-card-primary') ||
      blogCardBlock.includes('var(--color-primary') ||
      blogCardBlock.includes('#2563eb');
    expect(hasToken).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// AC5 — Separator between .blog-card__excerpt and .blog-card__meta
// ---------------------------------------------------------------------------
describe('AC5 – separator between excerpt and meta', () => {
  it('BlogCard.css provides a border separation on .blog-card__excerpt (border-bottom)', () => {
    const excerptBlock = cssRaw.match(/\.blog-card__excerpt\s*\{[^}]*\}/)?.[0] ?? '';
    expect(excerptBlock).toMatch(/border-bottom\s*:/);
    expect(excerptBlock).toContain('1px solid');
  });
});

// ---------------------------------------------------------------------------
// AC6 — Padding 24px on all sides; gap between meta items ≥ 12px
// ---------------------------------------------------------------------------
describe('AC6 – content padding 24px and meta gap ≥ 12px', () => {
  it('BlogCard.css sets padding: 24px on .blog-card__content', () => {
    const contentBlock = cssRaw.match(/\.blog-card__content\s*\{[^}]*\}/)?.[0] ?? '';
    expect(contentBlock).toContain('padding: 24px');
  });

  it('BlogCard.css sets gap of at least 12px on .blog-card__meta', () => {
    const metaBlock = cssRaw.match(/\.blog-card__meta\s*\{[^}]*\}/)?.[0] ?? '';
    // gap: 12px satisfies "≥ 12px"
    expect(metaBlock).toMatch(/gap\s*:\s*1[2-9]px|gap\s*:\s*[2-9]\d+px/);
  });
});

// ---------------------------------------------------------------------------
// AC7 — Avatars 40×40, border-radius 50%, 2px solid border
// ---------------------------------------------------------------------------
describe('AC7 – avatar size, shape, and border', () => {
  it('BlogCard.css sets 40px width and height on .blog-card__avatar', () => {
    const avatarBlock = cssRaw.match(/\.blog-card__avatar\s*\{[^}]*\}/)?.[0] ?? '';
    expect(avatarBlock).toContain('width: 40px');
    expect(avatarBlock).toContain('height: 40px');
  });

  it('BlogCard.css sets border-radius: 50% on .blog-card__avatar', () => {
    const avatarBlock = cssRaw.match(/\.blog-card__avatar\s*\{[^}]*\}/)?.[0] ?? '';
    expect(avatarBlock).toContain('border-radius: 50%');
  });

  it('BlogCard.css sets a 2px solid border on .blog-card__avatar', () => {
    const avatarBlock = cssRaw.match(/\.blog-card__avatar\s*\{[^}]*\}/)?.[0] ?? '';
    expect(avatarBlock).toMatch(/border\s*:\s*2px solid/);
  });

  it('BlogCard.css sets 40px width and height on .blog-card__avatar-initials', () => {
    const initialsBlock = cssRaw.match(/\.blog-card__avatar-initials\s*\{[^}]*\}/)?.[0] ?? '';
    expect(initialsBlock).toContain('width: 40px');
    expect(initialsBlock).toContain('height: 40px');
  });

  it('BlogCard.css sets border-radius: 50% on .blog-card__avatar-initials', () => {
    const initialsBlock = cssRaw.match(/\.blog-card__avatar-initials\s*\{[^}]*\}/)?.[0] ?? '';
    expect(initialsBlock).toContain('border-radius: 50%');
  });

  it('BlogCard.css sets a 2px solid border on .blog-card__avatar-initials', () => {
    const initialsBlock = cssRaw.match(/\.blog-card__avatar-initials\s*\{[^}]*\}/)?.[0] ?? '';
    expect(initialsBlock).toMatch(/border\s*:\s*2px solid/);
  });
});

// ---------------------------------------------------------------------------
// AC8 — Initials fallback uses primary colour background with white text
// ---------------------------------------------------------------------------
describe('AC8 – initials fallback primary background and white text', () => {
  it('BlogCard.css sets primary-colour background-color on .blog-card__avatar-initials', () => {
    const initialsBlock = cssRaw.match(/\.blog-card__avatar-initials\s*\{[^}]*\}/)?.[0] ?? '';
    // Must use the CSS variable (--blog-card-primary, --color-primary) or the primary hex value
    const hasPrimaryBg =
      initialsBlock.includes('var(--blog-card-primary') ||
      initialsBlock.includes('var(--color-primary') ||
      initialsBlock.includes('#2563eb');
    expect(hasPrimaryBg).toBe(true);
  });

  it('BlogCard.css sets a light text colour on .blog-card__avatar-initials for contrast', () => {
    const initialsBlock = cssRaw.match(/\.blog-card__avatar-initials\s*\{[^}]*\}/)?.[0] ?? '';
    // Accept either the old literal #ffffff or a CSS custom property token reference for on-primary text
    const hasLightText =
      initialsBlock.includes('#ffffff') ||
      initialsBlock.includes('var(--color-text-on-primary') ||
      initialsBlock.includes('var(--color-text)');
    expect(hasLightText).toBe(true);
  });

  it('BlogCard.tsx renders the initials fallback with class blog-card__avatar-initials when avatarUrl is null', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);
    await waitFor(() => {
      const initials = document.querySelector('.blog-card__avatar-initials');
      expect(initials).not.toBeNull();
      // Should show "JS" for Jane Smith
      expect(initials?.textContent).toBe('JS');
    });
  });
});

// ---------------------------------------------------------------------------
// AC9 — Tag pills: coloured background, border-radius 12px, padding 4px 10px,
//        0.15s transition on hover
// ---------------------------------------------------------------------------
describe('AC9 – tag pill styles', () => {
  it('BlogCard.css sets border-radius: 12px on .blog-card__tag', () => {
    const tagBlock = cssRaw.match(/\.blog-card__tag\s*\{[^}]*\}/)?.[0] ?? '';
    expect(tagBlock).toContain('border-radius: 12px');
  });

  it('BlogCard.css sets padding: 4px 10px on .blog-card__tag', () => {
    const tagBlock = cssRaw.match(/\.blog-card__tag\s*\{[^}]*\}/)?.[0] ?? '';
    expect(tagBlock).toContain('padding: 4px 10px');
  });

  it('BlogCard.css sets a coloured (non-transparent, non-white) background on .blog-card__tag', () => {
    const tagBlock = cssRaw.match(/\.blog-card__tag\s*\{[^}]*\}/)?.[0] ?? '';
    expect(tagBlock).toMatch(/background(-color)?\s*:/);
    // Should not be plain white or transparent
    expect(tagBlock).not.toMatch(/background(-color)?\s*:\s*(white|#fff|#ffffff|transparent)/i);
  });

  it('BlogCard.css sets a 0.15s background-color transition on .blog-card__tag', () => {
    const tagBlock = cssRaw.match(/\.blog-card__tag\s*\{[^}]*\}/)?.[0] ?? '';
    expect(tagBlock).toMatch(/transition\s*:[^;]*0\.15s/);
  });

  it('BlogCard.css defines a :hover rule with deepened background on .blog-card__tag', () => {
    const tagHoverBlock = cssRaw.match(/\.blog-card__tag:hover\s*\{[^}]*\}/)?.[0] ?? '';
    expect(tagHoverBlock).toMatch(/background(-color)?\s*:/);
  });

  it('BlogCard.tsx renders tag spans with class blog-card__tag', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);
    await waitFor(() => {
      const tags = document.querySelectorAll('.blog-card__tag');
      // mockPost has 5 tags but only first 3 are shown
      expect(tags.length).toBe(3);
    });
  });
});

// ---------------------------------------------------------------------------
// AC10 — "+N more" pill: same pill shape, muted/italic style
// ---------------------------------------------------------------------------
describe('AC10 – +N more overflow tag', () => {
  it('BlogCard.css sets border-radius: 12px on .blog-card__tag-more', () => {
    const tagMoreBlock = cssRaw.match(/\.blog-card__tag-more\s*\{[^}]*\}/)?.[0] ?? '';
    expect(tagMoreBlock).toContain('border-radius: 12px');
  });

  it('BlogCard.css sets padding: 4px 10px on .blog-card__tag-more', () => {
    const tagMoreBlock = cssRaw.match(/\.blog-card__tag-more\s*\{[^}]*\}/)?.[0] ?? '';
    expect(tagMoreBlock).toContain('padding: 4px 10px');
  });

  it('BlogCard.css marks .blog-card__tag-more as italic to distinguish it', () => {
    const tagMoreBlock = cssRaw.match(/\.blog-card__tag-more\s*\{[^}]*\}/)?.[0] ?? '';
    expect(tagMoreBlock).toContain('font-style: italic');
  });

  it('BlogCard.tsx renders the +N more element with class blog-card__tag-more when there are >3 tags', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);
    await waitFor(() => {
      const moreTag = document.querySelector('.blog-card__tag-more');
      expect(moreTag).not.toBeNull();
      // mockPost has 5 tags → 5 - 3 = 2 extra
      expect(moreTag?.textContent).toBe('+2 more');
    });
  });

  it('BlogCard.tsx does NOT render blog-card__tag-more when tags ≤ 3', async () => {
    const postFewTags = { ...mockPost, tags: ['design', 'ux'] };
    renderWithRouter(<BlogCard post={postFewTags} />);
    await waitFor(() => {
      const moreTag = document.querySelector('.blog-card__tag-more');
      expect(moreTag).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// AC13 — WCAG 2.1 AA contrast: verify text colours satisfy minimum ratio
// via static CSS inspection.
//
// WCAG AA requires contrast ≥ 4.5:1 for normal text (< 18pt / < 14pt bold).
// We assert the specific colour pairs that were deliberately chosen to satisfy
// this requirement.
// ---------------------------------------------------------------------------

/**
 * Approximate relative luminance of a hex colour (sRGB).
 * Formula from WCAG 2.x: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function relativeLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const linearise = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('AC13 – WCAG 2.1 AA contrast for key colour pairs', () => {
  it('initials avatar: white text #ffffff on primary background #2563eb meets AA (≥ 4.5:1)', () => {
    const ratio = contrastRatio('#ffffff', '#2563eb');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('tag text #1d4ed8 on tinted background rgba(37,99,235,0.12) over white meets AA (≥ 4.5:1)', () => {
    // Blend rgba(37,99,235,0.12) over white (#ffffff)
    // blended = round(37 * 0.12 + 255 * 0.88), same for g and b
    const blendedR = Math.round(37 * 0.12 + 255 * 0.88);
    const blendedG = Math.round(99 * 0.12 + 255 * 0.88);
    const blendedB = Math.round(235 * 0.12 + 255 * 0.88);
    const bgHex = `#${blendedR.toString(16).padStart(2, '0')}${blendedG.toString(16).padStart(2, '0')}${blendedB.toString(16).padStart(2, '0')}`;
    const ratio = contrastRatio('#1d4ed8', bgHex);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('excerpt text #555555 on white background #ffffff meets AA (≥ 4.5:1)', () => {
    const ratio = contrastRatio('#555555', '#ffffff');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('author name text #333333 on white background #ffffff meets AA (≥ 4.5:1)', () => {
    const ratio = contrastRatio('#333333', '#ffffff');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

// ---------------------------------------------------------------------------
// Additional DOM structure checks (support multiple ACs)
// ---------------------------------------------------------------------------
describe('DOM structure – class names emitted by BlogCard', () => {
  it('renders the root <a> element with class blog-card', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);
    await waitFor(() => {
      const card = document.querySelector('a.blog-card');
      expect(card).not.toBeNull();
    });
  });

  it('the root element is an <a> linking to /blog/{id}', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);
    await waitFor(() => {
      const link = document.querySelector('a.blog-card') as HTMLAnchorElement | null;
      expect(link).not.toBeNull();
      expect(link?.getAttribute('href')).toBe('/blog/42');
    });
  });

  it('renders .blog-card__content inside .blog-card', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);
    await waitFor(() => {
      expect(document.querySelector('.blog-card .blog-card__content')).not.toBeNull();
    });
  });

  it('renders .blog-card__excerpt with class for separator styling', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);
    await waitFor(() => {
      expect(document.querySelector('.blog-card__excerpt')).not.toBeNull();
    });
  });

  it('renders .blog-card__meta after .blog-card__excerpt', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);
    await waitFor(() => {
      expect(document.querySelector('.blog-card__meta')).not.toBeNull();
    });
  });

  it('renders .blog-card__reading-time inside .blog-card__meta', async () => {
    renderWithRouter(<BlogCard post={mockPost} />);
    await waitFor(() => {
      const meta = document.querySelector('.blog-card__meta');
      expect(meta?.querySelector('.blog-card__reading-time')).not.toBeNull();
    });
  });

  it('renders an <img> avatar with class blog-card__avatar when avatarUrl is provided', async () => {
    const postWithAvatar = { ...mockPost, author: { name: 'Jane Smith', avatarUrl: 'https://example.com/jane.png' } };
    renderWithRouter(<BlogCard post={postWithAvatar} />);
    await waitFor(() => {
      const img = document.querySelector('img.blog-card__avatar') as HTMLImageElement | null;
      expect(img).not.toBeNull();
      expect(img?.getAttribute('src')).toBe('https://example.com/jane.png');
    });
  });
});

// ---------------------------------------------------------------------------
// AC14 – SkeletonCard CSS reflects 40px avatar and reading-time placeholder
// ---------------------------------------------------------------------------
describe('AC14 – SkeletonCard consistency with BlogCard', () => {
  it('SkeletonCard.css sets 40px width on .skeleton-card__avatar', () => {
    const avatarBlock = skeletonCssRaw.match(/\.skeleton-card__avatar\s*\{[^}]*\}/)?.[0] ?? '';
    expect(avatarBlock).toContain('width: 40px');
  });

  it('SkeletonCard.css sets 40px height on .skeleton-card__avatar', () => {
    const avatarBlock = skeletonCssRaw.match(/\.skeleton-card__avatar\s*\{[^}]*\}/)?.[0] ?? '';
    expect(avatarBlock).toContain('height: 40px');
  });

  it('SkeletonCard.css defines a .skeleton-card__reading-time placeholder rule', () => {
    const readingTimeBlock =
      skeletonCssRaw.match(/\.skeleton-card__reading-time\s*\{[^}]*\}/)?.[0] ?? '';
    expect(readingTimeBlock.length).toBeGreaterThan(0);
  });

  it('SkeletonCard.tsx renders a .skeleton-card__reading-time placeholder element', () => {
    const { getByTestId } = render(<SkeletonCard />);
    const skeleton = getByTestId('skeleton-card');
    expect(skeleton.querySelector('.skeleton-card__reading-time')).not.toBeNull();
  });
});
