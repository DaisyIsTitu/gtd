# Mock API 사용 가이드

## 📋 목차
1. [개요](#개요)
2. [설치 및 설정](#설치-및-설정)
3. [API 사용법](#api-사용법)
4. [데이터 타입](#데이터-타입)
5. [사용 예시](#사용-예시)
6. [테스트 방법](#테스트-방법)
7. [주의사항](#주의사항)

## 개요

이 Mock API는 Todo Time-blocking 앱의 프론트엔드 독립 개발을 위한 localStorage 기반 시뮬레이션 API입니다.

### 주요 기능
- ✅ **Todo CRUD** (생성, 읽기, 업데이트, 삭제)
- ✅ **Schedule 관리** (일정 생성, 조회, 삭제)
- ✅ **자동 스케줄링** (간단한 알고리즘)
- ✅ **필터링 및 페이징** 지원
- ✅ **localStorage 영속성** 
- ✅ **실제 API와 동일한 응답 형태**

## 설치 및 설정

```typescript
import { todoApi, scheduleApi, schedulingApi, mockApiUtils } from '@/lib/mockApi';
```

### 초기 설정
```typescript
// 처음 사용 시 샘플 데이터 로드
await mockApiUtils.loadSampleData();

// 또는 빈 상태로 시작
await mockApiUtils.resetData();
```

## API 사용법

### Todo API

#### 1. Todo 목록 조회
```typescript
// 기본 조회 (페이징)
const result = await todoApi.getTodos(1, 10);
console.log(result.data); // Todo[]
console.log(result.pagination); // 페이징 정보

// 필터링과 함께 조회
const filteredResult = await todoApi.getTodos(1, 10, {
  categories: ['WORK', 'PERSONAL'],
  priorities: ['HIGH', 'URGENT'],
  statuses: ['WAITING', 'IN_PROGRESS'],
  tags: ['개발', '긴급']
});
```

#### 2. 특정 Todo 조회
```typescript
const todo = await todoApi.getTodoById('todo-1');
if (todo.success) {
  console.log('Todo 제목:', todo.data.title);
}
```

#### 3. Todo 생성
```typescript
import { CreateTodoForm } from '@/types';

const newTodo: CreateTodoForm = {
  title: '새로운 할 일',
  description: '상세 설명',
  duration: 90, // 분
  category: 'WORK',
  priority: 'HIGH',
  tags: ['개발', '프로젝트'],
  deadline: '2024-12-20T18:00:00Z' // 선택적
};

const result = await todoApi.createTodo(newTodo);
if (result.success) {
  console.log('생성된 Todo ID:', result.data.id);
}
```

#### 4. Todo 수정
```typescript
const updated = await todoApi.updateTodo('todo-1', {
  title: '수정된 제목',
  priority: 'URGENT',
  status: 'IN_PROGRESS'
});
```

#### 5. Todo 상태만 변경
```typescript
await todoApi.updateTodoStatus('todo-1', 'COMPLETED');
```

#### 6. Todo 삭제
```typescript
const result = await todoApi.deleteTodo('todo-1');
// 관련 스케줄도 자동으로 삭제됨
```

### Schedule API

#### 1. 날짜 범위로 스케줄 조회
```typescript
const startDate = new Date('2024-12-10');
const endDate = new Date('2024-12-17');

const schedules = await scheduleApi.getSchedules(startDate, endDate);
```

#### 2. 특정 Todo의 스케줄 조회
```typescript
const todoSchedules = await scheduleApi.getSchedulesByTodoId('todo-1');
```

#### 3. 스케줄 생성
```typescript
const newSchedule = await scheduleApi.createSchedule({
  todoId: 'todo-1',
  startTime: new Date('2024-12-11T09:00:00'),
  endTime: new Date('2024-12-11T10:30:00'),
  status: 'SCHEDULED'
});
```

### 자동 스케줄링 API

```typescript
import { SchedulingRequest } from '@/types';

const request: SchedulingRequest = {
  todoIds: ['todo-1', 'todo-2', 'todo-3'],
  preferences: {
    respectDeadlines: true,
    groupSimilarTasks: true
  }
};

const result = await schedulingApi.autoSchedule(request);
if (result.success) {
  console.log('스케줄링된 할 일 수:', result.data.scheduledTodos.length);
  console.log('제안사항:', result.data.suggestions);
}
```

## 데이터 타입

### API 응답 형태
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}
```

### 주요 데이터 타입
```typescript
type TodoStatus = 'WAITING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
type TodoPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type TodoCategory = 'WORK' | 'PERSONAL' | 'HEALTH' | 'LEARNING' | 'SOCIAL' | 'OTHER';
```

## 사용 예시

### React 컴포넌트에서 사용
```typescript
import { useEffect, useState } from 'react';
import { todoApi } from '@/lib/mockApi';
import { Todo } from '@/types';

export const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTodos = async () => {
    setLoading(true);
    try {
      const result = await todoApi.getTodos(1, 20);
      if (result.success) {
        setTodos(result.data || []);
      }
    } catch (error) {
      console.error('Todo 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (todoData: CreateTodoForm) => {
    const result = await todoApi.createTodo(todoData);
    if (result.success) {
      await loadTodos(); // 목록 새로고침
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  // ... 렌더링 로직
};
```

### 상태 관리 (Zustand 예시)
```typescript
import { create } from 'zustand';
import { todoApi } from '@/lib/mockApi';

interface TodoStore {
  todos: Todo[];
  loading: boolean;
  fetchTodos: () => Promise<void>;
  createTodo: (data: CreateTodoForm) => Promise<void>;
  updateTodo: (id: string, data: UpdateTodoForm) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  loading: false,
  
  fetchTodos: async () => {
    set({ loading: true });
    const result = await todoApi.getTodos();
    if (result.success) {
      set({ todos: result.data || [], loading: false });
    }
  },
  
  createTodo: async (data) => {
    const result = await todoApi.createTodo(data);
    if (result.success) {
      await get().fetchTodos(); // 새로고침
    }
  },
  
  updateTodo: async (id, data) => {
    const result = await todoApi.updateTodo(id, data);
    if (result.success) {
      await get().fetchTodos();
    }
  },
  
  deleteTodo: async (id) => {
    const result = await todoApi.deleteTodo(id);
    if (result.success) {
      await get().fetchTodos();
    }
  }
}));
```

## 테스트 방법

### 1. 브라우저 콘솔에서 테스트
```typescript
// 개발자 도구 콘솔에서 실행
await testMockApi(); // 전체 테스트
await testTodoOperations(); // Todo CRUD 테스트
await testPerformance(); // 성능 테스트
```

### 2. Jest 테스트 (향후 추가 예정)
```bash
npm test src/lib/mockApi.test.ts
```

### 3. 수동 테스트
1. 앱 실행
2. 개발자 도구 → Application → Local Storage 확인
3. UI에서 Todo 생성/수정/삭제 후 localStorage 변화 관찰

## 주의사항

### 1. 데이터 영속성
- localStorage를 사용하므로 브라우저를 닫아도 데이터 유지
- 시크릿 모드나 다른 브라우저에서는 별도 데이터
- 브라우저 캐시 삭제 시 데이터 손실 가능

### 2. 성능 고려사항
- 대량 데이터 시 느려질 수 있음 (실제 API 전환 시 해결)
- localStorage 용량 제한 (보통 5-10MB)

### 3. API 응답 시간
- 실제 네트워크 지연 시뮬레이션 (300ms 기본)
- 스케줄링 API는 1초 지연

### 4. 데이터 초기화
```typescript
// 개발 중 데이터 리셋이 필요한 경우
await mockApiUtils.resetData();
await mockApiUtils.loadSampleData();
```

### 5. 실제 API 전환 준비
- 모든 함수는 Promise를 반환하므로 async/await 패턴 유지
- API 응답 형태가 동일하므로 URL만 변경하면 전환 가능
- 에러 처리 로직도 실제 API와 호환

## 향후 계획

### Sprint 4에서 Real API 전환
1. `mockApi.ts` → `realApi.ts` 교체
2. API 기본 URL 설정
3. 인증 토큰 관리 추가
4. 네트워크 에러 처리 강화

### 추가 예정 기능
- [ ] WebSocket 연동 시뮬레이션
- [ ] 오프라인 동기화 로직
- [ ] 백그라운드 작업 시뮬레이션
- [ ] 더 정교한 스케줄링 알고리즘