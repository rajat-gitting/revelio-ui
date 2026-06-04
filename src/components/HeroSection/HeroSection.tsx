import styles from './HeroSection.module.scss';

export interface HeroSectionProps {
  /** Main heading text */
  headline: string;
  /** Secondary descriptive text */
  subheading: string;
  /** Label for the call-to-action button */
  ctaLabel: string;
  /** Anchor href that the CTA scrolls to (e.g. '#blog-section') */
  ctaHref: string;
  /**
   * Optional background image URL.
   * When provided, the image is layered behind a semi-transparent dark overlay
   * (rgba(0,0,0,0.45)) to guarantee text contrast regardless of image content.
   */
  backgroundImage?: string;
}

/**
 * HeroSection — decorative banner rendered at the very top of the homepage.
 *
 * Accessibility notes:
 * - The section carries role="banner" (implicit from <header>) — here we use
 *   <section aria-label> so it is exposed as a landmark without claiming the
 *   page-level "banner" role (the Navbar already occupies that).
 * - The CTA is an anchor (<a>) with href so it is keyboard-reachable via Tab
 *   and activatable via Enter without JavaScript.
 * - All text colours meet WCAG AA (≥ 4.5:1 normal, ≥ 3:1 large text) against
 *   both the gradient default and the darkened image overlay.
 */
function HeroSection({
  headline,
  subheading,
  ctaLabel,
  ctaHref,
  backgroundImage,
}: HeroSectionProps) {
  return (
    <section
      className={styles.hero}
      aria-label="Site introduction"
      data-testid="hero-section"
    >
      {/* Background image layer (rendered below the gradient ::before pseudo-element) */}
      {backgroundImage && (
        <div
          className={styles.bgImage}
          style={{ backgroundImage: `url(${backgroundImage})` }}
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* Semi-transparent overlay — only needed when a background image is present */}
      {backgroundImage && (
        <div
          className={styles.overlay}
          role="presentation"
          aria-hidden="true"
        />
      )}

      <div className={styles.content}>
        <h1 className={styles.headline}>{headline}</h1>
        <p className={styles.subheading}>{subheading}</p>
        <a
          href={ctaHref}
          className={styles.cta}
          data-testid="hero-cta"
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}

export default HeroSection;
