'use client';

import { useState, useEffect } from 'react';
import { todoApi, scheduleApi, mockApiUtils } from '@/lib/mockApi';
import { Todo, CreateTodoForm } from '@/types';

export default function TestApiPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');

  const addLog = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Todo 목록 로드
  const loadTodos = async () => {
    setLoading(true);
    try {
      const result = await todoApi.getTodos(1, 20);
      if (result.success) {
        setTodos(result.data || []);
        addLog(`✅ Todo 목록 로드 성공 (${result.data?.length}개)`);
      } else {
        addLog(`❌ Todo 목록 로드 실패: ${result.message}`);
      }
    } catch (error) {
      addLog(`❌ 에러: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 새 Todo 생성
  const createTodo = async () => {
    if (!newTodoTitle.trim()) return;

    const newTodo: CreateTodoForm = {
      title: newTodoTitle,
      description: '테스트용 할 일입니다',
      duration: 60,
      category: 'WORK',
      priority: 'MEDIUM',
      tags: ['테스트']
    };

    try {
      const result = await todoApi.createTodo(newTodo);
      if (result.success) {
        addLog(`✅ Todo 생성 성공: ${result.data?.title} (ID: ${result.data?.id})`);
        setNewTodoTitle('');
        await loadTodos(); // 목록 새로고침
      } else {
        addLog(`❌ Todo 생성 실패: ${result.message}`);
      }
    } catch (error) {
      addLog(`❌ 에러: ${error}`);
    }
  };

  // Todo 삭제
  const deleteTodo = async (id: string, title: string) => {
    try {
      const result = await todoApi.deleteTodo(id);
      if (result.success) {
        addLog(`✅ Todo 삭제 성공: ${title}`);
        await loadTodos();
      } else {
        addLog(`❌ Todo 삭제 실패: ${result.message}`);
      }
    } catch (error) {
      addLog(`❌ 에러: ${error}`);
    }
  };

  // Todo 상태 변경
  const updateStatus = async (id: string, title: string, newStatus: Todo['status']) => {
    try {
      const result = await todoApi.updateTodoStatus(id, newStatus);
      if (result.success) {
        addLog(`✅ 상태 변경 성공: ${title} → ${newStatus}`);
        await loadTodos();
      } else {
        addLog(`❌ 상태 변경 실패: ${result.message}`);
      }
    } catch (error) {
      addLog(`❌ 에러: ${error}`);
    }
  };

  // 샘플 데이터 로드
  const loadSampleData = async () => {
    try {
      await mockApiUtils.loadSampleData();
      addLog('✅ 샘플 데이터 로드 완료');
      await loadTodos();
    } catch (error) {
      addLog(`❌ 샘플 데이터 로드 실패: ${error}`);
    }
  };

  // 데이터 리셋
  const resetData = async () => {
    try {
      await mockApiUtils.resetData();
      addLog('✅ 데이터 리셋 완료');
      setTodos([]);
    } catch (error) {
      addLog(`❌ 데이터 리셋 실패: ${error}`);
    }
  };

  // 종합 테스트
  const runFullTest = async () => {
    addLog('🧪 종합 테스트 시작...');
    
    // 1. 데이터 리셋
    await resetData();
    
    // 2. 샘플 데이터 로드
    await loadSampleData();
    
    // 3. 필터링 테스트
    try {
      const workTodos = await todoApi.getTodos(1, 10, {
        categories: ['WORK'],
        priorities: ['HIGH', 'URGENT'],
        statuses: [],
        tags: []
      });
      addLog(`✅ 필터링 테스트: WORK 카테고리 ${workTodos.data?.length}개 조회`);
    } catch (error) {
      addLog(`❌ 필터링 테스트 실패: ${error}`);
    }

    // 4. 스케줄 조회 테스트
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      
      const schedules = await scheduleApi.getSchedules(startDate, endDate);
      addLog(`✅ 스케줄 조회 테스트: ${schedules.data?.length}개 스케줄 조회`);
    } catch (error) {
      addLog(`❌ 스케줄 조회 테스트 실패: ${error}`);
    }

    addLog('🎉 종합 테스트 완료!');
  };

  // 페이지 로드 시 초기 데이터 로드
  useEffect(() => {
    loadTodos();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Mock API 테스트 페이지</h1>
      
      {/* 컨트롤 패널 */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">🎮 컨트롤 패널</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={loadTodos}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            📋 Todo 목록 로드
          </button>
          <button 
            onClick={loadSampleData}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            📊 샘플 데이터 로드
          </button>
          <button 
            onClick={resetData}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            🗑️ 데이터 리셋
          </button>
          <button 
            onClick={runFullTest}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            🧪 종합 테스트
          </button>
        </div>
      </div>

      {/* Todo 생성 */}
      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">➕ 새 Todo 생성</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="할 일 제목을 입력하세요"
            className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && createTodo()}
          />
          <button
            onClick={createTodo}
            disabled={!newTodoTitle.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            생성
          </button>
        </div>
      </div>

      {/* Todo 목록 */}
      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">
          📝 Todo 목록 ({todos.length}개)
          {loading && <span className="text-blue-500 ml-2">로딩중...</span>}
        </h2>
        
        {todos.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Todo가 없습니다. 샘플 데이터를 로드해보세요!</p>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <div 
                key={todo.id} 
                className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{todo.title}</span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      todo.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      todo.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      todo.status === 'WAITING' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {todo.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      todo.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                      todo.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      todo.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {todo.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {todo.category} • {todo.duration}분 • {todo.tags.join(', ')}
                  </p>
                </div>
                
                <div className="flex gap-1">
                  {todo.status !== 'COMPLETED' && (
                    <button
                      onClick={() => updateStatus(todo.id, todo.title, 'COMPLETED')}
                      className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      완료
                    </button>
                  )}
                  {todo.status === 'WAITING' && (
                    <button
                      onClick={() => updateStatus(todo.id, todo.title, 'IN_PROGRESS')}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      시작
                    </button>
                  )}
                  <button
                    onClick={() => deleteTodo(todo.id, todo.title)}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 테스트 로그 */}
      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
        <h2 className="text-xl font-semibold mb-4 text-white">🖥️ 테스트 로그</h2>
        <div className="h-64 overflow-y-auto space-y-1">
          {testResults.length === 0 ? (
            <p className="text-gray-500">로그가 없습니다. 테스트를 실행해보세요!</p>
          ) : (
            testResults.map((log, index) => (
              <div key={index}>{log}</div>
            ))
          )}
        </div>
        <button
          onClick={() => setTestResults([])}
          className="mt-2 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
        >
          로그 지우기
        </button>
      </div>
    </div>
  );
}