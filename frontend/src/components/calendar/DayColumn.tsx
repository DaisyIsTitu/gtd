import { Todo, TodoSchedule } from '@/types';
import TodoBlock from './TodoBlock';

interface DayColumnProps {
  date: Date;
  schedules: TodoSchedule[];
  todos: Todo[];
  onScheduleClick?: (schedule: TodoSchedule) => void;
  onTimeSlotClick?: (date: Date, hour: number, minute: number) => void;
  isToday?: boolean;
  isPreviewMode?: boolean;
}

export default function DayColumn({
  date,
  schedules,
  todos,
  onScheduleClick,
  onTimeSlotClick,
  isToday = false,
  isPreviewMode = false
}: DayColumnProps) {
  // 6:00 AM ~ 11:00 PM (23:00) - 18시간
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);

  // Todo 찾기 함수
  const getTodoForSchedule = (schedule: TodoSchedule): Todo | undefined => {
    return todos.find(todo => todo.id === schedule.todoId);
  };

  // 시간 위치 계산 (6:00을 기준 0으로)
  const getTimePosition = (time: Date) => {
    const hour = time.getHours();
    const minute = time.getMinutes();
    const relativeHour = hour - 6; // 6:00을 기준으로 상대적 시간
    return (relativeHour * 80) + (minute / 60 * 80); // 각 시간을 80px로 설정
  };

  // 시간 슬롯 높이 계산
  const getBlockHeight = (startTime: Date, endTime: Date) => {
    const start = getTimePosition(startTime);
    const end = getTimePosition(endTime);
    return Math.max(end - start, 20); // 최소 20px 높이
  };

  // 시간 슬롯 클릭 핸들러
  const handleTimeSlotClick = (hour: number, isHalfHour: boolean) => {
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
      ${isToday ? 'bg-primary-50/30' : 'bg-white'}
    `}>
      {/* 시간 그리드 */}
      <div className="absolute inset-0">
        {hours.map((hour) => (
          <div key={hour} className="relative h-20">
            {/* 전체 시간 슬롯 */}
            <div 
              className={`
                absolute inset-0 border-b border-gray-100 cursor-pointer
                hover:bg-blue-50 transition-colors
                ${hasScheduleAt(hour, 0) ? '' : 'hover:bg-blue-50'}
              `}
              onClick={() => handleTimeSlotClick(hour, false)}
            />
            
            {/* 30분 슬롯 */}
            <div 
              className={`
                absolute inset-x-0 top-10 h-10 border-b border-gray-100 cursor-pointer
                hover:bg-blue-50 transition-colors
                ${hasScheduleAt(hour, 30) ? '' : 'hover:bg-blue-50'}
              `}
              onClick={() => handleTimeSlotClick(hour, true)}
            />
            
            {/* 30분 구분선 */}
            <div className="absolute top-10 inset-x-0 h-px bg-gray-200" />
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
              />
            </div>
          );
        })}
      </div>

      {/* 오늘 표시 (선택사항) */}
      {isToday && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-primary-400 rounded-b" />
      )}
    </div>
  );
}