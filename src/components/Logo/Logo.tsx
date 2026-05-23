import styles from '@/components/Logo/Logo.module.scss';

export interface LogoProps {
  /** Optional override for the wordmark text displayed beside the icon. */
  label?: string;
  /** Optional accessible label for the logo. */
  ariaLabel?: string;
}

/**
 * Branded logo for the Revelio header. Renders an inline SVG "R" icon
 * alongside a wordmark. The component is purely presentational and
 * exposes overrides for the label and accessible name.
 */
export default function Logo({ label = 'Revelio', ariaLabel = 'Revelio home' }: LogoProps) {
  return (
    <span className={styles.logo} aria-label={ariaLabel} role="img">
      <svg
        className={styles.icon}
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="1" y="1" width="38" height="38" rx="10" className={styles.iconBg} />
        <path
          d="M13 30V10h9.2c2.4 0 4.3.6 5.7 1.9 1.4 1.3 2.1 3 2.1 5.1 0 1.6-.4 3-1.3 4.1-.8 1.1-2 1.9-3.4 2.4L31 30h-4.6l-4.9-5.9H17V30h-4Zm4-9.4h5c1.2 0 2.2-.3 2.9-.9.7-.6 1-1.5 1-2.7 0-1.1-.3-2-1-2.6-.7-.6-1.7-.9-2.9-.9h-5v7.1Z"
          className={styles.iconFg}
        />
      </svg>
      <span className={styles.wordmark}>{label}</span>
    </span>
  );
}
