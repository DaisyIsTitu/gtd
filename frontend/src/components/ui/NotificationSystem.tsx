'use client';

import { useEffect } from 'react';
import { useNotifications } from '@/store';

const NOTIFICATION_ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

const NOTIFICATION_STYLES = {
  success: {
    bg: 'bg-green-100 border-green-200',
    text: 'text-green-800',
    button: 'text-green-600 hover:text-green-800',
  },
  error: {
    bg: 'bg-red-100 border-red-200',
    text: 'text-red-800',
    button: 'text-red-600 hover:text-red-800',
  },
  warning: {
    bg: 'bg-yellow-100 border-yellow-200',
    text: 'text-yellow-800',
    button: 'text-yellow-600 hover:text-yellow-800',
  },
  info: {
    bg: 'bg-blue-100 border-blue-200',
    text: 'text-blue-800',
    button: 'text-blue-600 hover:text-blue-800',
  },
};

export default function NotificationSystem() {
  const { notifications, removeNotification } = useNotifications();

  // Auto-remove notifications with duration (handled in store, but this is a safety net)
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        const timeElapsed = Date.now() - notification.timestamp.getTime();
        const timeRemaining = notification.duration - timeElapsed;
        
        if (timeRemaining > 0) {
          setTimeout(() => {
            removeNotification(notification.id);
          }, timeRemaining);
        } else {
          // Notification should have been removed already
          removeNotification(notification.id);
        }
      }
    });
  }, [notifications, removeNotification]);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => {
        const styles = NOTIFICATION_STYLES[notification.type];
        const icon = NOTIFICATION_ICONS[notification.type];

        return (
          <div
            key={notification.id}
            className={`
              ${styles.bg} ${styles.text} 
              border rounded-lg shadow-lg p-4 
              transform transition-all duration-300 ease-in-out
              animate-in slide-in-from-right-5 fade-in
            `}
            role="alert"
          >
            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                <span className="text-lg" role="img" aria-label={notification.type}>
                  {icon}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold">{notification.title}</h4>
                    {notification.message && (
                      <p className="text-sm mt-1 opacity-90">{notification.message}</p>
                    )}
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className={`
                      flex-shrink-0 ml-2 p-1 rounded-full 
                      ${styles.button} 
                      transition-colors duration-200
                      hover:bg-white hover:bg-opacity-25
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
                    `}
                    aria-label="알림 닫기"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Progress bar for timed notifications */}
            {notification.duration && notification.duration > 0 && (
              <div className="mt-3 bg-white bg-opacity-25 rounded-full h-1">
                <div
                  className="bg-current h-1 rounded-full transition-all duration-100 ease-linear"
                  style={{
                    width: `${Math.max(0, Math.min(100, 
                      ((notification.duration - (Date.now() - notification.timestamp.getTime())) / notification.duration) * 100
                    ))}%`,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Utility component to show notifications in development
export function NotificationDemo() {
  const { addNotification, clearNotifications } = useNotifications();

  const showDemoNotifications = () => {
    addNotification({
      type: 'success',
      title: '할 일 생성 완료',
      message: '새로운 할 일이 성공적으로 생성되었습니다.',
    });

    setTimeout(() => {
      addNotification({
        type: 'info',
        title: '정보',
        message: '스케줄링 기능을 사용해보세요.',
      });
    }, 1000);

    setTimeout(() => {
      addNotification({
        type: 'warning',
        title: '주의',
        message: '마감일이 다가오고 있습니다.',
      });
    }, 2000);

    setTimeout(() => {
      addNotification({
        type: 'error',
        title: '오류 발생',
        message: '네트워크 연결을 확인해주세요.',
      });
    }, 3000);
  };

  return (
    <div className="fixed bottom-4 right-4 space-x-2">
      <button
        onClick={showDemoNotifications}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        알림 테스트
      </button>
      <button
        onClick={clearNotifications}
        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        모든 알림 지우기
      </button>
    </div>
  );
}