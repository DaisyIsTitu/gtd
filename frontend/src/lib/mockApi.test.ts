// Mock API 함수들의 사용 예시 및 테스트
import { todoApi, scheduleApi, schedulingApi, mockApiUtils } from './mockApi';
import { CreateTodoForm, SchedulingRequest } from '@/types';

// 테스트 실행 함수
export const testMockApi = async () => {
  console.log('🧪 Mock API 테스트 시작');
  
  try {
    // 1. 초기화 및 샘플 데이터 로드
    console.log('\n1. 데이터 초기화 및 샘플 데이터 로드');
    await mockApiUtils.resetData();
    await mockApiUtils.loadSampleData();
    
    const storageInfo = await mockApiUtils.getStorageInfo();
    console.log('📊 Storage 상태:', storageInfo.data);

    // 2. Todo CRUD 테스트
    console.log('\n2. Todo CRUD 테스트');
    
    // 2-1. Todo 생성 테스트
    const newTodoData: CreateTodoForm = {
      title: '테스트 할 일',
      description: 'Mock API 테스트를 위한 할 일',
      duration: 90,
      category: 'WORK',
      priority: 'HIGH',
      tags: ['테스트', '개발'],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7일 후
    };
    
    const createResult = await todoApi.createTodo(newTodoData);
    console.log('✅ Todo 생성:', createResult.success ? '성공' : '실패');
    console.log('📝 생성된 Todo ID:', createResult.data?.id);

    // 2-2. Todo 조회 테스트
    const todosResult = await todoApi.getTodos(1, 10);
    console.log('📋 Todo 목록 조회:', todosResult.success ? '성공' : '실패');
    console.log('📊 조회된 Todo 수:', todosResult.data?.length);
    console.log('📄 페이징 정보:', todosResult.pagination);

    // 2-3. 특정 Todo 조회
    if (createResult.data?.id) {
      const todoResult = await todoApi.getTodoById(createResult.data.id);
      console.log('🔍 특정 Todo 조회:', todoResult.success ? '성공' : '실패');
      console.log('📝 조회된 Todo:', todoResult.data?.title);
    }

    // 2-4. Todo 수정 테스트
    if (createResult.data?.id) {
      const updateResult = await todoApi.updateTodo(createResult.data.id, {
        title: '수정된 테스트 할 일',
        priority: 'URGENT'
      });
      console.log('📝 Todo 수정:', updateResult.success ? '성공' : '실패');
    }

    // 2-5. Todo 상태 변경 테스트
    if (createResult.data?.id) {
      const statusResult = await todoApi.updateTodoStatus(createResult.data.id, 'IN_PROGRESS');
      console.log('🔄 Todo 상태 변경:', statusResult.success ? '성공' : '실패');
    }

    // 3. 필터링 테스트
    console.log('\n3. 필터링 테스트');
    const filteredResult = await todoApi.getTodos(1, 10, {
      categories: ['WORK'],
      priorities: ['HIGH', 'URGENT'],
      statuses: ['WAITING', 'IN_PROGRESS'],
      tags: []
    });
    console.log('🔍 필터링 결과:', filteredResult.success ? '성공' : '실패');
    console.log('📊 필터링된 Todo 수:', filteredResult.data?.length);

    // 4. 스케줄 API 테스트
    console.log('\n4. 스케줄 API 테스트');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // 일주일 전
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // 일주일 후
    
    const schedulesResult = await scheduleApi.getSchedules(startDate, endDate);
    console.log('📅 스케줄 조회:', schedulesResult.success ? '성공' : '실패');
    console.log('📊 조회된 스케줄 수:', schedulesResult.data?.length);

    // 5. 자동 스케줄링 테스트
    console.log('\n5. 자동 스케줄링 테스트');
    
    // WAITING 상태의 Todo들을 찾아서 자동 스케줄링
    const waitingTodos = todosResult.data?.filter(todo => todo.status === 'WAITING') || [];
    if (waitingTodos.length > 0) {
      const schedulingRequest: SchedulingRequest = {
        todoIds: waitingTodos.slice(0, 3).map(todo => todo.id), // 처음 3개만
        preferences: {
          respectDeadlines: true,
          groupSimilarTasks: true
        }
      };
      
      const autoScheduleResult = await schedulingApi.autoSchedule(schedulingRequest);
      console.log('🤖 자동 스케줄링:', autoScheduleResult.success ? '성공' : '실패');
      console.log('📊 스케줄링된 할 일 수:', autoScheduleResult.data?.scheduledTodos.length);
      console.log('💡 제안사항:', autoScheduleResult.data?.suggestions);
    }

    // 6. Todo 삭제 테스트 (마지막에 실행)
    console.log('\n6. Todo 삭제 테스트');
    if (createResult.data?.id) {
      const deleteResult = await todoApi.deleteTodo(createResult.data.id);
      console.log('🗑️ Todo 삭제:', deleteResult.success ? '성공' : '실패');
    }

    // 7. 최종 상태 확인
    console.log('\n7. 최종 상태 확인');
    const finalInfo = await mockApiUtils.getStorageInfo();
    console.log('📊 최종 Storage 상태:', finalInfo.data);

    console.log('\n✅ Mock API 테스트 완료');
    return true;

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    return false;
  }
};

// 개별 함수 테스트
export const testTodoOperations = async () => {
  console.log('🧪 Todo 연산 테스트');
  
  // 샘플 데이터 로드
  await mockApiUtils.loadSampleData();
  
  // Todo 생성 → 조회 → 수정 → 삭제 플로우
  const newTodo: CreateTodoForm = {
    title: 'API 테스트 할 일',
    description: '완전한 CRUD 플로우 테스트',
    duration: 60,
    category: 'WORK',
    priority: 'MEDIUM',
    tags: ['api', 'test']
  };
  
  try {
    // Create
    const created = await todoApi.createTodo(newTodo);
    if (!created.success || !created.data) {
      throw new Error('Todo 생성 실패');
    }
    
    // Read
    const read = await todoApi.getTodoById(created.data.id);
    if (!read.success || read.data?.title !== newTodo.title) {
      throw new Error('Todo 조회 실패');
    }
    
    // Update
    const updated = await todoApi.updateTodo(created.data.id, {
      title: '수정된 제목',
      status: 'IN_PROGRESS'
    });
    if (!updated.success || updated.data?.title !== '수정된 제목') {
      throw new Error('Todo 수정 실패');
    }
    
    // Delete
    const deleted = await todoApi.deleteTodo(created.data.id);
    if (!deleted.success) {
      throw new Error('Todo 삭제 실패');
    }
    
    // 삭제 확인
    const notFound = await todoApi.getTodoById(created.data.id);
    if (notFound.success) {
      throw new Error('Todo가 삭제되지 않음');
    }
    
    console.log('✅ Todo CRUD 플로우 테스트 성공');
    return true;
    
  } catch (error) {
    console.error('❌ Todo CRUD 테스트 실패:', error);
    return false;
  }
};

// 성능 테스트
export const testPerformance = async () => {
  console.log('🚀 성능 테스트');
  
  await mockApiUtils.loadSampleData();
  
  const startTime = performance.now();
  
  // 100개의 병렬 요청
  const promises = Array.from({ length: 100 }, (_, i) => 
    todoApi.getTodos(1, 10)
  );
  
  const results = await Promise.all(promises);
  const endTime = performance.now();
  
  const successCount = results.filter(r => r.success).length;
  const avgTime = (endTime - startTime) / 100;
  
  console.log(`📊 100개 병렬 요청 결과:`);
  console.log(`✅ 성공: ${successCount}/100`);
  console.log(`⏱️ 평균 응답 시간: ${avgTime.toFixed(2)}ms`);
  console.log(`🕐 총 소요 시간: ${(endTime - startTime).toFixed(2)}ms`);
  
  return successCount === 100;
};

// 브라우저 콘솔에서 실행할 수 있는 함수들 export
if (typeof window !== 'undefined') {
  (window as any).testMockApi = testMockApi;
  (window as any).testTodoOperations = testTodoOperations;
  (window as any).testPerformance = testPerformance;
}