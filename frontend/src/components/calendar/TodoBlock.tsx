import { Todo, TodoSchedule, TodoCategory, TodoPriority } from '@/types';

interface TodoBlockProps {
  schedule: TodoSchedule;
  todo: Todo;
  onClick?: (schedule: TodoSchedule) => void;
}

export default function TodoBlock({ schedule, todo, onClick }: TodoBlockProps) {
  // 카테고리별 색상 클래스 매핑
  const getCategoryColor = (category: TodoCategory) => {
    const colors = {
      WORK: 'bg-blue-100 border-blue-300 text-blue-800',
      PERSONAL: 'bg-green-100 border-green-300 text-green-800',
      HEALTH: 'bg-red-100 border-red-300 text-red-800',
      LEARNING: 'bg-purple-100 border-purple-300 text-purple-800',
      SOCIAL: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      OTHER: 'bg-gray-100 border-gray-300 text-gray-800',
    };
    return colors[category] || colors.OTHER;
  };

  // 우선순위별 보더 굵기
  const getPriorityBorder = (priority: TodoPriority) => {
    const borders = {
      LOW: 'border-l-2',
      MEDIUM: 'border-l-3',
      HIGH: 'border-l-4',
      URGENT: 'border-l-4 animate-pulse',
    };
    return borders[priority] || borders.MEDIUM;
  };

  // 시간 포맷팅
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(date));
  };

  // duration을 시간 단위로 변환
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}시간 ${remainingMinutes}분` : `${hours}시간`;
  };

  const handleClick = () => {
    onClick?.(schedule);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        p-2 rounded-md border cursor-move transition-all duration-200
        hover:shadow-md hover:scale-105 active:scale-95
        ${getCategoryColor(todo.category)}
        ${getPriorityBorder(todo.priority)}
      `}
      data-todo-id={todo.id}
      data-schedule-id={schedule.id}
    >
      {/* 상단: 제목과 시간 */}
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-medium text-sm leading-tight flex-1 mr-1">
          {todo.title}
        </h3>
        {todo.priority === 'URGENT' && (
          <span className="text-red-500 text-xs">⚡</span>
        )}
      </div>

      {/* 시간 정보 */}
      <div className="text-xs opacity-75 flex justify-between items-center">
        <span>
          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
        </span>
        <span className="font-medium">
          {formatDuration(todo.duration)}
        </span>
      </div>

      {/* 태그들 (있는 경우) */}
      {todo.tags && todo.tags.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {todo.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-1.5 py-0.5 text-xs rounded-full bg-black bg-opacity-10"
            >
              #{tag}
            </span>
          ))}
          {todo.tags.length > 2 && (
            <span className="text-xs opacity-50">
              +{todo.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* 분할된 작업인 경우 */}
      {schedule.splitInfo && (
        <div className="mt-1 text-xs opacity-60 flex items-center">
          <span className="inline-block w-2 h-2 bg-current rounded-full mr-1" />
          {schedule.splitInfo.partNumber}/{schedule.splitInfo.totalParts}
        </div>
      )}
    </div>
  );
}