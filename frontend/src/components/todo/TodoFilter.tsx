'use client';

import { useState } from 'react';
import { FilterOptions, TodoCategory, TodoPriority, TodoStatus } from '@/types';

interface TodoFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const CATEGORY_OPTIONS: { value: TodoCategory; label: string; color: string }[] = [
  { value: 'WORK', label: '업무', color: 'bg-blue-100 text-blue-800' },
  { value: 'PERSONAL', label: '개인', color: 'bg-green-100 text-green-800' },
  { value: 'HEALTH', label: '건강', color: 'bg-pink-100 text-pink-800' },
  { value: 'LEARNING', label: '학습', color: 'bg-purple-100 text-purple-800' },
  { value: 'SOCIAL', label: '사회', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'OTHER', label: '기타', color: 'bg-gray-100 text-gray-800' },
];

const PRIORITY_OPTIONS: { value: TodoPriority; label: string; color: string }[] = [
  { value: 'URGENT', label: '긴급', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'HIGH', label: '높음', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'MEDIUM', label: '보통', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'LOW', label: '낮음', color: 'bg-gray-100 text-gray-800 border-gray-200' },
];

const STATUS_OPTIONS: { value: TodoStatus; label: string; color: string }[] = [
  { value: 'WAITING', label: '대기', color: 'bg-gray-100 text-gray-800' },
  { value: 'SCHEDULED', label: '예정', color: 'bg-blue-100 text-blue-800' },
  { value: 'IN_PROGRESS', label: '진행중', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'COMPLETED', label: '완료', color: 'bg-green-100 text-green-800' },
  { value: 'MISSED', label: '놓침', color: 'bg-red-100 text-red-800' },
  { value: 'CANCELLED', label: '취소', color: 'bg-gray-100 text-gray-600' },
];

export default function TodoFilter({ filters, onFiltersChange }: TodoFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCategoryToggle = (category: TodoCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFiltersChange({
      ...filters,
      categories: newCategories,
    });
  };

  const handlePriorityToggle = (priority: TodoPriority) => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter(p => p !== priority)
      : [...filters.priorities, priority];
    
    onFiltersChange({
      ...filters,
      priorities: newPriorities,
    });
  };

  const handleStatusToggle = (status: TodoStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    
    onFiltersChange({
      ...filters,
      statuses: newStatuses,
    });
  };

  const handleClearAll = () => {
    onFiltersChange({
      categories: [],
      priorities: [],
      statuses: [],
      tags: [],
    });
  };

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.priorities.length > 0 ||
    filters.statuses.length > 0 ||
    filters.tags.length > 0;

  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">필터</h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              모두 지우기
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className={`w-4 h-4 transform transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 기본 상태 필터 (항상 표시) */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1">
          {STATUS_OPTIONS.filter(s => ['WAITING', 'SCHEDULED', 'IN_PROGRESS'].includes(s.value)).map(({ value, label, color }) => (
            <button
              key={value}
              onClick={() => handleStatusToggle(value)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                filters.statuses.includes(value)
                  ? color
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 확장된 필터 옵션 */}
      {isExpanded && (
        <div className="space-y-3 mt-3 pt-3 border-t border-gray-100">
          {/* 카테고리 필터 */}
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-2">카테고리</h4>
            <div className="flex flex-wrap gap-1">
              {CATEGORY_OPTIONS.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => handleCategoryToggle(value)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    filters.categories.includes(value)
                      ? color
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 우선순위 필터 */}
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-2">우선순위</h4>
            <div className="flex flex-wrap gap-1">
              {PRIORITY_OPTIONS.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => handlePriorityToggle(value)}
                  className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                    filters.priorities.includes(value)
                      ? color
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 전체 상태 필터 */}
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-2">모든 상태</h4>
            <div className="flex flex-wrap gap-1">
              {STATUS_OPTIONS.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => handleStatusToggle(value)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    filters.statuses.includes(value)
                      ? color
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}