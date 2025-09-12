'use client';

import { useTodoFilters, useTodoStore } from '@/store';
import { Todo } from '@/types';
import TodoFilter from './TodoFilter';
import TodoList from './TodoList';

interface TodoSidebarProps {
  todos: Todo[];
  onTodoClick?: (todo: Todo) => void;
  onDragStart?: (e: React.DragEvent, todo: Todo) => void;
  onAddTodo?: () => void;
}

export default function TodoSidebar({
  todos,
  onTodoClick,
  onDragStart,
  onAddTodo
}: TodoSidebarProps) {
  const filters = useTodoFilters();
  const { setFilters } = useTodoStore();
  const { isSidebarCollapsed, setSidebarCollapsed } = useTodoStore(state => ({
    isSidebarCollapsed: false, // We can add this to UI store later if needed
    setSidebarCollapsed: () => {}, // Placeholder for now
  }));

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleDragStart = (e: React.DragEvent, todo: Todo) => {
    // 드래그 데이터 설정
    e.dataTransfer.setData('application/json', JSON.stringify({
      todo,
      sourceType: 'SIDEBAR',
    }));
    e.dataTransfer.effectAllowed = 'move';
    
    // 부모 컴포넌트에 알림
    onDragStart?.(e, todo);
  };

  const getActiveCount = () => {
    return todos.filter(todo => 
      todo.status === 'WAITING' || 
      todo.status === 'SCHEDULED' || 
      todo.status === 'IN_PROGRESS'
    ).length;
  };

  const isCollapsed = false; // We'll implement this later with UI store

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white border-r border-gray-200 flex flex-col items-center py-4">
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          title="할 일 목록 열기"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        {/* 활성 할 일 개수 표시 */}
        {getActiveCount() > 0 && (
          <div className="mt-2 w-6 h-6 bg-blue-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
            {getActiveCount() > 99 ? '99+' : getActiveCount()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
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
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            
            {/* 접기 버튼 (나중에 구현) */}
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              title="사이드바 접기"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 간단한 통계 */}
        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
          <span>전체 {todos.length}개</span>
          <span>활성 {getActiveCount()}개</span>
        </div>
      </div>

      {/* 필터 */}
      <div className="p-4">
        <TodoFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Todo 목록 */}
      <div className="flex-1 overflow-hidden">
        <TodoList
          todos={todos}
          filters={filters}
          onTodoClick={onTodoClick}
          onDragStart={handleDragStart}
        />
      </div>

      {/* 푸터 (드래그 안내) */}
      <div className="border-t border-gray-100 p-3">
        <div className="text-xs text-gray-500 text-center flex items-center justify-center space-x-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l4-4 4 4m0 0l4-4-4-4m4 4H3" />
          </svg>
          <span>할 일을 캘린더로 드래그하여 일정에 추가</span>
        </div>
      </div>
    </div>
  );
}