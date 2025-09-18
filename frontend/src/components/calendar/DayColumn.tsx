import { Todo, TodoSchedule } from '@/types';
import TodoBlock from './TodoBlock';
import { CALENDAR_HOURS } from '@/lib/constants';

interface DayColumnProps {
  date: Date;
  schedules: TodoSchedule[];
  todos: Todo[];
  onScheduleClick?: (schedule: TodoSchedule) => void;
  onTimeSlotClick?: (date: Date, hour: number, minute: number) => void;
  isToday?: boolean;
  isWeekend?: boolean;
  isPreviewMode?: boolean;
}

export default function DayColumn({
  date,
  schedules,
  todos,
  onScheduleClick,
  onTimeSlotClick,
  isToday = false,
  isWeekend = false,
  isPreviewMode = false
}: DayColumnProps) {
  // 정책에 따른 업무 시간대 (10:00 AM ~ 8:00 PM)
  const hours = Array.from({ length: CALENDAR_HOURS.END - CALENDAR_HOURS.START }, (_, i) => i + CALENDAR_HOURS.START);

  // Todo 찾기 함수
  const getTodoForSchedule = (schedule: TodoSchedule): Todo | undefined => {
    return todos.find(todo => todo.id === schedule.todoId);
  };

  // 시간 위치 계산 (시작 시간을 기준 0으로)
  const getTimePosition = (time: Date) => {
    const hour = time.getHours();
    const minute = time.getMinutes();
    const relativeHour = hour - CALENDAR_HOURS.START; // 시작 시간을 기준으로 상대적 시간
    return (relativeHour * CALENDAR_HOURS.SLOT_HEIGHT) + (minute / 60 * CALENDAR_HOURS.SLOT_HEIGHT);
  };

  // 시간 슬롯 높이 계산
  const getBlockHeight = (startTime: Date, endTime: Date) => {
    const start = getTimePosition(startTime);
    const end = getTimePosition(endTime);
    return Math.max(end - start, 20); // 최소 20px 높이
  };

  // 시간 슬롯 클릭 핸들러
  const handleTimeSlotClick = (hour: number, isHalfHour: boolean) => {
    // 주말에는 배치 불가 (정책에 따라)
    if (isWeekend) {
      alert('주말에는 할 일을 배치하지 않습니다.');
      return;
    }
    const minute = isHalfHour ? 30 : 0;
    onTimeSlotClick?.(date, hour, minute);
  };

  // 해당 시간대에 겹치는 스케줄 체크
  const hasScheduleAt = (hour: number, minute: number) => {
    const targetTime = new Date(date);
    targetTime.setHours(hour, minute, 0, 0);
    
    return schedules.some(schedule => {
      const start = new Date(schedule.startTime);
      const end = new Date(schedule.endTime);
      return targetTime >= start && targetTime < end;
    });
  };

  return (
    <div className={`
      flex-1 border-l border-gray-200 first:border-l-0 relative
      ${isToday ? 'bg-blue-50/50' : 'bg-white'}
    `}>
      {/* 시간 그리드 */}
      <div className="absolute inset-0">
        {hours.map((hour) => (
          <div key={hour} className="relative" style={{ height: `${CALENDAR_HOURS.SLOT_HEIGHT}px` }}>
            {/* 전체 시간 슬롯 */}
            <div
              className={`
                absolute inset-0 border-b border-gray-100 transition-colors
                ${isWeekend ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-blue-50'}
                ${hasScheduleAt(hour, 0) || isWeekend ? '' : 'hover:bg-blue-50'}
              `}
              onClick={() => handleTimeSlotClick(hour, false)}
            />
            
            {/* 30분 슬롯 */}
            <div
              className={`
                absolute inset-x-0 border-b border-gray-100 transition-colors
                ${isWeekend ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-blue-50'}
                ${hasScheduleAt(hour, 30) || isWeekend ? '' : 'hover:bg-blue-50'}
              `}
              style={{
                top: `${CALENDAR_HOURS.HALF_SLOT_HEIGHT}px`,
                height: `${CALENDAR_HOURS.HALF_SLOT_HEIGHT}px`
              }}
              onClick={() => handleTimeSlotClick(hour, true)}
            />

            {/* 30분 구분선 */}
            <div
              className="absolute inset-x-0 h-px bg-gray-200"
              style={{ top: `${CALENDAR_HOURS.HALF_SLOT_HEIGHT}px` }}
            />
          </div>
        ))}
      </div>

      {/* Todo 블록들 */}
      <div className="relative z-10">
        {schedules.map((schedule) => {
          const todo = getTodoForSchedule(schedule);
          if (!todo) return null;

          const top = getTimePosition(new Date(schedule.startTime));
          const height = getBlockHeight(new Date(schedule.startTime), new Date(schedule.endTime));

          return (
            <div
              key={schedule.id}
              className="absolute inset-x-1"
              style={{
                top: `${top}px`,
                height: `${height}px`,
              }}
            >
              <TodoBlock
                schedule={schedule}
                todo={todo}
                onClick={onScheduleClick}
                isPreviewMode={isPreviewMode}
                isPreviewNew={isPreviewMode && schedule.isPreviewNew}
                isPreviewExisting={isPreviewMode && schedule.isPreviewExisting}
              />
            </div>
          );
        })}
      </div>

      {/* 오늘 표시 */}
      {isToday && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-400 rounded-b" />
      )}

    </div>
  );
}