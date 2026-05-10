import { createFileRoute } from '@tanstack/react-router';

import { useApi } from '@/hooks/useApi';
import { ping } from '@/api/services/pingService';

import styles from '@/routes/index.module.scss';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  const { data, loading, error } = useApi(() => ping());

  let status: string | null = null;
  if (loading) {
    status = 'Loading…';
  } else if (error) {
    status = error;
  } else if (data?.message === 'pong') {
    status = `Backend says: ${data.message}`;
  } else if (data) {
    status = `Unexpected response: ${JSON.stringify(data)}`;
  }

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>revelio-ui</h1>
      <p className={styles.lead}>
        Landing page wired to the ping service via a shared axios client.
      </p>
      <div className={styles.card}>
        <p className={styles.status} data-testid="ping-status">
          {status ?? 'Idle'}
        </p>
      </div>
    </section>
  );
}
