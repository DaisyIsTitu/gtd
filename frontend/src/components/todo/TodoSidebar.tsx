'use client';

import React, { useState } from 'react';
import TodoList from './TodoList';
import TodoFilter from './TodoFilter';
import { Todo, FilterOptions } from '@/types';
import { TodoSidebarSkeleton } from '@/components/ui/TodoSkeleton';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

interface TodoSidebarProps {
  todos: Todo[];
  loading?: boolean;
  error?: string | null;
  onTodoClick: (todo: Todo) => void;
  onDragStart: (e: React.DragEvent, todo: Todo) => void;
  onAddTodo: () => void;
}

export default function TodoSidebar({
  todos,
  loading = false,
  error = null,
  onTodoClick,
  onDragStart,
  onAddTodo,
}: TodoSidebarProps) {
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    priorities: [],
    statuses: [],
    tags: []
  });

  // Apply filters to todos
  const filteredTodos = todos.filter(todo => {
    if (filters.categories.length > 0 && !filters.categories.includes(todo.category)) {
      return false;
    }
    if (filters.priorities.length > 0 && !filters.priorities.includes(todo.priority)) {
      return false;
    }
    if (filters.statuses.length > 0 && !filters.statuses.includes(todo.status)) {
      return false;
    }
    if (filters.tags.length > 0 && !todo.tags.some(tag => filters.tags.includes(tag))) {
      return false;
    }
    return true;
  });

  // Group filtered todos by status
  const inProgressTodos = filteredTodos.filter(todo => todo.status === 'IN_PROGRESS');
  const scheduledTodos = filteredTodos.filter(todo => todo.status === 'SCHEDULED');
  const waitingTodos = filteredTodos.filter(todo => todo.status === 'WAITING');
  const missedTodos = filteredTodos.filter(todo => todo.status === 'MISSED');
  const completedTodos = filteredTodos.filter(todo => todo.status === 'COMPLETED');

  // Calculate counts
  const getActiveCount = () => {
    return inProgressTodos.length + scheduledTodos.length + waitingTodos.length + missedTodos.length;
  };

  const getTotalCount = () => {
    return todos.length;
  };

  // Handle loading state
  if (loading) {
    return <TodoSidebarSkeleton />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">할 일</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <ErrorDisplay
            title="데이터 로딩 오류"
            message={error}
            variant="default"
            onRetry={() => {
              // TODO: 재시도 로직 구현
              window.location.reload();
            }}
          />
        </div>
      </div>
    );
  }

  // Handle empty state
  if (todos.length === 0) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">할 일</h2>
            <button
              onClick={onAddTodo}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              title="새 할 일 추가"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 mb-4 text-gray-300">
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">할 일이 없습니다</h3>
          <p className="text-sm text-gray-600 mb-4">새로운 할 일을 추가하여 시작해보세요.</p>
          <button
            onClick={onAddTodo}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            첫 번째 할 일 만들기
          </button>
        </div>
        
        <div className="border-t border-gray-100 p-3 text-center">
          <div className="mt-2 w-6 h-6 bg-blue-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
            {getActiveCount() > 99 ? '99+' : getActiveCount()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 md:w-80 lg:w-80 bg-white border-r border-gray-200 flex flex-col h-full sidebar-mobile md:static">
      {/* 헤더 */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">할 일</h2>
          <div className="flex items-center space-x-1">
            {/* 할 일 추가 버튼 */}
            <button
              onClick={onAddTodo}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              title="새 할 일 추가"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            
            {/* 자동 배치 버튼 */}
            <button
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              title="자동 배치"
              onClick={() => {
                // TODO: 자동 배치 기능 구현
                console.log('자동 배치 기능');
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
          <span>활성: {getActiveCount()}</span>
          <span>전체: {getTotalCount()}</span>
        </div>
      </div>

      {/* 필터 */}
      <div className="border-b border-gray-100">
        <TodoFilter 
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Todo 리스트 */}
      <div className="flex-1 overflow-y-auto sidebar-scroll">
        <TodoList
          todos={filteredTodos}
          filters={filters}
          onTodoClick={onTodoClick}
          onDragStart={onDragStart}
        />
      </div>

      {/* 푸터 */}
      <div className="border-t border-gray-100 p-3 text-center">
        <p className="text-xs text-gray-500">
          마지막 업데이트: {new Date().toLocaleString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
}