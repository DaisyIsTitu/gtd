import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Todo, FilterOptions, CreateTodoForm, UpdateTodoForm, TodoStatus, TodoSchedule } from '@/types';
import { todoApi, schedulingApi, scheduleApi } from '@/lib/mockApi';
import { schedulingService } from '@/lib/schedulingService';

interface TodoState {
  // State
  todos: Todo[];
  schedules: TodoSchedule[];
  loading: boolean;
  error: string | null;
  filters: FilterOptions;
  selectedTodo: Todo | null;
  
  // Scheduling State
  schedulingLoading: boolean;
  schedulingError: string | null;
  lastSchedulingResult: any | null;
  
  // Computed values (calculated after data changes)
  filteredTodos: Todo[];
  activeTodos: Todo[];
  completedTodos: Todo[];
  waitingTodos: Todo[];
  
  // Actions
  updateComputedValues: () => void;
  setTodos: (todos: Todo[]) => void;
  setSchedules: (schedules: TodoSchedule[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: FilterOptions) => void;
  setSelectedTodo: (todo: Todo | null) => void;
  setSchedulingLoading: (loading: boolean) => void;
  setSchedulingError: (error: string | null) => void;
  
  // API Actions
  fetchTodos: () => Promise<void>;
  fetchSchedules: () => Promise<void>;
  createTodo: (todoData: CreateTodoForm) => Promise<Todo | null>;
  updateTodo: (id: string, updateData: UpdateTodoForm) => Promise<Todo | null>;
  deleteTodo: (id: string) => Promise<boolean>;
  updateTodoStatus: (id: string, status: TodoStatus) => Promise<Todo | null>;
  
  // Scheduling Actions
  autoScheduleWaitingTodos: () => Promise<boolean>;
  clearSchedulingError: () => void;
  
  // Utility Actions
  clearError: () => void;
  resetFilters: () => void;
  getTodoById: (id: string) => Todo | undefined;
  getSchedulesForTodo: (todoId: string) => TodoSchedule[];
}

const initialFilters: FilterOptions = {
  categories: [],
  priorities: [],
  statuses: [], // E2E 테스트를 위해 모든 상태 표시 (기본 필터 해제)
  tags: [],
};

export const useTodoStore = create<TodoState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        todos: [],
        schedules: [],
        loading: false,
        error: null,
        filters: initialFilters,
        selectedTodo: null,
        schedulingLoading: false,
        schedulingError: null,
        lastSchedulingResult: null,
        filteredTodos: [],
        activeTodos: [],
        completedTodos: [],
        waitingTodos: [],

        // Helper function to update computed values
        updateComputedValues: () => {
          const { todos, filters } = get();
          console.log('🔍 updateComputedValues 호출됨');
          console.log('🔍 todos 개수:', todos.length);
          console.log('🔍 filters:', filters);
          
          // Calculate filteredTodos
          const filteredTodos = todos.filter(todo => {
            // 카테고리 필터
            if (filters.categories.length > 0 && !filters.categories.includes(todo.category)) {
              return false;
            }

            // 우선순위 필터
            if (filters.priorities.length > 0 && !filters.priorities.includes(todo.priority)) {
              return false;
            }

            // 상태 필터
            if (filters.statuses.length > 0 && !filters.statuses.includes(todo.status)) {
              return false;
            }

            // 태그 필터 (하나라도 일치하면 포함)
            if (filters.tags.length > 0) {
              const hasMatchingTag = filters.tags.some(filterTag =>
                todo.tags.some(todoTag => 
                  todoTag.toLowerCase().includes(filterTag.toLowerCase())
                )
              );
              if (!hasMatchingTag) {
                return false;
              }
            }

            // 날짜 범위 필터
            if (filters.dateRange) {
              const createdAt = new Date(todo.createdAt);
              if (createdAt < filters.dateRange.start || createdAt > filters.dateRange.end) {
                return false;
              }
            }

            return true;
          });
          
          // Calculate activeTodos
          const activeTodos = todos.filter(todo => 
            todo.status === 'WAITING' || 
            todo.status === 'SCHEDULED' || 
            todo.status === 'IN_PROGRESS'
          );
          
          // Calculate completedTodos
          const completedTodos = todos.filter(todo => todo.status === 'COMPLETED');
          
          // Calculate waitingTodos
          const waitingTodos = todos.filter(todo => todo.status === 'WAITING');
          
          console.log('🔍 필터링 후 todos 개수:', filteredTodos.length);
          console.log('🔍 활성 todos 개수:', activeTodos.length);
          console.log('🔍 완료 todos 개수:', completedTodos.length);
          console.log('🔍 대기 todos 개수:', waitingTodos.length);
          
          set({ filteredTodos, activeTodos, completedTodos, waitingTodos }, false, 'updateComputedValues');
        },

        // Basic Setters
        setTodos: (todos) => {
          set({ todos }, false, 'setTodos');
          get().updateComputedValues();
        },
        setLoading: (loading) => set({ loading }, false, 'setLoading'),
        setError: (error) => set({ error }, false, 'setError'),
        setFilters: (filters) => {
          set({ filters }, false, 'setFilters');
          get().updateComputedValues();
        },
        setSelectedTodo: (selectedTodo) => set({ selectedTodo }, false, 'setSelectedTodo'),
        setSchedules: (schedules) => set({ schedules }, false, 'setSchedules'),
        setSchedulingLoading: (loading) => set({ schedulingLoading: loading }, false, 'setSchedulingLoading'),
        setSchedulingError: (error) => set({ schedulingError: error }, false, 'setSchedulingError'),

        // API Actions
        fetchTodos: async () => {
          console.log('🔍 fetchTodos 호출 시작');
          console.log('🔍 todoApi 객체 확인:', typeof todoApi, !!todoApi);
          console.log('🔍 todoApi.getTodos 함수 확인:', typeof todoApi?.getTodos, !!todoApi?.getTodos);
          set({ loading: true, error: null }, false, 'fetchTodos:start');

          try {
            console.log('🔍 todoApi.getTodos 호출 중...');
            const response = await todoApi.getTodos(1, 100); // Get all todos
            console.log('🔍 todoApi.getTodos 응답:', response);
            
            if (response.success && response.data) {
              console.log('🔍 성공! todos 개수:', response.data.length);
              console.log('🔍 첫 번째 todo:', response.data[0]);
              
              set({ 
                todos: response.data, 
                loading: false, 
                error: null 
              }, false, 'fetchTodos:success');
              
              // 계산된 값들 업데이트
              get().updateComputedValues();
              
              console.log('🔍 Zustand store에 todos 설정 및 계산된 값 업데이트 완료');
            } else {
              console.log('🔍 응답 실패:', response);
              set({ 
                loading: false, 
                error: response.message || '할 일 목록을 불러오는데 실패했습니다.' 
              }, false, 'fetchTodos:error');
            }
          } catch (error) {
            console.log('🔍 fetchTodos 에러:', error);
            set({ 
              loading: false, 
              error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
            }, false, 'fetchTodos:catch');
          }
        },

        createTodo: async (todoData) => {
          console.log('🚀 createTodo 호출됨:', todoData);
          set({ loading: true, error: null }, false, 'createTodo:start');

          try {
            console.log('🚀 todoApi.createTodo 호출 전');
            const response = await todoApi.createTodo(todoData);
            console.log('🚀 todoApi.createTodo 응답:', response);

            if (response.success && response.data) {
              const newTodo = response.data;
              const { todos } = get();
              console.log('🚀 새 할일 생성:', newTodo);
              console.log('🚀 기존 할일 개수:', todos.length);

              const newTodos = [...todos, newTodo];
              console.log('🚀 업데이트된 할일 개수:', newTodos.length);

              set({
                todos: newTodos,
                loading: false,
                error: null
              }, false, 'createTodo:success');

              // Update computed values after state change
              get().updateComputedValues();

              console.log('🚀 상태 업데이트 완료, 최종 할일 개수:', get().todos.length);
              console.log('🚀 filteredTodos 개수:', get().filteredTodos.length);

              return newTodo;
            } else {
              console.log('🚨 createTodo API 응답 실패:', response);
              set({
                loading: false,
                error: response.message || '할 일 생성에 실패했습니다.'
              }, false, 'createTodo:error');
              return null;
            }
          } catch (error) {
            console.log('🚨 createTodo 에러:', error);
            set({
              loading: false,
              error: error instanceof Error ? error.message : '할 일 생성 중 오류가 발생했습니다.'
            }, false, 'createTodo:catch');
            return null;
          }
        },

        updateTodo: async (id, updateData) => {
          set({ loading: true, error: null }, false, 'updateTodo:start');
          
          try {
            const response = await todoApi.updateTodo(id, updateData);
            
            if (response.success && response.data) {
              const updatedTodo = response.data;
              const { todos, selectedTodo } = get();
              
              const updatedTodos = todos.map(todo => 
                todo.id === id ? updatedTodo : todo
              );
              
              set({
                todos: updatedTodos,
                selectedTodo: selectedTodo?.id === id ? updatedTodo : selectedTodo,
                loading: false,
                error: null
              }, false, 'updateTodo:success');

              // Update computed values after state change
              get().updateComputedValues();
              
              return updatedTodo;
            } else {
              set({ 
                loading: false, 
                error: response.message || '할 일 수정에 실패했습니다.' 
              }, false, 'updateTodo:error');
              return null;
            }
          } catch (error) {
            set({ 
              loading: false, 
              error: error instanceof Error ? error.message : '할 일 수정 중 오류가 발생했습니다.' 
            }, false, 'updateTodo:catch');
            return null;
          }
        },

        deleteTodo: async (id) => {
          set({ loading: true, error: null }, false, 'deleteTodo:start');
          
          try {
            const response = await todoApi.deleteTodo(id);
            
            if (response.success) {
              const { todos, selectedTodo } = get();
              const updatedTodos = todos.filter(todo => todo.id !== id);
              
              set({
                todos: updatedTodos,
                selectedTodo: selectedTodo?.id === id ? null : selectedTodo,
                loading: false,
                error: null
              }, false, 'deleteTodo:success');

              // Update computed values after state change
              get().updateComputedValues();
              
              return true;
            } else {
              set({ 
                loading: false, 
                error: response.message || '할 일 삭제에 실패했습니다.' 
              }, false, 'deleteTodo:error');
              return false;
            }
          } catch (error) {
            set({ 
              loading: false, 
              error: error instanceof Error ? error.message : '할 일 삭제 중 오류가 발생했습니다.' 
            }, false, 'deleteTodo:catch');
            return false;
          }
        },

        updateTodoStatus: async (id, status) => {
          set({ loading: true, error: null }, false, 'updateTodoStatus:start');
          
          try {
            const response = await todoApi.updateTodoStatus(id, status);
            
            if (response.success && response.data) {
              const updatedTodo = response.data;
              const { todos, selectedTodo } = get();
              
              const updatedTodos = todos.map(todo => 
                todo.id === id ? updatedTodo : todo
              );
              
              set({ 
                todos: updatedTodos, 
                selectedTodo: selectedTodo?.id === id ? updatedTodo : selectedTodo,
                loading: false, 
                error: null 
              }, false, 'updateTodoStatus:success');
              
              return updatedTodo;
            } else {
              set({ 
                loading: false, 
                error: response.message || '할 일 상태 변경에 실패했습니다.' 
              }, false, 'updateTodoStatus:error');
              return null;
            }
          } catch (error) {
            set({ 
              loading: false, 
              error: error instanceof Error ? error.message : '할 일 상태 변경 중 오류가 발생했습니다.' 
            }, false, 'updateTodoStatus:catch');
            return null;
          }
        },

        // Scheduling API Actions
        fetchSchedules: async () => {
          console.log('🔍 fetchSchedules 호출 시작');
          set({ schedulingLoading: true, schedulingError: null }, false, 'fetchSchedules:start');
          
          try {
            const today = new Date();
            const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7); // 일주일 전부터
            const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7); // 일주일 후까지
            const response = await scheduleApi.getSchedules(startDate, endDate);
            console.log('🔍 schedulingApi.getSchedules 응답:', response);
            
            if (response.success && response.data) {
              console.log('🔍 성공! schedules 개수:', response.data.length);
              set({ 
                schedules: response.data, 
                schedulingLoading: false, 
                schedulingError: null 
              }, false, 'fetchSchedules:success');
            } else {
              set({ 
                schedulingLoading: false, 
                schedulingError: response.message || '스케줄 목록을 불러오는데 실패했습니다.' 
              }, false, 'fetchSchedules:error');
            }
          } catch (error) {
            console.error('🔍 fetchSchedules 에러:', error);
            set({ 
              schedulingLoading: false, 
              schedulingError: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
            }, false, 'fetchSchedules:catch');
          }
        },

        autoScheduleWaitingTodos: async () => {
          console.log('🔍 autoScheduleWaitingTodos 호출 시작');
          set({ schedulingLoading: true, schedulingError: null }, false, 'autoSchedule:start');
          
          try {
            const { todos, schedules } = get();
            console.log('🔍 현재 todos:', todos.length);
            console.log('🔍 현재 schedules:', schedules.length);
            
            // 스케줄링 서비스를 통해 자동 배치 실행
            const result = await schedulingService.autoScheduleWaitingTodos(todos, schedules);
            console.log('🔍 스케줄링 결과:', result);
            
            if (result.success) {
              // 새로운 스케줄이 생성되었으면 데이터 새로고침
              if (result.scheduledTodos && result.scheduledTodos.length > 0) {
                await get().fetchTodos();
                await get().fetchSchedules();
              }
              
              set({ 
                schedulingLoading: false, 
                schedulingError: null,
                lastSchedulingResult: result 
              }, false, 'autoSchedule:success');
              
              return true;
            } else {
              set({ 
                schedulingLoading: false, 
                schedulingError: result.message || '자동 스케줄링에 실패했습니다.',
                lastSchedulingResult: result
              }, false, 'autoSchedule:error');
              
              return false;
            }
          } catch (error) {
            console.error('🔍 autoScheduleWaitingTodos 에러:', error);
            set({ 
              schedulingLoading: false, 
              schedulingError: error instanceof Error ? error.message : '자동 스케줄링 중 오류가 발생했습니다.' 
            }, false, 'autoSchedule:catch');
            
            return false;
          }
        },

        clearSchedulingError: () => set({ schedulingError: null }, false, 'clearSchedulingError'),

        // Utility Actions
        clearError: () => set({ error: null }, false, 'clearError'),
        
        resetFilters: () => set({ filters: initialFilters }, false, 'resetFilters'),
        
        getTodoById: (id) => {
          const { todos } = get();
          return todos.find(todo => todo.id === id);
        },

        getSchedulesForTodo: (todoId) => {
          const { schedules } = get();
          return schedules.filter(schedule => schedule.todoId === todoId);
        },
      }),
      {
        name: 'todo-storage', // 로컬 스토리지 키 (Mock API와 다른 키 사용)
        partialize: (state) => ({ 
          filters: state.filters,
          // todos는 항상 Mock API에서 새로 가져오므로 저장하지 않음
          // Mock API가 gtd_todos 키에 직접 저장/관리함
        }),
      }
    ),
    {
      name: 'todo-store', // DevTools 이름
    }
  )
);

// Selector hooks for performance optimization
export const useFilteredTodos = () => useTodoStore(state => {
  console.log('🔍 useFilteredTodos 호출됨 - store의 filteredTodos 사용');
  console.log('🔍 store filteredTodos 개수:', state.filteredTodos.length);
  console.log('🔍 store filteredTodos 첫번째:', state.filteredTodos[0]);
  return state.filteredTodos;
});
export const useActiveTodos = () => useTodoStore(state => {
  console.log('🔍 useActiveTodos 호출됨 - store의 activeTodos 사용');
  return state.activeTodos;
});

export const useCompletedTodos = () => useTodoStore(state => {
  console.log('🔍 useCompletedTodos 호출됨 - store의 completedTodos 사용');
  return state.completedTodos;
});

export const useWaitingTodos = () => useTodoStore(state => {
  console.log('🔍 useWaitingTodos 호출됨 - store의 waitingTodos 사용');
  return state.waitingTodos;
});
export const useTodoLoading = () => useTodoStore(state => state.loading);
export const useTodoError = () => useTodoStore(state => state.error);
export const useTodoFilters = () => useTodoStore(state => state.filters);
export const useSelectedTodo = () => useTodoStore(state => state.selectedTodo);

// Scheduling-related selector hooks
export const useSchedules = () => useTodoStore(state => state.schedules);
export const useSchedulingLoading = () => useTodoStore(state => state.schedulingLoading);
export const useSchedulingError = () => useTodoStore(state => state.schedulingError);
export const useLastSchedulingResult = () => useTodoStore(state => state.lastSchedulingResult);

// Composite selector hooks
export const useAutoSchedule = () => useTodoStore(state => ({
  loading: state.schedulingLoading,
  error: state.schedulingError,
  lastResult: state.lastSchedulingResult,
  autoSchedule: state.autoScheduleWaitingTodos,
  clearError: state.clearSchedulingError,
}));

export const useSchedulingActions = () => useTodoStore(state => ({
  fetchSchedules: state.fetchSchedules,
  autoSchedule: state.autoScheduleWaitingTodos,
  clearError: state.clearSchedulingError,
}));