'use client';

import { useMemo } from 'react';
import { Todo, FilterOptions } from '@/types';
import TodoItem from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  filters: FilterOptions;
  onTodoClick?: (todo: Todo) => void;
  onDragStart?: (e: React.DragEvent, todo: Todo) => void;
}

export default function TodoList({ todos, filters, onTodoClick, onDragStart }: TodoListProps) {
  // 필터링된 Todo 목록
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      // 카테고리 필터
      if (filters.categories.length > 0 && !filters.categories.includes(todo.category)) {
        return false;
      }

      // 우선순위 필터
      if (filters.priorities.length > 0 && !filters.priorities.includes(todo.priority)) {
        return false;
      }

      // 상태 필터
      if (filters.statuses.length > 0 && !filters.statuses.includes(todo.status)) {
        return false;
      }

      // 태그 필터 (하나라도 일치하면 포함)
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(filterTag =>
          todo.tags.some(todoTag => 
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

  // 우선순위별로 정렬 (URGENT > HIGH > MEDIUM > LOW)
  const sortedTodos = useMemo(() => {
    const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    
    return [...filteredTodos].sort((a, b) => {
      // 1차: 우선순위 순서
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // 2차: 상태 순서 (진행중 > 예정 > 대기 > 완료 > 놓침 > 취소)
      const statusOrder = {
        IN_PROGRESS: 0,
        SCHEDULED: 1,
        WAITING: 2,
        COMPLETED: 3,
        MISSED: 4,
        CANCELLED: 5,
      };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      
      // 3차: 생성일 (최신순)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredTodos]);

  // 상태별로 그룹화
  const groupedTodos = useMemo(() => {
    const groups = {
      active: [] as Todo[],
      scheduled: [] as Todo[],
      waiting: [] as Todo[],
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
        case 'COMPLETED':
          groups.completed.push(todo);
          break;
        default:
          groups.other.push(todo);
          break;
      }
    });

    return groups;
  }, [sortedTodos]);

  const getTodoCount = () => {
    const activeCount = groupedTodos.active.length + groupedTodos.scheduled.length;
    const totalCount = sortedTodos.length;
    return { active: activeCount, total: totalCount };
  };

  const { active: activeCount, total: totalCount } = getTodoCount();

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

  return (
    <div className="flex-1 overflow-y-auto sidebar-scroll">
      {/* 헤더 - 할 일 개수 */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-2 mb-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            활성 {activeCount}개 · 전체 {totalCount}개
          </span>
          <span className="text-gray-400">
            드래그하여 일정에 추가
          </span>
        </div>
      </div>

      {/* Todo 목록 */}
      <div className="px-4 space-y-2">
        {/* 진행 중인 할 일 */}
        {groupedTodos.active.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              진행 중 ({groupedTodos.active.length})
            </h4>
            <div className="space-y-2">
              {groupedTodos.active.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onTodoClick={onTodoClick}
                  onDragStart={onDragStart}
                />
              ))}
            </div>
          </div>
        )}

        {/* 예정된 할 일 */}
        {groupedTodos.scheduled.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              예정됨 ({groupedTodos.scheduled.length})
            </h4>
            <div className="space-y-2">
              {groupedTodos.scheduled.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onTodoClick={onTodoClick}
                  onDragStart={onDragStart}
                />
              ))}
            </div>
          </div>
        )}

        {/* 대기 중인 할 일 */}
        {groupedTodos.waiting.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
              대기 중 ({groupedTodos.waiting.length})
            </h4>
            <div className="space-y-2">
              {groupedTodos.waiting.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onTodoClick={onTodoClick}
                  onDragStart={onDragStart}
                />
              ))}
            </div>
          </div>
        )}

        {/* 완료된 할 일 */}
        {groupedTodos.completed.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              완료됨 ({groupedTodos.completed.length})
            </h4>
            <div className="space-y-2">
              {groupedTodos.completed.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onTodoClick={onTodoClick}
                  onDragStart={onDragStart}
                />
              ))}
            </div>
          </div>
        )}

        {/* 기타 할 일 */}
        {groupedTodos.other.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
              <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
              기타 ({groupedTodos.other.length})
            </h4>
            <div className="space-y-2">
              {groupedTodos.other.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onTodoClick={onTodoClick}
                  onDragStart={onDragStart}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 스크롤 여백 */}
      <div className="h-4"></div>
    </div>
  );
}