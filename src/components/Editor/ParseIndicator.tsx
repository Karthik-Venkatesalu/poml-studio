// Parse indicator component for showing processing status
// This component will be fully implemented in Phase 3

import React from 'react';

interface ParseIndicatorProps {
  isProcessing: boolean;
  progress?: number;
  error?: string;
}

const ParseIndicator: React.FC<ParseIndicatorProps> = ({
  isProcessing,
  progress = 0,
  error,
}) => {
  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400 text-sm">
        Error: {error}
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="text-blue-600 dark:text-blue-400 text-sm flex items-center">
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        Processing... {progress > 0 && `${Math.round(progress)}%`}
      </div>
    );
  }

  return null;
};

export default ParseIndicator;
