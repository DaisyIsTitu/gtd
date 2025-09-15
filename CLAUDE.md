# Todo Time-blocking 앱 개발 가이드

## 📋 프로젝트 개요

Google Calendar와 연동하여 할 일을 자동으로 최적의 시간에 배치하는 스마트 시간 관리 웹 애플리케이션

### 🛠️ 기술 스택
- **Frontend**: NextJS + TypeScript
- **Backend**: Spring Boot + Kotlin
- **Database**: PostgreSQL
- **External API**: Google Calendar API + OAuth 2.0
- **Communication**: REST API

## 📚 참고 문서

작업 시 다음 문서들을 참고할 수 있습니다:

### 요구사항
- @docs/requirement/PRD.md - 제품 요구사항 명세서
- @docs/requirement/wireframe.md - 와이어프레임 및 UI 설계
- @docs/requirement/policy.md - 정책 및 규칙

### 아키텍처
- @docs/architecture/system-architecture.md - 시스템 아키텍처
- @docs/architecture/architecture-decisions.md - 아키텍처 결정 사항

### API
- @docs/api/api-specification.md - API 명세서
- @docs/api/api-usage-guide.md - API 사용 가이드

### 데이터베이스
- @docs/database/database-schema.md - 데이터베이스 스키마

### 스프린트
- @docs/sprint/development-roadmap.md - 개발 로드맵 및 체크리스트

## 📝 문서 작성 규칙

### 기본 원칙
- **언어**: 모든 문서는 한국어로 작성
- **구조**: 모든 문서에 목차 포함
- **업데이트**: API 변경 시 관련 문서 즉시 업데이트

### API 문서 관리
- **API 설계 명세서**: 엔드포인트, 데이터 모델, 에러 코드 변경 시 업데이트
- **API 사용 가이드**: 새 기능 사용법, 호출 방법 변경 시 업데이트
- **OpenAPI 스펙**: Swagger 문서 자동 생성용 스펙 파일 유지

## ⚙️ 작업 규칙

### 기본 원칙
- 소규모 애플리케이션이기 때문에, 과한 최적화와 오버 엔지니어링은 하지 않는다.

### 작업 절차
1. @docs/sprint/development-roadmap.md 에서 현재 Sprint 작업 확인
2. @docs 하위의 관련된 문서를 참고하여, 작업 진행을 위한 계획 수립
3. 계획에 따라 작업 진행
4. 작업 완료 후, @docs/sprint/development-roadmap.md 열기
5. 해당 작업 항목에 체크 표시