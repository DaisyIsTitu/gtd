'use client';

interface TodoSkeletonProps {
  count?: number;
}

const TodoItemSkeleton = () => (
  <div className="p-3 bg-white rounded-lg border border-gray-200 animate-pulse">
    {/* 제목과 카테고리 */}
    <div className="flex items-center justify-between mb-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-12"></div>
    </div>
    
    {/* 설명 */}
    <div className="mb-3">
      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
    
    {/* 메타 정보 */}
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center space-x-3">
        <div className="h-3 bg-gray-200 rounded w-8"></div>
        <div className="h-3 bg-gray-200 rounded w-12"></div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="h-3 bg-gray-200 rounded w-16"></div>
        <div className="h-3 bg-gray-200 rounded w-8"></div>
      </div>
    </div>
  </div>
);

const TodoGroupSkeleton = ({ title, count }: { title: string; count: number }) => (
  <div className="mb-4">
    <div className="flex items-center mb-2">
      <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
      <div className="h-3 bg-gray-200 rounded w-20"></div>
    </div>
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <TodoItemSkeleton key={index} />
      ))}
    </div>
  </div>
);

export default function TodoSkeleton({ count = 6 }: TodoSkeletonProps) {
  return (
    <div className="flex-1 overflow-y-auto sidebar-scroll">
      {/* 헤더 스켈레톤 */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-2 mb-2">
        <div className="flex items-center justify-between text-xs">
          <div className="h-3 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>

      {/* Todo 목록 스켈레톤 */}
      <div className="px-4 space-y-4">
        <TodoGroupSkeleton title="진행 중" count={Math.floor(count * 0.3) || 1} />
        <TodoGroupSkeleton title="예정" count={Math.floor(count * 0.4) || 2} />
        <TodoGroupSkeleton title="대기 중" count={Math.floor(count * 0.3) || 1} />
      </div>

      {/* 스크롤 여백 */}
      <div className="h-4"></div>
    </div>
  );
}

// 사이드바 전체 스켈레톤
export function TodoSidebarSkeleton() {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* 헤더 스켈레톤 */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-6 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
      </div>

      {/* 필터 스켈레톤 */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Todo 목록 스켈레톤 */}
      <div className="flex-1 overflow-hidden">
        <TodoSkeleton count={5} />
      </div>

      {/* 푸터 스켈레톤 */}
      <div className="border-t border-gray-100 p-3">
        <div className="h-3 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
      </div>
    </div>
  );
}