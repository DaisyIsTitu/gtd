// Todo Time-blocking 앱을 위한 상수 정의

export const APP_CONFIG = {
  name: 'Todo Time-blocking',
  version: '1.0.0',
  description: 'Google Calendar 연동 스마트 시간 관리 웹 애플리케이션',
} as const;

// 시간 관련 상수
export const TIME_CONSTANTS = {
  DEFAULT_TODO_DURATION: 60, // minutes
  MIN_TODO_DURATION: 15,     // minutes
  MAX_TODO_DURATION: 480,    // minutes (8 hours)
  TIME_SLOT_INTERVAL: 30,    // minutes
  BREAK_TIME: 15,            // minutes between tasks
  MISSED_TODO_THRESHOLD: 30, // minutes after scheduled time
  AUTO_SPLIT_THRESHOLD: 240, // minutes (4 hours)
} as const;

// 업무 시간 상수
export const WORKING_HOURS = {
  DEFAULT_START: '09:00',
  DEFAULT_END: '18:00',
  WORKING_DAYS: [1, 2, 3, 4, 5], // Monday to Friday
} as const;

// Todo 카테고리 정의
export const TODO_CATEGORIES = {
  WORK: {
    label: '업무',
    color: '#3b82f6',
    icon: '💼',
  },
  PERSONAL: {
    label: '개인',
    color: '#10b981',
    icon: '🏠',
  },
  HEALTH: {
    label: '건강',
    color: '#ef4444',
    icon: '🏃‍♀️',
  },
  LEARNING: {
    label: '학습',
    color: '#8b5cf6',
    icon: '📚',
  },
  SOCIAL: {
    label: '사교',
    color: '#f59e0b',
    icon: '👥',
  },
  OTHER: {
    label: '기타',
    color: '#6b7280',
    icon: '📝',
  },
} as const;

// Todo 우선순위 정의
export const TODO_PRIORITIES = {
  LOW: {
    label: '낮음',
    color: '#10b981',
    value: 1,
  },
  MEDIUM: {
    label: '보통',
    color: '#f59e0b',
    value: 2,
  },
  HIGH: {
    label: '높음',
    color: '#ef4444',
    value: 3,
  },
  URGENT: {
    label: '긴급',
    color: '#dc2626',
    value: 4,
  },
} as const;

// Todo 상태 정의
export const TODO_STATUSES = {
  WAITING: {
    label: '대기중',
    color: '#6b7280',
    icon: '⏳',
  },
  SCHEDULED: {
    label: '예정',
    color: '#3b82f6',
    icon: '📅',
  },
  IN_PROGRESS: {
    label: '진행중',
    color: '#f59e0b',
    icon: '🔄',
  },
  COMPLETED: {
    label: '완료',
    color: '#10b981',
    icon: '✅',
  },
  MISSED: {
    label: '놓침',
    color: '#ef4444',
    icon: '⚠️',
  },
  CANCELLED: {
    label: '취소',
    color: '#6b7280',
    icon: '❌',
  },
} as const;

// API 엔드포인트
export const API_ENDPOINTS = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1',
  TODOS: '/todos',
  CALENDAR: '/calendar',
  SCHEDULING: '/scheduling',
  USER: '/user',
  AUTH: '/auth',
} as const;

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'gtd_access_token',
  REFRESH_TOKEN: 'gtd_refresh_token',
  USER_PREFERENCES: 'gtd_user_preferences',
  CALENDAR_VIEW: 'gtd_calendar_view',
  FILTER_OPTIONS: 'gtd_filter_options',
  MOCK_TODOS: 'gtd_mock_todos',
  MOCK_SCHEDULES: 'gtd_mock_schedules',
} as const;

// 캘린더 관련 상수
export const CALENDAR_CONFIG = {
  WEEK_START: 1, // Monday
  TIME_FORMAT: 'HH:mm',
  DATE_FORMAT: 'yyyy-MM-dd',
  DATETIME_FORMAT: 'yyyy-MM-dd HH:mm',
  DISPLAY_HOURS: {
    START: 8,  // 8 AM
    END: 22,   // 10 PM
  },
} as const;

// 드래그앤드롭 상수
export const DRAG_TYPES = {
  TODO_ITEM: 'TODO_ITEM',
  SCHEDULED_TODO: 'SCHEDULED_TODO',
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  INVALID_TOKEN: '인증이 만료되었습니다. 다시 로그인해주세요.',
  TODO_NOT_FOUND: '할 일을 찾을 수 없습니다.',
  SCHEDULING_FAILED: '스케줄링에 실패했습니다. 다시 시도해주세요.',
  CALENDAR_SYNC_FAILED: '캘린더 동기화에 실패했습니다.',
  GOOGLE_AUTH_FAILED: 'Google 로그인에 실패했습니다.',
  INVALID_INPUT: '입력 값이 올바르지 않습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const;

// 성공 메시지
export const SUCCESS_MESSAGES = {
  TODO_CREATED: '할 일이 성공적으로 추가되었습니다.',
  TODO_UPDATED: '할 일이 성공적으로 수정되었습니다.',
  TODO_DELETED: '할 일이 성공적으로 삭제되었습니다.',
  SCHEDULE_CREATED: '스케줄이 성공적으로 생성되었습니다.',
  CALENDAR_SYNCED: '캘린더 동기화가 완료되었습니다.',
  LOGIN_SUCCESS: '로그인되었습니다.',
  LOGOUT_SUCCESS: '로그아웃되었습니다.',
} as const;

// 스케줄링 알고리즘 상수
export const SCHEDULING_CONFIG = {
  PRIORITY_BOOST: {
    MISSED_TODO: 1,        // 놓친 할 일 우선순위 부스트
    DEADLINE_APPROACHING: 1, // 마감일 임박 부스트
  },
  TIME_PREFERENCES: {
    CATEGORY_GROUPING_THRESHOLD: 120, // minutes (2 hours)
    SIMILAR_TASK_GROUPING: true,
    RESPECT_BREAK_TIME: true,
  },
  CONFLICT_RESOLUTION: {
    ALLOW_OVERLAP: false,
    PREFER_MORNING: false,
    PREFER_AFTERNOON: false,
  },
} as const;

// 사용자 설정 기본값
export const DEFAULT_USER_SETTINGS = {
  workingHours: {
    start: WORKING_HOURS.DEFAULT_START,
    end: WORKING_HOURS.DEFAULT_END,
  },
  workingDays: WORKING_HOURS.WORKING_DAYS,
  timeZone: 'Asia/Seoul',
  defaultTodoDuration: TIME_CONSTANTS.DEFAULT_TODO_DURATION,
  breakTime: TIME_CONSTANTS.BREAK_TIME,
  autoSchedule: true,
} as const;