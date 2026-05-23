# Revelio Design System

## Overview

This document describes the color palette, typography system, and design tokens used throughout the Revelio UI. All tokens are defined in `_variables.scss` and exposed as CSS custom properties in `global.scss`.

## Color Palette

### Primary Colors (Blue Scale)

Primary colors are used for main actions, links, and key UI elements.

- **Primary**: `#2563eb` - Main brand color
- **Primary Hover**: `#1d4ed8` - Interactive hover state
- **Primary Light**: `#3b82f6` - Lighter variant
- **Primary Dark**: `#1e40af` - Darker variant

**WCAG Contrast Ratios** (on dark background `#0b1120`):
- Primary: 3.64:1 (suitable for large text only, AA: 3:1+)
- Primary Light: 5.12:1 (AA compliant for normal text)

### Secondary Colors (Purple Scale)

Secondary colors are used for complementary UI elements and accents.

- **Secondary**: `#7c3aed` - Secondary brand color
- **Secondary Hover**: `#6d28d9` - Interactive hover state
- **Secondary Light**: `#8b5cf6` - Lighter variant
- **Secondary Dark**: `#5b21b6` - Darker variant

**WCAG Contrast Ratios** (on dark background):
- Secondary: 3.30:1 (suitable for large text only, AA: 3:1+)

### Accent Colors (Emerald Scale)

Accent colors are used for success states, highlights, and call-to-action elements.

- **Accent**: `#10b981` - Accent color
- **Accent Hover**: `#059669` - Interactive hover state
- **Accent Light**: `#34d399` - Lighter variant
- **Accent Dark**: `#047857` - Darker variant

**WCAG Contrast Ratios** (on dark background):
- Accent: 7.42:1 (AAA compliant for normal text)

### Background Colors

- **Background**: `#0b1120` - Main page background
- **Background Secondary**: `#0f172a` - Secondary surfaces
- **Surface**: `#111827` - Card and component backgrounds
- **Surface Elevated**: `#1f2937` - Elevated components (modals, dropdowns)

### Text Colors

- **Text**: `#f8fafc` - Primary text (contrast ratio: 18.0:1, AAA compliant)
- **Text Secondary**: `#e2e8f0` - Secondary text (contrast ratio: 15.3:1, AAA compliant)
- **Text Muted**: `#94a3b8` - Muted/placeholder text (contrast ratio: 7.3:1, AAA compliant)
- **Text Disabled**: `#64748b` - Disabled state text (contrast ratio: 4.0:1, suitable for large text only)

### Border Colors

- **Border**: `#1f2937` - Default borders
- **Border Light**: `#334155` - Lighter borders for emphasis
- **Border Focus**: `#2563eb` - Focus state borders (same as Primary)

### Semantic Colors

#### Error (Red Scale)
- **Error**: `#f87171` - Error messages and alerts
- **Error Dark**: `#dc2626` - Error hover states

#### Warning (Amber Scale)
- **Warning**: `#fbbf24` - Warning messages
- **Warning Dark**: `#f59e0b` - Warning hover states

#### Success (Green Scale)
- **Success**: `#4ade80` - Success messages
- **Success Dark**: `#22c55e` - Success hover states

#### Info (Blue Scale)
- **Info**: `#60a5fa` - Informational messages
- **Info Dark**: `#3b82f6` - Info hover states

## Typography

### Font Families

```scss
// Body text
$font-family-base: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

// Headings
$font-family-heading: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

// Code
$font-family-mono: ui-monospace, 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
```

### Type Scale (1.250 - Major Third)

| Size | Token | Value | Usage |
|------|-------|-------|-------|
| XS | `$font-size-xs` | 0.75rem (12px) | Small labels, captions |
| SM | `$font-size-sm` | 0.875rem (14px) | Secondary text, code |
| Base | `$font-size-base` | 1rem (16px) | Body text |
| LG | `$font-size-lg` | 1.125rem (18px) | Large body text |
| XL | `$font-size-xl` | 1.25rem (20px) | h6, small headings |
| 2XL | `$font-size-2xl` | 1.5rem (24px) | h5, h4 |
| 3XL | `$font-size-3xl` | 1.875rem (30px) | h3 |
| 4XL | `$font-size-4xl` | 2.25rem (36px) | h2, h1 |
| 5XL | `$font-size-5xl` | 3rem (48px) | Display headings |

### Font Weights

- **Light**: `300` - Minimal use, large display text
- **Normal**: `400` - Body text
- **Medium**: `500` - Emphasized body text
- **Semibold**: `600` - Buttons, labels
- **Bold**: `700` - Headings, strong emphasis
- **Extrabold**: `800` - Brand elements, logos

### Line Heights

- **Tight**: `1.25` - Headings
- **Snug**: `1.375` - Tight body text
- **Normal**: `1.5` - Default body text
- **Relaxed**: `1.625` - Loose body text, paragraphs
- **Loose**: `2` - Very spacious text

### Letter Spacing

- **Tight**: `-0.02em` - Large headings
- **Normal**: `0` - Body text
- **Wide**: `0.03em` - Small headings, buttons
- **Wider**: `0.05em` - Uppercase text, logos

## Heading Styles

All headings use:
- Font family: `$font-family-heading`
- Font weight: `$font-weight-bold` (700)
- Line height: `$line-height-tight` (1.25)
- Letter spacing: `$letter-spacing-tight` (-0.02em)
- Color: `$color-text`

| Heading | Size | Usage |
|---------|------|-------|
| h1 | 2.25rem (36px) | Page titles |
| h2 | 1.875rem (30px) | Section titles |
| h3 | 1.5rem (24px) | Subsection titles |
| h4 | 1.25rem (20px) | Component titles |
| h5 | 1.125rem (18px) | Small component titles |
| h6 | 1rem (16px) | Tiny component titles |

## Responsive Typography

On mobile breakpoints (`< 768px`), consider reducing font sizes:

```scss
@include mobile {
  h1 { font-size: $font-size-3xl; } // 30px → 24px
  h2 { font-size: $font-size-2xl; } // 24px → 18px
}
```

## Usage Examples

### Using in SCSS

```scss
@use 'styles/variables' as *;

.my-component {
  color: $color-text;
  background-color: $color-surface;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  border: 1px solid $color-border;
}
```

### Using CSS Custom Properties

```css
.my-component {
  color: var(--color-text);
  background-color: var(--color-surface);
  font-family: var(--font-family-base);
}
```

## Accessibility Notes

- All color combinations meet **WCAG 2.1 Level AA** standards (4.5:1 for normal text, 3:1 for large text)
- Primary text colors meet **AAA** standards (7:1+)
- Focus states use clear, high-contrast borders
- Semantic colors are not relied upon alone; icons and text provide additional context
- Interactive elements have sufficient size (minimum 44x44px touch target)

## Maintenance

When adding new colors:
1. Define in `_variables.scss`
2. Expose as CSS custom property in `global.scss` if needed globally
3. Verify WCAG contrast ratios using tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
4. Document in this file
5. Update component styles to use the new tokens
