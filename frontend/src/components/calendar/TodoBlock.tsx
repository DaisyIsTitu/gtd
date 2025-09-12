import { Todo, TodoSchedule } from '@/types';
import { 
  getCategoryColor, 
  getStatusColor, 
  getPriorityColor, 
  formatTime, 
  formatDuration,
  CATEGORY_LABELS,
  PRIORITY_LABELS 
} from '@/lib/constants';

interface TodoBlockProps {
  schedule: TodoSchedule;
  todo: Todo;
  onClick?: (schedule: TodoSchedule) => void;
}

export default function TodoBlock({ schedule, todo, onClick }: TodoBlockProps) {
  const categoryColors = getCategoryColor(todo.category);
  const statusColors = getStatusColor(todo.status);
  const priorityColors = getPriorityColor(todo.priority);

  // 상태에 따른 스타일 적용
  const getBlockStyles = () => {
    let baseStyles = 'p-2 rounded-md border cursor-pointer transition-all duration-200 hover:shadow-md';
    
    // 상태별 스타일
    switch (todo.status) {
      case 'IN_PROGRESS':
        baseStyles += ' ring-2 ring-offset-1 animate-pulse';
        break;
      case 'COMPLETED':
        baseStyles += ' opacity-60 line-through';
        break;
      case 'MISSED':
        baseStyles += ' ring-2 ring-offset-1';
        break;
      default:
        baseStyles += ' hover:scale-[1.02] active:scale-[0.98]';
    }

    return baseStyles;
  };

  // 우선순위별 좌측 보더
  const getPriorityBorder = () => {
    const borderWidth = {
      LOW: 'border-l-2',
      MEDIUM: 'border-l-3', 
      HIGH: 'border-l-4',
      URGENT: 'border-l-4',
    };
    
    let borderClass = borderWidth[todo.priority] || borderWidth.MEDIUM;
    
    if (todo.priority === 'URGENT') {
      borderClass += ' animate-pulse';
    }

    return borderClass;
  };

  const handleClick = () => {
    onClick?.(schedule);
  };

  // 인라인 스타일로 동적 색상 적용
  const blockStyle = {
    backgroundColor: statusColors.bg,
    borderColor: categoryColors.primary,
    color: categoryColors.text,
    borderLeftColor: priorityColors.primary,
  };

  return (
    <div
      onClick={handleClick}
      className={`
        ${getBlockStyles()}
        ${getPriorityBorder()}
      `}
      style={blockStyle}
      data-todo-id={todo.id}
      data-schedule-id={schedule.id}
      title={`${todo.title} - ${CATEGORY_LABELS[todo.category]} (${PRIORITY_LABELS[todo.priority]})`}
    >
      {/* 상단: 제목과 상태 표시 */}
      <div className="flex justify-between items-start mb-1">
        <h3 className={`font-medium text-sm leading-tight flex-1 mr-1 ${
          todo.status === 'COMPLETED' ? 'line-through opacity-60' : ''
        }`}>
          {todo.title}
        </h3>
        <div className="flex items-center space-x-1">
          {/* 우선순위 표시 */}
          {todo.priority === 'URGENT' && (
            <span style={{ color: priorityColors.primary }} className="text-xs">⚡</span>
          )}
          {todo.priority === 'HIGH' && (
            <span style={{ color: priorityColors.primary }} className="text-xs">🔥</span>
          )}
          
          {/* 상태 표시 */}
          {todo.status === 'IN_PROGRESS' && (
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: statusColors.primary }}
            />
          )}
          {todo.status === 'COMPLETED' && (
            <span style={{ color: statusColors.primary }} className="text-xs">✅</span>
          )}
          {todo.status === 'MISSED' && (
            <span style={{ color: statusColors.primary }} className="text-xs">⚠️</span>
          )}
        </div>
      </div>

      {/* 시간 정보 */}
      <div className="text-xs opacity-75 flex justify-between items-center">
        <span>
          {formatTime(new Date(schedule.startTime))} - {formatTime(new Date(schedule.endTime))}
        </span>
        <span className="font-medium">
          {formatDuration(todo.duration)}
        </span>
      </div>

      {/* 카테고리 라벨 */}
      <div className="mt-1 flex items-center justify-between">
        <span 
          className="inline-block px-1.5 py-0.5 text-xs rounded-full font-medium"
          style={{ 
            backgroundColor: categoryColors.bg,
            color: categoryColors.text 
          }}
        >
          {CATEGORY_LABELS[todo.category]}
        </span>
        
        {/* 우선순위 라벨 (URGENT, HIGH만 표시) */}
        {(todo.priority === 'URGENT' || todo.priority === 'HIGH') && (
          <span 
            className="inline-block px-1.5 py-0.5 text-xs rounded-full font-medium"
            style={{ 
              backgroundColor: priorityColors.indicator,
              color: priorityColors.text 
            }}
          >
            {PRIORITY_LABELS[todo.priority]}
          </span>
        )}
      </div>

      {/* 태그들 (있는 경우) */}
      {todo.tags && todo.tags.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {todo.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-1 py-0.5 text-xs rounded-md opacity-60"
              style={{ backgroundColor: categoryColors.primary + '20' }}
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
          <span 
            className="inline-block w-2 h-2 rounded-full mr-1"
            style={{ backgroundColor: categoryColors.primary }}
          />
          {schedule.splitInfo.partNumber}/{schedule.splitInfo.totalParts} 분할
        </div>
      )}
    </div>
  );
}