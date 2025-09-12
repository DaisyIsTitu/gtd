// Export all stores and hooks
export * from './todoStore';
export * from './uiStore';

// Re-export commonly used hooks for convenience
export {
  useTodoStore,
  useFilteredTodos,
  useActiveTodos,
  useCompletedTodos,
  useTodoLoading,
  useTodoError,
  useTodoFilters,
  useSelectedTodo,
} from './todoStore';

export {
  useUIStore,
  useAddTodoModal,
  useEditTodoModal,
  useSidebar,
  useCalendarView,
  useUILoading,
  useUIError,
  useNotifications,
  useToast,
} from './uiStore';