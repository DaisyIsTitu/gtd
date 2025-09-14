-- Todo Time-blocking 앱 데이터베이스 초기화 스크립트
-- 이 파일은 PostgreSQL 컨테이너 시작 시 자동으로 실행됩니다.

-- 데이터베이스 및 사용자는 docker-compose.yml의 환경변수로 이미 생성됨
-- POSTGRES_DB: gtd_timeblocking
-- POSTGRES_USER: gtd_user
-- POSTGRES_PASSWORD: gtd_password

-- 한국어 지원을 위한 로케일 설정
SET client_encoding = 'UTF8';

-- 타임존 설정
SET timezone = 'Asia/Seoul';

-- ENUM 타입 생성
CREATE TYPE todo_category AS ENUM ('WORK', 'PERSONAL');
CREATE TYPE todo_priority AS ENUM ('HIGH', 'MEDIUM', 'LOW');
CREATE TYPE todo_status AS ENUM ('WAITING', 'SCHEDULED', 'SPLIT', 'IN_PROGRESS', 'MISSED', 'COMPLETED');

-- 1. users 테이블
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

-- 2. todos 테이블
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
    is_split BOOLEAN DEFAULT FALSE,
    parent_todo_id BIGINT REFERENCES todos(id) ON DELETE CASCADE, -- 분할된 할일의 경우 원본 할일 ID
    split_index INTEGER, -- 분할 순서 (1, 2, 3, ...)
    split_total INTEGER, -- 전체 분할 개수
    priority_boost INTEGER DEFAULT 0, -- 놓친 할일에 대한 우선순위 부스트
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. todo_tags 테이블 (@ElementCollection용)
CREATE TABLE todo_tags (
    todo_id BIGINT NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
    tag VARCHAR(255) NOT NULL,
    PRIMARY KEY (todo_id, tag)
);

-- 4. todo_schedules 테이블
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

-- 5. calendar_sync 테이블
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

-- 6. google_calendar_events 테이블
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

-- 7. todo_status_history 테이블
CREATE TABLE todo_status_history (
    id BIGSERIAL PRIMARY KEY,
    todo_id BIGINT NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
    from_status todo_status,
    to_status todo_status NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(255), -- 상태 변경 사유 (예: 'missed_deadline', 'user_action')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. user_preferences 테이블
CREATE TABLE user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, setting_key)
);

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 할일 상태 변경 로깅 함수
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

-- 할일 분할 관련 검증 함수
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

-- 스케줄 겹침 방지 함수 (같은 사용자의 할일끼리)
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

-- 인덱스 생성
-- users 테이블 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

-- todos 테이블 인덱스
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_status ON todos(status);
CREATE INDEX idx_todos_category ON todos(category);
CREATE INDEX idx_todos_deadline ON todos(deadline);
CREATE INDEX idx_todos_created_at ON todos(created_at);
CREATE INDEX idx_todos_parent_todo_id ON todos(parent_todo_id);

-- todo_tags 테이블 인덱스
CREATE INDEX idx_todo_tags_todo_id ON todo_tags(todo_id);
CREATE INDEX idx_todo_tags_tag ON todo_tags(tag);

-- todo_schedules 테이블 인덱스
CREATE INDEX idx_todo_schedules_todo_id ON todo_schedules(todo_id);
CREATE INDEX idx_todo_schedules_start_time ON todo_schedules(start_time);
CREATE INDEX idx_todo_schedules_end_time ON todo_schedules(end_time);
CREATE INDEX idx_todo_schedules_time_range ON todo_schedules(start_time, end_time);
CREATE INDEX idx_todo_schedules_google_event_id ON todo_schedules(google_calendar_event_id);

-- calendar_sync 테이블 인덱스
CREATE INDEX idx_calendar_sync_user_id ON calendar_sync(user_id);
CREATE INDEX idx_calendar_sync_last_sync_at ON calendar_sync(last_sync_at);

-- google_calendar_events 테이블 인덱스
CREATE INDEX idx_google_events_user_id ON google_calendar_events(user_id);
CREATE INDEX idx_google_events_time_range ON google_calendar_events(start_time, end_time);
CREATE INDEX idx_google_events_google_id ON google_calendar_events(google_event_id);

-- todo_status_history 테이블 인덱스
CREATE INDEX idx_todo_status_history_todo_id ON todo_status_history(todo_id);
CREATE INDEX idx_todo_status_history_changed_at ON todo_status_history(changed_at);

-- user_preferences 테이블 인덱스
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_key ON user_preferences(setting_key);

-- 트리거 생성
-- 각 테이블에 업데이트 트리거 적용
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

-- 비즈니스 로직 트리거
CREATE TRIGGER log_todo_status_change_trigger AFTER UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION log_todo_status_change();

CREATE TRIGGER validate_todo_split_trigger BEFORE INSERT OR UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION validate_todo_split();

CREATE TRIGGER prevent_schedule_overlap_trigger BEFORE INSERT OR UPDATE ON todo_schedules
    FOR EACH ROW EXECUTE FUNCTION prevent_schedule_overlap();

COMMIT;