import React, { useState } from 'react';
import { Todo, TodoSchedule, TodoStatus } from '@/types';
import {
  getCategoryColor,
  getStatusColor,
  getPriorityColor,
  formatTime,
  formatDuration,
  CATEGORY_LABELS,
  PRIORITY_LABELS
} from '@/lib/constants';
import StateButton from '@/components/ui/StateButton';
import { useTodoState } from '@/hooks/useTodoState';

interface TodoBlockProps {
  schedule: TodoSchedule;
  todo: Todo;
  onClick?: (schedule: TodoSchedule) => void;
  isPreviewMode?: boolean;
  isPreviewNew?: boolean;
  isPreviewExisting?: boolean;
}

export default function TodoBlock({
  schedule,
  todo,
  onClick,
  isPreviewMode = false,
  isPreviewNew = false,
  isPreviewExisting = false
}: TodoBlockProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { updateStatus, loading: stateLoading } = useTodoState();

  const categoryColors = getCategoryColor(todo.category);
  const statusColors = getStatusColor(todo.status);
  const priorityColors = getPriorityColor(todo.priority);

  // 상태에 따른 스타일 적용
  const getBlockStyles = () => {
    let baseStyles = 'p-2 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] backdrop-blur-sm overflow-hidden relative group';

    // Preview mode 스타일 - 상황에 맞는 CSS 클래스 적용
    if (isPreviewMode) {
      if (isPreviewNew) {
        baseStyles += ' preview-new';
      } else if (isPreviewExisting) {
        baseStyles += ' preview-existing';
      } else {
        // 기본적으로 새로운 todo로 처리
        baseStyles += ' preview-new';
      }
      return baseStyles;
    }

    // 상태별 스타일
    switch (todo.status) {
      case 'IN_PROGRESS':
        baseStyles += ' ring-2 ring-blue-400 ring-offset-1 animate-pulse border-blue-300';
        break;
      case 'COMPLETED':
        baseStyles += ' opacity-60 line-through bg-gray-50';
        break;
      case 'MISSED':
        baseStyles += ' ring-2 ring-red-400 ring-offset-1 animate-pulse border-red-300 bg-red-50';
        break;
      case 'WAITING':
        baseStyles += ' border-gray-300 bg-gray-50';
        break;
      case 'SCHEDULED':
        baseStyles += ' border-blue-300 bg-blue-50';
        break;
      default:
        baseStyles += ' hover:scale-[1.02] active:scale-[0.98]';
    }

    return baseStyles;
  };

  // 우선순위별 좌측 보더
  const getPriorityBorder = () => {
    const borderWidth = {
      LOW: 'border-l-2',
      MEDIUM: 'border-l-3', 
      HIGH: 'border-l-4',
      URGENT: 'border-l-4',
    };
    
    let borderClass = borderWidth[todo.priority] || borderWidth.MEDIUM;
    
    if (todo.priority === 'URGENT') {
      borderClass += ' animate-pulse';
    }

    return borderClass;
  };

  const handleClick = () => {
    onClick?.(schedule);
  };

  const handleStatusChange = async (newStatus: TodoStatus) => {
    console.log(`상태 변경: ${todo.id} ${todo.status} → ${newStatus}`);
    await updateStatus(todo.id, newStatus);
  };

  // 인라인 스타일로 동적 색상 적용
  const blockStyle = {
    backgroundColor: statusColors.bg,
    borderColor: categoryColors.primary,
    color: categoryColors.text,
    borderLeftColor: priorityColors.primary,
  };

  // 진행도 계산 (상태 기반)
  const getProgressPercentage = () => {
    switch (todo.status) {
      case 'COMPLETED': return 100;
      case 'IN_PROGRESS': return 60;
      case 'SCHEDULED': return 30;
      case 'WAITING': return 0;
      case 'MISSED': return 20;
      default: return 0;
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        ${getBlockStyles()}
        ${getPriorityBorder()}
        relative
      `}
      style={blockStyle}
      data-todo-id={todo.id}
      data-schedule-id={schedule.id}
      title={`${todo.title} - ${CATEGORY_LABELS[todo.category]} (${PRIORITY_LABELS[todo.priority]})`}
    >
      {/* 진행도 표시바 (상단) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-black bg-opacity-10 overflow-hidden">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${getProgressPercentage()}%`,
            backgroundColor: statusColors.primary || categoryColors.primary
          }}
        />
      </div>
      {/* 상단: 제목과 상태 표시 */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 mr-2">
          <h3 className={`font-semibold text-sm leading-tight truncate ${
            todo.status === 'COMPLETED' ? 'line-through opacity-60' : ''
          }`}>
            {todo.title}
          </h3>
          {/* 부제목으로 카테고리와 우선순위를 간단히 표시 */}
          <div className="flex items-center space-x-2 mt-0.5">
            <span className="text-xs font-medium opacity-70">
              {CATEGORY_LABELS[todo.category]}
            </span>
            {(todo.priority === 'URGENT' || todo.priority === 'HIGH') && (
              <span className="text-xs font-medium opacity-80">
                {todo.priority === 'URGENT' ? '⚡ 긴급' : '🔥 높음'}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end space-y-1">
          {/* 상태 표시 */}
          {todo.status === 'IN_PROGRESS' && (
            <div className="flex items-center space-x-1">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: statusColors.primary }}
              />
              <span className="text-xs font-medium">진행중</span>
            </div>
          )}
          {todo.status === 'COMPLETED' && (
            <div className="flex items-center space-x-1">
              <span style={{ color: statusColors.primary }} className="text-sm">✅</span>
              <span className="text-xs font-medium opacity-70">완료</span>
            </div>
          )}
          {todo.status === 'MISSED' && (
            <div className="flex items-center space-x-1">
              <span style={{ color: statusColors.primary }} className="text-sm">⚠️</span>
              <span className="text-xs font-medium text-red-600">놓침</span>
            </div>
          )}
          {todo.status === 'SCHEDULED' && (
            <span className="text-xs font-medium opacity-60">예정</span>
          )}
          {todo.status === 'WAITING' && (
            <span className="text-xs font-medium opacity-60">대기중</span>
          )}
        </div>
      </div>

      {/* 상태 전환 버튼 (호버 시 표시) */}
      {isHovered && !isPreviewMode && (
        <div className="absolute top-1 right-1 z-10">
          <StateButton
            currentStatus={todo.status}
            onStatusChange={handleStatusChange}
            loading={stateLoading}
            size="sm"
            variant="icon"
          />
        </div>
      )}


      {/* 시간 정보 */}
      <div className="bg-black bg-opacity-5 rounded-md px-2 py-1 mb-2">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center space-x-1">
            <span className="font-mono font-medium">
              {formatTime(new Date(schedule.startTime))}
            </span>
            <span className="opacity-60">-</span>
            <span className="font-mono font-medium">
              {formatTime(new Date(schedule.endTime))}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs opacity-60">⏱</span>
            <span className="font-medium">
              {formatDuration(todo.duration)}
            </span>
          </div>
        </div>
      </div>

      {/* 태그들 (있는 경우) */}
      {todo.tags && todo.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {todo.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-1.5 py-0.5 text-xs rounded-md font-medium border"
              style={{
                backgroundColor: categoryColors.primary + '15',
                borderColor: categoryColors.primary + '30',
                color: categoryColors.primary
              }}
            >
              #{tag}
            </span>
          ))}
          {todo.tags.length > 3 && (
            <span
              className="inline-block px-1.5 py-0.5 text-xs rounded-md font-medium opacity-60"
              style={{ backgroundColor: categoryColors.primary + '10' }}
            >
              +{todo.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* 분할된 작업인 경우 */}
      {schedule.splitInfo && (
        <div className="flex items-center justify-between mt-1 p-1 rounded-md bg-white bg-opacity-30">
          <div className="flex items-center space-x-1">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: categoryColors.primary }}
            />
            <span className="text-xs font-medium">
              파트 {schedule.splitInfo.partNumber}/{schedule.splitInfo.totalParts}
            </span>
          </div>
          <span className="text-xs opacity-60">
            🧩 분할 작업
          </span>
        </div>
      )}

      {/* 호버 그라데이션 효과 */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-white to-transparent transition-opacity duration-200 pointer-events-none rounded-lg" />
    </div>
  );
}