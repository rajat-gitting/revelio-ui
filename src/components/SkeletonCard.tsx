import './SkeletonCard.css';

function SkeletonCard(): JSX.Element {
  return (
    <div className="skeleton-card" data-testid="skeleton-card">
      <div className="skeleton-card__image" />
      <div className="skeleton-card__content">
        <div className="skeleton-card__title" />
        <div className="skeleton-card__excerpt">
          <div className="skeleton-card__excerpt-line" />
          <div className="skeleton-card__excerpt-line" />
          <div className="skeleton-card__excerpt-line skeleton-card__excerpt-line--short" />
        </div>
        <div className="skeleton-card__footer">
          <div className="skeleton-card__author">
            <div className="skeleton-card__avatar" />
            <div className="skeleton-card__author-name" />
          </div>
          <div className="skeleton-card__tags">
            <div className="skeleton-card__tag" />
            <div className="skeleton-card__tag" />
            <div className="skeleton-card__tag" />
          </div>
        </div>
        <div className="skeleton-card__timestamp" />
      </div>
    </div>
  );
}

export default SkeletonCard;
