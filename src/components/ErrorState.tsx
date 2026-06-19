import styles from './ErrorState.module.scss';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps): JSX.Element {
  return (
    <div className={styles['error-state']}>
      <div className={styles['error-state__content']}>
        <p className={styles['error-state__message']}>{message}</p>
        <button className={styles['error-state__retry-button']} onClick={onRetry}>
          Retry
        </button>
      </div>
    </div>
  );
}

export default ErrorState;
