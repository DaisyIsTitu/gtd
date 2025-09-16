import React from 'react';
import { TodoStatus } from '@/types';

interface StateButtonProps {
  currentStatus: TodoStatus;
  onStatusChange: (newStatus: TodoStatus) => void;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'text' | 'both';
}

export default function StateButton({
  currentStatus,
  onStatusChange,
  loading = false,
  size = 'sm',
  variant = 'icon'
}: StateButtonProps) {

  // 상태별 가능한 전환 정의
  const getAvailableTransitions = (status: TodoStatus) => {
    switch (status) {
      case 'WAITING':
        return [
          { to: 'IN_PROGRESS', label: '시작', icon: '▶️', color: 'bg-blue-500 hover:bg-blue-600' },
          { to: 'COMPLETED' as TodoStatus, label: '완료', icon: '✅', color: 'bg-green-500 hover:bg-green-600' }
        ];
      case 'SCHEDULED':
        return [
          { to: 'IN_PROGRESS', label: '시작', icon: '▶️', color: 'bg-blue-500 hover:bg-blue-600' },
          { to: 'COMPLETED' as TodoStatus, label: '완료', icon: '✅', color: 'bg-green-500 hover:bg-green-600' }
        ];
      case 'IN_PROGRESS':
        return [
          { to: 'SCHEDULED', label: '일시정지', icon: '⏸️', color: 'bg-yellow-500 hover:bg-yellow-600' },
          { to: 'COMPLETED' as TodoStatus, label: '완료', icon: '✅', color: 'bg-green-500 hover:bg-green-600' }
        ];
      case 'MISSED':
        return [
          { to: 'WAITING', label: '재시작', icon: '🔄', color: 'bg-orange-500 hover:bg-orange-600' },
          { to: 'IN_PROGRESS', label: '시작', icon: '▶️', color: 'bg-blue-500 hover:bg-blue-600' }
        ];
      case 'COMPLETED':
        return [
          { to: 'SCHEDULED', label: '재개', icon: '🔄', color: 'bg-gray-500 hover:bg-gray-600' }
        ];
      default:
        return [];
    }
  };

  // 크기별 스타일
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6 text-xs';
      case 'md':
        return 'w-8 h-8 text-sm';
      case 'lg':
        return 'w-10 h-10 text-base';
      default:
        return 'w-6 h-6 text-xs';
    }
  };

  const transitions = getAvailableTransitions(currentStatus);
  const sizeStyles = getSizeStyles();

  // 전환할 수 있는 상태가 없으면 아무것도 렌더링하지 않음
  if (transitions.length === 0) {
    return null;
  }

  const handleTransition = (newStatus: TodoStatus) => {
    if (loading) return;
    onStatusChange(newStatus);
  };

  return (
    <div className="flex gap-1">
      {transitions.map((transition) => (
        <button
          key={transition.to}
          onClick={(e) => {
            e.stopPropagation(); // 부모 클릭 이벤트 방지
            handleTransition(transition.to as TodoStatus);
          }}
          disabled={loading}
          className={`
            ${sizeStyles}
            ${transition.color}
            text-white rounded-md
            flex items-center justify-center
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:scale-105 active:scale-95
            shadow-sm hover:shadow-md
          `}
          title={`${transition.label} (${currentStatus} → ${transition.to})`}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
          ) : variant === 'text' ? (
            <span className="font-medium">{transition.label}</span>
          ) : variant === 'both' ? (
            <span className="flex items-center gap-1">
              <span>{transition.icon}</span>
              <span className="text-xs">{transition.label}</span>
            </span>
          ) : (
            <span>{transition.icon}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// 개별 상태 전환 버튼 컴포넌트들
export function StartButton({ onStart, loading = false }: {
  onStart: () => void;
  loading?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onStart();
      }}
      disabled={loading}
      className="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
      title="시작"
    >
      {loading ? (
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
      ) : (
        <span className="text-xs">▶️</span>
      )}
    </button>
  );
}

export function CompleteButton({ onComplete, loading = false }: {
  onComplete: () => void;
  loading?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onComplete();
      }}
      disabled={loading}
      className="w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center justify-center transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
      title="완료"
    >
      {loading ? (
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
      ) : (
        <span className="text-xs">✅</span>
      )}
    </button>
  );
}

export function PauseButton({ onPause, loading = false }: {
  onPause: () => void;
  loading?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onPause();
      }}
      disabled={loading}
      className="w-6 h-6 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md flex items-center justify-center transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
      title="일시정지"
    >
      {loading ? (
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
      ) : (
        <span className="text-xs">⏸️</span>
      )}
    </button>
  );
}