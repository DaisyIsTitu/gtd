// Todo Time-blocking 앱을 위한 상수 정의

import { TodoCategory, TodoPriority, TodoStatus } from '@/types';

// 카테고리별 색상 매핑
export const CATEGORY_COLORS: Record<TodoCategory, {
  primary: string;
  light: string;
  dark: string;
  bg: string;
  text: string;
}> = {
  WORK: {
    primary: '#2563eb', // blue-600
    light: '#3b82f6',   // blue-500
    dark: '#1d4ed8',    // blue-700
    bg: '#dbeafe',      // blue-100
    text: '#1e40af',    // blue-800
  },
  PERSONAL: {
    primary: '#10b981', // emerald-500
    light: '#34d399',   // emerald-400
    dark: '#059669',    // emerald-600
    bg: '#d1fae5',      // emerald-100
    text: '#065f46',    // emerald-800
  },
  HEALTH: {
    primary: '#8b5cf6', // violet-500
    light: '#a78bfa',   // violet-400
    dark: '#7c3aed',    // violet-600
    bg: '#ede9fe',      // violet-100
    text: '#5b21b6',    // violet-800
  },
  LEARNING: {
    primary: '#f59e0b', // amber-500
    light: '#fbbf24',   // amber-400
    dark: '#d97706',    // amber-600
    bg: '#fef3c7',      // amber-100
    text: '#92400e',    // amber-800
  },
  SOCIAL: {
    primary: '#ec4899', // pink-500
    light: '#f472b6',   // pink-400
    dark: '#db2777',    // pink-600
    bg: '#fce7f3',      // pink-100
    text: '#be185d',    // pink-800
  },
  OTHER: {
    primary: '#6b7280', // gray-500
    light: '#9ca3af',   // gray-400
    dark: '#4b5563',    // gray-600
    bg: '#f3f4f6',      // gray-100
    text: '#374151',    // gray-700
  },
};

// 상태별 색상 매핑
export const STATUS_COLORS: Record<TodoStatus, {
  primary: string;
  bg: string;
  text: string;
  border?: string;
}> = {
  WAITING: {
    primary: '#6b7280', // gray-500
    bg: '#f9fafb',      // gray-50
    text: '#374151',    // gray-700
  },
  SCHEDULED: {
    primary: '#3b82f6', // blue-500
    bg: '#eff6ff',      // blue-50
    text: '#1e40af',    // blue-800
  },
  IN_PROGRESS: {
    primary: '#10b981', // emerald-500
    bg: '#ecfdf5',      // emerald-50
    text: '#065f46',    // emerald-800
    border: '#10b981',  // emerald-500
  },
  COMPLETED: {
    primary: '#22c55e', // green-500
    bg: '#f0fdf4',      // green-50
    text: '#15803d',    // green-700
  },
  MISSED: {
    primary: '#f97316', // orange-500
    bg: '#fff7ed',      // orange-50
    text: '#ea580c',    // orange-600
    border: '#f97316',  // orange-500
  },
  CANCELLED: {
    primary: '#ef4444', // red-500
    bg: '#fef2f2',      // red-50
    text: '#dc2626',    // red-600
  },
};

// 우선순위별 색상 매핑
export const PRIORITY_COLORS: Record<TodoPriority, {
  primary: string;
  indicator: string;
  text: string;
}> = {
  LOW: {
    primary: '#22c55e', // green-500
    indicator: '#bbf7d0', // green-200
    text: '#15803d',    // green-700
  },
  MEDIUM: {
    primary: '#f59e0b', // amber-500
    indicator: '#fde68a', // amber-200
    text: '#d97706',    // amber-600
  },
  HIGH: {
    primary: '#f97316', // orange-500
    indicator: '#fed7aa', // orange-200
    text: '#ea580c',    // orange-600
  },
  URGENT: {
    primary: '#ef4444', // red-500
    indicator: '#fecaca', // red-200
    text: '#dc2626',    // red-600
  },
};

// 업무 시간대 설정
export const WORK_HOURS = {
  START: 10, // 10:00 AM
  END: 20,   // 8:00 PM (20:00)
  LUNCH_START: 12, // 12:00 PM
  LUNCH_END: 13,   // 1:00 PM
} as const;

// 캘린더 시간 설정
export const CALENDAR_HOURS = {
  START: 10, // 10:00 AM
  END: 21,   // 9:00 PM (21:00) - 8시까지 표시하려면 21로 설정
  SLOT_HEIGHT: 80, // 1시간당 높이 (px)
  HALF_SLOT_HEIGHT: 40, // 30분당 높이 (px)
} as const;

// 시간대별 배경 색상
export const TIME_SLOT_COLORS = {
  WORK_HOURS: 'bg-white',
  NON_WORK_HOURS: 'bg-gray-50',
  LUNCH_TIME: 'bg-blue-50',
  WEEKEND: 'bg-gray-100',
  CURRENT_TIME: 'bg-blue-100',
} as const;

// 드래그앤드롭 관련 상수
export const DRAG_DROP = {
  TYPES: {
    TODO_FROM_SIDEBAR: 'todo-from-sidebar',
    TODO_FROM_CALENDAR: 'todo-from-calendar',
  },
  HOVER_COLORS: {
    VALID: 'bg-green-100 border-green-300',
    INVALID: 'bg-red-100 border-red-300',
    NEUTRAL: 'bg-blue-50 border-blue-200',
  },
} as const;

// 애니메이션 duration
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Todo 블록 최소/최대 높이 (분 단위)
export const TODO_BLOCK = {
  MIN_DURATION: 15,  // 최소 15분
  MAX_DURATION: 480, // 최대 8시간
  DEFAULT_DURATION: 60, // 기본 1시간
} as const;

// 스케줄링 관련 상수
export const SCHEDULING = {
  BREAK_TIME: 15,     // 할 일 사이 휴식시간 (분)
  MAX_DAILY_WORK: 480, // 하루 최대 업무시간 (8시간)
  PREFERRED_BREAK: 30, // 선호하는 휴식시간 (분)
} as const;

// 카테고리별 한글 라벨
export const CATEGORY_LABELS: Record<TodoCategory, string> = {
  WORK: '업무',
  PERSONAL: '개인',
  HEALTH: '건강',
  LEARNING: '학습',
  SOCIAL: '사교',
  OTHER: '기타',
};

// 우선순위별 한글 라벨
export const PRIORITY_LABELS: Record<TodoPriority, string> = {
  LOW: '낮음',
  MEDIUM: '보통',
  HIGH: '높음',
  URGENT: '긴급',
};

// 상태별 한글 라벨
export const STATUS_LABELS: Record<TodoStatus, string> = {
  WAITING: '대기중',
  SCHEDULED: '예정',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  MISSED: '놓침',
  CANCELLED: '취소됨',
};

// 유틸리티 함수들
export const getCategoryColor = (category: TodoCategory) => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.OTHER;
};

export const getStatusColor = (status: TodoStatus) => {
  return STATUS_COLORS[status] || STATUS_COLORS.WAITING;
};

export const getPriorityColor = (priority: TodoPriority) => {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM;
};

export const isWorkHour = (hour: number): boolean => {
  return hour >= WORK_HOURS.START && hour < WORK_HOURS.END;
};

export const isLunchTime = (hour: number): boolean => {
  return hour >= WORK_HOURS.LUNCH_START && hour < WORK_HOURS.LUNCH_END;
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 일요일(0) 또는 토요일(6)
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}분`;
  } else if (mins === 0) {
    return `${hours}시간`;
  } else {
    return `${hours}시간 ${mins}분`;
  }
};