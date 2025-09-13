'use client';

interface CalendarSkeletonProps {
  showWeekdays?: boolean;
}

const TimeSlotSkeleton = () => (
  <div className="border-b border-gray-100 h-20 p-2">
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
    </div>
  </div>
);

const DayColumnSkeleton = ({ showHeader = true }: { showHeader?: boolean }) => (
  <div className="flex-1 border-r border-gray-200 last:border-r-0">
    {showHeader && (
      <div className="sticky top-0 bg-white border-b border-gray-200 p-3 text-center">
        <div className="h-4 bg-gray-200 rounded w-8 mx-auto mb-1 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-6 mx-auto animate-pulse"></div>
      </div>
    )}
    <div className="divide-y divide-gray-100">
      {Array.from({ length: 10 }).map((_, index) => (
        <TimeSlotSkeleton key={index} />
      ))}
    </div>
  </div>
);

export default function CalendarSkeleton({ showWeekdays = true }: CalendarSkeletonProps) {
  return (
    <div className="h-full bg-white rounded-lg border border-gray-200">
      {/* 헤더 스켈레톤 */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100%-73px)]">
        {/* 시간 축 스켈레톤 */}
        <div className="w-16 border-r border-gray-200 bg-gray-50">
          {showWeekdays && (
            <div className="h-[73px] border-b border-gray-200"></div>
          )}
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="h-20 flex items-center justify-center">
                <div className="h-3 bg-gray-200 rounded w-8 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* 주간 컬럼 스켈레톤 */}
        <div className="flex flex-1 overflow-hidden">
          {Array.from({ length: 7 }).map((_, index) => (
            <DayColumnSkeleton key={index} showHeader={showWeekdays} />
          ))}
        </div>
      </div>
    </div>
  );
}

// 단순한 캘린더 로딩 인디케이터
export function CalendarLoadingIndicator() {
  return (
    <div className="h-full flex items-center justify-center bg-white rounded-lg border border-gray-200">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4">
          <svg 
            className="w-full h-full animate-spin text-blue-500" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-600 mb-1">캘린더를 로딩 중...</p>
        <p className="text-xs text-gray-400">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}

// 캘린더 에러 상태
export function CalendarError({ 
  message = "캘린더를 로드할 수 없습니다", 
  onRetry 
}: { 
  message?: string; 
  onRetry?: () => void; 
}) {
  return (
    <div className="h-full flex items-center justify-center bg-white rounded-lg border border-gray-200">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-16 h-16 mx-auto mb-4 text-red-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">로딩 오류</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
}