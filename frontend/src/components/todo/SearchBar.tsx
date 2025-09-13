'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Todo } from '@/types';

interface SearchBarProps {
  placeholder?: string;
  onSearchChange: (searchTerm: string, filteredTodos: Todo[]) => void;
  todos: Todo[];
  disabled?: boolean;
}

export default function SearchBar({
  placeholder = "할 일 검색...",
  onSearchChange,
  todos,
  disabled = false
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // 검색 로직
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return todos;
    }

    const term = searchTerm.toLowerCase().trim();

    return todos.filter(todo => {
      // 제목에서 검색
      if (todo.title.toLowerCase().includes(term)) {
        return true;
      }

      // 설명에서 검색
      if (todo.description?.toLowerCase().includes(term)) {
        return true;
      }

      // 태그에서 검색
      if (todo.tags.some(tag => tag.toLowerCase().includes(term))) {
        return true;
      }

      // 카테고리에서 검색 (한국어)
      const categoryMap = {
        'WORK': '업무',
        'PERSONAL': '개인',
        'HEALTH': '건강',
        'LEARNING': '학습',
        'SOCIAL': '사회',
        'OTHER': '기타'
      };
      const categoryText = categoryMap[todo.category];
      if (categoryText && categoryText.toLowerCase().includes(term)) {
        return true;
      }

      // 우선순위에서 검색 (한국어)
      const priorityMap = {
        'URGENT': '긴급',
        'HIGH': '높음',
        'MEDIUM': '보통',
        'LOW': '낮음'
      };
      const priorityText = priorityMap[todo.priority];
      if (priorityText && priorityText.toLowerCase().includes(term)) {
        return true;
      }

      // 상태에서 검색 (한국어)
      const statusMap = {
        'WAITING': '대기',
        'SCHEDULED': '예정',
        'IN_PROGRESS': '진행',
        'COMPLETED': '완료',
        'MISSED': '놓침',
        'CANCELLED': '취소'
      };
      const statusText = statusMap[todo.status];
      if (statusText && statusText.toLowerCase().includes(term)) {
        return true;
      }

      return false;
    });
  }, [todos, searchTerm]);

  // 검색어 변경 핸들러
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // 검색어나 결과가 변경될 때 부모 컴포넌트에 알림
  React.useEffect(() => {
    onSearchChange(searchTerm, searchResults);
  }, [searchTerm, searchResults, onSearchChange]);

  // 검색 초기화
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClearSearch();
      e.currentTarget.blur();
    }
  }, [handleClearSearch]);

  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <div className={`relative transition-all duration-200 ${isFocused ? 'ring-2 ring-blue-500 ring-opacity-20' : ''}`}>
        <div className="relative">
          {/* 검색 아이콘 */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className={`h-4 w-4 transition-colors duration-200 ${
                isFocused ? 'text-blue-500' : 'text-gray-400'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* 입력 필드 */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder={placeholder}
            className={`
              block w-full pl-10 pr-10 py-2 text-sm
              border border-gray-200 rounded-lg
              bg-white placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              transition-all duration-200
            `}
          />

          {/* 검색어 초기화 버튼 */}
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 text-gray-400 transition-colors duration-200"
              title="검색어 지우기"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* 검색 결과 요약 */}
        {searchTerm && (
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-gray-600">
              <span className="font-medium">{searchResults.length}개</span> 검색 결과
            </span>
            {searchResults.length > 0 && (
              <span className="text-gray-400">
                "{searchTerm}" 검색
              </span>
            )}
          </div>
        )}
      </div>

      {/* 검색 가이드 (포커스 시에만 표시) */}
      {isFocused && !searchTerm && (
        <div className="mt-2 text-xs text-gray-400">
          <div className="mb-1">💡 검색 팁:</div>
          <div className="space-y-0.5 pl-2">
            <div>• 제목, 설명, 태그로 검색 가능</div>
            <div>• "업무", "개인", "긴급" 등 한국어 검색 지원</div>
            <div>• ESC키로 검색 초기화</div>
          </div>
        </div>
      )}
    </div>
  );
}

// 검색 관련 유틸리티 함수들
export const searchUtils = {
  // 하이라이트된 텍스트 생성
  highlightSearchTerm: (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-0.5 rounded">$1</mark>');
  },

  // 검색어를 포함한 필드들 반환
  getMatchingFields: (todo: Todo, searchTerm: string): string[] => {
    const term = searchTerm.toLowerCase().trim();
    const matchingFields: string[] = [];

    if (todo.title.toLowerCase().includes(term)) {
      matchingFields.push('title');
    }
    if (todo.description?.toLowerCase().includes(term)) {
      matchingFields.push('description');
    }
    if (todo.tags.some(tag => tag.toLowerCase().includes(term))) {
      matchingFields.push('tags');
    }

    return matchingFields;
  }
};