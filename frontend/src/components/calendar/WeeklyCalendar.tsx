'use client';

import { useState } from 'react';
import CalendarHeader from './CalendarHeader';
import TimeGrid from './TimeGrid';
import DayColumn from './DayColumn';
import CurrentTimeIndicator from './CurrentTimeIndicator';
import { Todo, TodoSchedule } from '@/types';

interface WeeklyCalendarProps {
  schedules?: TodoSchedule[];
  todos?: Todo[];
  onScheduleClick?: (schedule: TodoSchedule) => void;
  onTimeSlotClick?: (date: Date, hour: number, minute: number) => void;
  isPreviewMode?: boolean;
}

export default function WeeklyCalendar({
  schedules = [],
  todos = [],
  onScheduleClick,
  onTimeSlotClick,
  isPreviewMode = false
}: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // 주간의 시작일 (월요일) 계산
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 월요일을 주의 시작으로
    return new Date(d.setDate(diff));
  };

  // 주간 날짜 배열 생성 (월-일)
  const getWeekDays = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekStart = getWeekStart(currentWeek);
  const weekDays = getWeekDays(weekStart);

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const handleToday = () => {
    setCurrentWeek(new Date());
  };

  // 해당 날짜의 스케줄 필터링
  const getSchedulesForDate = (date: Date) => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startTime);
      return (
        scheduleDate.getFullYear() === date.getFullYear() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getDate() === date.getDate()
      );
    });
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <CalendarHeader
        currentWeek={weekStart}
        weekDays={weekDays}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
      />
      
      <div className="flex h-[880px] overflow-hidden">
        {/* 시간 축 */}
        <TimeGrid />
        
        {/* 날짜별 컬럼들 */}
        <div className="flex-1 flex">
          {weekDays.map((date, index) => (
            <DayColumn
              key={date.toISOString()}
              date={date}
              schedules={getSchedulesForDate(date)}
              todos={todos}
              onScheduleClick={onScheduleClick}
              onTimeSlotClick={onTimeSlotClick}
              isToday={
                date.toDateString() === new Date().toDateString()
              }
              isPreviewMode={isPreviewMode}
            />
          ))}
        </div>
      </div>
      
      <CurrentTimeIndicator weekDays={weekDays} />
    </div>
  );
}