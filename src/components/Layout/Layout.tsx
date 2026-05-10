import type { ReactNode } from 'react';

import Navbar from '@/components/Navbar/Navbar';

import styles from '@/components/Layout/Layout.module.scss';

export interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <span className={styles.title}>revelio-ui</span>
        <Navbar />
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
