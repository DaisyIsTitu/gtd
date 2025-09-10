-- GTD Time-blocking 애플리케이션 초기 스키마
-- 사용자, Todo, 캘린더 연동 등을 위한 기본 테이블 구조

-- 사용자 테이블
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'Asia/Seoul',
    is_active BOOLEAN DEFAULT true,
    google_calendar_token TEXT,
    google_calendar_refresh_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) DEFAULT 'system',
    updated_by VARCHAR(50) DEFAULT 'system'
);

-- 사용자 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active);

-- Todo 카테고리 테이블
CREATE TABLE todo_categories (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#007bff', -- 헥사 컬러 코드
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) DEFAULT 'system',
    updated_by VARCHAR(50) DEFAULT 'system',
    
    UNIQUE(user_id, name)
);

-- Todo 테이블
CREATE TABLE todos (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES todo_categories(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5), -- 1=매우높음, 5=매우낮음
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    due_date TIMESTAMP,
    estimated_minutes INTEGER, -- 예상 소요 시간 (분)
    actual_minutes INTEGER, -- 실제 소요 시간 (분)
    google_calendar_event_id VARCHAR(255), -- Google Calendar 이벤트 ID
    is_time_blocked BOOLEAN DEFAULT false, -- 시간 블록킹 여부
    time_block_start TIMESTAMP, -- 시간 블록 시작
    time_block_end TIMESTAMP, -- 시간 블록 종료
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) DEFAULT 'system',
    updated_by VARCHAR(50) DEFAULT 'system'
);

-- Todo 인덱스
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_category_id ON todos(category_id);
CREATE INDEX idx_todos_status ON todos(status);
CREATE INDEX idx_todos_due_date ON todos(due_date);
CREATE INDEX idx_todos_priority ON todos(priority);
CREATE INDEX idx_todos_time_block ON todos(time_block_start, time_block_end);
CREATE INDEX idx_todos_google_event ON todos(google_calendar_event_id);

-- Todo 태그 테이블
CREATE TABLE todo_tags (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#6c757d',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) DEFAULT 'system',
    
    UNIQUE(user_id, name)
);

-- Todo-태그 연결 테이블
CREATE TABLE todo_tag_relations (
    todo_id BIGINT REFERENCES todos(id) ON DELETE CASCADE,
    tag_id BIGINT REFERENCES todo_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (todo_id, tag_id)
);

-- 시간 추적 테이블
CREATE TABLE time_tracking (
    id BIGSERIAL PRIMARY KEY,
    todo_id BIGINT NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_minutes INTEGER, -- 계산된 소요 시간
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) DEFAULT 'system',
    updated_by VARCHAR(50) DEFAULT 'system'
);

-- 시간 추적 인덱스
CREATE INDEX idx_time_tracking_todo_id ON time_tracking(todo_id);
CREATE INDEX idx_time_tracking_start_time ON time_tracking(start_time);

-- 사용자 설정 테이블
CREATE TABLE user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) DEFAULT 'system',
    updated_by VARCHAR(50) DEFAULT 'system',
    
    UNIQUE(user_id, setting_key)
);

-- 기본 카테고리 생성을 위한 함수
CREATE OR REPLACE FUNCTION create_default_category_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO todo_categories (user_id, name, color, description, is_default, created_by, updated_by)
    VALUES (NEW.id, '기본', '#007bff', '기본 카테고리', true, NEW.username, NEW.username);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 사용자 생성 시 기본 카테고리 자동 생성 트리거
CREATE TRIGGER trigger_create_default_category
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_category_for_user();

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 모든 테이블에 updated_at 자동 업데이트 트리거 추가
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_todo_categories_updated_at BEFORE UPDATE ON todo_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_todos_updated_at BEFORE UPDATE ON todos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_time_tracking_updated_at BEFORE UPDATE ON time_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();