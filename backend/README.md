# Todo Time-blocking Backend

Spring Boot + Kotlin으로 구현된 Todo Time-blocking 앱의 백엔드 서버입니다.

## 기술 스택

- **Framework**: Spring Boot 3.x
- **Language**: Kotlin 1.9+
- **Database**: PostgreSQL 15+
- **Build Tool**: Gradle 8.x
- **JVM**: OpenJDK 17+

## 개발 환경 설정

#### PostgreSQL (Docker) 실행
```bash
# 프로젝트 루트에서 infra 폴더의 Docker Compose로 PostgreSQL 실행
cd ../infra
docker-compose up -d postgres

# 데이터베이스 접속 확인
docker-compose exec postgres psql -U postgres -d gtd_backend
```

### 3. 프로젝트 실행

#### 개발 서버 실행
```bash
# 권한 설정 (최초 1회)
chmod +x gradlew

# 의존성 설치 및 빌드
./gradlew build

# 개발 서버 실행
./gradlew bootRun --args='--spring.profiles.active=local'
```

#### 테스트 실행
```bash
# 전체 테스트 실행
./gradlew test

# 특정 테스트 클래스 실행
./gradlew test --tests TodoServiceTest

# 테스트 커버리지 확인
./gradlew jacocoTestReport
```

## 개발 가이드라인

### 코드 스타일
- Kotlin 공식 코딩 컨벤션 준수
- ktlint를 통한 자동 포맷팅
- 클래스/함수명: PascalCase/camelCase
- 상수명: UPPER_SNAKE_CASE

### Git 커밋 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 스타일 변경
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드 설정 변경
```

### 브랜치 전략
- `main`: 프로덕션 배포용
- `develop`: 개발 브랜치
- `feature/기능명`: 기능 개발 브랜치

## 참고 자료

- [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
- [Kotlin 공식 문서](https://kotlinlang.org/docs/)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
- [프로젝트 API 설계 문서](../docs/api/api-specification.md)
- [아키텍처 문서](../docs/architecture/system-architecture.md)