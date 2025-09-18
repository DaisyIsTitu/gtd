import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface CalendarHeaderProps {
  currentWeek: Date;
  weekDays: Date[];
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

export default function CalendarHeader({
  currentWeek,
  weekDays,
  onPreviousWeek,
  onNextWeek,
  onToday
}: CalendarHeaderProps) {
  const formatWeekRange = (startDate: Date, endDate: Date) => {
    const startMonth = startDate.toLocaleDateString('ko-KR', { month: 'long' });
    const startDay = startDate.getDate();
    const endMonth = endDate.toLocaleDateString('ko-KR', { month: 'long' });
    const endDay = endDate.getDate();
    
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startMonth} ${startDay}일 - ${endDay}일`;
    } else {
      return `${startMonth} ${startDay}일 - ${endMonth} ${endDay}일`;
    }
  };

  const formatDayOfWeek = (date: Date, index: number) => {
    const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
    return dayNames[index];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200">
      {/* 상단 네비게이션 */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatWeekRange(weekStart, weekEnd)}
          </h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={onPreviousWeek}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              aria-label="이전 주"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={onNextWeek}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              aria-label="다음 주"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
        
        <button
          onClick={onToday}
          className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors"
        >
          오늘
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="flex">
        {/* 시간 컬럼 공간 */}
        <div className="w-16 flex-shrink-0" />
        
        {/* 날짜 헤더들 */}
        {weekDays.map((date, index) => (
          <div key={date.toISOString()} className="flex-1 border-l border-gray-200 dark:border-gray-700 first:border-l-0">
            <div className="p-3 text-center">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                {formatDayOfWeek(date, index)}
              </div>
              <div className={`
                text-lg font-semibold
                ${isToday(date)
                  ? 'bg-primary-500 dark:bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto'
                  : 'text-gray-700 dark:text-gray-300'
                }
              `}>
                {date.getDate()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}