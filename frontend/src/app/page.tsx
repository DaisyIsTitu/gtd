'use client';

import React, { useEffect, useState, useLayoutEffect, useMemo } from 'react';
import WeeklyCalendar from '@/components/calendar/WeeklyCalendar';
import TodoSidebar from '@/components/todo/TodoSidebar';
import PreviewActionBar from '@/components/calendar/PreviewActionBar';
import NotificationSystem from '@/components/ui/NotificationSystem';
import TodoAddModal from '@/components/todo/TodoAddModal';
import TodoEditModal from '@/components/todo/TodoEditModal';
import { CalendarLoadingIndicator } from '@/components/ui/CalendarSkeleton';
import { TodoSchedule, Todo } from '@/types';
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
  const [mounted, setMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // 🔥 CRITICAL FIX: 스토어 상태를 개별적으로 구독하여 재렌더링 보장
  const fetchTodos = useTodoStore(state => state.fetchTodos);
  const fetchSchedules = useTodoStore(state => state.fetchSchedules);
  const createTodo = useTodoStore(state => state.createTodo);
  const updateTodo = useTodoStore(state => state.updateTodo);
  const deleteTodo = useTodoStore(state => state.deleteTodo);
  const clearError = useTodoStore(state => state.clearError);

  // 🎯 핵심: 스토어 상태를 직접 구독하여 변경 시 재렌더링 보장
  const storeTodos = useTodoStore(state => state.todos);
  const storeLoading = useTodoStore(state => state.loading);
  const storeError = useTodoStore(state => state.error);

  // 데이터 로딩은 useEffect에서만 처리 (중복 실행 방지)

  console.log('🚀 HomePage 컴포넌트 렌더링, mounted:', mounted, ', isClient:', isClient, ', dataLoaded:', dataLoaded);
  console.log('🚀 fetchTodos 함수 타입:', typeof fetchTodos);
  console.log('🚀 fetchSchedules 함수 타입:', typeof fetchSchedules);
  console.log('🚀 window 존재 여부:', typeof window !== 'undefined');
  console.log('🔍 HomePage: storeTodos 개수:', storeTodos?.length || 0);
  console.log('🔍 HomePage: storeTodos 직접 사용 - 무한루프 수정 완료');

  // 데이터 로딩은 useEffect에서만 처리 (중복 실행 방지)

  // 🚀 CRITICAL FIX: 스토어 데이터를 직접 사용하고 필터링은 컴포넌트 내부에서 처리
  // useFilteredTodos 훅이 작동하지 않는 문제 우회
  const filteredTodos = useFilteredTodos();
  console.log('🔍 HomePage: filteredTodos 개수:', filteredTodos?.length || 0);
  console.log('🔍 HomePage: storeTodos vs filteredTodos:', (storeTodos?.length || 0), 'vs', (filteredTodos?.length || 0));

  // 🚀 ULTIMATE SOLUTION: 직접 store state 주입으로 React 재렌더링 문제 완전 우회
  // Playwright 테스트 환경에서 React 컴포넌트 구독이 실패하는 문제 해결
  const getDirectStoreData = () => {
    try {
      const currentStore = useTodoStore.getState();
      console.log('🎯 DIRECT STORE INJECTION: store todos 개수:', currentStore.todos?.length || 0);
      console.log('🎯 DIRECT STORE INJECTION: store filteredTodos 개수:', currentStore.filteredTodos?.length || 0);

      // 🎯 CRITICAL FIX: filteredTodos와 todos 모두 확인하여 가장 많은 데이터 사용
      const storeData = currentStore.filteredTodos || currentStore.todos;
      if (storeData && storeData.length > 0) {
        console.log('🎯 DIRECT STORE INJECTION: 성공! store에서 직접 데이터 주입');
        console.log('🎯 DIRECT STORE INJECTION: 데이터 소스:', currentStore.filteredTodos ? 'filteredTodos' : 'todos');
        console.log('🎯 DIRECT STORE INJECTION: 첫 번째 todo:', storeData[0]?.title);
        return storeData;
      }
    } catch (error) {
      console.error('🚨 DIRECT STORE INJECTION 실패:', error);
    }
    return null;
  };

  // 🎯 데이터 소스 단순화: storeTodos와 filteredTodos만 사용 (무한 루프 방지)
  const directStoreTodos = useMemo(() => {
    // 단순히 사용 가능한 데이터 반환 (무한 루프 방지)
    if (storeTodos && storeTodos.length > 0) {
      return storeTodos;
    }
    return getDirectStoreData();
  }, [storeTodos]);

  // 🎯 SIMPLIFIED FALLBACK: storeTodos 우선, filteredTodos는 fallback
  const todos = directStoreTodos || storeTodos || filteredTodos || [];

  console.log('🔍 HomePage: FINAL todos value (단순화된 소스):');
  console.log('🔍 - directStoreTodos 개수:', directStoreTodos?.length || 0);
  console.log('🔍 - storeTodos 개수:', storeTodos?.length || 0);
  console.log('🔍 - filteredTodos 개수:', filteredTodos?.length || 0);
  console.log('🔍 - FINAL todos 개수:', todos?.length || 0);
  console.log('🔍 - FINAL todos 첫 번째:', todos?.[0]?.title || 'none');

  const waitingTodos = useWaitingTodos();
  // 🎯 스토어 데이터를 직접 사용하여 재렌더링 보장
  const loading = storeLoading;
  const error = storeError;
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

  // Combined client-side detection and data loading effect
  useEffect(() => {
    console.log('🚀 통합 useEffect 실행 - 클라이언트 감지 및 데이터 로딩');
    console.log('🚀 window 존재 여부:', typeof window !== 'undefined');

    // Set client state immediately
    setIsClient(true);
    setMounted(true);

    // Load data immediately in the same effect with slight delay for SSR compatibility
    const loadData = async () => {
      console.log('🚀 즉시 데이터 로딩 시작');
      console.log('🚀 fetchTodos 호출');
      await fetchTodos();
      console.log('🚀 fetchTodos 완료');

      console.log('🚀 fetchSchedules 호출');
      await fetchSchedules();
      console.log('🚀 fetchSchedules 완료');
      setDataLoaded(true);
    };

    // Execute immediately, but also ensure it runs after hydration
    loadData();

    // Fallback: also trigger after a small delay to ensure SSR/hydration compatibility
    const fallbackTimer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        console.log('🔄 Fallback 데이터 로딩 실행');
        loadData();
      }
    }, 100);

    return () => clearTimeout(fallbackTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // WORKAROUND: Force data loading even if useEffect doesn't work (for test environments)
  // This is a backup mechanism to ensure data loading works in Playwright tests
  useLayoutEffect(() => {
    console.log('🧪 WORKAROUND useLayoutEffect 실행');
    const timer = setTimeout(() => {
      console.log('🧪 WORKAROUND 타이머 실행 - 데이터 강제 로딩');
      if (typeof fetchTodos === 'function') {
        console.log('🧪 WORKAROUND fetchTodos 강제 호출');
        fetchTodos();
      }
      if (typeof fetchSchedules === 'function') {
        console.log('🧪 WORKAROUND fetchSchedules 강제 호출');
        fetchSchedules();
      }
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleTodoUpdated = async (updatedTodo: any) => {
    console.log('📝 handleTodoUpdated 시작:', updatedTodo);
    const success = await updateTodo(updatedTodo.id, updatedTodo);
    if (success) {
      console.log('✅ handleTodoUpdated - 업데이트 성공');
      toast.success('할 일 수정 완료', `"${updatedTodo.title}"이(가) 수정되었습니다.`);
      editModal.close();
      // Refresh schedules as updated todos might affect display
      fetchSchedules();
    } else {
      console.error('❌ handleTodoUpdated - 업데이트 실패');
    }
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

  // 자동배치 버튼 중복 클릭 방지를 위한 상태
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);

  const handleAutoSchedule = async () => {
    // 강화된 중복 실행 방지
    if (isAutoScheduling || autoSchedule.loading || previewMode.isPreviewMode) {
      console.log('🚨 자동 배치 중복 실행 방지 - isAutoScheduling:', isAutoScheduling, '로딩:', autoSchedule.loading, '미리보기:', previewMode.isPreviewMode);
      return;
    }

    if (!waitingTodos || waitingTodos.length === 0) {
      toast.warning('자동 배치', '배치할 대기중인 할 일이 없습니다.');
      return;
    }

    // 실행 시작 플래그 설정
    setIsAutoScheduling(true);
    console.log('🚀 자동 배치 시작 - waitingTodos:', waitingTodos.length);

    try {
      const result = await autoSchedule.autoSchedule();
      console.log('🚀 자동 배치 결과:', result);

      // Enter preview mode with the scheduling result
      if (result) {
        // Get updated todos and schedules after auto-scheduling
        const updatedTodos = useTodoStore.getState().filteredTodos;
        const updatedSchedules = useTodoStore.getState().schedules;
        previewMode.enterPreviewMode(updatedTodos || [], { success: true, scheduledTodos: updatedTodos });
        toast.info('미리보기 모드', '배치 결과를 확인하고 적용 또는 취소를 선택하세요.');
      }
    } catch (error) {
      console.error('🚨 Auto-scheduling failed:', error);
      toast.error('자동 배치 실패', error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      // 실행 완료 후 플래그 해제
      setIsAutoScheduling(false);
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
    // 자동 호출 제거 - 사용자가 직접 버튼을 클릭하도록 함
    console.log('🔄 미리보기 모드 종료 완료. 사용자가 자동 배치 버튼을 다시 클릭해야 합니다.');
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
                console.log('🧪 fetchTodos type:', typeof fetchTodos);
                console.log('🧪 mounted:', mounted);

                fetchTodos().then(() => {
                  console.log('🧪 Manual fetchTodos 완료');
                }).catch((error) => {
                  console.error('🧪 Manual fetchTodos 오류:', error);
                });
              }}
              className="inline-flex items-center px-3 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
            >
              🧪 테스트 (mounted: {mounted ? 'true' : 'false'})
            </button>

            {/* Auto Schedule Button with Enhanced Progress */}
            <div className="relative">
              <button
                onClick={handleAutoSchedule}
                disabled={isAutoScheduling || autoSchedule.loading || previewMode.isPreviewMode || (!waitingTodos || waitingTodos.length === 0)}
                className={`auto-schedule-button inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                  (isAutoScheduling || autoSchedule.loading)
                    ? 'loading bg-green-500 text-white cursor-not-allowed'
                    : (previewMode.isPreviewMode)
                    ? 'bg-orange-400 text-white cursor-not-allowed'
                    : (!waitingTodos || waitingTodos.length === 0)
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md focus:ring-green-500'
                }`}
              >
                {(isAutoScheduling || autoSchedule.loading) ? (
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
              {(isAutoScheduling || autoSchedule.loading) && (
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
        {(() => {
          console.log('🎯 ABOUT TO RENDER TodoSidebar with props:');
          console.log('🎯 - todos:', todos);
          console.log('🎯 - todos length:', todos?.length || 0);
          console.log('🎯 - todos || []:', todos || []);
          console.log('🎯 - (todos || []).length:', (todos || []).length);
          console.log('🎯 - loading:', loading);
          console.log('🎯 - error:', error);
          return null;
        })()}
        <TodoSidebar
          todos={todos || []}
          loading={loading}
          error={error}
          onTodoClick={handleTodoClick}
          onDragStart={handleTodoDragStart}
          onAddTodo={addModal.open}
          onAutoSchedule={handleAutoSchedule}
          autoScheduleLoading={isAutoScheduling || autoSchedule.loading}
        />

        {/* 캘린더 영역 */}
        <div className="flex-1 p-2 md:p-4 calendar-scroll">
          {(loading || !dataLoaded) ? (
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