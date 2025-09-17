'use client';

import { useMemo } from 'react';
import { Todo, FilterOptions, TodoPriority, TodoStatus } from '@/types';
import TodoItem from './TodoItem';
import { ListErrorFallback, InlineErrorDisplay } from '@/components/ui/ErrorDisplay';
import { SortOption } from './TodoFilter';

interface TodoListProps {
  todos: Todo[];
  filters: FilterOptions;
  sortOption?: SortOption;
  onTodoClick?: (todo: Todo) => void;
  onDragStart?: (e: React.DragEvent, todo: Todo) => void;
  // 에러 상태 관리
  error?: Error | null;
  onRetry?: () => void;
  isLoading?: boolean;
}

export default function TodoList({
  todos,
  filters,
  sortOption,
  onTodoClick,
  onDragStart,
  error,
  onRetry,
  isLoading
}: TodoListProps) {
  // E2E 테스트 환경에서는 로그 비활성화
  const isDev = process.env.NODE_ENV === 'development';
  const isE2E = process.env.NODE_ENV === 'test';
  // 필터링된 Todo 목록
  const filteredTodos = useMemo(() => {
    if (!todos || !Array.isArray(todos)) return [];
    return todos.filter(todo => {
      // 카테고리 필터
      if (filters.categories?.length > 0 && !filters.categories.includes(todo.category)) {
        return false;
      }

      // 우선순위 필터
      if (filters.priorities?.length > 0 && !filters.priorities.includes(todo.priority)) {
        return false;
      }

      // 상태 필터
      if (filters.statuses?.length > 0 && !filters.statuses.includes(todo.status)) {
        return false;
      }

      // 태그 필터 (하나라도 일치하면 포함)
      if (filters.tags?.length > 0) {
        const hasMatchingTag = filters.tags.some(filterTag =>
          (todo.tags || []).some(todoTag =>
            todoTag.toLowerCase().includes(filterTag.toLowerCase())
          )
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      return true;
    });
  }, [todos, filters]);

  // 정렬된 Todo 목록
  const sortedTodos = useMemo(() => {
    if (isDev && !isE2E) {
      console.log('🔄 TodoList 정렬 시작, filteredTodos.length=', filteredTodos.length);
    }

    // 기본값이 있으므로 sortOption이 없는 경우는 거의 없음
    const currentSortOption = sortOption || {
      field: 'priority' as const,
      direction: 'desc' as const,
      value: 'priority-desc',
      label: '우선순위 ↓'
    };
    // 정렬 처리
    const sorted = [...filteredTodos].sort((a, b) => {
      let comparison = 0;

      switch (currentSortOption.field) {
        case 'priority':
          const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;

        case 'deadline':
          // 마감일이 없는 경우 처리
          const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          comparison = aDeadline - bDeadline;
          break;

        case 'createdAt':
          const aCreated = new Date(a.createdAt).getTime();
          const bCreated = new Date(b.createdAt).getTime();
          comparison = aCreated - bCreated;
          break;

        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;

        case 'title':
          comparison = a.title.localeCompare(b.title, 'ko-KR');
          break;

        case 'duration':
          comparison = a.duration - b.duration;
          break;

        default:
          comparison = 0;
      }

      // 내림차순인 경우 결과 반전
      return currentSortOption.direction === 'desc' ? -comparison : comparison;
    });

    if (isDev && !isE2E) {
      console.log('✅ Sorted results:', sorted.length, 'items');
    }
    return sorted;
  }, [filteredTodos, sortOption]);

  // 상태별로 그룹화 (정렬이 우선순위/상태 기반이 아닐 때만 사용)
  const shouldGroupByStatus = !sortOption || (sortOption.field !== 'priority' && sortOption.field !== 'deadline');

  const groupedTodos = useMemo(() => {
    if (!shouldGroupByStatus) {
      // 정렬 우선시 - 그룹화 없이 단순 목록
      return { all: sortedTodos };
    }

    const groups = {
      active: [] as Todo[],
      scheduled: [] as Todo[],
      waiting: [] as Todo[],
      missed: [] as Todo[],
      completed: [] as Todo[],
      other: [] as Todo[],
    };

    sortedTodos.forEach(todo => {
      switch (todo.status) {
        case 'IN_PROGRESS':
          groups.active.push(todo);
          break;
        case 'SCHEDULED':
          groups.scheduled.push(todo);
          break;
        case 'WAITING':
          groups.waiting.push(todo);
          break;
        case 'MISSED':
          groups.missed.push(todo);
          break;
        case 'COMPLETED':
          groups.completed.push(todo);
          break;
        default:
          groups.other.push(todo);
          break;
      }
    });

    return groups;
  }, [sortedTodos, shouldGroupByStatus]);

  const getTodoCount = () => {
    if (!shouldGroupByStatus) {
      const activeCount = sortedTodos.filter(todo => 
        ['IN_PROGRESS', 'SCHEDULED', 'WAITING'].includes(todo.status)
      ).length;
      return { active: activeCount, total: sortedTodos.length };
    }

    const activeCount = ('active' in groupedTodos ? (groupedTodos.active?.length || 0) + (groupedTodos.scheduled?.length || 0) + (groupedTodos.waiting?.length || 0) : 0);
    return { active: activeCount, total: sortedTodos.length };
  };

  const { active: activeCount, total: totalCount } = getTodoCount();

  // 에러 상태 처리
  if (error) {
    return (
      <div className="flex-1">
        <ListErrorFallback 
          onRetry={onRetry}
          message={error.message || '할 일 목록을 불러오는 중 오류가 발생했습니다.'}
        />
      </div>
    );
  }

  if (sortedTodos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">
            {todos.length === 0 ? '할 일이 없습니다' : '필터 조건에 맞는 할 일이 없습니다'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {todos.length === 0 ? '새로운 할 일을 추가해보세요' : '다른 필터를 시도해보세요'}
          </p>
        </div>
      </div>
    );
  }

  const renderTodoGroup = (title: string, todos: Todo[], color: string, icon?: string) => {
    if (todos.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
          <span className={`w-2 h-2 ${color} rounded-full mr-2 ${title === '놓친 할 일' ? 'animate-pulse' : ''}`}></span>
          {icon && <span className="mr-1">{icon}</span>}
          {title} ({todos.length})
        </h4>
        <div className="space-y-2">
          {todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onTodoClick={onTodoClick}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto sidebar-scroll">
      {/* 헤더 - 할 일 개수 및 정렬 정보 */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-2 mb-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            활성 {activeCount}개 · 전체 {totalCount}개
          </span>
          <div className="flex items-center space-x-2">
            {sortOption && (
              <span className="text-gray-400">
                {sortOption.label}
              </span>
            )}
            <span className="text-gray-400">
              드래그하여 일정에 추가
            </span>
          </div>
        </div>
      </div>

      {/* Todo 목록 */}
      <div className="px-4 space-y-2">
        {shouldGroupByStatus && 'active' in groupedTodos ? (
          // 상태별 그룹화된 표시
          <>
            {renderTodoGroup('진행 중', groupedTodos.active, 'bg-yellow-500', '🔄')}
            {renderTodoGroup('예정', groupedTodos.scheduled, 'bg-blue-500', '📅')}
            {renderTodoGroup('대기 중', groupedTodos.waiting, 'bg-gray-400', '⏳')}
            {renderTodoGroup('놓친 할 일', groupedTodos.missed, 'bg-red-500', '❌')}
            {renderTodoGroup('완료됨', groupedTodos.completed, 'bg-green-500', '✅')}
            {renderTodoGroup('기타', groupedTodos.other, 'bg-gray-300')}
          </>
        ) : (
          // 정렬 우선시 - 단순 목록
          <div className="space-y-2">
            {'all' in groupedTodos ? groupedTodos.all.map((todo, index) => (
              <div key={todo.id} className="relative">
                {/* 정렬 순서 표시 (선택사항) */}
                {sortOption && ['deadline', 'priority'].includes(sortOption.field) && (
                  <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 font-mono">
                    {index + 1}
                  </div>
                )}
                <TodoItem
                  todo={todo}
                  onTodoClick={onTodoClick}
                  onDragStart={onDragStart}
                />
              </div>
            )) : null}
          </div>
        )}
      </div>

      {/* 스크롤 여백 */}
      <div className="h-4"></div>
    </div>
  );
}