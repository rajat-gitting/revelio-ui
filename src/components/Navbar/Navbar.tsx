import { Link } from '@tanstack/react-router';

import styles from '@/components/Navbar/Navbar.module.scss';

export default function Navbar() {
  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <Link to="/" className={styles.link} activeProps={{ className: styles.active }}>
        Home
      </Link>
      <Link to="/about" className={styles.link} activeProps={{ className: styles.active }}>
        About
      </Link>
    </nav>
  );
}
