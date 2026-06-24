import { Link } from '@tanstack/react-router';

import styles from '@/components/Navbar/Navbar.module.scss';

export default function Navbar() {
  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <Link to="/" search={{ q: '', page: 1 }} className={styles.link} activeProps={{ className: styles.active }} activeOptions={{ includeSearch: false }}>
        Home
      </Link>
      <Link to="/about" className={styles.link} activeProps={{ className: styles.active }}>
        About
      </Link>
    </nav>
  );
}
