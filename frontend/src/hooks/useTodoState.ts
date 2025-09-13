import { useState } from 'react';
import { useTodoStore } from '@/store/todoStore';
import { TodoStatus } from '@/types';

interface UseTodoStateReturn {
  updateStatus: (todoId: string, newStatus: TodoStatus) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export function useTodoState(): UseTodoStateReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateTodoStatus = useTodoStore(state => state.updateTodoStatus);

  const updateStatus = async (todoId: string, newStatus: TodoStatus): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🔄 상태 변경 시도: ${todoId} → ${newStatus}`);

      const updatedTodo = await updateTodoStatus(todoId, newStatus);

      if (updatedTodo) {
        console.log(`✅ 상태 변경 성공: ${todoId} → ${newStatus}`);
        return true;
      } else {
        const errorMsg = 'Todo 상태 변경에 실패했습니다.';
        console.error(`❌ 상태 변경 실패: ${errorMsg}`);
        setError(errorMsg);
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '상태 변경 중 오류가 발생했습니다.';
      console.error(`❌ 상태 변경 에러: ${errorMsg}`);
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateStatus,
    loading,
    error
  };
}

// 특정 상태 전환을 위한 개별 hooks
export function useStartTodo() {
  const { updateStatus, loading, error } = useTodoState();

  const startTodo = (todoId: string) => updateStatus(todoId, 'IN_PROGRESS');

  return { startTodo, loading, error };
}

export function useCompleteTodo() {
  const { updateStatus, loading, error } = useTodoState();

  const completeTodo = (todoId: string) => updateStatus(todoId, 'COMPLETED');

  return { completeTodo, loading, error };
}

export function usePauseTodo() {
  const { updateStatus, loading, error } = useTodoState();

  const pauseTodo = (todoId: string) => updateStatus(todoId, 'SCHEDULED');

  return { pauseTodo, loading, error };
}

export function useRestartTodo() {
  const { updateStatus, loading, error } = useTodoState();

  const restartTodo = (todoId: string) => updateStatus(todoId, 'WAITING');

  return { restartTodo, loading, error };
}

// 상태별 가능한 전환 목록을 반환하는 유틸리티 hook
export function useAvailableTransitions(currentStatus: TodoStatus) {
  const transitions = {
    WAITING: [
      { to: 'IN_PROGRESS' as TodoStatus, label: '시작', icon: '▶️' },
      { to: 'COMPLETED' as TodoStatus, label: '완료', icon: '✅' }
    ],
    SCHEDULED: [
      { to: 'IN_PROGRESS' as TodoStatus, label: '시작', icon: '▶️' },
      { to: 'COMPLETED' as TodoStatus, label: '완료', icon: '✅' }
    ],
    IN_PROGRESS: [
      { to: 'SCHEDULED' as TodoStatus, label: '일시정지', icon: '⏸️' },
      { to: 'COMPLETED' as TodoStatus, label: '완료', icon: '✅' }
    ],
    MISSED: [
      { to: 'WAITING' as TodoStatus, label: '재시작', icon: '🔄' },
      { to: 'IN_PROGRESS' as TodoStatus, label: '시작', icon: '▶️' }
    ],
    COMPLETED: [
      { to: 'SCHEDULED' as TodoStatus, label: '재개', icon: '🔄' }
    ],
    CANCELLED: []
  };

  return transitions[currentStatus] || [];
}