'use client';

import React, { useState } from 'react';
import { Todo, TodoCategory, TodoPriority, TodoStatus } from '@/types';
import StateButton from '@/components/ui/StateButton';
import { useTodoState } from '@/hooks/useTodoState';

interface TodoItemProps {
  todo: Todo;
  onTodoClick?: (todo: Todo) => void;
  onDragStart?: (e: React.DragEvent, todo: Todo) => void;
}

const CATEGORY_STYLES: Record<TodoCategory, { bg: string; text: string; icon: string }> = {
  WORK: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', icon: '💼' },
  PERSONAL: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', icon: '👤' },
  HEALTH: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-800 dark:text-pink-300', icon: '🏥' },
  LEARNING: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300', icon: '📚' },
  SOCIAL: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', icon: '👥' },
  OTHER: { bg: 'bg-gray-100 dark:bg-gray-700/50', text: 'text-gray-800 dark:text-gray-300', icon: '📌' },
};

const PRIORITY_STYLES: Record<TodoPriority, { border: string; dot: string }> = {
  URGENT: { border: 'border-l-red-500', dot: 'bg-red-500' },
  HIGH: { border: 'border-l-orange-500', dot: 'bg-orange-500' },
  MEDIUM: { border: 'border-l-yellow-500', dot: 'bg-yellow-500' },
  LOW: { border: 'border-l-gray-400', dot: 'bg-gray-400' },
};

const STATUS_STYLES: Record<TodoStatus, { bg: string; text: string; icon: string; border: string; glow: string }> = {
  WAITING: {
    bg: 'bg-gray-50 dark:bg-gray-800/50',
    text: 'text-gray-700 dark:text-gray-300',
    icon: '⏳',
    border: 'border-gray-200 dark:border-gray-700',
    glow: 'shadow-sm dark:shadow-gray-900/20'
  },
  SCHEDULED: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-300',
    icon: '📅',
    border: 'border-blue-200 dark:border-blue-800',
    glow: 'shadow-blue-100 shadow-md dark:shadow-blue-900/30'
  },
  IN_PROGRESS: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-300',
    icon: '🔄',
    border: 'border-amber-300 dark:border-amber-700 animate-pulse',
    glow: 'shadow-amber-200 shadow-lg animate-pulse dark:shadow-amber-900/30'
  },
  COMPLETED: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: '✅',
    border: 'border-emerald-200 dark:border-emerald-800',
    glow: 'shadow-emerald-100 shadow-md dark:shadow-emerald-900/30'
  },
  MISSED: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-300',
    icon: '❌',
    border: 'border-red-300 dark:border-red-700 animate-pulse',
    glow: 'shadow-red-200 shadow-lg animate-pulse dark:shadow-red-900/30'
  },
  CANCELLED: {
    bg: 'bg-slate-50 dark:bg-slate-800/50',
    text: 'text-slate-600 dark:text-slate-400',
    icon: '🚫',
    border: 'border-slate-200 dark:border-slate-700',
    glow: 'shadow-sm opacity-75 dark:shadow-slate-900/20'
  },
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
  const [isHovered, setIsHovered] = useState(false);
  const { updateStatus, loading: stateLoading } = useTodoState();

  const categoryStyle = CATEGORY_STYLES[todo.category];
  const priorityStyle = PRIORITY_STYLES[todo.priority];
  const statusStyle = STATUS_STYLES[todo.status];

  const handleClick = () => {
    onTodoClick?.(todo);
  };

  const handleDragStart = (e: React.DragEvent) => {
    onDragStart?.(e, todo);
  };

  const handleStatusChange = async (newStatus: TodoStatus) => {
    console.log(`TodoItem 상태 변경: ${todo.id} ${todo.status} → ${newStatus}`);
    await updateStatus(todo.id, newStatus);
  };

  const isInteractive = todo.status === 'WAITING' || todo.status === 'SCHEDULED';

  return (
    <div
      data-testid="todo-item"
      className={`group relative rounded-lg border p-3 transition-all duration-300 hover:scale-[1.02] ${
        statusStyle.bg
      } ${statusStyle.border} ${statusStyle.glow} ${
        isInteractive ? 'cursor-pointer hover:shadow-lg' : 'opacity-75'
      } ${priorityStyle.border} border-l-4`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable={isInteractive}
      onDragStart={handleDragStart}
      data-todo-id={todo.id}
      data-todo-status={todo.status}
      data-todo-category={todo.category}
      data-todo-priority={todo.priority}
      data-todo-duration={todo.duration}
    >
      {/* 상태 진행도 표시 바 (상단) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-10 rounded-t-lg overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-out ${
            todo.status === 'COMPLETED' ? 'bg-emerald-400' :
            todo.status === 'IN_PROGRESS' ? 'bg-amber-400 animate-pulse' :
            todo.status === 'SCHEDULED' ? 'bg-blue-400' :
            todo.status === 'MISSED' ? 'bg-red-400 animate-pulse' :
            'bg-gray-300'
          }`}
          style={{
            width: `${
              todo.status === 'COMPLETED' ? 100 :
              todo.status === 'IN_PROGRESS' ? 60 :
              todo.status === 'SCHEDULED' ? 30 :
              todo.status === 'MISSED' ? 15 :
              todo.status === 'WAITING' ? 5 : 0
            }%`
          }}
        />
      </div>

      {/* 우선순위 표시 */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <div className={`w-2 h-2 rounded-full ${priorityStyle.dot} flex-shrink-0 mt-1`} />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{todo.title}</h3>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          {/* 상태 전환 버튼 (호버 시 표시) */}
          {isHovered && (
            <StateButton
              currentStatus={todo.status}
              onStatusChange={handleStatusChange}
              loading={stateLoading}
              size="sm"
              variant="icon"
            />
          )}

          {/* 상태 아이콘 (호버 시 숨김) */}
          {!isHovered && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${statusStyle.bg} ${statusStyle.border} border`}>
              <span className={`text-sm ${
                todo.status === 'IN_PROGRESS' || todo.status === 'MISSED' ? 'animate-pulse' : ''
              }`} title={todo.status}>
                {statusStyle.icon}
              </span>
              <span className={`text-xs font-medium ${statusStyle.text}`}>
                {todo.status === 'WAITING' && '대기'}
                {todo.status === 'SCHEDULED' && '예정'}
                {todo.status === 'IN_PROGRESS' && '진행'}
                {todo.status === 'COMPLETED' && '완료'}
                {todo.status === 'MISSED' && '놓침'}
                {todo.status === 'CANCELLED' && '취소'}
              </span>
            </div>
          )}

          {/* 드래그 핸들 */}
          {isInteractive && !isHovered && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 3h2v2H9V3zm0 4h2v2H9V7zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm4-16h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* 설명 (있는 경우) */}
      {todo.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
          {todo.description}
        </p>
      )}

      {/* 카테고리, 기간, 태그 */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-medium border transition-all duration-200 ${categoryStyle.bg} ${categoryStyle.text} hover:scale-105`}>
            <span className="mr-1">{categoryStyle.icon}</span>
            {CATEGORY_OPTIONS.find(c => c.value === todo.category)?.label}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
            todo.status === 'COMPLETED' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
            todo.status === 'IN_PROGRESS' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
            'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400'
          }`}>
            ⏱ {formatDuration(todo.duration)}
          </span>
        </div>
      </div>

      {/* 태그들 */}
      {todo.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {todo.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              #{tag}
            </span>
          ))}
          {todo.tags.length > 3 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              +{todo.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* 마감일 (있는 경우) */}
      {todo.deadline && (
        <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
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