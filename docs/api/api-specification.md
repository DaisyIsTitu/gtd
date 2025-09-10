# Todo Time-blocking 앱 API 설계 명세서

## 개요

Todo Time-blocking 앱의 RESTful API 설계 명세서입니다. Google Calendar와 연동하여 할 일을 자동으로 최적의 시간에 배치하는 웹 애플리케이션의 백엔드 API를 정의합니다.

## 기술 스택
- **백엔드**: Spring Boot + Kotlin
- **데이터베이스**: PostgreSQL  
- **외부 연동**: Google Calendar API
- **인증**: Google OAuth 2.0

## API 설계 원칙

1. **RESTful 아키텍처**: HTTP 메서드와 상태 코드를 올바르게 사용
2. **버전 관리**: `/api/v1/` 네임스페이스 사용
3. **일관된 응답 형식**: 성공/실패 응답의 표준화
4. **보안**: OAuth 2.0 기반 인증 및 권한 부여
5. **성능**: 페이지네이션 및 필터링 지원
6. **에러 처리**: 명확한 에러 코드와 메시지

## 인증

모든 API는 Google OAuth 2.0 기반 Bearer Token 인증을 사용합니다.

```http
Authorization: Bearer {access_token}
```

## 공통 응답 형식

### 성공 응답
```json
{
    "success": true,
    "data": {},
    "message": "요청이 성공적으로 처리되었습니다.",
    "timestamp": "2024-12-10T12:00:00Z"
}
```

### 에러 응답
```json
{
    "success": false,
    "error": {
        "code": "ERROR_CODE",
        "message": "에러 메시지",
        "details": "상세 에러 정보"
    },
    "timestamp": "2024-12-10T12:00:00Z"
}
```

## 데이터 모델

### 할일 (Todo)
```json
{
    "id": "long",
    "title": "string (required, max 200)",
    "description": "string (optional, max 1000)",
    "estimatedDuration": "int (required, minutes)",
    "category": "enum ['WORK', 'PERSONAL']",
    "priority": "enum ['HIGH', 'MEDIUM', 'LOW']",
    "status": "enum ['WAITING', 'SCHEDULED', 'SPLIT', 'IN_PROGRESS', 'MISSED', 'COMPLETED']",
    "deadline": "datetime (optional)",
    "tags": ["string"],
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "userId": "string"
}
```

### 할일 스케줄링 (TodoSchedule)
```json
{
    "id": "long",
    "todoId": "long",
    "startTime": "datetime",
    "endTime": "datetime",
    "actualDuration": "int (minutes)",
    "isCompleted": "boolean",
    "splitIndex": "int (optional, 분할된 경우)",
    "splitTotal": "int (optional, 전체 분할 수)",
    "createdAt": "datetime"
}
```

### 사용자 (User)
```json
{
    "id": "string",
    "email": "string",
    "name": "string",
    "googleId": "string",
    "accessToken": "string (encrypted)",
    "refreshToken": "string (encrypted)",
    "timezone": "string",
    "workStartTime": "time (default: 10:00)",
    "workEndTime": "time (default: 20:00)",
    "createdAt": "datetime",
    "lastLoginAt": "datetime"
}
```

## API 엔드포인트

### 1. 인증 (Authentication)

#### 1.1 Google OAuth 로그인
```http
GET /api/v1/auth/google
```

Google OAuth 인증 URL로 리다이렉트합니다.

**응답:**
```json
{
    "success": true,
    "data": {
        "authUrl": "https://accounts.google.com/oauth/authorize?..."
    }
}
```

#### 1.2 OAuth 콜백 처리
```http
POST /api/v1/auth/google/callback
```

**요청 본문:**
```json
{
    "code": "string",
    "state": "string"
}
```

**응답:**
```json
{
    "success": true,
    "data": {
        "accessToken": "string",
        "refreshToken": "string",
        "expiresIn": 3600,
        "user": {
            "id": "string",
            "email": "string",
            "name": "string"
        }
    }
}
```

#### 1.3 토큰 갱신
```http
POST /api/v1/auth/refresh
```

**요청 본문:**
```json
{
    "refreshToken": "string"
}
```

### 2. 사용자 관리 (Users)

#### 2.1 사용자 프로필 조회
```http
GET /api/v1/users/me
```

**응답:**
```json
{
    "success": true,
    "data": {
        "id": "string",
        "email": "string",
        "name": "string",
        "timezone": "Asia/Seoul",
        "workStartTime": "10:00",
        "workEndTime": "20:00"
    }
}
```

#### 2.2 사용자 설정 업데이트
```http
PUT /api/v1/users/me
```

**요청 본문:**
```json
{
    "timezone": "Asia/Seoul",
    "workStartTime": "09:00",
    "workEndTime": "18:00"
}
```

### 3. 할일 관리 (Todos)

#### 3.1 할일 목록 조회
```http
GET /api/v1/todos
```

**쿼리 파라미터:**
- `status`: string (WAITING, SCHEDULED, IN_PROGRESS, MISSED, COMPLETED)
- `category`: string (WORK, PERSONAL)
- `priority`: string (HIGH, MEDIUM, LOW)
- `page`: int (default: 0)
- `size`: int (default: 20)
- `sort`: string (createdAt, updatedAt, deadline, priority)
- `direction`: string (asc, desc)

**응답:**
```json
{
    "success": true,
    "data": {
        "content": [
            {
                "id": 1,
                "title": "프로젝트 설계서 작성",
                "description": "새로운 프로젝트의 설계서를 작성합니다.",
                "estimatedDuration": 240,
                "category": "WORK",
                "priority": "HIGH",
                "status": "WAITING",
                "deadline": "2024-12-15T18:00:00Z",
                "tags": ["개발", "설계"],
                "createdAt": "2024-12-10T10:00:00Z",
                "updatedAt": "2024-12-10T10:00:00Z"
            }
        ],
        "page": {
            "number": 0,
            "size": 20,
            "totalElements": 1,
            "totalPages": 1
        }
    }
}
```

#### 3.2 할일 상세 조회
```http
GET /api/v1/todos/{todoId}
```

**응답:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "title": "프로젝트 설계서 작성",
        "description": "새로운 프로젝트의 설계서를 작성합니다.",
        "estimatedDuration": 240,
        "category": "WORK",
        "priority": "HIGH",
        "status": "SCHEDULED",
        "deadline": "2024-12-15T18:00:00Z",
        "tags": ["개발", "설계"],
        "schedules": [
            {
                "id": 1,
                "startTime": "2024-12-11T10:00:00Z",
                "endTime": "2024-12-11T14:00:00Z",
                "splitIndex": 1,
                "splitTotal": 1
            }
        ],
        "createdAt": "2024-12-10T10:00:00Z",
        "updatedAt": "2024-12-10T10:00:00Z"
    }
}
```

#### 3.3 할일 생성
```http
POST /api/v1/todos
```

**요청 본문:**
```json
{
    "title": "프로젝트 설계서 작성",
    "description": "새로운 프로젝트의 설계서를 작성합니다.",
    "estimatedDuration": 240,
    "category": "WORK",
    "priority": "HIGH",
    "deadline": "2024-12-15T18:00:00Z",
    "tags": ["개발", "설계"]
}
```

**응답:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "title": "프로젝트 설계서 작성",
        "status": "WAITING",
        "createdAt": "2024-12-10T10:00:00Z"
    },
    "message": "할일이 성공적으로 생성되었습니다."
}
```

#### 3.4 할일 수정
```http
PUT /api/v1/todos/{todoId}
```

**요청 본문:**
```json
{
    "title": "프로젝트 설계서 작성 (수정됨)",
    "description": "수정된 설명",
    "estimatedDuration": 300,
    "priority": "MEDIUM",
    "deadline": "2024-12-16T18:00:00Z",
    "tags": ["개발", "설계", "문서화"]
}
```

#### 3.5 할일 삭제
```http
DELETE /api/v1/todos/{todoId}
```

#### 3.6 할일 상태 변경
```http
PATCH /api/v1/todos/{todoId}/status
```

**요청 본문:**
```json
{
    "status": "IN_PROGRESS"
}
```

**유효한 상태 전환:**
- `WAITING` → `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`
- `SCHEDULED` → `IN_PROGRESS`, `COMPLETED`, `MISSED`
- `IN_PROGRESS` → `COMPLETED`, `SCHEDULED`
- `MISSED` → `WAITING`, `SCHEDULED`

### 4. 스케줄링 (Scheduling)

#### 4.1 자동 스케줄링 실행
```http
POST /api/v1/scheduling/auto-schedule
```

**요청 본문:**
```json
{
    "todoIds": [1, 2, 3],  // optional, 지정하지 않으면 모든 WAITING 상태 할일
    "startDate": "2024-12-11",  // optional, 기본값: 현재 날짜
    "endDate": "2024-12-17"     // optional, 기본값: 현재 주의 금요일
}
```

**응답:**
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
        "unscheduledTodos": [2],
        "totalScheduled": 1,
        "totalUnscheduled": 1
    },
    "message": "1개의 할일이 스케줄링되었습니다."
}
```

#### 4.2 가용 시간 분석
```http
GET /api/v1/scheduling/available-slots
```

**쿼리 파라미터:**
- `startDate`: string (required, YYYY-MM-DD)
- `endDate`: string (required, YYYY-MM-DD)
- `minDuration`: int (optional, 최소 시간(분), 기본값: 30)

**응답:**
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

### 5. 캘린더 연동 (Calendar)

#### 5.1 Google Calendar 동기화
```http
POST /api/v1/calendar/sync
```

**응답:**
```json
{
    "success": true,
    "data": {
        "syncedEvents": 15,
        "lastSyncAt": "2024-12-10T12:00:00Z"
    },
    "message": "Google Calendar와 동기화가 완료되었습니다."
}
```

#### 5.2 캘린더 이벤트 조회
```http
GET /api/v1/calendar/events
```

**쿼리 파라미터:**
- `startDate`: string (required, YYYY-MM-DD)
- `endDate`: string (required, YYYY-MM-DD)
- `source`: string (google, todo, all - 기본값: all)

**응답:**
```json
{
    "success": true,
    "data": {
        "events": [
            {
                "id": "google_event_123",
                "title": "팀 미팅",
                "startTime": "2024-12-11T09:00:00Z",
                "endTime": "2024-12-11T10:00:00Z",
                "source": "google",
                "color": "#4285f4"
            },
            {
                "id": "todo_1_schedule_1",
                "title": "프로젝트 설계서 작성",
                "startTime": "2024-12-11T10:00:00Z",
                "endTime": "2024-12-11T14:00:00Z",
                "source": "todo",
                "color": "#34a853",
                "todoId": 1,
                "scheduleId": 1
            }
        ]
    }
}
```

### 6. 놓친 할일 관리 (Missed Todos)

#### 6.1 놓친 할일 목록 조회
```http
GET /api/v1/todos/missed
```

**응답:**
```json
{
    "success": true,
    "data": {
        "missedTodos": [
            {
                "id": 2,
                "title": "보고서 검토",
                "originalSchedule": {
                    "startTime": "2024-12-10T14:00:00Z",
                    "endTime": "2024-12-10T16:00:00Z"
                },
                "missedAt": "2024-12-10T16:30:00Z",
                "boostedPriority": "HIGH"
            }
        ]
    }
}
```

#### 6.2 놓친 할일 재배치
```http
POST /api/v1/todos/missed/reschedule
```

**요청 본문:**
```json
{
    "todoIds": [2, 3]  // optional, 지정하지 않으면 모든 MISSED 상태 할일
}
```

### 7. 통계 및 분석 (Analytics)

#### 7.1 완료율 통계
```http
GET /api/v1/analytics/completion-rate
```

**쿼리 파라미터:**
- `startDate`: string (optional, YYYY-MM-DD)
- `endDate`: string (optional, YYYY-MM-DD)
- `groupBy`: string (day, week, month)

**응답:**
```json
{
    "success": true,
    "data": {
        "completionRate": 0.85,
        "totalTodos": 20,
        "completedTodos": 17,
        "missedTodos": 2,
        "inProgressTodos": 1
    }
}
```

## 에러 코드

### 인증 에러
- `AUTH_001`: 유효하지 않은 토큰
- `AUTH_002`: 토큰 만료
- `AUTH_003`: 권한 없음
- `AUTH_004`: Google OAuth 인증 실패

### 요청 에러
- `REQ_001`: 필수 파라미터 누락
- `REQ_002`: 유효하지 않은 파라미터 값
- `REQ_003`: 요청 본문 형식 오류

### 비즈니스 로직 에러
- `BIZ_001`: 존재하지 않는 할일
- `BIZ_002`: 유효하지 않은 상태 전환
- `BIZ_003`: 스케줄링 실패 (가용 시간 부족)
- `BIZ_004`: Google Calendar 동기화 실패

### 시스템 에러
- `SYS_001`: 데이터베이스 오류
- `SYS_002`: 외부 API 호출 실패
- `SYS_003`: 내부 서버 오류

## 성능 요구사항

- **응답 시간**: 일반 API 500ms 이내, 스케줄링 API 3초 이내
- **처리량**: 사용자당 초당 10 요청까지 처리
- **가용성**: 99.9% 가동 시간
- **동시성**: 최대 1,000명 동시 사용자 지원

## 보안 고려사항

1. **인증**: Google OAuth 2.0 기반 토큰 인증
2. **권한**: 사용자별 데이터 접근 제어
3. **암호화**: 중요 데이터(토큰) 암호화 저장
4. **API 제한**: Rate limiting으로 남용 방지
5. **입력 검증**: 모든 입력 데이터 유효성 검사
6. **HTTPS**: 모든 통신 HTTPS 강제