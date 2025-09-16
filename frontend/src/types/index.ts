// Todo Time-blocking 앱을 위한 기본 타입 정의

export interface User {
  id: string;
  email: string;
  name: string;
  googleId?: string;
  profileImage?: string;
  settings: UserSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  workingHours: {
    start: string; // "09:00"
    end: string;   // "18:00"
  };
  workingDays: number[]; // [1, 2, 3, 4, 5] (월-금)
  timeZone: string;
  defaultTodoDuration: number; // minutes
  breakTime: number; // minutes between tasks
  autoSchedule: boolean;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  duration: number; // minutes
  category: TodoCategory;
  priority: TodoPriority;
  status: TodoStatus;
  tags: string[];
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  // 스케줄링 관련
  schedules?: TodoSchedule[];
  estimatedCompletionTime?: number;
}

export interface TodoSchedule {
  id: string;
  todoId: string;
  startTime: Date;
  endTime: Date;
  splitInfo?: {
    partNumber: number;
    totalParts: number;
    splitReason: 'USER_SPLIT' | 'AUTO_SPLIT' | 'TIME_CONFLICT';
  };
  status: ScheduleStatus;
  createdAt: Date;
  // Preview mode properties
  isPreviewNew?: boolean;
  isPreviewExisting?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  source: 'GOOGLE_CALENDAR' | 'TODO_SCHEDULE';
  googleEventId?: string;
  isAllDay: boolean;
  color?: string;
  attendees?: string[];
}

export interface AvailableSlot {
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
}

export interface SchedulingRequest {
  todoIds: string[];
  preferences?: {
    preferredTimeSlots?: AvailableSlot[];
    avoidTimeSlots?: AvailableSlot[];
    groupSimilarTasks?: boolean;
    respectDeadlines?: boolean;
  };
}

export interface SchedulingResult {
  success: boolean;
  scheduledTodos: TodoSchedule[];
  conflicts: ConflictInfo[];
  suggestions: string[];
  message: string;
}

export interface ConflictInfo {
  todoId: string;
  conflictType: 'TIME_CONFLICT' | 'DEADLINE_CONFLICT' | 'CAPACITY_CONFLICT';
  conflictWith: string; // Calendar event ID or Todo ID
  suggestedAction: string;
}

// Enums
export type TodoCategory = 
  | 'WORK' 
  | 'PERSONAL' 
  | 'HEALTH' 
  | 'LEARNING' 
  | 'SOCIAL' 
  | 'OTHER';

export type TodoPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TodoStatus = 
  | 'WAITING'      // 대기중
  | 'SCHEDULED'    // 예정
  | 'IN_PROGRESS'  // 진행중
  | 'COMPLETED'    // 완료
  | 'MISSED'       // 놓침
  | 'CANCELLED';   // 취소

export type ScheduleStatus = 
  | 'SCHEDULED'    // 예정
  | 'ACTIVE'       // 진행중
  | 'COMPLETED'    // 완료
  | 'MISSED'       // 놓침
  | 'CANCELLED';   // 취소됨

// API Response 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

// Form 관련 타입
export interface CreateTodoForm {
  title: string;
  description?: string;
  duration: number;
  category: TodoCategory;
  priority: TodoPriority;
  tags: string[];
  deadline?: string; // ISO date string
}

export interface UpdateTodoForm extends Partial<CreateTodoForm> {
  status?: TodoStatus;
}

// UI 상태 타입
export interface CalendarView {
  type: 'WEEK' | 'DAY';
  currentDate: Date;
  selectedDate?: Date;
}

export interface FilterOptions {
  categories: TodoCategory[];
  priorities: TodoPriority[];
  statuses: TodoStatus[];
  tags: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// 드래그앤드롭 타입
export interface DraggedTodo {
  todo: Todo;
  sourceType: 'SIDEBAR' | 'CALENDAR';
  sourcePosition?: {
    date: Date;
    timeSlot: string;
  };
}

export interface DropTarget {
  date: Date;
  timeSlot: string;
  duration: number;
}