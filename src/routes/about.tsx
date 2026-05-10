import { createFileRoute } from '@tanstack/react-router';

import styles from '@/routes/about.module.scss';

export const Route = createFileRoute('/about')({
  component: AboutPage,
});

function AboutPage() {
  return (
    <section className={styles.section}>
      <h1 className={styles.title}>About</h1>
      <p className={styles.body}>
        Sample route demonstrating file-based routing. Add more files under{' '}
        <code className={styles.code}>src/routes/</code> to grow the navigation surface.
      </p>
    </section>
  );
}
