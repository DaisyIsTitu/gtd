'use client';

import React from 'react';
import { useDarkMode } from '@/hooks/useDarkMode';

interface DarkModeToggleProps {
  className?: string;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ className = '' }) => {
  const { isDarkMode, toggleDarkMode, isLoaded } = useDarkMode();

  // 로딩 중에는 스켈레톤 표시
  if (!isLoaded) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <button
        onClick={toggleDarkMode}
        className={`
          relative inline-flex items-center h-6 w-10 flex-shrink-0 cursor-pointer
          rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
          dark:focus:ring-offset-gray-800
          ${isDarkMode
            ? 'bg-purple-600 hover:bg-purple-700'
            : 'bg-gray-300 hover:bg-gray-400'
          }
        `}
        role="switch"
        aria-checked={isDarkMode}
        aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0
            transition duration-200 ease-in-out
            flex items-center justify-center
            ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}
          `}
        >
          {/* 아이콘 애니메이션 */}
          <span className={`transition-opacity duration-200 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}>
            {/* 달 아이콘 */}
            <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          </span>
          <span className={`absolute transition-opacity duration-200 ${isDarkMode ? 'opacity-0' : 'opacity-100'}`}>
            {/* 태양 아이콘 */}
            <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          </span>
        </span>
      </button>

      {/* 텍스트 레이블 (선택사항) */}
      <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
        {isDarkMode ? '다크 모드' : '라이트 모드'}
      </span>
    </div>
  );
};

export default DarkModeToggle;