'use client';

import { Metadata } from 'next';
import { useState } from 'react';
import WeeklyCalendar from '@/components/calendar/WeeklyCalendar';
import TodoSidebar from '@/components/todo/TodoSidebar';
import { mockTodos, mockSchedules } from '@/lib/mockData';
import { Todo, TodoSchedule } from '@/types';

export default function HomePage() {
  const [draggedTodo, setDraggedTodo] = useState<Todo | null>(null);

  const handleScheduleClick = (schedule: TodoSchedule) => {
    console.log('Schedule clicked:', schedule);
    // TODO: 스케줄 상세 모달 또는 편집 기능 구현
  };

  const handleTimeSlotClick = (date: Date, hour: number, minute: number) => {
    console.log('Time slot clicked:', { date, hour, minute });
    // TODO: 새 Todo 생성 또는 드래그 앤 드롭 기능 구현
  };

  const handleTodoClick = (todo: Todo) => {
    console.log('Todo clicked:', todo);
    // TODO: Todo 상세 모달 또는 편집 기능 구현
  };

  const handleTodoDragStart = (e: React.DragEvent, todo: Todo) => {
    console.log('Todo drag started:', todo);
    setDraggedTodo(todo);
    
    // 드래그 중 스타일을 위한 클래스 추가
    e.currentTarget.classList.add('dragging');
    
    // 드래그가 끝나면 클래스 제거
    setTimeout(() => {
      e.currentTarget.classList.remove('dragging');
    }, 100);
  };

  const handleAddTodo = () => {
    console.log('Add todo clicked');
    // TODO: 새 Todo 생성 모달 구현
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-full mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Todo Time-blocking
          </h1>
          <p className="text-sm text-gray-600">
            당신의 할 일을 분명한 일정으로 관리하세요.
          </p>
        </div>
      </header>
      
      {/* 메인 컨텐츠 */}
      <div className="flex h-[calc(100vh-88px)]">
        {/* Todo 사이드바 */}
        <TodoSidebar
          todos={mockTodos}
          onTodoClick={handleTodoClick}
          onDragStart={handleTodoDragStart}
          onAddTodo={handleAddTodo}
        />
        
        {/* 캘린더 영역 */}
        <div className="flex-1 p-4">
          <WeeklyCalendar
            schedules={mockSchedules}
            todos={mockTodos}
            onScheduleClick={handleScheduleClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        </div>
      </div>
    </div>
  );
}