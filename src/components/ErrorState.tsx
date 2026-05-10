import React from 'react';
import './ErrorState.css';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps): JSX.Element {
  return (
    <div className="error-state">
      <div className="error-state__content">
        <p className="error-state__message">{message}</p>
        <button className="error-state__retry-button" onClick={onRetry}>
          Retry
        </button>
      </div>
    </div>
  );
}

export default ErrorState;
