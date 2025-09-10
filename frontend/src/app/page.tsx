'use client';

import { Metadata } from 'next';
import WeeklyCalendar from '@/components/calendar/WeeklyCalendar';
import { mockTodos, mockSchedules } from '@/lib/mockData';
import { TodoSchedule } from '@/types';

export default function HomePage() {
  const handleScheduleClick = (schedule: TodoSchedule) => {
    console.log('Schedule clicked:', schedule);
    // TODO: 스케줄 상세 모달 또는 편집 기능 구현
  };

  const handleTimeSlotClick = (date: Date, hour: number, minute: number) => {
    console.log('Time slot clicked:', { date, hour, minute });
    // TODO: 새 Todo 생성 또는 드래그 앤 드롭 기능 구현
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Todo Time-blocking
          </h1>
          <p className="text-gray-600">
            Akiflow 스타일의 주간 캘린더로 일정을 효율적으로 관리하세요
          </p>
        </header>
        
        <main>
          <WeeklyCalendar
            schedules={mockSchedules}
            todos={mockTodos}
            onScheduleClick={handleScheduleClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        </main>
      </div>
    </div>
  );
}