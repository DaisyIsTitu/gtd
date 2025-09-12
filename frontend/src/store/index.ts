// Export all stores and hooks
export * from './todoStore';
export * from './uiStore';

// Re-export commonly used hooks for convenience
export {
  useTodoStore,
  useFilteredTodos,
  useActiveTodos,
  useCompletedTodos,
  useWaitingTodos,
  useTodoLoading,
  useTodoError,
  useTodoFilters,
  useSelectedTodo,
  useSchedules,
  useSchedulingLoading,
  useSchedulingError,
  useLastSchedulingResult,
  useAutoSchedule,
  useSchedulingActions,
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