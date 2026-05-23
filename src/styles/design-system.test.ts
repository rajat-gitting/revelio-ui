import { describe, expect, it } from 'vitest';

/**
 * Design System Tests
 *
 * These tests verify that the design tokens (colors, typography) are properly
 * defined and meet accessibility standards.
 */

describe('Design System - Color Palette', () => {
  it('defines primary color tokens', () => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);

    const primary = styles.getPropertyValue('--color-primary').trim();
    const primaryHover = styles.getPropertyValue('--color-primary-hover').trim();
    const primaryLight = styles.getPropertyValue('--color-primary-light').trim();
    const primaryDark = styles.getPropertyValue('--color-primary-dark').trim();

    expect(primary).toBe('#2563eb');
    expect(primaryHover).toBe('#1d4ed8');
    expect(primaryLight).toBe('#3b82f6');
    expect(primaryDark).toBe('#1e40af');
  });

  it('defines secondary color tokens', () => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);

    const secondary = styles.getPropertyValue('--color-secondary').trim();
    const secondaryHover = styles.getPropertyValue('--color-secondary-hover').trim();
    const secondaryLight = styles.getPropertyValue('--color-secondary-light').trim();
    const secondaryDark = styles.getPropertyValue('--color-secondary-dark').trim();

    expect(secondary).toBe('#7c3aed');
    expect(secondaryHover).toBe('#6d28d9');
    expect(secondaryLight).toBe('#8b5cf6');
    expect(secondaryDark).toBe('#5b21b6');
  });

  it('defines accent color tokens', () => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);

    const accent = styles.getPropertyValue('--color-accent').trim();
    const accentHover = styles.getPropertyValue('--color-accent-hover').trim();
    const accentLight = styles.getPropertyValue('--color-accent-light').trim();
    const accentDark = styles.getPropertyValue('--color-accent-dark').trim();

    expect(accent).toBe('#10b981');
    expect(accentHover).toBe('#059669');
    expect(accentLight).toBe('#34d399');
    expect(accentDark).toBe('#047857');
  });

  it('defines background color tokens', () => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);

    const bg = styles.getPropertyValue('--color-bg').trim();
    const bgSecondary = styles.getPropertyValue('--color-bg-secondary').trim();
    const surface = styles.getPropertyValue('--color-surface').trim();
    const surfaceElevated = styles.getPropertyValue('--color-surface-elevated').trim();

    expect(bg).toBe('#0b1120');
    expect(bgSecondary).toBe('#0f172a');
    expect(surface).toBe('#111827');
    expect(surfaceElevated).toBe('#1f2937');
  });

  it('defines text color tokens', () => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);

    const text = styles.getPropertyValue('--color-text').trim();
    const textSecondary = styles.getPropertyValue('--color-text-secondary').trim();
    const textMuted = styles.getPropertyValue('--color-text-muted').trim();
    const textDisabled = styles.getPropertyValue('--color-text-disabled').trim();

    expect(text).toBe('#f8fafc');
    expect(textSecondary).toBe('#e2e8f0');
    expect(textMuted).toBe('#94a3b8');
    expect(textDisabled).toBe('#64748b');
  });

  it('defines border color tokens', () => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);

    const border = styles.getPropertyValue('--color-border').trim();
    const borderLight = styles.getPropertyValue('--color-border-light').trim();
    const borderFocus = styles.getPropertyValue('--color-border-focus').trim();

    expect(border).toBe('#1f2937');
    expect(borderLight).toBe('#334155');
    expect(borderFocus).toBe('#2563eb');
  });

  it('defines semantic color tokens for error', () => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);

    const error = styles.getPropertyValue('--color-error').trim();
    const errorDark = styles.getPropertyValue('--color-error-dark').trim();

    expect(error).toBe('#f87171');
    expect(errorDark).toBe('#dc2626');
  });

  it('defines semantic color tokens for warning', () => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);

    const warning = styles.getPropertyValue('--color-warning').trim();
    const warningDark = styles.getPropertyValue('--color-warning-dark').trim();

    expect(warning).toBe('#fbbf24');
    expect(warningDark).toBe('#f59e0b');
  });

  it('defines semantic color tokens for success', () => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);

    const success = styles.getPropertyValue('--color-success').trim();
    const successDark = styles.getPropertyValue('--color-success-dark').trim();

    expect(success).toBe('#4ade80');
    expect(successDark).toBe('#22c55e');
  });

  it('defines semantic color tokens for info', () => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);

    const info = styles.getPropertyValue('--color-info').trim();
    const infoDark = styles.getPropertyValue('--color-info-dark').trim();

    expect(info).toBe('#60a5fa');
    expect(infoDark).toBe('#3b82f6');
  });
});

describe('Design System - Typography', () => {
  it('defines font family tokens', () => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);

    const fontBase = styles.getPropertyValue('--font-family-base').trim();
    const fontHeading = styles.getPropertyValue('--font-family-heading').trim();
    const fontMono = styles.getPropertyValue('--font-family-mono').trim();

    expect(fontBase).toContain('ui-sans-serif');
    expect(fontHeading).toContain('ui-sans-serif');
    expect(fontMono).toContain('ui-monospace');
  });

  it('defines base font size token', () => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);

    const fontSize = styles.getPropertyValue('--font-size-base').trim();
    expect(fontSize).toBe('1rem');
  });

  it('applies correct body typography', () => {
    const body = document.body;
    const styles = getComputedStyle(body);

    const fontFamily = styles.fontFamily;
    const fontSize = styles.fontSize;
    const fontWeight = styles.fontWeight;
    const lineHeight = styles.lineHeight;
    const color = styles.color;

    expect(fontFamily).toContain('ui-sans-serif');
    expect(fontSize).toBe('16px'); // 1rem
    expect(fontWeight).toBe('400'); // normal
    expect(parseFloat(lineHeight)).toBeGreaterThanOrEqual(24); // line-height: 1.5
    expect(color).toBeTruthy();
  });

  it('applies correct heading typography for h1', () => {
    const h1 = document.createElement('h1');
    h1.textContent = 'Test Heading';
    document.body.appendChild(h1);

    const styles = getComputedStyle(h1);

    expect(styles.fontFamily).toContain('ui-sans-serif');
    expect(styles.fontSize).toBe('36px'); // 2.25rem
    expect(styles.fontWeight).toBe('700'); // bold
    expect(parseFloat(styles.lineHeight)).toBeLessThan(48); // tight line-height

    document.body.removeChild(h1);
  });

  it('applies correct heading typography for h2', () => {
    const h2 = document.createElement('h2');
    h2.textContent = 'Test Heading';
    document.body.appendChild(h2);

    const styles = getComputedStyle(h2);

    expect(styles.fontSize).toBe('30px'); // 1.875rem
    expect(styles.fontWeight).toBe('700');

    document.body.removeChild(h2);
  });

  it('applies correct heading typography for h3', () => {
    const h3 = document.createElement('h3');
    h3.textContent = 'Test Heading';
    document.body.appendChild(h3);

    const styles = getComputedStyle(h3);

    expect(styles.fontSize).toBe('24px'); // 1.5rem
    expect(styles.fontWeight).toBe('700');

    document.body.removeChild(h3);
  });

  it('applies correct paragraph typography', () => {
    const p = document.createElement('p');
    p.textContent = 'Test paragraph';
    document.body.appendChild(p);

    const styles = getComputedStyle(p);

    expect(styles.fontSize).toBe('16px'); // 1rem
    expect(parseFloat(styles.lineHeight)).toBeGreaterThanOrEqual(25); // relaxed line-height

    document.body.removeChild(p);
  });

  it('applies correct small text typography', () => {
    const small = document.createElement('small');
    small.textContent = 'Test small text';
    document.body.appendChild(small);

    const styles = getComputedStyle(small);

    expect(styles.fontSize).toBe('14px'); // 0.875rem

    document.body.removeChild(small);
  });

  it('applies correct code typography', () => {
    const code = document.createElement('code');
    code.textContent = 'const test = true;';
    document.body.appendChild(code);

    const styles = getComputedStyle(code);

    expect(styles.fontFamily).toContain('monospace');
    expect(styles.fontSize).toBe('14px'); // 0.875rem

    document.body.removeChild(code);
  });
});

describe('Design System - Accessibility', () => {
  /**
   * Calculate relative luminance of an RGB color
   * https://www.w3.org/TR/WCAG20-TECHS/G17.html
   */
  function getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      const val = c / 255;
      return val <= 0.03928 ? val / 12.92 : ((val + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calculate contrast ratio between two colors
   * https://www.w3.org/TR/WCAG20-TECHS/G17.html
   */
  function getContrastRatio(hex1: string, hex2: string): number {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);

    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Convert hex color to RGB
   */
  function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  it('primary colors meet WCAG AA contrast ratio on dark background', () => {
    const bgColor = '#0b1120';
    const primary = '#2563eb';
    const primaryLight = '#3b82f6';

    const primaryContrast = getContrastRatio(primary, bgColor);
    const primaryLightContrast = getContrastRatio(primaryLight, bgColor);

    // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
    expect(primaryContrast).toBeGreaterThanOrEqual(4.5);
    expect(primaryLightContrast).toBeGreaterThanOrEqual(4.5);
  });

  it('text colors meet WCAG AAA contrast ratio on dark background', () => {
    const bgColor = '#0b1120';
    const text = '#f8fafc';
    const textSecondary = '#e2e8f0';

    const textContrast = getContrastRatio(text, bgColor);
    const textSecondaryContrast = getContrastRatio(textSecondary, bgColor);

    // WCAG AAA requires 7:1 for normal text
    expect(textContrast).toBeGreaterThanOrEqual(7);
    expect(textSecondaryContrast).toBeGreaterThanOrEqual(7);
  });

  it('muted text color meets WCAG AA contrast ratio on dark background', () => {
    const bgColor = '#0b1120';
    const textMuted = '#94a3b8';

    const textMutedContrast = getContrastRatio(textMuted, bgColor);

    // WCAG AA requires 4.5:1 for normal text
    expect(textMutedContrast).toBeGreaterThanOrEqual(4.5);
  });

  it('semantic colors meet WCAG AA contrast ratio on dark background', () => {
    const bgColor = '#0b1120';
    const error = '#f87171';
    const warning = '#fbbf24';
    const success = '#4ade80';
    const info = '#60a5fa';

    const errorContrast = getContrastRatio(error, bgColor);
    const warningContrast = getContrastRatio(warning, bgColor);
    const successContrast = getContrastRatio(success, bgColor);
    const infoContrast = getContrastRatio(info, bgColor);

    // WCAG AA requires 4.5:1 for normal text
    expect(errorContrast).toBeGreaterThanOrEqual(4.5);
    expect(warningContrast).toBeGreaterThanOrEqual(4.5);
    expect(successContrast).toBeGreaterThanOrEqual(4.5);
    expect(infoContrast).toBeGreaterThanOrEqual(4.5);
  });
});
