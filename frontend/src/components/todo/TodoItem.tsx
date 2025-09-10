'use client';

import { Todo, TodoCategory, TodoPriority, TodoStatus } from '@/types';

interface TodoItemProps {
  todo: Todo;
  onTodoClick?: (todo: Todo) => void;
  onDragStart?: (e: React.DragEvent, todo: Todo) => void;
}

const CATEGORY_STYLES: Record<TodoCategory, { bg: string; text: string; icon: string }> = {
  WORK: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '💼' },
  PERSONAL: { bg: 'bg-green-100', text: 'text-green-800', icon: '👤' },
  HEALTH: { bg: 'bg-pink-100', text: 'text-pink-800', icon: '🏥' },
  LEARNING: { bg: 'bg-purple-100', text: 'text-purple-800', icon: '📚' },
  SOCIAL: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '👥' },
  OTHER: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '📌' },
};

const PRIORITY_STYLES: Record<TodoPriority, { border: string; dot: string }> = {
  URGENT: { border: 'border-l-red-500', dot: 'bg-red-500' },
  HIGH: { border: 'border-l-orange-500', dot: 'bg-orange-500' },
  MEDIUM: { border: 'border-l-yellow-500', dot: 'bg-yellow-500' },
  LOW: { border: 'border-l-gray-400', dot: 'bg-gray-400' },
};

const STATUS_STYLES: Record<TodoStatus, { bg: string; text: string; icon: string }> = {
  WAITING: { bg: 'bg-gray-100', text: 'text-gray-600', icon: '⏳' },
  SCHEDULED: { bg: 'bg-blue-100', text: 'text-blue-600', icon: '📅' },
  IN_PROGRESS: { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: '🔄' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-600', icon: '✅' },
  MISSED: { bg: 'bg-red-100', text: 'text-red-600', icon: '❌' },
  CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-500', icon: '🚫' },
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
};

export default function TodoItem({ todo, onTodoClick, onDragStart }: TodoItemProps) {
  const categoryStyle = CATEGORY_STYLES[todo.category];
  const priorityStyle = PRIORITY_STYLES[todo.priority];
  const statusStyle = STATUS_STYLES[todo.status];

  const handleClick = () => {
    onTodoClick?.(todo);
  };

  const handleDragStart = (e: React.DragEvent) => {
    onDragStart?.(e, todo);
  };

  const isInteractive = todo.status === 'WAITING' || todo.status === 'SCHEDULED';

  return (
    <div
      className={`group relative bg-white rounded-lg border border-gray-200 p-3 transition-all duration-200 hover:shadow-md ${
        isInteractive ? 'cursor-pointer hover:border-gray-300' : 'opacity-75'
      } ${priorityStyle.border} border-l-4`}
      onClick={handleClick}
      draggable={isInteractive}
      onDragStart={handleDragStart}
      data-todo-id={todo.id}
      data-todo-status={todo.status}
      data-todo-category={todo.category}
      data-todo-priority={todo.priority}
      data-todo-duration={todo.duration}
    >
      {/* 우선순위 표시 */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <div className={`w-2 h-2 rounded-full ${priorityStyle.dot} flex-shrink-0 mt-1`} />
          <h3 className="text-sm font-medium text-gray-900 truncate">{todo.title}</h3>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          {/* 상태 아이콘 */}
          <span className="text-sm" title={todo.status}>
            {statusStyle.icon}
          </span>
          {/* 드래그 핸들 */}
          {isInteractive && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 3h2v2H9V3zm0 4h2v2H9V7zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm4-16h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* 설명 (있는 경우) */}
      {todo.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {todo.description}
        </p>
      )}

      {/* 카테고리, 기간, 태그 */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${categoryStyle.bg} ${categoryStyle.text}`}>
            <span className="mr-1">{categoryStyle.icon}</span>
            {CATEGORY_OPTIONS.find(c => c.value === todo.category)?.label}
          </span>
          <span className="text-gray-500 font-medium">
            {formatDuration(todo.duration)}
          </span>
        </div>
      </div>

      {/* 태그들 */}
      {todo.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {todo.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
            >
              #{tag}
            </span>
          ))}
          {todo.tags.length > 3 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
              +{todo.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* 마감일 (있는 경우) */}
      {todo.deadline && (
        <div className="mt-2 flex items-center text-xs text-gray-500">
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(todo.deadline).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )}
    </div>
  );
}

// 카테고리 옵션 (필터에서 참조용)
const CATEGORY_OPTIONS = [
  { value: 'WORK' as TodoCategory, label: '업무' },
  { value: 'PERSONAL' as TodoCategory, label: '개인' },
  { value: 'HEALTH' as TodoCategory, label: '건강' },
  { value: 'LEARNING' as TodoCategory, label: '학습' },
  { value: 'SOCIAL' as TodoCategory, label: '사회' },
  { value: 'OTHER' as TodoCategory, label: '기타' },
];