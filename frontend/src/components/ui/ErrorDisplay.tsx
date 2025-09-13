import React from 'react';

interface ErrorDisplayProps {
  error?: Error | null;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  variant?: 'default' | 'warning' | 'critical';
}

export function ErrorDisplay({
  error,
  title,
  message,
  onRetry,
  onDismiss,
  showDetails = false,
  variant = 'default'
}: ErrorDisplayProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          message: 'text-yellow-700'
        };
      case 'critical':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700'
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-600',
          title: 'text-gray-800',
          message: 'text-gray-700'
        };
    }
  };

  const styles = getVariantStyles();
  const displayTitle = title || (error ? error.name : '오류가 발생했습니다');
  const displayMessage = message || (error ? error.message : '알 수 없는 오류가 발생했습니다.');

  return (
    <div className={`rounded-lg border p-4 ${styles.container}`}>
      <div className="flex items-start">
        {/* Error Icon */}
        <div className={`flex-shrink-0 ${styles.icon}`}>
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
                  clipRule="evenodd" />
          </svg>
        </div>

        {/* Error Content */}
        <div className="ml-3 flex-1">
          {/* Title */}
          <h3 className={`text-sm font-medium ${styles.title}`}>
            {displayTitle}
          </h3>
          
          {/* Message */}
          <div className={`mt-2 text-sm ${styles.message}`}>
            <p>{displayMessage}</p>
          </div>

          {/* Error Details (Development Mode) */}
          {showDetails && error && error.stack && (
            <details className="mt-3">
              <summary className={`cursor-pointer text-xs ${styles.message} hover:underline`}>
                오류 세부사항 보기
              </summary>
              <pre className={`mt-2 text-xs ${styles.message} bg-white bg-opacity-50 p-2 rounded border overflow-x-auto`}>
                {error.stack}
              </pre>
            </details>
          )}

          {/* Action Buttons */}
          {(onRetry || onDismiss) && (
            <div className="mt-4 flex space-x-2">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  다시 시도
                </button>
              )}
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded ${styles.message} bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                >
                  닫기
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact version for inline errors
export function InlineErrorDisplay({ 
  message, 
  onRetry 
}: { 
  message: string; 
  onRetry?: () => void; 
}) {
  return (
    <div className="flex items-center justify-between p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
      <div className="flex items-center">
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
                clipRule="evenodd" />
        </svg>
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-2 text-xs underline hover:no-underline"
        >
          재시도
        </button>
      )}
    </div>
  );
}

// Loading error fallback for lists
export function ListErrorFallback({ 
  onRetry,
  message = "데이터를 불러오는 중 오류가 발생했습니다."
}: {
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-16 h-16 mb-4 text-gray-400">
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">오류 발생</h3>
      <p className="text-sm text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          다시 시도
        </button>
      )}
    </div>
  );
}