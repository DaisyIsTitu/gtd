import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Todo, CalendarView } from '@/types';

interface UIState {
  // Modal States
  isAddTodoModalOpen: boolean;
  isEditTodoModalOpen: boolean;
  editingTodo: Todo | null;

  // Sidebar State
  isSidebarCollapsed: boolean;

  // Calendar View State
  calendarView: CalendarView;

  // Preview Mode State
  isPreviewMode: boolean;
  previewSchedules: any[];
  previewResult: any | null;

  // Loading and Error States for UI operations
  uiLoading: boolean;
  uiError: string | null;

  // Notification System
  notifications: Notification[];
  
  // Actions for Modals
  openAddTodoModal: () => void;
  closeAddTodoModal: () => void;
  openEditTodoModal: (todo: Todo) => void;
  closeEditTodoModal: () => void;
  
  // Actions for Sidebar
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Actions for Calendar View
  setCalendarView: (view: CalendarView) => void;
  navigateToDate: (date: Date) => void;
  goToToday: () => void;

  // Actions for Preview Mode
  enterPreviewMode: (schedules: any[], result: any) => void;
  exitPreviewMode: () => void;
  applyPreview: () => void;

  // Actions for UI State
  setUILoading: (loading: boolean) => void;
  setUIError: (error: string | null) => void;
  clearUIError: () => void;
  
  // Actions for Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number; // milliseconds, undefined means permanent
  timestamp: Date;
}

const initialCalendarView: CalendarView = {
  type: 'WEEK',
  currentDate: new Date(),
};

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Initial State
      isAddTodoModalOpen: false,
      isEditTodoModalOpen: false,
      editingTodo: null,
      isSidebarCollapsed: false,
      calendarView: initialCalendarView,
      isPreviewMode: false,
      previewSchedules: [],
      previewResult: null,
      uiLoading: false,
      uiError: null,
      notifications: [],

      // Modal Actions
      openAddTodoModal: () => {
        set({ 
          isAddTodoModalOpen: true,
          isEditTodoModalOpen: false, // Ensure only one modal is open
          editingTodo: null,
          uiError: null // Clear any previous errors
        }, false, 'openAddTodoModal');
      },

      closeAddTodoModal: () => {
        set({ 
          isAddTodoModalOpen: false,
          uiError: null // Clear errors when closing
        }, false, 'closeAddTodoModal');
      },

      openEditTodoModal: (todo) => {
        set({ 
          isEditTodoModalOpen: true,
          isAddTodoModalOpen: false, // Ensure only one modal is open
          editingTodo: todo,
          uiError: null // Clear any previous errors
        }, false, 'openEditTodoModal');
      },

      closeEditTodoModal: () => {
        set({ 
          isEditTodoModalOpen: false,
          editingTodo: null,
          uiError: null // Clear errors when closing
        }, false, 'closeEditTodoModal');
      },

      // Sidebar Actions
      toggleSidebar: () => {
        const { isSidebarCollapsed } = get();
        set({ 
          isSidebarCollapsed: !isSidebarCollapsed 
        }, false, 'toggleSidebar');
      },

      setSidebarCollapsed: (collapsed) => {
        set({ 
          isSidebarCollapsed: collapsed 
        }, false, 'setSidebarCollapsed');
      },

      // Calendar View Actions
      setCalendarView: (view) => {
        set({ 
          calendarView: view 
        }, false, 'setCalendarView');
      },

      navigateToDate: (date) => {
        const { calendarView } = get();
        set({ 
          calendarView: {
            ...calendarView,
            currentDate: date,
            selectedDate: date,
          }
        }, false, 'navigateToDate');
      },

      goToToday: () => {
        const { calendarView } = get();
        const today = new Date();
        set({
          calendarView: {
            ...calendarView,
            currentDate: today,
            selectedDate: today,
          }
        }, false, 'goToToday');
      },

      // Preview Mode Actions
      enterPreviewMode: (schedules, result) => {
        set({
          isPreviewMode: true,
          previewSchedules: schedules,
          previewResult: result,
        }, false, 'enterPreviewMode');
      },

      exitPreviewMode: () => {
        set({
          isPreviewMode: false,
          previewSchedules: [],
          previewResult: null,
        }, false, 'exitPreviewMode');
      },

      applyPreview: () => {
        // Preview를 실제로 적용하고 미리보기 모드 종료
        set({
          isPreviewMode: false,
          previewSchedules: [],
          previewResult: null,
        }, false, 'applyPreview');
      },

      // UI State Actions
      setUILoading: (loading) => {
        set({ uiLoading: loading }, false, 'setUILoading');
      },

      setUIError: (error) => {
        set({ uiError: error }, false, 'setUIError');
      },

      clearUIError: () => {
        set({ uiError: null }, false, 'clearUIError');
      },

      // Notification Actions
      addNotification: (notificationData) => {
        const { notifications } = get();
        const newNotification: Notification = {
          id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          duration: notificationData.type === 'error' ? undefined : 5000, // Errors stay until dismissed
          ...notificationData,
        };

        set({ 
          notifications: [...notifications, newNotification] 
        }, false, 'addNotification');

        // Auto-remove notification if it has a duration
        if (newNotification.duration) {
          setTimeout(() => {
            const currentNotifications = get().notifications;
            set({ 
              notifications: currentNotifications.filter(n => n.id !== newNotification.id) 
            }, false, 'autoRemoveNotification');
          }, newNotification.duration);
        }
      },

      removeNotification: (id) => {
        const { notifications } = get();
        set({ 
          notifications: notifications.filter(n => n.id !== id) 
        }, false, 'removeNotification');
      },

      clearNotifications: () => {
        set({ notifications: [] }, false, 'clearNotifications');
      },
    }),
    {
      name: 'ui-store', // DevTools 이름
    }
  )
);

// Selector hooks for performance optimization
export const useAddTodoModal = () => useUIStore(state => ({
  isOpen: state.isAddTodoModalOpen,
  open: state.openAddTodoModal,
  close: state.closeAddTodoModal,
}));

export const useEditTodoModal = () => useUIStore(state => ({
  isOpen: state.isEditTodoModalOpen,
  todo: state.editingTodo,
  open: state.openEditTodoModal,
  close: state.closeEditTodoModal,
}));

export const useSidebar = () => useUIStore(state => ({
  isCollapsed: state.isSidebarCollapsed,
  toggle: state.toggleSidebar,
  setCollapsed: state.setSidebarCollapsed,
}));

export const useCalendarView = () => useUIStore(state => ({
  view: state.calendarView,
  setView: state.setCalendarView,
  navigateToDate: state.navigateToDate,
  goToToday: state.goToToday,
}));

export const usePreviewMode = () => useUIStore(state => ({
  isPreviewMode: state.isPreviewMode,
  previewSchedules: state.previewSchedules,
  previewResult: state.previewResult,
  enterPreviewMode: state.enterPreviewMode,
  exitPreviewMode: state.exitPreviewMode,
  applyPreview: state.applyPreview,
}));

export const useUILoading = () => useUIStore(state => state.uiLoading);
export const useUIError = () => useUIStore(state => state.uiError);

export const useNotifications = () => useUIStore(state => ({
  notifications: state.notifications,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
}));

// Utility hook for showing success/error messages
export const useToast = () => {
  const addNotification = useUIStore(state => state.addNotification);

  return {
    success: (title: string, message?: string) => {
      addNotification({
        type: 'success',
        title,
        message: message || '',
      });
    },
    error: (title: string, message?: string) => {
      addNotification({
        type: 'error',
        title,
        message: message || '',
      });
    },
    warning: (title: string, message?: string) => {
      addNotification({
        type: 'warning',
        title,
        message: message || '',
      });
    },
    info: (title: string, message?: string) => {
      addNotification({
        type: 'info',
        title,
        message: message || '',
      });
    },
  };
};