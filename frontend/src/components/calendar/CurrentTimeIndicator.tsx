'use client';

import { useEffect, useState } from 'react';

interface CurrentTimeIndicatorProps {
  weekDays: Date[];
}

export default function CurrentTimeIndicator({ weekDays }: CurrentTimeIndicatorProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // 현재 시간 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, []);

  // 오늘 날짜인지 확인
  const getTodayColumnIndex = () => {
    const today = new Date();
    return weekDays.findIndex(day => 
      day.getFullYear() === today.getFullYear() &&
      day.getMonth() === today.getMonth() &&
      day.getDate() === today.getDate()
    );
  };

  // 현재 시간의 위치 계산 (6:00 기준)
  const getCurrentTimePosition = () => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    
    // 6:00 이전이거나 23:00 이후면 표시하지 않음
    if (hour < 6 || hour >= 23) return -1;
    
    const relativeHour = hour - 6;
    return (relativeHour * 80) + (minute / 60 * 80); // 80px per hour
  };

  const todayIndex = getTodayColumnIndex();
  const timePosition = getCurrentTimePosition();

  // 오늘이 아니거나 표시 시간 범위 밖이면 렌더링하지 않음
  if (todayIndex === -1 || timePosition === -1) {
    return null;
  }

  // 시간 라벨 포맷
  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <>
      {/* 현재 시간 표시선 */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{
          left: `${64 + (todayIndex * (100 / 7))}%`, // 시간축 폭(64px) + 해당 컬럼 위치
          width: `${100 / 7}%`, // 컬럼 하나의 폭
          top: `${timePosition}px`,
          transform: 'translateY(-50%)',
        }}
      >
        {/* 빨간 선 */}
        <div className="flex items-center">
          {/* 시간 라벨 */}
          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow-md mr-2 whitespace-nowrap">
            {formatCurrentTime()}
          </div>
          
          {/* 선 */}
          <div className="flex-1 h-0.5 bg-red-500 shadow-sm" />
          
          {/* 끝점 원 */}
          <div className="w-2 h-2 bg-red-500 rounded-full shadow-sm ml-1" />
        </div>
      </div>

      {/* 현재 시간 이후 영역 반투명 표시 (선택사항) */}
      <div
        className="absolute z-10 pointer-events-none opacity-20"
        style={{
          left: `${64 + (todayIndex * (100 / 7))}%`,
          width: `${100 / 7}%`,
          top: `${timePosition}px`,
          bottom: 0,
          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%)',
        }}
      />
    </>
  );
}