export default function TimeGrid() {
  // 6:00 AM ~ 11:00 PM (23:00)
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);

  const formatHour = (hour: number) => {
    if (hour === 12) return '12 PM';
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  return (
    <div className="w-16 flex-shrink-0 border-r border-gray-200 bg-gray-50">
      <div className="relative">
        {hours.map((hour, index) => (
          <div key={hour} className="relative">
            {/* 전체 시간 */}
            <div className="h-20 border-b border-gray-200 relative">
              <div className="absolute -top-2 right-2 text-xs font-medium text-gray-500">
                {formatHour(hour)}
              </div>
              
              {/* 30분 구분선 */}
              <div className="absolute top-10 right-0 w-3 h-px bg-gray-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}