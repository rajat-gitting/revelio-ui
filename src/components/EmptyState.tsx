import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  message: string;
}

function EmptyState({ message }: EmptyStateProps): JSX.Element {
  return (
    <div className={styles['empty-state']}>
      <div className={styles['empty-state__content']}>
        <p className={styles['empty-state__message']}>{message}</p>
      </div>
    </div>
  );
}

export default EmptyState;
