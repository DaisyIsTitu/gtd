# API 사용 가이드

## 개요

Todo Time-blocking 앱 API 사용법을 단계별로 설명하는 가이드입니다. 실제 사용 시나리오를 중심으로 API 호출 방법과 예상 응답을 제시합니다.

## 목차

1. [인증 플로우](#1-인증-플로우)
2. [기본 할일 관리](#2-기본-할일-관리)
3. [자동 스케줄링](#3-자동-스케줄링)
4. [캘린더 연동](#4-캘린더-연동)
5. [놓친 할일 처리](#5-놓친-할일-처리)
6. [통계 및 분석](#6-통계-및-분석)
7. [에러 처리](#7-에러-처리)
8. [개발 팁](#8-개발-팁)

## 1. 인증 플로우

### 1.1 Google OAuth 인증 시작

```javascript
// 1. 인증 URL 요청
const response = await fetch('/api/v1/auth/google', {
    method: 'GET'
});

const data = await response.json();
// 사용자를 Google 인증 페이지로 리다이렉트
window.location.href = data.data.authUrl;
```

**응답 예시:**
```json
{
    "success": true,
    "data": {
        "authUrl": "https://accounts.google.com/oauth/authorize?client_id=...&scope=..."
    },
    "timestamp": "2024-12-10T10:00:00Z"
}
```

### 1.2 OAuth 콜백 처리

```javascript
// 2. Google에서 리다이렉트된 후 authorization code로 토큰 교환
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');

const tokenResponse = await fetch('/api/v1/auth/google/callback', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        code: code,
        state: state
    })
});

const tokens = await tokenResponse.json();
// 토큰을 안전하게 저장 (localStorage는 보안상 권장하지 않음)
localStorage.setItem('accessToken', tokens.data.accessToken);
localStorage.setItem('refreshToken', tokens.data.refreshToken);
```

### 1.3 API 호출 시 인증 헤더 설정

```javascript
// 모든 API 호출에 사용할 기본 헤더 설정
const apiHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
};
```

## 2. 기본 할일 관리

### 2.1 할일 생성

```javascript
// 새로운 할일 생성
const createTodo = async (todoData) => {
    const response = await fetch('/api/v1/todos', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({
            title: "프로젝트 기획서 작성",
            description: "새로운 프로젝트의 상세 기획서를 작성합니다.",
            estimatedDuration: 240, // 4시간
            category: "WORK",
            priority: "HIGH",
            deadline: "2024-12-15T18:00:00Z",
            tags: ["기획", "문서", "프로젝트"]
        })
    });
    
    return await response.json();
};
```

**응답 예시:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "title": "프로젝트 기획서 작성",
        "status": "WAITING",
        "createdAt": "2024-12-10T10:00:00Z"
    },
    "message": "할일이 성공적으로 생성되었습니다."
}
```

### 2.2 할일 목록 조회

```javascript
// 필터링된 할일 목록 조회
const getTodos = async (filters = {}) => {
    const params = new URLSearchParams({
        page: filters.page || 0,
        size: filters.size || 20,
        status: filters.status || '',
        category: filters.category || '',
        priority: filters.priority || '',
        sort: filters.sort || 'createdAt',
        direction: filters.direction || 'desc'
    });
    
    const response = await fetch(`/api/v1/todos?${params}`, {
        headers: apiHeaders
    });
    
    return await response.json();
};

// 사용 예시
const workTodos = await getTodos({ 
    category: 'WORK', 
    status: 'WAITING' 
});
```

### 2.3 할일 상태 변경

```javascript
// 할일 시작
const startTodo = async (todoId) => {
    const response = await fetch(`/api/v1/todos/${todoId}/status`, {
        method: 'PATCH',
        headers: apiHeaders,
        body: JSON.stringify({
            status: 'IN_PROGRESS'
        })
    });
    
    return await response.json();
};

// 할일 완료
const completeTodo = async (todoId) => {
    const response = await fetch(`/api/v1/todos/${todoId}/status`, {
        method: 'PATCH',
        headers: apiHeaders,
        body: JSON.stringify({
            status: 'COMPLETED'
        })
    });
    
    return await response.json();
};
```

## 3. 자동 스케줄링

### 3.1 가용 시간 확인

```javascript
// 이번 주 가용 시간 조회
const getAvailableSlots = async (startDate, endDate) => {
    const params = new URLSearchParams({
        startDate: startDate,
        endDate: endDate,
        minDuration: 30
    });
    
    const response = await fetch(`/api/v1/scheduling/available-slots?${params}`, {
        headers: apiHeaders
    });
    
    return await response.json();
};

// 사용 예시
const slots = await getAvailableSlots('2024-12-11', '2024-12-17');
console.log('가용 시간:', slots.data.slots);
```

**응답 예시:**
```json
{
    "success": true,
    "data": {
        "slots": [
            {
                "date": "2024-12-11",
                "availableSlots": [
                    {
                        "startTime": "10:00",
                        "endTime": "12:00",
                        "duration": 120
                    },
                    {
                        "startTime": "14:00",
                        "endTime": "18:00",
                        "duration": 240
                    }
                ],
                "totalAvailable": 360
            }
        ]
    }
}
```

### 3.2 자동 스케줄링 실행

```javascript
// 모든 대기중인 할일 자동 배치
const autoSchedule = async (options = {}) => {
    const response = await fetch('/api/v1/scheduling/auto-schedule', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({
            todoIds: options.todoIds, // 선택적: 특정 할일들만 배치
            startDate: options.startDate || new Date().toISOString().split('T')[0],
            endDate: options.endDate
        })
    });
    
    return await response.json();
};

// 사용 예시
const scheduleResult = await autoSchedule();
console.log(`${scheduleResult.data.totalScheduled}개 할일이 배치되었습니다.`);
```

**응답 예시:**
```json
{
    "success": true,
    "data": {
        "scheduledTodos": [
            {
                "todoId": 1,
                "schedules": [
                    {
                        "id": 1,
                        "startTime": "2024-12-11T10:00:00Z",
                        "endTime": "2024-12-11T14:00:00Z",
                        "splitIndex": 1,
                        "splitTotal": 1
                    }
                ]
            }
        ],
        "unscheduledTodos": [],
        "totalScheduled": 1,
        "totalUnscheduled": 0
    },
    "message": "1개의 할일이 스케줄링되었습니다."
}
```

## 4. 캘린더 연동

### 4.1 Google Calendar 동기화

```javascript
// Google Calendar와 수동 동기화
const syncCalendar = async () => {
    const response = await fetch('/api/v1/calendar/sync', {
        method: 'POST',
        headers: apiHeaders
    });
    
    return await response.json();
};

// 동기화 상태 확인
const checkSyncStatus = async () => {
    try {
        const result = await syncCalendar();
        console.log(`${result.data.syncedEvents}개 이벤트가 동기화되었습니다.`);
    } catch (error) {
        console.error('동기화 실패:', error);
    }
};
```

### 4.2 통합 캘린더 뷰 조회

```javascript
// Google Calendar 이벤트와 Todo 스케줄을 통합하여 조회
const getCalendarEvents = async (startDate, endDate, source = 'all') => {
    const params = new URLSearchParams({
        startDate: startDate,
        endDate: endDate,
        source: source // 'google', 'todo', 'all'
    });
    
    const response = await fetch(`/api/v1/calendar/events?${params}`, {
        headers: apiHeaders
    });
    
    return await response.json();
};

// 캘린더 컴포넌트에서 사용
const renderCalendar = async (weekStart, weekEnd) => {
    const events = await getCalendarEvents(weekStart, weekEnd);
    
    events.data.events.forEach(event => {
        if (event.source === 'google') {
            // Google 이벤트 렌더링 (수정 불가)
            renderGoogleEvent(event);
        } else {
            // Todo 스케줄 렌더링 (드래그앤드롭 가능)
            renderTodoSchedule(event);
        }
    });
};
```

## 5. 놓친 할일 처리

### 5.1 놓친 할일 조회

```javascript
// 놓친 할일 목록 가져오기
const getMissedTodos = async () => {
    const response = await fetch('/api/v1/todos/missed', {
        headers: apiHeaders
    });
    
    return await response.json();
};

// UI에서 놓친 할일 표시
const displayMissedTodos = async () => {
    const missedTodos = await getMissedTodos();
    
    missedTodos.data.missedTodos.forEach(todo => {
        console.log(`놓친 할일: ${todo.title}`);
        console.log(`원래 시간: ${todo.originalSchedule.startTime}`);
        console.log(`우선순위 부스트: ${todo.boostedPriority}`);
    });
};
```

### 5.2 놓친 할일 재배치

```javascript
// 모든 놓친 할일 재배치
const rescheduleMissedTodos = async (todoIds = null) => {
    const response = await fetch('/api/v1/todos/missed/reschedule', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({
            todoIds: todoIds // null이면 모든 놓친 할일
        })
    });
    
    return await response.json();
};

// 사용자 액션으로 재배치 실행
const handleRescheduleClick = async () => {
    try {
        const result = await rescheduleMissedTodos();
        alert(`${result.data.totalScheduled}개의 놓친 할일이 재배치되었습니다.`);
        
        // 캘린더 뷰 새로고침
        refreshCalendarView();
    } catch (error) {
        console.error('재배치 실패:', error);
    }
};
```

## 6. 통계 및 분석

### 6.1 완료율 통계

```javascript
// 주간/월간 완료율 조회
const getCompletionStats = async (period = 'week') => {
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === 'week') {
        startDate.setDate(endDate.getDate() - 7);
    } else if (period === 'month') {
        startDate.setMonth(endDate.getMonth() - 1);
    }
    
    const params = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        groupBy: period === 'week' ? 'day' : 'week'
    });
    
    const response = await fetch(`/api/v1/analytics/completion-rate?${params}`, {
        headers: apiHeaders
    });
    
    return await response.json();
};

// 대시보드에서 통계 표시
const renderStats = async () => {
    const stats = await getCompletionStats('week');
    const completionRate = (stats.data.completionRate * 100).toFixed(1);
    
    document.getElementById('completion-rate').textContent = `${completionRate}%`;
    document.getElementById('total-todos').textContent = stats.data.totalTodos;
    document.getElementById('completed-todos').textContent = stats.data.completedTodos;
    document.getElementById('missed-todos').textContent = stats.data.missedTodos;
};
```

## 7. 에러 처리

### 7.1 표준 에러 처리 패턴

```javascript
// API 호출 래퍼 함수
const apiCall = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...apiHeaders,
                ...options.headers
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`API Error: ${data.error?.code || 'UNKNOWN'} - ${data.error?.message || 'Unknown error'}`);
        }
        
        return data;
    } catch (error) {
        console.error('API 호출 실패:', error);
        throw error;
    }
};

// 토큰 만료 처리
const handleTokenExpiry = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
        // 다시 로그인 필요
        redirectToLogin();
        return;
    }
    
    try {
        const response = await fetch('/api/v1/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refreshToken: refreshToken
            })
        });
        
        const tokens = await response.json();
        localStorage.setItem('accessToken', tokens.data.accessToken);
        localStorage.setItem('refreshToken', tokens.data.refreshToken);
        
        // API 헤더 업데이트
        apiHeaders.Authorization = `Bearer ${tokens.data.accessToken}`;
        
    } catch (error) {
        console.error('토큰 갱신 실패:', error);
        redirectToLogin();
    }
};
```

### 7.2 에러 코드별 처리

```javascript
// 에러 코드에 따른 사용자 메시지 표시
const getErrorMessage = (errorCode) => {
    const errorMessages = {
        'AUTH_001': '로그인이 필요합니다.',
        'AUTH_002': '세션이 만료되었습니다. 다시 로그인해주세요.',
        'BIZ_001': '할일을 찾을 수 없습니다.',
        'BIZ_003': '스케줄링할 수 있는 시간이 부족합니다.',
        'REQ_001': '필수 정보가 누락되었습니다.',
        'REQ_002': '입력한 정보가 올바르지 않습니다.',
        'SYS_001': '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    };
    
    return errorMessages[errorCode] || '알 수 없는 오류가 발생했습니다.';
};

// 통합 에러 핸들러
const handleApiError = (error) => {
    const errorData = JSON.parse(error.message.replace('API Error: ', ''));
    const userMessage = getErrorMessage(errorData.code);
    
    // 사용자에게 친화적인 메시지 표시
    showNotification(userMessage, 'error');
    
    // 특정 에러에 대한 추가 처리
    if (errorData.code === 'AUTH_002') {
        handleTokenExpiry();
    }
};
```

## 8. 개발 팁

### 8.1 실시간 업데이트 구현

```javascript
// 주기적인 상태 확인 (WebSocket 대신)
class TodoApp {
    constructor() {
        this.syncInterval = null;
        this.missedTodoCheckInterval = null;
    }
    
    startPeriodicSync() {
        // 5분마다 캘린더 동기화
        this.syncInterval = setInterval(async () => {
            try {
                await syncCalendar();
                this.refreshUI();
            } catch (error) {
                console.error('자동 동기화 실패:', error);
            }
        }, 5 * 60 * 1000);
        
        // 1분마다 놓친 할일 확인
        this.missedTodoCheckInterval = setInterval(async () => {
            const missedTodos = await getMissedTodos();
            if (missedTodos.data.missedTodos.length > 0) {
                this.showMissedTodoNotification(missedTodos.data.missedTodos);
            }
        }, 60 * 1000);
    }
    
    stopPeriodicSync() {
        if (this.syncInterval) clearInterval(this.syncInterval);
        if (this.missedTodoCheckInterval) clearInterval(this.missedTodoCheckInterval);
    }
}
```

### 8.2 성능 최적화

```javascript
// 캐싱 전략
class ApiCache {
    constructor(ttl = 5 * 60 * 1000) { // 5분 TTL
        this.cache = new Map();
        this.ttl = ttl;
    }
    
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return item.data;
    }
    
    set(key, data) {
        this.cache.set(key, {
            data: data,
            expiry: Date.now() + this.ttl
        });
    }
}

const apiCache = new ApiCache();

// 캐시를 활용한 API 호출
const getCachedTodos = async (filters) => {
    const cacheKey = `todos_${JSON.stringify(filters)}`;
    const cachedData = apiCache.get(cacheKey);
    
    if (cachedData) {
        return cachedData;
    }
    
    const data = await getTodos(filters);
    apiCache.set(cacheKey, data);
    
    return data;
};
```

### 8.3 드래그앤드롭 구현 예시

```javascript
// 캘린더에서 할일 시간 변경
const handleTodoScheduleDrop = async (todoId, scheduleId, newStartTime, newEndTime) => {
    try {
        // 낙관적 업데이트 (UI 먼저 업데이트)
        updateScheduleInUI(scheduleId, newStartTime, newEndTime);
        
        // 서버에 변경 사항 저장
        const response = await fetch(`/api/v1/todos/${todoId}/schedules/${scheduleId}`, {
            method: 'PUT',
            headers: apiHeaders,
            body: JSON.stringify({
                startTime: newStartTime,
                endTime: newEndTime
            })
        });
        
        if (!response.ok) {
            throw new Error('스케줄 업데이트 실패');
        }
        
        // 성공 시 충돌 검사 및 Google Calendar 동기화
        await syncCalendar();
        
    } catch (error) {
        // 실패 시 UI 롤백
        revertScheduleInUI(scheduleId);
        handleApiError(error);
    }
};
```

이 가이드를 통해 개발자들은 Todo Time-blocking 앱의 API를 효율적으로 활용할 수 있으며, 실제 프로덕션 환경에서 필요한 에러 처리, 성능 최적화, 사용자 경험 향상을 위한 패턴들을 학습할 수 있습니다.