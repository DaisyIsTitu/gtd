import { Todo, TodoSchedule } from '@/types';

// Mock Todo 데이터
export const mockTodos: Todo[] = [
  {
    id: 'todo-1',
    title: '프로젝트 미팅',
    description: '주간 프로젝트 진행 상황 리뷰',
    duration: 60,
    category: 'WORK',
    priority: 'HIGH',
    status: 'SCHEDULED',
    tags: ['회의', '프로젝트'],
    createdAt: new Date('2024-12-09T08:00:00'),
    updatedAt: new Date('2024-12-09T08:00:00'),
    userId: 'user-1',
  },
  {
    id: 'todo-2',
    title: '운동하기',
    description: '헬스장에서 운동',
    duration: 90,
    category: 'HEALTH',
    priority: 'MEDIUM',
    status: 'SCHEDULED',
    tags: ['건강', '루틴'],
    createdAt: new Date('2024-12-09T06:00:00'),
    updatedAt: new Date('2024-12-09T06:00:00'),
    userId: 'user-1',
  },
  {
    id: 'todo-3',
    title: 'TypeScript 공부',
    description: '고급 TypeScript 패턴 학습',
    duration: 120,
    category: 'LEARNING',
    priority: 'MEDIUM',
    status: 'SCHEDULED',
    tags: ['개발', '학습'],
    createdAt: new Date('2024-12-10T09:00:00'),
    updatedAt: new Date('2024-12-10T09:00:00'),
    userId: 'user-1',
  },
  {
    id: 'todo-4',
    title: '점심 약속',
    description: '친구와 점심 식사',
    duration: 60,
    category: 'SOCIAL',
    priority: 'LOW',
    status: 'SCHEDULED',
    tags: ['식사', '친구'],
    createdAt: new Date('2024-12-10T12:00:00'),
    updatedAt: new Date('2024-12-10T12:00:00'),
    userId: 'user-1',
  },
  {
    id: 'todo-5',
    title: '긴급 버그 수정',
    description: '프로덕션 환경 긴급 버그 수정',
    duration: 180,
    category: 'WORK',
    priority: 'URGENT',
    status: 'SCHEDULED',
    tags: ['버그', '긴급'],
    createdAt: new Date('2024-12-11T14:00:00'),
    updatedAt: new Date('2024-12-11T14:00:00'),
    userId: 'user-1',
  },
  {
    id: 'todo-6',
    title: '개인 프로젝트',
    description: '사이드 프로젝트 개발',
    duration: 150,
    category: 'PERSONAL',
    priority: 'MEDIUM',
    status: 'SCHEDULED',
    tags: ['개발', '사이드'],
    createdAt: new Date('2024-12-12T19:00:00'),
    updatedAt: new Date('2024-12-12T19:00:00'),
    userId: 'user-1',
  },
  {
    id: 'todo-7',
    title: '독서 시간',
    description: '기술 서적 읽기',
    duration: 60,
    category: 'LEARNING',
    priority: 'LOW',
    status: 'SCHEDULED',
    tags: ['독서', '학습'],
    createdAt: new Date('2024-12-13T20:00:00'),
    updatedAt: new Date('2024-12-13T20:00:00'),
    userId: 'user-1',
  },
];

// Mock TodoSchedule 데이터
export const mockSchedules: TodoSchedule[] = [
  {
    id: 'schedule-1',
    todoId: 'todo-1',
    startTime: new Date('2024-12-09T09:00:00'),
    endTime: new Date('2024-12-09T10:00:00'),
    status: 'SCHEDULED',
    createdAt: new Date('2024-12-09T08:00:00'),
  },
  {
    id: 'schedule-2',
    todoId: 'todo-2',
    startTime: new Date('2024-12-09T18:00:00'),
    endTime: new Date('2024-12-09T19:30:00'),
    status: 'SCHEDULED',
    createdAt: new Date('2024-12-09T06:00:00'),
  },
  {
    id: 'schedule-3',
    todoId: 'todo-3',
    startTime: new Date('2024-12-10T19:00:00'),
    endTime: new Date('2024-12-10T21:00:00'),
    status: 'SCHEDULED',
    createdAt: new Date('2024-12-10T09:00:00'),
  },
  {
    id: 'schedule-4',
    todoId: 'todo-4',
    startTime: new Date('2024-12-10T12:00:00'),
    endTime: new Date('2024-12-10T13:00:00'),
    status: 'SCHEDULED',
    createdAt: new Date('2024-12-10T12:00:00'),
  },
  {
    id: 'schedule-5',
    todoId: 'todo-5',
    startTime: new Date('2024-12-11T14:00:00'),
    endTime: new Date('2024-12-11T17:00:00'),
    status: 'SCHEDULED',
    createdAt: new Date('2024-12-11T14:00:00'),
  },
  {
    id: 'schedule-6',
    todoId: 'todo-6',
    startTime: new Date('2024-12-12T19:00:00'),
    endTime: new Date('2024-12-12T21:30:00'),
    status: 'SCHEDULED',
    createdAt: new Date('2024-12-12T19:00:00'),
  },
  {
    id: 'schedule-7',
    todoId: 'todo-7',
    startTime: new Date('2024-12-13T20:00:00'),
    endTime: new Date('2024-12-13T21:00:00'),
    status: 'SCHEDULED',
    createdAt: new Date('2024-12-13T20:00:00'),
  },
  // 분할된 작업 예시
  {
    id: 'schedule-8',
    todoId: 'todo-5',
    startTime: new Date('2024-12-11T10:00:00'),
    endTime: new Date('2024-12-11T11:30:00'),
    splitInfo: {
      partNumber: 1,
      totalParts: 2,
      splitReason: 'TIME_CONFLICT'
    },
    status: 'SCHEDULED',
    createdAt: new Date('2024-12-11T14:00:00'),
  },
];

// 현재 주의 데이터만 필터링하는 함수
export const getCurrentWeekSchedules = (currentWeekStart: Date): TodoSchedule[] => {
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  
  return mockSchedules.filter(schedule => {
    const scheduleDate = new Date(schedule.startTime);
    return scheduleDate >= currentWeekStart && scheduleDate < weekEnd;
  });
};

export const getCurrentWeekTodos = (currentWeekStart: Date): Todo[] => {
  const schedules = getCurrentWeekSchedules(currentWeekStart);
  const todoIds = schedules.map(s => s.todoId);
  return mockTodos.filter(todo => todoIds.includes(todo.id));
};