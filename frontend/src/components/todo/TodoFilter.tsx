'use client';

import { useState } from 'react';
import { FilterOptions, TodoCategory, TodoPriority, TodoStatus } from '@/types';

// 정렬 옵션 타입 정의
export type SortOption = {
  value: string;
  label: string;
  field: 'createdAt' | 'updatedAt' | 'deadline' | 'priority' | 'title' | 'duration';
  direction: 'asc' | 'desc';
};

interface TodoFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  sortOption?: SortOption;
  onSortChange?: (sort: SortOption) => void;
}

const CATEGORY_OPTIONS: { value: TodoCategory; label: string; color: string; icon: string }[] = [
  { value: 'WORK', label: '업무', color: 'bg-blue-100 text-blue-800', icon: '💼' },
  { value: 'PERSONAL', label: '개인', color: 'bg-green-100 text-green-800', icon: '👤' },
  { value: 'HEALTH', label: '건강', color: 'bg-pink-100 text-pink-800', icon: '🏥' },
  { value: 'LEARNING', label: '학습', color: 'bg-purple-100 text-purple-800', icon: '📚' },
  { value: 'SOCIAL', label: '사회', color: 'bg-yellow-100 text-yellow-800', icon: '👥' },
  { value: 'OTHER', label: '기타', color: 'bg-gray-100 text-gray-800', icon: '📌' },
];

const PRIORITY_OPTIONS: { value: TodoPriority; label: string; color: string; icon: string }[] = [
  { value: 'URGENT', label: '긴급', color: 'bg-red-100 text-red-800 border-red-200', icon: '🚨' },
  { value: 'HIGH', label: '높음', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '🔥' },
  { value: 'MEDIUM', label: '보통', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⭐' },
  { value: 'LOW', label: '낮음', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '📝' },
];

const STATUS_OPTIONS: { value: TodoStatus; label: string; color: string; icon: string }[] = [
  { value: 'WAITING', label: '대기', color: 'bg-gray-100 text-gray-800', icon: '⏳' },
  { value: 'SCHEDULED', label: '예정', color: 'bg-blue-100 text-blue-800', icon: '📅' },
  { value: 'IN_PROGRESS', label: '진행중', color: 'bg-yellow-100 text-yellow-800', icon: '🔄' },
  { value: 'COMPLETED', label: '완료', color: 'bg-green-100 text-green-800', icon: '✅' },
  { value: 'MISSED', label: '놓침', color: 'bg-red-100 text-red-800', icon: '❌' },
  { value: 'CANCELLED', label: '취소', color: 'bg-gray-100 text-gray-600', icon: '🚫' },
];

const SORT_OPTIONS: SortOption[] = [
  { value: 'priority-desc', label: '우선순위 ↓', field: 'priority', direction: 'desc' },
  { value: 'deadline-asc', label: '마감일 ↑', field: 'deadline', direction: 'asc' },
  { value: 'created-desc', label: '생성일 ↓', field: 'createdAt', direction: 'desc' },
  { value: 'created-asc', label: '생성일 ↑', field: 'createdAt', direction: 'asc' },
  { value: 'title-asc', label: '제목 ↑', field: 'title', direction: 'asc' },
  { value: 'duration-desc', label: '소요시간 ↓', field: 'duration', direction: 'desc' },
  { value: 'updated-desc', label: '수정일 ↓', field: 'updatedAt', direction: 'desc' },
];


export default function TodoFilter({ 
  filters, 
  onFiltersChange, 
  sortOption = SORT_OPTIONS[0], 
  onSortChange 
}: TodoFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'filters' | 'sort'>('filters');

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

  const getActiveFiltersCount = () => {
    return filters.categories.length + 
           filters.priorities.length + 
           filters.statuses.length + 
           filters.tags.length;
  };

  return (
    <div className="border-b border-gray-200 pb-3">
      <div className="px-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <h3 className="text-sm font-semibold text-gray-700">필터 & 정렬</h3>
            {hasActiveFilters && (
              <span
                data-testid="active-filters-count"
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {getActiveFiltersCount()}개 필터 활성
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                data-testid="clear-all-filters"
                onClick={handleClearAll}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                모두 지우기
              </button>
            )}
            <button
              data-testid="filter-expand-button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-50"
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


        {/* 확장된 옵션 */}
        {isExpanded && (
          <div data-testid="filter-panel" className="space-y-4">
            {/* 탭 */}
            <div className="flex border-b border-gray-200">
              <button
                data-testid="filters-tab"
                onClick={() => setActiveTab('filters')}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'filters'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                필터
              </button>
              <button
                data-testid="sort-tab"
                onClick={() => setActiveTab('sort')}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'sort'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                정렬
              </button>
            </div>

            {/* 필터 탭 */}
            {activeTab === 'filters' && (
              <div data-testid="filter-content" className="space-y-4">

                {/* 상태 필터 */}
                <div>
                  <h4 className="text-xs font-medium text-gray-600 mb-2">상태</h4>
                  <div className="grid grid-cols-3 gap-1">
                    {STATUS_OPTIONS.map(({ value, label, color, icon }) => (
                      <button
                        key={value}
                        data-testid={`status-filter-${value}`}
                        onClick={() => handleStatusToggle(value)}
                        className={`flex items-center px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                          filters.statuses.includes(value)
                            ? color
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span className="mr-1">{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 카테고리 필터 */}
                <div>
                  <h4 className="text-xs font-medium text-gray-600 mb-2">카테고리</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {CATEGORY_OPTIONS.map(({ value, label, color, icon }) => (
                      <button
                        key={value}
                        data-testid={`category-filter-${value}`}
                        onClick={() => handleCategoryToggle(value)}
                        className={`flex items-center px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                          filters.categories.includes(value)
                            ? color
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span className="mr-1">{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 우선순위 필터 */}
                <div>
                  <h4 className="text-xs font-medium text-gray-600 mb-2">우선순위</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {PRIORITY_OPTIONS.map(({ value, label, color, icon }) => (
                      <button
                        key={value}
                        data-testid={`priority-filter-${value}`}
                        onClick={() => handlePriorityToggle(value)}
                        className={`flex items-center px-2 py-1.5 rounded text-xs font-medium border transition-colors ${
                          filters.priorities.includes(value)
                            ? color
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <span className="mr-1">{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 정렬 탭 */}
            {activeTab === 'sort' && (
              <div data-testid="sort-content" className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-600 mb-2">정렬 기준</h4>
                  <div className="space-y-1">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        data-testid={`sort-option-${option.value}`}
                        onClick={() => {
                          console.log('🎯 TodoFilter 정렬 옵션 클릭됨:', option);
                          onSortChange?.(option);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                          sortOption.value === option.value
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span>{option.label}</span>
                        {sortOption.value === option.value && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
