# 데이터베이스 스키마 설계

## 개요

Todo Time-blocking 앱의 PostgreSQL 데이터베이스 스키마를 정의합니다. 이 스키마는 사용자 관리, 할일 관리, 스케줄링, 그리고 Google Calendar 연동을 지원하도록 설계되었습니다.

## 테이블 구조

### 1. users (사용자)

사용자 정보와 Google 계정 연동 정보를 저장합니다.

```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    google_id VARCHAR(255) NOT NULL UNIQUE,
    access_token TEXT,  -- 암호화되어 저장
    refresh_token TEXT, -- 암호화되어 저장
    token_expires_at TIMESTAMP,
    timezone VARCHAR(50) DEFAULT 'Asia/Seoul',
    work_start_time TIME DEFAULT '10:00:00',
    work_end_time TIME DEFAULT '20:00:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
```

### 2. todos (할일)

사용자가 생성한 할일 정보를 저장합니다.

```sql
CREATE TYPE todo_category AS ENUM ('WORK', 'PERSONAL');
CREATE TYPE todo_priority AS ENUM ('HIGH', 'MEDIUM', 'LOW');
CREATE TYPE todo_status AS ENUM ('WAITING', 'SCHEDULED', 'SPLIT', 'IN_PROGRESS', 'MISSED', 'COMPLETED');

CREATE TABLE todos (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    estimated_duration INTEGER NOT NULL CHECK (estimated_duration >= 30), -- 분 단위
    actual_duration INTEGER, -- 실제 소요 시간
    category todo_category NOT NULL,
    priority todo_priority DEFAULT 'MEDIUM',
    status todo_status DEFAULT 'WAITING',
    deadline TIMESTAMP,
    tags TEXT[], -- PostgreSQL 배열 타입
    is_split BOOLEAN DEFAULT FALSE,
    parent_todo_id BIGINT REFERENCES todos(id) ON DELETE CASCADE, -- 분할된 할일의 경우 원본 할일 ID
    split_index INTEGER, -- 분할 순서 (1, 2, 3, ...)
    split_total INTEGER, -- 전체 분할 개수
    priority_boost INTEGER DEFAULT 0, -- 놓친 할일에 대한 우선순위 부스트
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_status ON todos(status);
CREATE INDEX idx_todos_category ON todos(category);
CREATE INDEX idx_todos_deadline ON todos(deadline);
CREATE INDEX idx_todos_created_at ON todos(created_at);
CREATE INDEX idx_todos_parent_todo_id ON todos(parent_todo_id);
```

### 3. todo_schedules (할일 스케줄링)

할일의 실제 스케줄 정보를 저장합니다.

```sql
CREATE TABLE todo_schedules (
    id BIGSERIAL PRIMARY KEY,
    todo_id BIGINT NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    actual_duration INTEGER, -- 실제 소요 시간(분)
    is_completed BOOLEAN DEFAULT FALSE,
    google_calendar_event_id VARCHAR(255), -- Google Calendar에 생성된 이벤트 ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_start_end_time CHECK (start_time < end_time)
);

CREATE INDEX idx_todo_schedules_todo_id ON todo_schedules(todo_id);
CREATE INDEX idx_todo_schedules_start_time ON todo_schedules(start_time);
CREATE INDEX idx_todo_schedules_end_time ON todo_schedules(end_time);
CREATE INDEX idx_todo_schedules_time_range ON todo_schedules(start_time, end_time);
CREATE INDEX idx_todo_schedules_google_event_id ON todo_schedules(google_calendar_event_id);
```

### 4. calendar_sync (캘린더 동기화)

Google Calendar와의 동기화 정보를 관리합니다.

```sql
CREATE TABLE calendar_sync (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    google_calendar_id VARCHAR(255) NOT NULL,
    last_sync_at TIMESTAMP,
    sync_token VARCHAR(500), -- Google Calendar sync token
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, google_calendar_id)
);

CREATE INDEX idx_calendar_sync_user_id ON calendar_sync(user_id);
CREATE INDEX idx_calendar_sync_last_sync_at ON calendar_sync(last_sync_at);
```

### 5. google_calendar_events (Google 캘린더 이벤트)

동기화된 Google Calendar 이벤트를 저장합니다.

```sql
CREATE TABLE google_calendar_events (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    google_event_id VARCHAR(255) NOT NULL,
    google_calendar_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_all_day BOOLEAN DEFAULT FALSE,
    description TEXT,
    location VARCHAR(500),
    status VARCHAR(50), -- confirmed, tentative, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, google_event_id),
    CONSTRAINT check_start_end_time CHECK (start_time < end_time)
);

CREATE INDEX idx_google_events_user_id ON google_calendar_events(user_id);
CREATE INDEX idx_google_events_time_range ON google_calendar_events(start_time, end_time);
CREATE INDEX idx_google_events_google_id ON google_calendar_events(google_event_id);
```

### 6. todo_status_history (할일 상태 변경 이력)

할일 상태 변경 이력을 추적합니다.

```sql
CREATE TABLE todo_status_history (
    id BIGSERIAL PRIMARY KEY,
    todo_id BIGINT NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
    from_status todo_status,
    to_status todo_status NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(255), -- 상태 변경 사유 (예: 'missed_deadline', 'user_action')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_todo_status_history_todo_id ON todo_status_history(todo_id);
CREATE INDEX idx_todo_status_history_changed_at ON todo_status_history(changed_at);
```

### 7. user_preferences (사용자 환경설정)

사용자별 세부 설정을 저장합니다.

```sql
CREATE TABLE user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, setting_key)
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_key ON user_preferences(setting_key);
```

## 데이터베이스 제약사항 및 트리거

### 업데이트 트리거

모든 테이블의 `updated_at` 필드를 자동으로 업데이트하는 트리거를 생성합니다.

```sql
-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todo_schedules_updated_at BEFORE UPDATE ON todo_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_sync_updated_at BEFORE UPDATE ON calendar_sync
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_calendar_events_updated_at BEFORE UPDATE ON google_calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 할일 상태 변경 로깅 트리거

할일 상태가 변경될 때 이력을 자동으로 기록하는 트리거입니다.

```sql
CREATE OR REPLACE FUNCTION log_todo_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO todo_status_history (todo_id, from_status, to_status, reason)
        VALUES (NEW.id, OLD.status, NEW.status, 
                CASE 
                    WHEN NEW.status = 'MISSED' THEN 'missed_deadline'
                    ELSE 'user_action'
                END);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_todo_status_change_trigger AFTER UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION log_todo_status_change();
```

## 인덱스 전략

### 복합 인덱스

자주 함께 사용되는 컬럼들에 대한 복합 인덱스를 생성합니다.

```sql
-- 할일 조회 시 자주 사용되는 필터 조합
CREATE INDEX idx_todos_user_status_category ON todos(user_id, status, category);
CREATE INDEX idx_todos_user_deadline ON todos(user_id, deadline) WHERE deadline IS NOT NULL;

-- 스케줄링 조회 시 사용
CREATE INDEX idx_schedules_user_time ON todo_schedules 
    USING GIST (
        (SELECT user_id FROM todos WHERE todos.id = todo_schedules.todo_id),
        tsrange(start_time, end_time)
    );

-- Google 캘린더 이벤트 조회
CREATE INDEX idx_google_events_user_time ON google_calendar_events 
    USING GIST (user_id, tsrange(start_time, end_time));
```

## 데이터 무결성 규칙

### 비즈니스 로직 검증 함수

```sql
-- 할일 분할 관련 검증
CREATE OR REPLACE FUNCTION validate_todo_split()
RETURNS TRIGGER AS $$
BEGIN
    -- 분할된 할일인 경우 parent_todo_id, split_index, split_total이 모두 설정되어야 함
    IF NEW.is_split = TRUE THEN
        IF NEW.parent_todo_id IS NULL OR NEW.split_index IS NULL OR NEW.split_total IS NULL THEN
            RAISE EXCEPTION '분할된 할일은 parent_todo_id, split_index, split_total이 모두 필요합니다.';
        END IF;
        
        IF NEW.split_index < 1 OR NEW.split_index > NEW.split_total THEN
            RAISE EXCEPTION 'split_index는 1부터 split_total 사이의 값이어야 합니다.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER validate_todo_split_trigger BEFORE INSERT OR UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION validate_todo_split();

-- 스케줄 겹침 방지 (같은 사용자의 할일끼리)
CREATE OR REPLACE FUNCTION prevent_schedule_overlap()
RETURNS TRIGGER AS $$
DECLARE
    overlapping_count INTEGER;
    user_id_val VARCHAR(255);
BEGIN
    -- 해당 할일의 사용자 ID 조회
    SELECT t.user_id INTO user_id_val FROM todos t WHERE t.id = NEW.todo_id;
    
    -- 같은 사용자의 다른 스케줄과 겹치는지 확인
    SELECT COUNT(*) INTO overlapping_count
    FROM todo_schedules ts
    JOIN todos t ON ts.todo_id = t.id
    WHERE t.user_id = user_id_val
      AND ts.id != COALESCE(NEW.id, -1)  -- 업데이트 시 자기 자신 제외
      AND tsrange(NEW.start_time, NEW.end_time) && tsrange(ts.start_time, ts.end_time);
    
    IF overlapping_count > 0 THEN
        RAISE EXCEPTION '스케줄이 다른 할일과 겹칩니다: % - %', NEW.start_time, NEW.end_time;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER prevent_schedule_overlap_trigger BEFORE INSERT OR UPDATE ON todo_schedules
    FOR EACH ROW EXECUTE FUNCTION prevent_schedule_overlap();
```

## 성능 최적화

### 파티셔닝

대용량 데이터 처리를 위한 테이블 파티셔닝 (필요시 적용):

```sql
-- todo_status_history 테이블을 월별로 파티셔닝
CREATE TABLE todo_status_history_y2024m12 PARTITION OF todo_status_history
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- 자동 파티션 생성 함수 (pg_partman 확장 사용 권장)
```

### 통계 정보 수집

```sql
-- 정기적인 통계 정보 수집을 위한 작업
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 분석 대상 테이블들의 통계 정보 수집
ANALYZE users;
ANALYZE todos;
ANALYZE todo_schedules;
ANALYZE google_calendar_events;
```

## 백업 및 아카이빙 전략

### 아카이빙 정책

```sql
-- 완료된 할일과 관련 스케줄을 3개월 후 아카이브 테이블로 이동
CREATE TABLE todos_archive (LIKE todos INCLUDING ALL);
CREATE TABLE todo_schedules_archive (LIKE todo_schedules INCLUDING ALL);

-- 아카이빙 함수
CREATE OR REPLACE FUNCTION archive_completed_todos(cutoff_date DATE)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- 완료된 할일들을 아카이브로 이동
    WITH archived AS (
        DELETE FROM todos 
        WHERE status = 'COMPLETED' 
          AND updated_at < cutoff_date
        RETURNING *
    )
    INSERT INTO todos_archive SELECT * FROM archived;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RETURN archived_count;
END;
$$ language 'plpgsql';
```

## 초기 데이터

### 기본 사용자 환경설정

```sql
-- 기본 환경설정 값들
INSERT INTO user_preferences (user_id, setting_key, setting_value) VALUES
('', 'default_work_start', '10:00'),
('', 'default_work_end', '20:00'),
('', 'timezone', 'Asia/Seoul'),
('', 'weekend_work', 'false'),
('', 'notification_enabled', 'true'),
('', 'auto_schedule_enabled', 'true');
```

이 데이터베이스 스키마는 Todo Time-blocking 앱의 모든 기능을 지원하며, 확장 가능하고 성능 최적화된 구조로 설계되었습니다.