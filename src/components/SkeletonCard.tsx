import styles from './SkeletonCard.module.scss';

function SkeletonCard(): JSX.Element {
  return (
    <div className={styles['skeleton-card']} data-testid="skeleton-card">
      <div className={styles['skeleton-card__image']} />
      <div className={styles['skeleton-card__content']}>
        <div className={styles['skeleton-card__title']} />
        <div className={styles['skeleton-card__excerpt']}>
          <div className={styles['skeleton-card__excerpt-line']} />
          <div className={styles['skeleton-card__excerpt-line']} />
          <div
            className={`${styles['skeleton-card__excerpt-line']} ${styles['skeleton-card__excerpt-line--short']}`}
          />
        </div>
        <div className={styles['skeleton-card__footer']}>
          <div className={styles['skeleton-card__author']}>
            <div className={styles['skeleton-card__avatar']} />
            <div className={styles['skeleton-card__author-name']} />
          </div>
          <div className={styles['skeleton-card__tags']}>
            <div className={styles['skeleton-card__tag']} />
            <div className={styles['skeleton-card__tag']} />
            <div className={styles['skeleton-card__tag']} />
          </div>
        </div>
        <div className={styles['skeleton-card__reading-time']} />
        <div className={styles['skeleton-card__timestamp']} />
      </div>
    </div>
  );
}

export default SkeletonCard;
