import { 
  Todo, 
  TodoSchedule, 
  ApiResponse, 
  PaginatedResponse,
  CreateTodoForm, 
  UpdateTodoForm, 
  FilterOptions,
  SchedulingRequest,
  SchedulingResult 
} from '@/types';
import { mockTodos, mockSchedules } from './mockData';

// localStorage 키 상수
const STORAGE_KEYS = {
  TODOS: 'gtd_todos',
  SCHEDULES: 'gtd_schedules',
  LAST_TODO_ID: 'gtd_last_todo_id',
  LAST_SCHEDULE_ID: 'gtd_last_schedule_id',
  ERROR_CONFIG: 'gtd_error_config',
} as const;

// 에러 시뮬레이션 설정 타입
interface ErrorSimulationConfig {
  enabled: boolean;
  errorRate: number; // 0-100 사이의 백분율
  networkFailureRate: number; // 네트워크 실패 시뮬레이션
  specificErrors: {
    getTodos: boolean;
    createTodo: boolean;
    updateTodo: boolean;
    deleteTodo: boolean;
    autoSchedule: boolean;
  };
  slowResponse: boolean; // 느린 응답 시뮬레이션
  slowResponseDelay: number; // 느린 응답 지연 시간(ms)
}

// 기본 에러 시뮬레이션 설정
const DEFAULT_ERROR_CONFIG: ErrorSimulationConfig = {
  enabled: false,
  errorRate: 20, // 20% 에러율
  networkFailureRate: 10,
  specificErrors: {
    getTodos: false,
    createTodo: false,
    updateTodo: false,
    deleteTodo: false,
    autoSchedule: false,
  },
  slowResponse: false,
  slowResponseDelay: 2000, // 2초
};

// localStorage 유틸리티 함수들
export const storageUtils = {
  // 데이터 저장
  setItem: <T>(key: string, data: T): void => {
    try {
      // SSR 호환성: localStorage가 사용 가능한지 확인
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage가 사용할 수 없습니다. 저장이 생략됩니다.');
        return;
      }
      
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('localStorage 저장 오류:', error);
    }
  },

  // 데이터 불러오기
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      // SSR 호환성: localStorage가 사용 가능한지 확인
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage가 사용할 수 없습니다. SSR 환경이거나 브라우저에서 비활성화됨');
        // SSR 환경에서는 기본 Mock 데이터 반환
        if (key === STORAGE_KEYS.TODOS) {
          return mockTodos as T;
        }
        if (key === STORAGE_KEYS.SCHEDULES) {
          return mockSchedules as T;
        }
        return defaultValue;
      }

      const item = localStorage.getItem(key);
      if (item === null || item === 'undefined' || item === '[]') {
        console.log(`📋 localStorage에 ${key} 데이터 없음 (item: ${item}), 기본 Mock 데이터로 초기화`);
        // 초기 데이터가 없으면 기본 Mock 데이터로 초기화
        if (key === STORAGE_KEYS.TODOS) {
          console.log('📋 mockTodos로 초기화:', mockTodos.length, '개');
          // 🔥 CRITICAL FIX: 즉시 localStorage에 저장하고 반환
          localStorage.setItem(key, JSON.stringify(mockTodos));
          return mockTodos as T;
        }
        if (key === STORAGE_KEYS.SCHEDULES) {
          console.log('📋 mockSchedules로 초기화:', mockSchedules.length, '개');
          // 🔥 CRITICAL FIX: 즉시 localStorage에 저장하고 반환
          localStorage.setItem(key, JSON.stringify(mockSchedules));
          return mockSchedules as T;
        }
        return defaultValue;
      }

      const parsed = JSON.parse(item) as T;

      // 🔥 CRITICAL FIX: 빈 배열인 경우에도 mock 데이터로 초기화
      if (Array.isArray(parsed) && parsed.length === 0) {
        console.log(`📋 localStorage ${key}가 빈 배열임, Mock 데이터로 재초기화`);
        if (key === STORAGE_KEYS.TODOS) {
          console.log('📋 빈 배열 → mockTodos로 재초기화:', mockTodos.length, '개');
          localStorage.setItem(key, JSON.stringify(mockTodos));
          return mockTodos as T;
        }
        if (key === STORAGE_KEYS.SCHEDULES) {
          console.log('📋 빈 배열 → mockSchedules로 재초기화:', mockSchedules.length, '개');
          localStorage.setItem(key, JSON.stringify(mockSchedules));
          return mockSchedules as T;
        }
      }

      console.log(`📋 localStorage에서 ${key} 읽기 성공:`, Array.isArray(parsed) ? `${parsed.length}개` : typeof parsed);
      return parsed;
    } catch (error) {
      console.error('localStorage 읽기 오류:', error);
      // 오류 발생 시에도 기본 Mock 데이터 반환
      if (key === STORAGE_KEYS.TODOS) {
        console.log('📋 오류로 인한 mockTodos 사용:', mockTodos.length, '개');
        // 🔥 CRITICAL FIX: 오류 시에도 localStorage에 저장
        try {
          localStorage.setItem(key, JSON.stringify(mockTodos));
        } catch (e) {
          console.error('localStorage 저장 중 추가 오류:', e);
        }
        return mockTodos as T;
      }
      if (key === STORAGE_KEYS.SCHEDULES) {
        console.log('📋 오류로 인한 mockSchedules 사용:', mockSchedules.length, '개');
        // 🔥 CRITICAL FIX: 오류 시에도 localStorage에 저장
        try {
          localStorage.setItem(key, JSON.stringify(mockSchedules));
        } catch (e) {
          console.error('localStorage 저장 중 추가 오류:', e);
        }
        return mockSchedules as T;
      }
      return defaultValue;
    }
  },

  // 데이터 삭제
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage 삭제 오류:', error);
    }
  },

  // 모든 데이터 초기화
  clear: (): void => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('localStorage 초기화 오류:', error);
    }
  }
};

// ID 생성 함수들
const generateTodoId = (): string => {
  const lastId = storageUtils.getItem(STORAGE_KEYS.LAST_TODO_ID, 0);
  const newId = lastId + 1;
  storageUtils.setItem(STORAGE_KEYS.LAST_TODO_ID, newId);
  return `todo-${newId}`;
};

const generateScheduleId = (): string => {
  const lastId = storageUtils.getItem(STORAGE_KEYS.LAST_SCHEDULE_ID, 0);
  const newId = lastId + 1;
  storageUtils.setItem(STORAGE_KEYS.LAST_SCHEDULE_ID, newId);
  return `schedule-${newId}`;
};

// 에러 시뮬레이션 헬퍼 함수들
const getErrorConfig = (): ErrorSimulationConfig => {
  return storageUtils.getItem(STORAGE_KEYS.ERROR_CONFIG, DEFAULT_ERROR_CONFIG);
};

const shouldSimulateError = (operation: keyof ErrorSimulationConfig['specificErrors']): boolean => {
  const config = getErrorConfig();
  
  if (!config.enabled) {
    return false;
  }
  
  // 특정 오퍼레이션에 대한 강제 에러가 설정된 경우
  if (config.specificErrors[operation]) {
    return true;
  }
  
  // 일반 에러율에 따른 랜덤 에러 발생
  const randomValue = Math.random() * 100;
  return randomValue < config.errorRate;
};

const shouldSimulateNetworkError = (): boolean => {
  const config = getErrorConfig();
  
  if (!config.enabled) {
    return false;
  }
  
  const randomValue = Math.random() * 100;
  return randomValue < config.networkFailureRate;
};

const getSimulationDelay = (): number => {
  const config = getErrorConfig();
  
  if (config.slowResponse) {
    return config.slowResponseDelay;
  }
  
  return 300; // 기본 지연 시간
};

const createNetworkError = (operation: string): Error => {
  const errorMessages = [
    '네트워크 연결이 불안정합니다.',
    '서버에 연결할 수 없습니다.',
    '요청 시간이 초과되었습니다.',
    '일시적인 네트워크 오류가 발생했습니다.',
  ];
  
  const randomMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];
  const error = new Error(randomMessage);
  error.name = 'NetworkError';
  return error;
};

const createOperationError = (operation: string): Error => {
  const errorMessages = {
    getTodos: ['할 일 목록을 불러올 수 없습니다.', '데이터베이스 연결 오류가 발생했습니다.'],
    createTodo: ['할 일 생성에 실패했습니다.', '필수 정보가 누락되었습니다.'],
    updateTodo: ['할 일 수정에 실패했습니다.', '권한이 없습니다.'],
    deleteTodo: ['할 일 삭제에 실패했습니다.', '이미 삭제된 항목입니다.'],
    autoSchedule: ['스케줄링 알고리즘 오류가 발생했습니다.', '사용 가능한 시간이 부족합니다.'],
  };
  
  const messages = errorMessages[operation as keyof typeof errorMessages] || ['알 수 없는 오류가 발생했습니다.'];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  const error = new Error(randomMessage);
  error.name = 'OperationError';
  return error;
};

// API 응답 지연 시뮬레이션
const delay = (ms?: number): Promise<void> => {
  const delayMs = ms || getSimulationDelay();
  return new Promise(resolve => setTimeout(resolve, delayMs));
};

// API 응답 래퍼 함수
const createApiResponse = <T>(
  data: T | null, 
  success: boolean = true, 
  message?: string
): ApiResponse<T> => {
  if (success && data !== null) {
    return {
      success: true,
      data,
      message: message || '성공적으로 처리되었습니다.'
    };
  } else {
    return {
      success: false,
      message: message || '처리 중 오류가 발생했습니다.',
      error: {
        code: 'MOCK_API_ERROR',
        message: message || '알 수 없는 오류가 발생했습니다.'
      }
    } as ApiResponse<T>;
  }
};

// Todo CRUD API 함수들
export const todoApi = {
  // 모든 Todo 조회 (페이징, 필터링 지원)
  getTodos: async (
    page: number = 1,
    size: number = 20,
    filters?: FilterOptions
  ): Promise<PaginatedResponse<Todo>> => {
    console.log('📋 mockApi.getTodos 호출됨 - page:', page, 'size:', size, 'filters:', filters);
    await delay();

    // 네트워크 에러 시뮬레이션
    if (shouldSimulateNetworkError()) {
      throw createNetworkError('getTodos');
    }

    // 특정 오퍼레이션 에러 시뮬레이션
    if (shouldSimulateError('getTodos')) {
      throw createOperationError('getTodos');
    }

    try {
      let todos = storageUtils.getItem<Todo[]>(STORAGE_KEYS.TODOS, []);
      console.log('📋 localStorage에서 읽어온 todos 개수:', todos.length);
      console.log('📋 첫 번째 todo:', todos[0]);
      
      // 날짜 문자열을 Date 객체로 변환
      todos = todos.map(todo => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
        deadline: todo.deadline ? new Date(todo.deadline) : undefined
      }));

      // 필터링 적용
      if (filters) {
        if (filters.categories && filters.categories.length > 0) {
          todos = todos.filter(todo => filters.categories.includes(todo.category));
        }
        if (filters.priorities && filters.priorities.length > 0) {
          todos = todos.filter(todo => filters.priorities.includes(todo.priority));
        }
        if (filters.statuses && filters.statuses.length > 0) {
          todos = todos.filter(todo => filters.statuses.includes(todo.status));
        }
        if (filters.tags && filters.tags.length > 0) {
          todos = todos.filter(todo => 
            filters.tags.some(tag => todo.tags.includes(tag))
          );
        }
        if (filters.dateRange) {
          todos = todos.filter(todo => {
            const createdAt = new Date(todo.createdAt);
            return createdAt >= filters.dateRange!.start && 
                   createdAt <= filters.dateRange!.end;
          });
        }
      }

      // 페이징 처리
      const total = todos.length;
      const totalPages = Math.ceil(total / size);
      const start = (page - 1) * size;
      const end = start + size;
      const paginatedTodos = todos.slice(start, end);

      return {
        success: true,
        data: paginatedTodos,
        message: `총 ${total}개의 할 일을 조회했습니다.`,
        pagination: {
          page,
          size,
          total,
          totalPages
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Todo 목록 조회 중 오류가 발생했습니다.',
        error: {
          code: 'GET_TODOS_ERROR',
          message: error instanceof Error ? error.message : '알 수 없는 오류'
        },
        pagination: {
          page: 1,
          size: 0,
          total: 0,
          totalPages: 0
        }
      };
    }
  },

  // 특정 Todo 조회
  getTodoById: async (id: string): Promise<ApiResponse<Todo>> => {
    await delay();
    
    try {
      const todos = storageUtils.getItem<Todo[]>(STORAGE_KEYS.TODOS, []);
      const todo = todos.find(t => t.id === id);
      
      if (!todo) {
        return createApiResponse<Todo>(null, false, '해당 할 일을 찾을 수 없습니다.');
      }

      // 날짜 문자열을 Date 객체로 변환
      const todoWithDates = {
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
        deadline: todo.deadline ? new Date(todo.deadline) : undefined
      };

      return createApiResponse(todoWithDates, true, '할 일 조회가 완료되었습니다.');
    } catch (error) {
      return createApiResponse<Todo>(null, false, 'Todo 조회 중 오류가 발생했습니다.');
    }
  },

  // Todo 생성
  createTodo: async (todoData: CreateTodoForm): Promise<ApiResponse<Todo>> => {
    console.log('📝 mockApi.createTodo 시작, 입력 데이터:', todoData);
    await delay();

    try {
      const todos = storageUtils.getItem<Todo[]>(STORAGE_KEYS.TODOS, []);
      console.log('📝 기존 localStorage todos:', todos.length, '개');

      const newTodo: Todo = {
        id: generateTodoId(),
        title: todoData.title.trim(),
        description: todoData.description?.trim(),
        duration: todoData.duration,
        category: todoData.category,
        priority: todoData.priority,
        status: 'WAITING',
        tags: todoData.tags.map(tag => tag.trim()),
        deadline: todoData.deadline ? new Date(todoData.deadline) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-1' // Mock 사용자 ID
      };

      console.log('📝 생성된 새 할일:', newTodo);

      todos.push(newTodo);
      console.log('📝 할일 추가 후 총 개수:', todos.length);

      storageUtils.setItem(STORAGE_KEYS.TODOS, todos);
      console.log('📝 localStorage 저장 완료');

      // 저장 후 검증
      const savedTodos = storageUtils.getItem<Todo[]>(STORAGE_KEYS.TODOS, []);
      console.log('📝 저장 후 검증 - localStorage에서 다시 읽은 todos 개수:', savedTodos.length);

      const response = createApiResponse(newTodo, true, '새로운 할 일이 생성되었습니다.');
      console.log('📝 createTodo API 응답:', response);

      return response;
    } catch (error) {
      console.log('📝 createTodo 에러:', error);
      return createApiResponse<Todo>(null, false, 'Todo 생성 중 오류가 발생했습니다.');
    }
  },

  // Todo 수정
  updateTodo: async (id: string, updateData: UpdateTodoForm): Promise<ApiResponse<Todo>> => {
    await delay();
    
    try {
      const todos = storageUtils.getItem<Todo[]>(STORAGE_KEYS.TODOS, []);
      const todoIndex = todos.findIndex(t => t.id === id);
      
      if (todoIndex === -1) {
        return createApiResponse<any>(null, false, '해당 할 일을 찾을 수 없습니다.');
      }

      const updatedTodo = {
        ...todos[todoIndex],
        ...updateData,
        deadline: updateData.deadline ? new Date(updateData.deadline) : todos[todoIndex].deadline,
        updatedAt: new Date()
      };

      todos[todoIndex] = updatedTodo;
      storageUtils.setItem(STORAGE_KEYS.TODOS, todos);

      return createApiResponse(updatedTodo, true, '할 일이 성공적으로 수정되었습니다.');
    } catch (error) {
      return createApiResponse<any>(null, false, 'Todo 수정 중 오류가 발생했습니다.');
    }
  },

  // Todo 삭제
  deleteTodo: async (id: string): Promise<ApiResponse<void>> => {
    await delay();
    
    try {
      const todos = storageUtils.getItem<Todo[]>(STORAGE_KEYS.TODOS, []);
      const todoIndex = todos.findIndex(t => t.id === id);
      
      if (todoIndex === -1) {
        return createApiResponse<any>(null, false, '해당 할 일을 찾을 수 없습니다.');
      }

      todos.splice(todoIndex, 1);
      storageUtils.setItem(STORAGE_KEYS.TODOS, todos);

      // 관련된 스케줄도 삭제
      const schedules = storageUtils.getItem<TodoSchedule[]>(STORAGE_KEYS.SCHEDULES, []);
      const filteredSchedules = schedules.filter(s => s.todoId !== id);
      storageUtils.setItem(STORAGE_KEYS.SCHEDULES, filteredSchedules);

      return createApiResponse<void>(undefined as any, true, '할 일이 성공적으로 삭제되었습니다.');
    } catch (error) {
      return createApiResponse<any>(null, false, 'Todo 삭제 중 오류가 발생했습니다.');
    }
  },

  // Todo 상태 변경
  updateTodoStatus: async (id: string, status: Todo['status']): Promise<ApiResponse<Todo>> => {
    await delay();
    
    try {
      const todos = storageUtils.getItem<Todo[]>(STORAGE_KEYS.TODOS, []);
      const todoIndex = todos.findIndex(t => t.id === id);
      
      if (todoIndex === -1) {
        return createApiResponse<any>(null, false, '해당 할 일을 찾을 수 없습니다.');
      }

      todos[todoIndex] = {
        ...todos[todoIndex],
        status,
        updatedAt: new Date()
      };

      storageUtils.setItem(STORAGE_KEYS.TODOS, todos);

      return createApiResponse(todos[todoIndex], true, `할 일 상태가 ${status}로 변경되었습니다.`);
    } catch (error) {
      return createApiResponse<any>(null, false, 'Todo 상태 변경 중 오류가 발생했습니다.');
    }
  }
};

// Schedule CRUD API 함수들
export const scheduleApi = {
  // 스케줄 조회 (날짜 범위로)
  getSchedules: async (startDate: Date, endDate: Date): Promise<ApiResponse<TodoSchedule[]>> => {
    await delay();
    
    try {
      let schedules = storageUtils.getItem<TodoSchedule[]>(STORAGE_KEYS.SCHEDULES, []);
      
      // 날짜 문자열을 Date 객체로 변환
      schedules = schedules.map(schedule => ({
        ...schedule,
        startTime: new Date(schedule.startTime),
        endTime: new Date(schedule.endTime),
        createdAt: new Date(schedule.createdAt)
      }));

      // 날짜 범위로 필터링
      const filteredSchedules = schedules.filter(schedule => {
        const scheduleStart = new Date(schedule.startTime);
        return scheduleStart >= startDate && scheduleStart <= endDate;
      });

      return createApiResponse(filteredSchedules, true, `${filteredSchedules.length}개의 스케줄을 조회했습니다.`);
    } catch (error) {
      return createApiResponse([], false, '스케줄 조회 중 오류가 발생했습니다.');
    }
  },

  // 특정 Todo의 스케줄 조회
  getSchedulesByTodoId: async (todoId: string): Promise<ApiResponse<TodoSchedule[]>> => {
    await delay();
    
    try {
      let schedules = storageUtils.getItem<TodoSchedule[]>(STORAGE_KEYS.SCHEDULES, []);
      
      // 날짜 문자열을 Date 객체로 변환
      schedules = schedules.map(schedule => ({
        ...schedule,
        startTime: new Date(schedule.startTime),
        endTime: new Date(schedule.endTime),
        createdAt: new Date(schedule.createdAt)
      }));

      const todoSchedules = schedules.filter(s => s.todoId === todoId);

      return createApiResponse(todoSchedules, true, `해당 할 일의 ${todoSchedules.length}개 스케줄을 조회했습니다.`);
    } catch (error) {
      return createApiResponse([], false, '스케줄 조회 중 오류가 발생했습니다.');
    }
  },

  // 스케줄 생성
  createSchedule: async (scheduleData: Omit<TodoSchedule, 'id' | 'createdAt'>): Promise<ApiResponse<TodoSchedule>> => {
    await delay();
    
    try {
      const schedules = storageUtils.getItem<TodoSchedule[]>(STORAGE_KEYS.SCHEDULES, []);
      
      const newSchedule: TodoSchedule = {
        id: generateScheduleId(),
        ...scheduleData,
        startTime: new Date(scheduleData.startTime),
        endTime: new Date(scheduleData.endTime),
        createdAt: new Date()
      };

      schedules.push(newSchedule);
      storageUtils.setItem(STORAGE_KEYS.SCHEDULES, schedules);

      return createApiResponse(newSchedule, true, '새로운 스케줄이 생성되었습니다.');
    } catch (error) {
      return createApiResponse<any>(null, false, '스케줄 생성 중 오류가 발생했습니다.');
    }
  },

  // 스케줄 삭제
  deleteSchedule: async (id: string): Promise<ApiResponse<void>> => {
    await delay();
    
    try {
      const schedules = storageUtils.getItem<TodoSchedule[]>(STORAGE_KEYS.SCHEDULES, []);
      const scheduleIndex = schedules.findIndex(s => s.id === id);
      
      if (scheduleIndex === -1) {
        return createApiResponse<any>(null, false, '해당 스케줄을 찾을 수 없습니다.');
      }

      schedules.splice(scheduleIndex, 1);
      storageUtils.setItem(STORAGE_KEYS.SCHEDULES, schedules);

      return createApiResponse<void>(undefined as any, true, '스케줄이 성공적으로 삭제되었습니다.');
    } catch (error) {
      return createApiResponse<any>(null, false, '스케줄 삭제 중 오류가 발생했습니다.');
    }
  }
};

// 자동 스케줄링 API (간단한 로직)
export const schedulingApi = {
  // 자동 스케줄링
  autoSchedule: async (request: SchedulingRequest): Promise<ApiResponse<SchedulingResult>> => {
    await delay(1000); // 스케줄링은 더 오래 걸린다고 시뮬레이션
    
    try {
      const todos = storageUtils.getItem<Todo[]>(STORAGE_KEYS.TODOS, []);
      const schedules = storageUtils.getItem<TodoSchedule[]>(STORAGE_KEYS.SCHEDULES, []);
      
      // 요청된 Todo들 중 WAITING 상태인 것만 찾기
      const targetTodos = todos.filter(todo =>
        request.todoIds.includes(todo.id) && todo.status === 'WAITING'
      );
      const newSchedules: TodoSchedule[] = [];
      const conflicts: any[] = [];
      
      // 간단한 스케줄링 로직 (실제로는 더 복잡할 것)
      let currentTime = new Date();
      
      // 현재 시간이 업무시간(9시-18시) 내라면 현재 시간부터, 아니라면 다음 업무일 9시부터
      const now = new Date();
      if (now.getHours() >= 9 && now.getHours() < 18) {
        // 현재 시간에서 다음 30분 단위로 반올림
        const minutes = Math.ceil(now.getMinutes() / 30) * 30;
        currentTime.setHours(now.getHours(), minutes, 0, 0);
        if (minutes >= 60) {
          currentTime.setHours(currentTime.getHours() + 1, 0, 0, 0);
        }
      } else {
        // 업무시간 외라면 다음 업무일 오전 9시
        if (now.getHours() >= 18) {
          currentTime.setDate(currentTime.getDate() + 1);
        }
        currentTime.setHours(9, 0, 0, 0);
      }
      
      for (const todo of targetTodos) {
        const duration = todo.duration;
        const endTime = new Date(currentTime.getTime() + duration * 60000);
        
        const newSchedule: TodoSchedule = {
          id: generateScheduleId(),
          todoId: todo.id,
          startTime: new Date(currentTime),
          endTime: endTime,
          status: 'SCHEDULED',
          createdAt: new Date()
        };
        
        newSchedules.push(newSchedule);
        schedules.push(newSchedule);
        
        // Todo 상태도 SCHEDULED로 변경
        const todoIndex = todos.findIndex(t => t.id === todo.id);
        if (todoIndex !== -1) {
          todos[todoIndex].status = 'SCHEDULED';
          todos[todoIndex].updatedAt = new Date();
        }
        
        // 다음 할 일을 위해 30분 간격 추가
        currentTime = new Date(endTime.getTime() + 30 * 60000);
        
        // 업무시간(18시) 초과 시 다음날 9시로 이동
        if (currentTime.getHours() >= 18) {
          currentTime.setDate(currentTime.getDate() + 1);
          currentTime.setHours(9, 0, 0, 0);
        }
      }
      
      // 저장
      storageUtils.setItem(STORAGE_KEYS.SCHEDULES, schedules);
      storageUtils.setItem(STORAGE_KEYS.TODOS, todos);
      
      const result: SchedulingResult = {
        success: true,
        scheduledTodos: newSchedules,
        conflicts,
        suggestions: targetTodos.length > 0 ? [
          '모든 할 일이 성공적으로 스케줄링되었습니다.',
          '각 할 일 사이에 30분 휴식 시간이 자동으로 배정되었습니다.'
        ] : [
          '스케줄링할 대기중인 할 일이 없습니다.',
          '새로운 할 일을 추가하거나 기존 할 일의 상태를 확인하세요.'
        ],
        message: targetTodos.length > 0
          ? `${targetTodos.length}개의 할 일이 자동으로 스케줄링되었습니다.`
          : '스케줄링할 대기중인 할 일이 없습니다.'
      };
      
      return createApiResponse(result, true, '자동 스케줄링이 완료되었습니다.');
    } catch (error) {
      console.error('🚨 자동 스케줄링 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '자동 스케줄링 중 오류가 발생했습니다.';
      return createApiResponse<any>(null, false, errorMessage);
    }
  }
};

// 유틸리티 함수들
export const mockApiUtils = {
  // 데이터 초기화
  resetData: async (): Promise<ApiResponse<void>> => {
    await delay();
    
    try {
      storageUtils.clear();
      return createApiResponse<void>(undefined as any, true, '모든 데이터가 초기화되었습니다.');
    } catch (error) {
      return createApiResponse<any>(null, false, '데이터 초기화 중 오류가 발생했습니다.');
    }
  },

  // 샘플 데이터 로드
  loadSampleData: async (): Promise<ApiResponse<void>> => {
    await delay();
    
    try {
      storageUtils.setItem(STORAGE_KEYS.TODOS, mockTodos);
      storageUtils.setItem(STORAGE_KEYS.SCHEDULES, mockSchedules);
      storageUtils.setItem(STORAGE_KEYS.LAST_TODO_ID, mockTodos.length);
      storageUtils.setItem(STORAGE_KEYS.LAST_SCHEDULE_ID, mockSchedules.length);
      
      return createApiResponse<void>(undefined as any, true, '샘플 데이터가 로드되었습니다.');
    } catch (error) {
      return createApiResponse<any>(null, false, '샘플 데이터 로드 중 오류가 발생했습니다.');
    }
  },

  // localStorage 상태 확인
  getStorageInfo: async (): Promise<ApiResponse<{
    todosCount: number;
    schedulesCount: number;
    lastTodoId: number;
    lastScheduleId: number;
  }>> => {
    await delay(100);
    
    try {
      const todos = storageUtils.getItem<Todo[]>(STORAGE_KEYS.TODOS, []);
      const schedules = storageUtils.getItem<TodoSchedule[]>(STORAGE_KEYS.SCHEDULES, []);
      const lastTodoId = storageUtils.getItem<number>(STORAGE_KEYS.LAST_TODO_ID, 0);
      const lastScheduleId = storageUtils.getItem<number>(STORAGE_KEYS.LAST_SCHEDULE_ID, 0);
      
      const info = {
        todosCount: todos.length,
        schedulesCount: schedules.length,
        lastTodoId,
        lastScheduleId
      };
      
      return createApiResponse(info, true, 'localStorage 정보 조회 완료');
    } catch (error) {
      return createApiResponse<any>(null, false, 'localStorage 정보 조회 중 오류가 발생했습니다.');
    }
  }
};

// 에러 시뮬레이션 제어 API
export const errorSimulationApi = {
  // 에러 시뮬레이션 설정 조회
  getConfig: (): ErrorSimulationConfig => {
    return getErrorConfig();
  },

  // 에러 시뮬레이션 설정 업데이트
  updateConfig: (config: Partial<ErrorSimulationConfig>): void => {
    const currentConfig = getErrorConfig();
    const newConfig = { ...currentConfig, ...config };
    storageUtils.setItem(STORAGE_KEYS.ERROR_CONFIG, newConfig);
  },

  // 에러 시뮬레이션 활성화/비활성화
  setEnabled: (enabled: boolean): void => {
    const config = getErrorConfig();
    config.enabled = enabled;
    storageUtils.setItem(STORAGE_KEYS.ERROR_CONFIG, config);
  },

  // 에러율 설정
  setErrorRate: (rate: number): void => {
    const config = getErrorConfig();
    config.errorRate = Math.max(0, Math.min(100, rate)); // 0-100 사이로 제한
    storageUtils.setItem(STORAGE_KEYS.ERROR_CONFIG, config);
  },

  // 특정 오퍼레이션 에러 강제 설정/해제
  setOperationError: (operation: keyof ErrorSimulationConfig['specificErrors'], enabled: boolean): void => {
    const config = getErrorConfig();
    config.specificErrors[operation] = enabled;
    storageUtils.setItem(STORAGE_KEYS.ERROR_CONFIG, config);
  },

  // 느린 응답 시뮬레이션 설정
  setSlowResponse: (enabled: boolean, delay: number = 2000): void => {
    const config = getErrorConfig();
    config.slowResponse = enabled;
    config.slowResponseDelay = delay;
    storageUtils.setItem(STORAGE_KEYS.ERROR_CONFIG, config);
  },

  // 네트워크 실패율 설정
  setNetworkFailureRate: (rate: number): void => {
    const config = getErrorConfig();
    config.networkFailureRate = Math.max(0, Math.min(100, rate));
    storageUtils.setItem(STORAGE_KEYS.ERROR_CONFIG, config);
  },

  // 설정 초기화
  resetConfig: (): void => {
    storageUtils.setItem(STORAGE_KEYS.ERROR_CONFIG, DEFAULT_ERROR_CONFIG);
  },

  // 개발자 도우미: 일반적인 에러 시나리오들
  scenarios: {
    // 모든 에러 비활성화 (정상 동작)
    normal: (): void => {
      errorSimulationApi.updateConfig({
        enabled: false,
        errorRate: 0,
        networkFailureRate: 0,
        specificErrors: {
          getTodos: false,
          createTodo: false,
          updateTodo: false,
          deleteTodo: false,
          autoSchedule: false,
        },
        slowResponse: false,
      });
    },

    // 네트워크 불안정 시나리오
    unstableNetwork: (): void => {
      errorSimulationApi.updateConfig({
        enabled: true,
        errorRate: 10,
        networkFailureRate: 30,
        slowResponse: true,
        slowResponseDelay: 3000,
      });
    },

    // 할 일 조회 실패 시나리오
    todoLoadFailure: (): void => {
      errorSimulationApi.updateConfig({
        enabled: true,
        specificErrors: {
          getTodos: true,
          createTodo: false,
          updateTodo: false,
          deleteTodo: false,
          autoSchedule: false,
        },
      });
    },

    // 스케줄링 실패 시나리오
    schedulingFailure: (): void => {
      errorSimulationApi.updateConfig({
        enabled: true,
        specificErrors: {
          getTodos: false,
          createTodo: false,
          updateTodo: false,
          deleteTodo: false,
          autoSchedule: true,
        },
      });
    },

    // 높은 에러율 시나리오 (개발 테스트용)
    highErrorRate: (): void => {
      errorSimulationApi.updateConfig({
        enabled: true,
        errorRate: 50,
        networkFailureRate: 20,
        slowResponse: true,
        slowResponseDelay: 1500,
      });
    },
  }
};