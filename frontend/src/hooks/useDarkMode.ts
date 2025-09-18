'use client';

import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 초기화 시 localStorage에서 다크모드 설정 읽어오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('gtd_dark_mode');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      // localStorage에 저장된 값이 있으면 그것을 사용, 없으면 시스템 설정 따름
      const shouldUseDark = savedMode ? savedMode === 'true' : systemPrefersDark;

      setIsDarkMode(shouldUseDark);
      setIsLoaded(true);

      // HTML 클래스 적용
      if (shouldUseDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // 다크모드 토글 함수
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    // localStorage에 저장
    localStorage.setItem('gtd_dark_mode', newMode.toString());

    // HTML 클래스 토글
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 시스템 다크모드 변경 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // localStorage에 저장된 설정이 없을 때만 시스템 설정 따름
      const savedMode = localStorage.getItem('gtd_dark_mode');
      if (savedMode === null) {
        setIsDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    if (typeof window !== 'undefined') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return {
    isDarkMode,
    toggleDarkMode,
    isLoaded
  };
};