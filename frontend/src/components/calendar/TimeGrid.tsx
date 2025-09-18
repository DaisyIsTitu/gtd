import { WORK_HOURS, CALENDAR_HOURS, isWorkHour, isLunchTime } from '@/lib/constants';

export default function TimeGrid() {
  // 10:00 AM ~ 8:00 PM (20:00) - 11시간
  const hours = Array.from({ length: CALENDAR_HOURS.END - CALENDAR_HOURS.START }, (_, i) => i + CALENDAR_HOURS.START);

  const formatHour = (hour: number) => {
    if (hour === 12) return '12 PM';
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  const getHourStyles = (hour: number) => {
    const isWork = isWorkHour(hour);
    const isLunch = isLunchTime(hour);
    
    let styles = 'h-20 border-b border-gray-200 dark:border-gray-700 relative transition-colors';

    if (isWork) {
      styles += ' bg-blue-50/30 dark:bg-blue-900/10'; // 업무 시간대 - 연한 파란색
    } else {
      styles += ' bg-gray-50 dark:bg-gray-800/50'; // 비업무 시간대 - 회색
    }

    if (isLunch) {
      styles += ' bg-orange-50/50 dark:bg-orange-900/10'; // 점심 시간 - 연한 주황색
    }
    
    return styles;
  };

  const getTimeTextStyles = (hour: number) => {
    const isWork = isWorkHour(hour);
    const isLunch = isLunchTime(hour);
    
    let styles = 'absolute -top-2 right-2 text-xs font-medium';
    
    if (isWork) {
      styles += ' text-blue-700 dark:text-blue-400'; // 업무 시간 텍스트
    } else {
      styles += ' text-gray-500 dark:text-gray-400'; // 비업무 시간 텍스트
    }

    if (isLunch) {
      styles += ' text-orange-600 dark:text-orange-400'; // 점심 시간 텍스트
    }
    
    return styles;
  };

  return (
    <div className="w-16 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 transition-colors duration-200">
      <div className="relative">
        {hours.map((hour, index) => (
          <div key={hour} className="relative">
            {/* 전체 시간 */}
            <div className={getHourStyles(hour)}>
              <div className={getTimeTextStyles(hour)}>
                {formatHour(hour)}
              </div>
              
              {/* 업무시간대 시작 표시 */}
              {hour === WORK_HOURS.START && (
                <div className="absolute left-0 top-0 w-1 h-full bg-blue-400 rounded-r" />
              )}
              
              {/* 업무시간대 종료 표시 */}
              {hour === WORK_HOURS.END - 1 && (
                <div className="absolute left-0 bottom-0 w-1 h-full bg-blue-400 rounded-r" />
              )}
              
              {/* 점심시간 표시 */}
              {isLunchTime(hour) && (
                <div className="absolute left-0 top-0 w-2 h-full bg-orange-300/50 rounded-r" />
              )}
              
              {/* 30분 구분선 */}
              <div className={`absolute top-10 right-0 w-3 h-px ${
                isWorkHour(hour) ? 'bg-blue-300' : 'bg-gray-300'
              }`} />
            </div>
          </div>
        ))}
      </div>
      
      {/* 업무시간대 범례 (선택사항) */}
      <div className="absolute top-2 left-1 space-y-1">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full" />
          <span className="text-xs text-blue-700 font-medium">업무</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-orange-300 rounded-full" />
          <span className="text-xs text-orange-600 font-medium">점심</span>
        </div>
      </div>
    </div>
  );
}