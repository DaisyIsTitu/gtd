'use client';

import { useEffect } from 'react';
import WeeklyCalendar from '@/components/calendar/WeeklyCalendar';
import TodoSidebar from '@/components/todo/TodoSidebar';
import NotificationSystem from '@/components/ui/NotificationSystem';
import TodoAddModal from '@/components/todo/TodoAddModal';
import TodoEditModal from '@/components/todo/TodoEditModal';
import { mockSchedules } from '@/lib/mockData';
import { TodoSchedule } from '@/types';
import {
  useTodoStore,
  useFilteredTodos,
  useTodoLoading,
  useTodoError,
  useAddTodoModal,
  useEditTodoModal,
  useToast,
} from '@/store';

export default function HomePage() {
  // Store hooks
  const { fetchTodos, createTodo, updateTodo, deleteTodo, clearError } = useTodoStore();
  const todos = useFilteredTodos();
  const loading = useTodoLoading();
  const error = useTodoError();
  
  // Modal hooks
  const addModal = useAddTodoModal();
  const editModal = useEditTodoModal();
  
  // Toast notifications
  const toast = useToast();

  // Load todos on component mount
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Handle API errors with toast notifications
  useEffect(() => {
    if (error) {
      toast.error('오류 발생', error);
      clearError();
    }
  }, [error, toast, clearError]);

  // Event handlers
  const handleScheduleClick = (schedule: TodoSchedule) => {
    console.log('Schedule clicked:', schedule);
    // TODO: 스케줄 상세 모달 또는 편집 기능 구현
  };

  const handleTimeSlotClick = (date: Date, hour: number, minute: number) => {
    console.log('Time slot clicked:', { date, hour, minute });
    // TODO: 새 Todo 생성 또는 드래그 앤 드롭 기능 구현
  };

  const handleTodoClick = (todo: any) => {
    console.log('Todo clicked:', todo);
    editModal.open(todo);
  };

  const handleTodoDragStart = (e: React.DragEvent, todo: any) => {
    console.log('Todo drag started:', todo);
    
    // 드래그 중 스타일을 위한 클래스 추가
    e.currentTarget.classList.add('dragging');
    
    // 드래그가 끝나면 클래스 제거
    setTimeout(() => {
      e.currentTarget.classList.remove('dragging');
    }, 100);
  };

  // Modal event handlers
  const handleTodoCreated = async (todoData: any) => {
    const newTodo = await createTodo(todoData);
    if (newTodo) {
      toast.success('할 일 생성 완료', `"${newTodo.title}"이(가) 생성되었습니다.`);
      addModal.close();
    }
  };

  const handleTodoUpdated = (updatedTodo: any) => {
    toast.success('할 일 수정 완료', `"${updatedTodo.title}"이(가) 수정되었습니다.`);
    editModal.close();
  };

  const handleTodoDeleted = async (todoId: string) => {
    const success = await deleteTodo(todoId);
    if (success) {
      toast.success('할 일 삭제 완료', '할 일이 삭제되었습니다.');
      editModal.close();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification System */}
      <NotificationSystem />

      {/* Modals */}
      <TodoAddModal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        onTodoCreated={handleTodoCreated}
      />

      <TodoEditModal
        isOpen={editModal.isOpen}
        todo={editModal.todo}
        onClose={editModal.close}
        onTodoUpdated={handleTodoUpdated}
        onTodoDeleted={handleTodoDeleted}
      />

      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Todo Time-blocking
            </h1>
            <p className="text-sm text-gray-600">
              당신의 할 일을 명확한 일정으로 관리하세요.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {!loading && (
              <div className="text-sm text-gray-500">
                총 {todos.length}개의 할 일
              </div>
            )}
            <button
              onClick={addModal.open}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              새 할 일
            </button>
          </div>
        </div>
      </header>
      
      {/* 메인 컨텐츠 */}
      <div className="flex h-[calc(100vh-88px)]">
        {/* Todo 사이드바 */}
        <TodoSidebar
          todos={todos}
          onTodoClick={handleTodoClick}
          onDragStart={handleTodoDragStart}
          onAddTodo={addModal.open}
        />
        
        {/* 캘린더 영역 */}
        <div className="flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center space-x-2 text-gray-500">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>할 일 목록을 로드하는 중...</span>
              </div>
            </div>
          ) : (
            <WeeklyCalendar
              schedules={mockSchedules}
              todos={todos}
              onScheduleClick={handleScheduleClick}
              onTimeSlotClick={handleTimeSlotClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}