import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Todo, FilterOptions, CreateTodoForm, UpdateTodoForm, TodoStatus } from '@/types';
import { todoApi } from '@/lib/mockApi';

interface TodoState {
  // State
  todos: Todo[];
  loading: boolean;
  error: string | null;
  filters: FilterOptions;
  selectedTodo: Todo | null;
  
  // Computed values (calculated after data changes)
  filteredTodos: Todo[];
  activeTodos: Todo[];
  completedTodos: Todo[];
  
  // Actions
  updateComputedValues: () => void;
  setTodos: (todos: Todo[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: FilterOptions) => void;
  setSelectedTodo: (todo: Todo | null) => void;
  
  // API Actions
  fetchTodos: () => Promise<void>;
  createTodo: (todoData: CreateTodoForm) => Promise<Todo | null>;
  updateTodo: (id: string, updateData: UpdateTodoForm) => Promise<Todo | null>;
  deleteTodo: (id: string) => Promise<boolean>;
  updateTodoStatus: (id: string, status: TodoStatus) => Promise<Todo | null>;
  
  // Utility Actions
  clearError: () => void;
  resetFilters: () => void;
  getTodoById: (id: string) => Todo | undefined;
}

const initialFilters: FilterOptions = {
  categories: [],
  priorities: [],
  statuses: ['WAITING', 'SCHEDULED', 'IN_PROGRESS'], // 기본적으로 활성 상태만 표시
  tags: [],
};

export const useTodoStore = create<TodoState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        todos: [],
        loading: false,
        error: null,
        filters: initialFilters,
        selectedTodo: null,
        filteredTodos: [],
        activeTodos: [],
        completedTodos: [],

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
          
          console.log('🔍 필터링 후 todos 개수:', filteredTodos.length);
          console.log('🔍 활성 todos 개수:', activeTodos.length);
          console.log('🔍 완료 todos 개수:', completedTodos.length);
          
          set({ filteredTodos, activeTodos, completedTodos }, false, 'updateComputedValues');
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

        // API Actions
        fetchTodos: async () => {
          console.log('🔍 fetchTodos 호출 시작');
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
          set({ loading: true, error: null }, false, 'createTodo:start');
          
          try {
            const response = await todoApi.createTodo(todoData);
            
            if (response.success && response.data) {
              const newTodo = response.data;
              const { todos } = get();
              
              set({ 
                todos: [...todos, newTodo], 
                loading: false, 
                error: null 
              }, false, 'createTodo:success');
              
              return newTodo;
            } else {
              set({ 
                loading: false, 
                error: response.message || '할 일 생성에 실패했습니다.' 
              }, false, 'createTodo:error');
              return null;
            }
          } catch (error) {
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

        // Utility Actions
        clearError: () => set({ error: null }, false, 'clearError'),
        
        resetFilters: () => set({ filters: initialFilters }, false, 'resetFilters'),
        
        getTodoById: (id) => {
          const { todos } = get();
          return todos.find(todo => todo.id === id);
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
export const useFilteredTodos = () => useTodoStore(state => state.filteredTodos);
export const useActiveTodos = () => useTodoStore(state => state.activeTodos);
export const useCompletedTodos = () => useTodoStore(state => state.completedTodos);
export const useTodoLoading = () => useTodoStore(state => state.loading);
export const useTodoError = () => useTodoStore(state => state.error);
export const useTodoFilters = () => useTodoStore(state => state.filters);
export const useSelectedTodo = () => useTodoStore(state => state.selectedTodo);