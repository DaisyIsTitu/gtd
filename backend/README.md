# GTD Time-blocking 백엔드

## 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [개발 환경 설정](#개발-환경-설정)
5. [실행 방법](#실행-방법)
6. [API 문서](#api-문서)
7. [데이터베이스 스키마](#데이터베이스-스키마)
8. [개발 가이드라인](#개발-가이드라인)

## 프로젝트 개요

Todo 관리 및 Google Calendar 연동을 통한 시간 블록킹(Time-blocking) 기능을 제공하는 Spring Boot 3+ 기반 REST API 서버입니다.

### 주요 기능
- 사용자 인증 및 권한 관리 (JWT)
- Todo CRUD 및 카테고리 관리
- 시간 추적 및 시간 블록킹
- Google Calendar 연동
- RESTful API 제공
- OpenAPI 3.0 문서화

## 기술 스택

### 핵심 기술
- **Language**: Kotlin 1.9.21
- **Framework**: Spring Boot 3.2.1
- **Build Tool**: Gradle 8.5 (Kotlin DSL)
- **JVM**: Java 17

### 주요 라이브러리
- **Spring Boot Starters**:
  - spring-boot-starter-web
  - spring-boot-starter-data-jpa
  - spring-boot-starter-security
  - spring-boot-starter-validation
  - spring-boot-starter-actuator

- **데이터베이스**:
  - PostgreSQL (운영)
  - H2 Database (테스트)
  - Flyway (마이그레이션)

- **보안 및 인증**:
  - JWT (jsonwebtoken)
  - Spring Security

- **문서화**:
  - SpringDoc OpenAPI 3.0

- **Google API**:
  - Google Calendar API
  - Google OAuth Client

- **테스트**:
  - JUnit 5
  - MockK
  - Testcontainers

## 프로젝트 구조

```
src/
├── main/
│   ├── kotlin/com/gtd/timeblocking/
│   │   ├── config/          # 설정 클래스들
│   │   ├── controller/      # REST API 컨트롤러
│   │   ├── service/         # 비즈니스 로직
│   │   ├── repository/      # 데이터 액세스 레이어
│   │   ├── entity/          # JPA 엔티티
│   │   ├── dto/             # 데이터 전송 객체
│   │   └── exception/       # 예외 클래스들
│   └── resources/
│       ├── application.yml  # 환경별 설정
│       └── db/migration/    # Flyway 마이그레이션 파일들
└── test/
    └── kotlin/com/gtd/timeblocking/  # 테스트 코드
```

## 개발 환경 설정

### 필수 요구사항
- JDK 17 이상
- Docker & Docker Compose
- Git

### 1. 저장소 클론
```bash
git clone <repository-url>
cd gtd-backend/backend
```

### 2. 데이터베이스 실행 (PostgreSQL)
```bash
# PostgreSQL 실행 (프로젝트 루트에서)
cd ..
docker-compose up -d

# 데이터베이스 연결 정보
# - Host: localhost:5432
# - Database: gtd_timeblocking
# - Username: gtd_user
# - Password: gtd_password
```

### 3. 환경 설정
application.yml 파일에서 필요에 따라 설정을 수정합니다.

## 실행 방법

### Gradle을 이용한 실행
```bash
# 애플리케이션 실행 (개발 모드)
./gradlew bootRun --args='--spring.profiles.active=local'

# 빌드
./gradlew build

# 테스트 실행
./gradlew test

# JAR 파일 생성 및 실행
./gradlew bootJar
java -jar build/libs/gtd-timeblocking-1.0.0.jar --spring.profiles.active=local
```

### IDE에서 실행
1. IntelliJ IDEA 또는 Eclipse에서 backend 폴더를 프로젝트로 import
2. `GtdTimeblockingApplication.kt` 파일의 main 함수 실행 (실제 파일명 확인 필요)
3. Active profiles: `local` 설정

## API 문서

애플리케이션 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:

- **Swagger UI**: http://localhost:8080/swagger-ui/index.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

### 주요 엔드포인트
- `GET /api/v1/health` - 헬스 체크
- `GET /actuator/health` - 액추에이터 헬스 체크
- `POST /api/v1/auth/**` - 인증 관련 API (추후 구현)
- `GET/POST/PUT/DELETE /api/v1/todos/**` - Todo 관리 API (추후 구현)

## 데이터베이스 스키마

### 주요 테이블
- `users` - 사용자 정보
- `todo_categories` - Todo 카테고리
- `todos` - Todo 항목
- `todo_tags` - Todo 태그
- `todo_tag_relations` - Todo-태그 연결
- `time_tracking` - 시간 추적 기록
- `user_settings` - 사용자 설정

### 마이그레이션
Flyway를 사용한 데이터베이스 스키마 버전 관리:
- 마이그레이션 파일 위치: `src/main/resources/db/migration/`
- 파일 명명 규칙: `V{버전}__{설명}.sql`

## 개발 가이드라인

### 코딩 스타일
- Kotlin 공식 코딩 컨벤션 준수
- 클래스, 함수, 변수명은 한국어 주석과 함께 영문으로 작성
- API 응답은 공통 `ApiResponse` 형식 사용

### Git 브랜치 전략
- `main` - 운영 환경 배포 브랜치
- `develop` - 개발 통합 브랜치
- `feature/*` - 기능 개발 브랜치
- `hotfix/*` - 핫픽스 브랜치

### 테스트 작성
- 단위 테스트: `@WebMvcTest`, `@DataJpaTest` 활용
- 통합 테스트: `@SpringBootTest` 활용
- 테스트 커버리지 최소 80% 유지

### 환경별 설정
- `local` - 로컬 개발 환경
- `test` - 테스트 환경 (H2 DB)
- `dev` - 개발 서버 환경
- `prod` - 운영 환경

## 향후 개발 계획

1. **Sprint 1**: 사용자 인증 및 기본 Todo CRUD
2. **Sprint 2**: Google Calendar 연동
3. **Sprint 3**: 시간 블록킹 및 추적 기능
4. **Sprint 4**: 알림 및 분석 기능

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.