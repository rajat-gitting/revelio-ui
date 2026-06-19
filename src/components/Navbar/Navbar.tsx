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
      <Link to="/blogs" search={{ q: '', category: [], author: [], page: 1 }} className={styles.link} activeProps={{ className: styles.active }}>
        Blogs
      </Link>
    </nav>
  );
}
