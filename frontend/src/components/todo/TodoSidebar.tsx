'use client';

import React, { useState, useEffect, useCallback } from 'react';
import TodoList from './TodoList';
import TodoFilter, { SortOption } from './TodoFilter';
import SearchBar from './SearchBar';
import { Todo, FilterOptions } from '@/types';
import { TodoSidebarSkeleton } from '@/components/ui/TodoSkeleton';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

// E2E 테스트 환경에서는 로그 비활성화
const isDev = process.env.NODE_ENV === 'development';
const isE2E = process.env.NODE_ENV === 'test';

interface TodoSidebarProps {
  todos: Todo[];
  loading?: boolean;
  error?: string | null;
  onTodoClick: (todo: Todo) => void;
  onDragStart: (e: React.DragEvent, todo: Todo) => void;
  onAddTodo: () => void;
  onAutoSchedule?: () => void;
  autoScheduleLoading?: boolean;
}

const DEFAULT_SORT: SortOption = {
  value: 'priority-desc',
  label: '우선순위 ↓',
  field: 'priority',
  direction: 'desc'
};


export default function TodoSidebar({
  todos,
  loading = false,
  error = null,
  onTodoClick,
  onDragStart,
  onAddTodo,
  onAutoSchedule,
  autoScheduleLoading = false,
}: TodoSidebarProps) {
  // Filter, sort, and search state
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    priorities: [],
    statuses: [],
    tags: []
  });
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT);

  // Debug logging for development only
  useEffect(() => {
    if (isDev && !isE2E) {
      console.log('🔄 TodoSidebar sortOption 변경됨:', sortOption);
    }
  }, [sortOption]);

  useEffect(() => {
    if (isDev && !isE2E) {
      console.log('🔄 TodoSidebar todos 변경됨:', todos?.length || 0);
  }, [todos]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Todo[]>(todos);

  // todos가 변경되면 searchResults도 업데이트
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults(todos);
    }
  }, [todos, searchTerm]);

  // Handle search changes (useCallback으로 최적화하여 재렌더링 방지)
  const handleSearchChange = useCallback((term: string, results: Todo[]) => {
    setSearchTerm(term);
    setSearchResults(results);
  }, []);

  // Use search results if searching, otherwise use props todos
  const todosToFilter = searchTerm ? searchResults : todos;

  // Debug logging for development only
  if (isDev && !isE2E) {
    console.log('🎯 TodoSidebar 전달 데이터:', {
      searchTerm,
      'todosToFilter.length': todosToFilter.length,
      sortOption: sortOption
    });
  }

  // Apply filters to the todos (search results or all todos) for counts
  const filteredTodos = todosToFilter.filter(todo => {
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

  // Group filtered todos by status for counts
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
              className={`p-1.5 rounded-lg transition-colors ${
                autoScheduleLoading
                  ? 'text-blue-600 bg-blue-50 cursor-not-allowed'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              title={autoScheduleLoading ? "자동 배치 진행 중..." : "자동 배치"}
              onClick={onAutoSchedule}
              disabled={autoScheduleLoading || waitingTodos.length === 0}
            >
              {autoScheduleLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-sm">
          <div className="flex items-center space-x-3 text-gray-600">
            <span>활성: {getActiveCount()}</span>
            <span>전체: {getTotalCount()}</span>
            {searchTerm && (
              <span data-testid="search-status" className="text-blue-600 text-xs">
&quot;{searchTerm}&quot; 검색 중
              </span>
            )}
          </div>
          {/* 현재 정렬 표시 */}
          <div data-testid="current-sort" className="text-xs text-gray-500">
            {sortOption.label}
          </div>
        </div>
      </div>

      {/* 검색 바 */}
      <SearchBar
        todos={todos}
        onSearchChange={handleSearchChange}
        placeholder="제목, 설명, 태그로 검색..."
        disabled={loading}
      />

      {/* 필터 & 정렬 */}
      <div>
        <TodoFilter
          filters={filters}
          onFiltersChange={setFilters}
          sortOption={sortOption}
          onSortChange={setSortOption}
        />
      </div>

      {/* Todo 리스트 */}
      <div className="flex-1 overflow-y-auto sidebar-scroll">
        <TodoList
          todos={todosToFilter} // 필터링 전 todos를 전달하여 TodoList가 필터링과 정렬을 모두 처리하도록 함
          filters={filters} // 실제 필터를 전달
          sortOption={sortOption}
          onTodoClick={onTodoClick}
          onDragStart={onDragStart}
        />
      </div>

      {/* 푸터 */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            마지막 업데이트: {new Date().toLocaleString('ko-KR', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          {(filteredTodos.length !== todos.length || searchTerm) && (
            <span className="text-blue-600">
              {filteredTodos.length}/{todos.length} 표시
              {searchTerm && ' (검색됨)'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}