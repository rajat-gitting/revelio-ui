import React from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  message: string;
}

function EmptyState({ message }: EmptyStateProps): JSX.Element {
  return (
    <div className="empty-state" data-testid="empty-state">
      <div className="empty-state__content">
        <p className="empty-state__message">{message}</p>
      </div>
    </div>
  );
}

export default EmptyState;
