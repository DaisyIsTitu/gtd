'use client';

import { useEffect } from 'react';
import WeeklyCalendar from '@/components/calendar/WeeklyCalendar';
import TodoSidebar from '@/components/todo/TodoSidebar';
import PreviewActionBar from '@/components/calendar/PreviewActionBar';
import NotificationSystem from '@/components/ui/NotificationSystem';
import TodoAddModal from '@/components/todo/TodoAddModal';
import TodoEditModal from '@/components/todo/TodoEditModal';
import { CalendarLoadingIndicator } from '@/components/ui/CalendarSkeleton';
import { TodoSchedule } from '@/types';
import {
  useTodoStore,
  useFilteredTodos,
  useTodoLoading,
  useTodoError,
  useWaitingTodos,
  useAddTodoModal,
  useEditTodoModal,
  useAutoSchedule,
  usePreviewMode,
  useSchedules,
  useToast,
} from '@/store';

export default function HomePage() {
  // Store hooks
  const { fetchTodos, fetchSchedules, createTodo, updateTodo, deleteTodo, clearError } = useTodoStore(state => ({
    fetchTodos: state.fetchTodos,
    fetchSchedules: state.fetchSchedules,
    createTodo: state.createTodo,
    updateTodo: state.updateTodo,
    deleteTodo: state.deleteTodo,
    clearError: state.clearError,
  }));

  console.log('🚀 HomePage 컴포넌트 렌더링');
  
  const todos = useFilteredTodos();
  const waitingTodos = useWaitingTodos();
  const loading = useTodoLoading();
  const error = useTodoError();
  const schedules = useSchedules();
  
  // Auto-scheduling hooks
  const autoSchedule = useAutoSchedule();

  // Preview mode hooks
  const previewMode = usePreviewMode();

  // Modal hooks
  const addModal = useAddTodoModal();
  const editModal = useEditTodoModal();

  // Toast notifications
  const toast = useToast();

  // Load todos and schedules on component mount
  useEffect(() => {
    console.log('🚀 useEffect 실행 - fetchTodos 호출 시도');
    console.log('🚀 fetchTodos 함수:', typeof fetchTodos, fetchTodos);
    fetchTodos();
    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency - only run on mount

  // Handle API errors with toast notifications
  useEffect(() => {
    if (error) {
      toast.error('오류 발생', error);
      clearError();
    }
  }, [error, toast, clearError]);

  // Handle auto-scheduling errors with toast notifications
  useEffect(() => {
    if (autoSchedule.error) {
      toast.error('자동 배치 오류', autoSchedule.error);
      autoSchedule.clearError();
    }
  }, [autoSchedule.error, toast, autoSchedule]);

  // Handle auto-scheduling success with toast notifications
  useEffect(() => {
    if (autoSchedule.lastResult?.success) {
      const result = autoSchedule.lastResult;
      toast.success(
        '자동 배치 완료',
        `${result.scheduledTodos?.length || 0}개의 할 일이 배치되었습니다.`
      );
    }
  }, [autoSchedule.lastResult, toast]);

  // Create merged schedules for preview mode
  const getMergedSchedules = () => {
    if (!previewMode.isPreviewMode) {
      return schedules;
    }

    // Mark existing schedules as preview-existing
    const existingSchedules = schedules.map(schedule => ({
      ...schedule,
      isPreviewExisting: true,
      isPreviewNew: false
    }));

    // Mark preview schedules as preview-new
    const newSchedules = previewMode.previewSchedules.map(schedule => ({
      ...schedule,
      isPreviewNew: true,
      isPreviewExisting: false
    }));

    return [...existingSchedules, ...newSchedules];
  };

  // Event handlers
  const handleScheduleClick = (schedule: TodoSchedule) => {
    console.log('Schedule clicked:', schedule);
    // TODO: 스케줄 상세 모달 또는 편집 기능 구현
  };

  const handleTimeSlotClick = (date: Date, hour: number, minute: number) => {
    console.log('Time slot clicked:', { date, hour, minute });
    // TODO: 새 Todo 생성 또는 드래그 앤 드롭 기능 구현
  };

  const handleTodoClick = (todo: any) => {
    console.log('Todo clicked:', todo);
    editModal.open(todo);
  };

  const handleTodoDragStart = (e: React.DragEvent, todo: any) => {
    console.log('Todo drag started:', todo);
    
    // 드래그 중 스타일을 위한 클래스 추가
    e.currentTarget.classList.add('dragging');
    
    // 드래그가 끝나면 클래스 제거
    setTimeout(() => {
      e.currentTarget.classList.remove('dragging');
    }, 100);
  };

  // Modal event handlers
  const handleTodoCreated = async (todoData: any) => {
    const newTodo = await createTodo(todoData);
    if (newTodo) {
      toast.success('할 일 생성 완료', `"${newTodo.title}"이(가) 생성되었습니다.`);
      addModal.close();
      // Refresh schedules as new todos might affect display
      fetchSchedules();
    }
  };

  const handleTodoUpdated = (updatedTodo: any) => {
    toast.success('할 일 수정 완료', `"${updatedTodo.title}"이(가) 수정되었습니다.`);
    editModal.close();
    // Refresh schedules as updated todos might affect display
    fetchSchedules();
  };

  const handleTodoDeleted = async (todoId: string) => {
    const success = await deleteTodo(todoId);
    if (success) {
      toast.success('할 일 삭제 완료', '할 일이 삭제되었습니다.');
      editModal.close();
      // Refresh schedules as deleted todos might affect display
      fetchSchedules();
    }
  };

  const handleAutoSchedule = async () => {
    // 이미 로딩 중이거나 미리보기 모드인 경우 중복 실행 방지
    if (autoSchedule.loading || previewMode.isPreviewMode) {
      console.log('🚨 자동 배치 중복 실행 방지 - 로딩:', autoSchedule.loading, '미리보기:', previewMode.isPreviewMode);
      return;
    }

    if (!waitingTodos || waitingTodos.length === 0) {
      toast.warning('자동 배치', '배치할 대기중인 할 일이 없습니다.');
      return;
    }

    console.log('🚀 자동 배치 시작 - waitingTodos:', waitingTodos.length);

    try {
      const result = await autoSchedule.autoSchedule();
      console.log('🚀 자동 배치 결과:', result);

      // Enter preview mode with the scheduling result
      if (result && result.success) {
        previewMode.enterPreviewMode(result.scheduledTodos || [], result);
        toast.info('미리보기 모드', '배치 결과를 확인하고 적용 또는 취소를 선택하세요.');
      }
    } catch (error) {
      console.error('🚨 Auto-scheduling failed:', error);
      toast.error('자동 배치 실패', error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  // Preview mode handlers
  const handlePreviewApply = () => {
    previewMode.applyPreview();
    toast.success('자동 배치 적용', '일정이 성공적으로 적용되었습니다.');
    // Refresh schedules after applying preview
    fetchSchedules();
  };

  const handlePreviewRetry = async () => {
    console.log('🔄 미리보기 재시도');
    previewMode.exitPreviewMode();
    // Retry auto-scheduling
    setTimeout(() => {
      handleAutoSchedule();
    }, 100);
  };

  const handlePreviewCancel = () => {
    console.log('❌ 미리보기 취소');
    previewMode.exitPreviewMode();
    toast.info('배치 취소', '자동 배치가 취소되었습니다.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification System */}
      <NotificationSystem />

      {/* Modals */}
      <TodoAddModal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        onTodoCreated={handleTodoCreated}
      />

      <TodoEditModal
        isOpen={editModal.isOpen}
        todo={editModal.todo}
        onClose={editModal.close}
        onTodoUpdated={handleTodoUpdated}
        onTodoDeleted={handleTodoDeleted}
      />

      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* 모바일 햄버거 메뉴 */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors touch-target"
              onClick={() => {
                // TODO: 사이드바 토글 기능 구현
                console.log('Toggle sidebar');
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="header-mobile">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                Todo Time-blocking
              </h1>
              <p className="text-xs md:text-sm text-gray-600 hidden sm:block">
                당신의 할 일을 명확한 일정으로 관리하세요.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {!loading && (
              <div className="text-sm text-gray-500">
                총 {todos?.length || 0}개의 할 일 {waitingTodos && waitingTodos.length > 0 && `(${waitingTodos.length}개 대기중)`}
              </div>
            )}
            
            {/* Manual Test Button */}
            <button
              onClick={() => {
                console.log('🧪 Manual fetchTodos 테스트 시작');
                fetchTodos().then(() => {
                  console.log('🧪 Manual fetchTodos 완료');
                }).catch((error) => {
                  console.error('🧪 Manual fetchTodos 오류:', error);
                });
              }}
              className="inline-flex items-center px-3 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
            >
              🧪 테스트
            </button>

            {/* Auto Schedule Button with Enhanced Progress */}
            <div className="relative">
              <button
                onClick={handleAutoSchedule}
                disabled={autoSchedule.loading || previewMode.isPreviewMode || (!waitingTodos || waitingTodos.length === 0)}
                className={`auto-schedule-button inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                  autoSchedule.loading
                    ? 'loading bg-green-500 text-white cursor-not-allowed'
                    : (previewMode.isPreviewMode)
                    ? 'bg-orange-400 text-white cursor-not-allowed'
                    : (!waitingTodos || waitingTodos.length === 0)
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md focus:ring-green-500'
                }`}
              >
                {autoSchedule.loading ? (
                  <>
                    <div className="relative w-4 h-4 mr-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                    <span className="animate-pulse">
                      {waitingTodos ? `${waitingTodos.length}개 배치 중...` : '배치 중...'}
                    </span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      {previewMode.isPreviewMode
                        ? '미리보기 모드'
                        : (!waitingTodos || waitingTodos.length === 0)
                        ? '배치할 할 일 없음'
                        : `자동 배치 (${waitingTodos.length}개)`
                      }
                    </span>
                  </>
                )}
              </button>

              {/* Enhanced Progress Bar - 로딩 중일 때만 표시 */}
              {autoSchedule.loading && (
                <div className="absolute -bottom-1 left-0 right-0 h-1.5 bg-green-100 rounded-full overflow-hidden">
                  <div className="h-full progress-bar-enhanced rounded-full">
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={addModal.open}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              새 할 일
            </button>
          </div>
        </div>
      </header>
      
      {/* Preview Mode Action Bar */}
      {previewMode.isPreviewMode && (
        <PreviewActionBar
          previewResult={previewMode.previewResult}
          onApply={handlePreviewApply}
          onRetry={handlePreviewRetry}
          onCancel={handlePreviewCancel}
        />
      )}

      {/* 메인 컨텐츠 */}
      <div className="flex h-[calc(100vh-88px)] relative">
        {/* Todo 사이드바 */}
        <TodoSidebar
          todos={todos || []}
          loading={loading}
          error={error}
          onTodoClick={handleTodoClick}
          onDragStart={handleTodoDragStart}
          onAddTodo={addModal.open}
          onAutoSchedule={handleAutoSchedule}
          autoScheduleLoading={autoSchedule.loading}
        />

        {/* 캘린더 영역 */}
        <div className="flex-1 p-2 md:p-4 calendar-scroll">
          {loading ? (
            <CalendarLoadingIndicator />
          ) : (
            <WeeklyCalendar
              schedules={getMergedSchedules()}
              todos={todos || []}
              onScheduleClick={handleScheduleClick}
              onTimeSlotClick={handleTimeSlotClick}
              isPreviewMode={previewMode.isPreviewMode}
            />
          )}
        </div>
      </div>
    </div>
  );
}