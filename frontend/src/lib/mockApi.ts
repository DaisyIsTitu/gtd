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
} as const;

// localStorage 유틸리티 함수들
export const storageUtils = {
  // 데이터 저장
  setItem: <T>(key: string, data: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('localStorage 저장 오류:', error);
    }
  },

  // 데이터 불러오기
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        // 초기 데이터가 없으면 기본 Mock 데이터로 초기화
        if (key === STORAGE_KEYS.TODOS) {
          storageUtils.setItem(key, mockTodos);
          return mockTodos as T;
        }
        if (key === STORAGE_KEYS.SCHEDULES) {
          storageUtils.setItem(key, mockSchedules);
          return mockSchedules as T;
        }
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('localStorage 읽기 오류:', error);
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

// API 응답 지연 시뮬레이션
const delay = (ms: number = 300): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
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
    };
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
    await delay();
    
    try {
      let todos = storageUtils.getItem<Todo[]>(STORAGE_KEYS.TODOS, []);
      
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
        return createApiResponse(null, false, '해당 할 일을 찾을 수 없습니다.');
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
      return createApiResponse(null, false, 'Todo 조회 중 오류가 발생했습니다.');
    }
  },

  // Todo 생성
  createTodo: async (todoData: CreateTodoForm): Promise<ApiResponse<Todo>> => {
    await delay();
    
    try {
      const todos = storageUtils.getItem<Todo[]>(STORAGE_KEYS.TODOS, []);
      
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

      todos.push(newTodo);
      storageUtils.setItem(STORAGE_KEYS.TODOS, todos);

      return createApiResponse(newTodo, true, '새로운 할 일이 생성되었습니다.');
    } catch (error) {
      return createApiResponse(null, false, 'Todo 생성 중 오류가 발생했습니다.');
    }
  },

  // Todo 수정
  updateTodo: async (id: string, updateData: UpdateTodoForm): Promise<ApiResponse<Todo>> => {
    await delay();
    
    try {
      const todos = storageUtils.getItem<Todo[]>(STORAGE_KEYS.TODOS, []);
      const todoIndex = todos.findIndex(t => t.id === id);
      
      if (todoIndex === -1) {
        return createApiResponse(null, false, '해당 할 일을 찾을 수 없습니다.');
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
      return createApiResponse(null, false, 'Todo 수정 중 오류가 발생했습니다.');
    }
  },

  // Todo 삭제
  deleteTodo: async (id: string): Promise<ApiResponse<void>> => {
    await delay();
    
    try {
      const todos = storageUtils.getItem<Todo[]>(STORAGE_KEYS.TODOS, []);
      const todoIndex = todos.findIndex(t => t.id === id);
      
      if (todoIndex === -1) {
        return createApiResponse(null, false, '해당 할 일을 찾을 수 없습니다.');
      }

      todos.splice(todoIndex, 1);
      storageUtils.setItem(STORAGE_KEYS.TODOS, todos);

      // 관련된 스케줄도 삭제
      const schedules = storageUtils.getItem<TodoSchedule[]>(STORAGE_KEYS.SCHEDULES, []);
      const filteredSchedules = schedules.filter(s => s.todoId !== id);
      storageUtils.setItem(STORAGE_KEYS.SCHEDULES, filteredSchedules);

      return createApiResponse(null, true, '할 일이 성공적으로 삭제되었습니다.');
    } catch (error) {
      return createApiResponse(null, false, 'Todo 삭제 중 오류가 발생했습니다.');
    }
  },

  // Todo 상태 변경
  updateTodoStatus: async (id: string, status: Todo['status']): Promise<ApiResponse<Todo>> => {
    await delay();
    
    try {
      const todos = storageUtils.getItem<Todo[]>(STORAGE_KEYS.TODOS, []);
      const todoIndex = todos.findIndex(t => t.id === id);
      
      if (todoIndex === -1) {
        return createApiResponse(null, false, '해당 할 일을 찾을 수 없습니다.');
      }

      todos[todoIndex] = {
        ...todos[todoIndex],
        status,
        updatedAt: new Date()
      };

      storageUtils.setItem(STORAGE_KEYS.TODOS, todos);

      return createApiResponse(todos[todoIndex], true, `할 일 상태가 ${status}로 변경되었습니다.`);
    } catch (error) {
      return createApiResponse(null, false, 'Todo 상태 변경 중 오류가 발생했습니다.');
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
      return createApiResponse(null, false, '스케줄 생성 중 오류가 발생했습니다.');
    }
  },

  // 스케줄 삭제
  deleteSchedule: async (id: string): Promise<ApiResponse<void>> => {
    await delay();
    
    try {
      const schedules = storageUtils.getItem<TodoSchedule[]>(STORAGE_KEYS.SCHEDULES, []);
      const scheduleIndex = schedules.findIndex(s => s.id === id);
      
      if (scheduleIndex === -1) {
        return createApiResponse(null, false, '해당 스케줄을 찾을 수 없습니다.');
      }

      schedules.splice(scheduleIndex, 1);
      storageUtils.setItem(STORAGE_KEYS.SCHEDULES, schedules);

      return createApiResponse(null, true, '스케줄이 성공적으로 삭제되었습니다.');
    } catch (error) {
      return createApiResponse(null, false, '스케줄 삭제 중 오류가 발생했습니다.');
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
      
      // 요청된 Todo들 찾기
      const targetTodos = todos.filter(todo => request.todoIds.includes(todo.id));
      const newSchedules: TodoSchedule[] = [];
      const conflicts = [];
      
      // 간단한 스케줄링 로직 (실제로는 더 복잡할 것)
      let currentTime = new Date();
      currentTime.setHours(9, 0, 0, 0); // 오전 9시부터 시작
      
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
      }
      
      // 저장
      storageUtils.setItem(STORAGE_KEYS.SCHEDULES, schedules);
      storageUtils.setItem(STORAGE_KEYS.TODOS, todos);
      
      const result: SchedulingResult = {
        success: true,
        scheduledTodos: newSchedules,
        conflicts,
        suggestions: [
          '모든 할 일이 성공적으로 스케줄링되었습니다.',
          '각 할 일 사이에 30분 휴식 시간이 자동으로 배정되었습니다.'
        ],
        message: `${targetTodos.length}개의 할 일이 자동으로 스케줄링되었습니다.`
      };
      
      return createApiResponse(result, true, '자동 스케줄링이 완료되었습니다.');
    } catch (error) {
      return createApiResponse(null, false, '자동 스케줄링 중 오류가 발생했습니다.');
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
      return createApiResponse(null, true, '모든 데이터가 초기화되었습니다.');
    } catch (error) {
      return createApiResponse(null, false, '데이터 초기화 중 오류가 발생했습니다.');
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
      
      return createApiResponse(null, true, '샘플 데이터가 로드되었습니다.');
    } catch (error) {
      return createApiResponse(null, false, '샘플 데이터 로드 중 오류가 발생했습니다.');
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
      return createApiResponse(null, false, 'localStorage 정보 조회 중 오류가 발생했습니다.');
    }
  }
};