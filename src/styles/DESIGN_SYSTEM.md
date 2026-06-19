# Revelio Design System

## Overview

This document describes the color palette, typography system, and design tokens used throughout the Revelio UI. All tokens are defined in `_variables.scss` and exposed as CSS custom properties in `global.scss`. The theme is a **dark editorial** look: a calm deep-teal primary, a warm-stone secondary, and a restrained amber accent on a deep charcoal background.

The exact token values below mirror `_variables.scss`, and the WCAG contrast pairings are verified in `design-system.test.ts` — update both when changing a token.

## Color Palette

### Primary Colors (Teal Scale)

Primary colors are used for main actions, links, and key UI elements.

- **Primary**: `#2a7d6f` - Main brand color
- **Primary Hover**: `#1f6059` - Interactive hover state
- **Primary Light**: `#3d9e8e` - Lighter variant
- **Primary Dark**: `#165448` - Darker variant
- **Primary Subtle**: `rgba(42, 125, 111, 0.18)` - Tinted fills (e.g. tag pills)

### Secondary Colors (Warm Stone Scale)

Secondary colors are used as a neutral complement to the primary teal.

- **Secondary**: `#8c7b6e` - Secondary brand color
- **Secondary Hover**: `#7a6b5f` - Interactive hover state
- **Secondary Light**: `#a8998e` - Lighter variant
- **Secondary Dark**: `#6b5c51` - Darker variant

### Accent Colors (Warm Amber Scale)

Accent colors are used for restrained highlights and call-to-action emphasis.

- **Accent**: `#b08d5b` - Accent color
- **Accent Hover**: `#9a7a4a` - Interactive hover state
- **Accent Light**: `#c9a87a` - Lighter variant
- **Accent Dark**: `#7d6034` - Darker variant

### Background & Surface Colors

- **Background**: `#12161e` - Main page background
- **Background Secondary**: `#181d27` - Secondary surfaces
- **Surface**: `#1e2430` - Card and component backgrounds
- **Surface Elevated**: `#252c3a` - Elevated components (modals, dropdowns)
- **Surface Hover**: `rgba(255, 255, 255, 0.05)` - Hover overlay on surfaces

### Text Colors

A warm off-white hierarchy chosen for high contrast on the charcoal background.

- **Text**: `#f0ede8` - Primary text
- **Text Secondary**: `#d6d0c8` - Secondary text
- **Text Muted**: `#9e9790` - Muted/placeholder text
- **Text Disabled**: `#6b6560` - Disabled state text (large text only)
- **Text On Primary**: `#ffffff` - Text on primary-colored fills

### Border Colors

- **Border**: `#2a3040` - Default borders
- **Border Light**: `#363d50` - Lighter borders for emphasis
- **Border Focus**: `#2a7d6f` - Focus state borders (same as Primary)

### Semantic Colors

Muted, editorial tones — deliberately not harsh or fully saturated.

#### Error
- **Error**: `#d97b6b` - Error messages and alerts
- **Error Dark**: `#b55a4a` - Error hover states

#### Warning
- **Warning**: `#c9973d` - Warning messages
- **Warning Dark**: `#a87a28` - Warning hover states

#### Success
- **Success**: `#5a9e82` - Success messages
- **Success Dark**: `#3d7a60` - Success hover states

#### Info
- **Info**: `#5e92b5` - Informational messages
- **Info Dark**: `#3d6e8a` - Info hover states

## Typography

### Font Families

```scss
// Body text — clean sans
$font-family-base: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

// Headings — editorial serif
$font-family-heading: 'Georgia', 'Cambria', ui-serif, serif;

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

Slightly more generous than a default scale for editorial readability.

- **Tight**: `1.2` - Headings
- **Snug**: `1.35` - Tight body text
- **Normal**: `1.55` - Default body text
- **Relaxed**: `1.7` - Loose body text, paragraphs
- **Loose**: `2` - Very spacious text

### Letter Spacing

- **Tight**: `-0.02em` - Large headings
- **Normal**: `0` - Body text
- **Wide**: `0.03em` - Small headings, buttons
- **Wider**: `0.05em` - Uppercase text, logos

## Radii & Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `$radius-sm` | 6px | Small elements (skeleton lines, chips) |
| `$radius-md` | 10px | Buttons, inputs, avatars-as-square |
| `$radius-lg` | 14px | Cards, panels |
| `$radius-full` | 999px | Pills, circular avatars |

Shadows are intentionally subtle (no harsh drop shadows):

- `$shadow-sm`: `0 1px 3px rgb(0 0 0 / 25%)` - Resting cards
- `$shadow-md`: `0 4px 16px rgb(0 0 0 / 30%)` - Hover / elevated surfaces
- `$shadow-lg`: `0 12px 32px rgb(0 0 0 / 35%)` - Modals, popovers

## Heading Styles

All headings use:
- Font family: `$font-family-heading` (editorial serif)
- Font weight: `$font-weight-bold` (700)
- Line height: `$line-height-tight` (1.2)
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

Components consume tokens through scoped **SCSS modules** (`Component.module.scss`). Prefer the SCSS variables; the matching CSS custom properties (`var(--color-*)`) exist for cases where a runtime value is needed.

### Using SCSS variables

```scss
@use '../../styles/variables' as *;

.myComponent {
  color: $color-text;
  background-color: $color-surface;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  border: 1px solid $color-border;
}
```

### Using CSS custom properties

```scss
.myComponent {
  color: var(--color-text);
  background-color: var(--color-surface);
  font-family: var(--font-family-base);
}
```

## Accessibility Notes

- Color combinations target **WCAG 2.1 Level AA** (4.5:1 for normal text, 3:1 for large text); the key pairings are asserted in `design-system.test.ts`.
- Focus states use clear, high-contrast borders (`--color-border-focus`).
- Semantic colors are not relied upon alone; icons and text provide additional context.
- Interactive elements have sufficient size (minimum 44×44px touch target).

## Maintenance

When adding or changing a color:
1. Define it in `_variables.scss`.
2. Expose it as a CSS custom property in `global.scss` if it is needed at runtime.
3. Verify WCAG contrast ratios (e.g. [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)) and add/adjust the assertion in `design-system.test.ts`.
4. Document it in this file.
5. Update component styles to use the new token.
