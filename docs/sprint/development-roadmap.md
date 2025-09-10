# Todo Time-blocking 앱 개발 로드맵

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
   - [기술 스택](#기술-스택)
   - [개발 전략](#개발-전략)

2. [🚀 Phase 1: 독립 병렬 개발 (Sprint 1-3, Week 1-6)](#-phase-1-독립-병렬-개발-sprint-1-3-week-1-6)
   - [Sprint 1: 프로젝트 기반 구축 (Week 1-2)](#sprint-1-프로젝트-기반-구축-week-1-2)
   - [Sprint 2: 핵심 데이터 흐름 (Week 3-4)](#sprint-2-핵심-데이터-흐름-week-3-4)
   - [Sprint 3: 기본 스케줄링 (Week 5-6)](#sprint-3-기본-스케줄링-week-5-6)

3. [🔗 Phase 2: 통합 개발 (Sprint 4-9, Week 7-18)](#-phase-2-통합-개발-sprint-4-9-week-7-18)
   - [Sprint 4: 첫 번째 API 연동 + Google Calendar 연동 (Week 7-8)](#sprint-4--첫-번째-api-연동--google-calendar-연동-week-7-8)
   - [Sprint 5: 고급 스케줄링 & UI 인터랙션 (Week 9-10)](#sprint-5-고급-스케줄링--ui-인터랙션-week-9-10)
   - [Sprint 6: 놓친 할 일 & 상태 관리 (Week 11-12)](#sprint-6-놓친-할-일--상태-관리-week-11-12)
   - [Sprint 7: 에러 처리 & 예외 상황 (Week 13-14)](#sprint-7-에러-처리--예외-상황-week-13-14)
   - [Sprint 8: 성능 최적화 & 배포 준비 (Week 15-16)](#sprint-8-성능-최적화--배포-준비-week-15-16)
   - [Sprint 9: 테스팅 & 버그 수정 (Week 17-18)](#sprint-9-테스팅--버그-수정-week-17-18)

4. [주요 마일스톤](#주요-마일스톤)

5. [리스크 관리](#리스크-관리)
   - [기술적 리스크](#기술적-리스크)
   - [일정 리스크](#일정-리스크)
   - [대응 방안](#대응-방안)

6. [성공 기준](#성공-기준)
   - [기능적 요구사항](#기능적-요구사항)
   - [성능 요구사항](#성능-요구사항)
   - [사용성 요구사항](#사용성-요구사항)

---

## 프로젝트 개요

Google Calendar와 연동하여 할 일을 자동으로 최적의 시간에 배치하는 스마트 시간 관리 웹 애플리케이션의 단계별 개발 계획입니다.

### 기술 스택
- **Frontend**: NextJS + TypeScript
- **Backend**: Spring Boot + Kotlin
- **Database**: PostgreSQL
- **External API**: Google Calendar API + OAuth 2.0
- **Communication**: REST API

### 개발 전략
- 🔄 **분리된 병렬 개발**: Sprint 1-3은 Frontend/Backend 완전 독립 진행
- 🔗 **API 연동 시점**: Sprint 4 (Week 7-8)부터 Frontend ↔ Backend 통합
- 🎯 **MVP 우선**: 핵심 기능부터 점진적 확장
- ✅ **Success Case 우선**: 정상 케이스 구현 후 예외 처리
- 🧪 **Mock API 활용**: Frontend 독립 개발 지원 (Sprint 1-3)

---

# 🚀 Phase 1: 독립 병렬 개발 (Sprint 1-3, Week 1-6)

> **핵심 전략**: Frontend와 Backend가 서로의 개발 진행에 의존하지 않고 완전 독립적으로 진행
> 
> - **Frontend**: Mock API로 모든 UI/UX 완성
> - **Backend**: 실제 데이터베이스와 완전한 API 구현
> - **연동 준비**: Sprint 4에서 원활한 통합을 위한 인터페이스 표준화

## Sprint 1: 프로젝트 기반 구축 (Week 1-2)

### 목표
프로젝트 환경 구성 및 기본 UI/데이터 구조 설계
**⚠️ Frontend와 Backend 팀은 독립적으로 작업하며 상호 의존성 없음**

### Frontend 작업 (NextJS + TypeScript)
#### 환경 구성
- [ ] NextJS 13+ 프로젝트 초기 설정
- [ ] TypeScript 구성 및 타입 정의
- [ ] TailwindCSS 또는 CSS 프레임워크 설정
- [ ] ESLint, Prettier 코드 품질 도구 설정

#### 핵심 UI 컴포넌트
- [ ] 주간 캘린더 UI 컴포넌트 (정적, 그리드 레이아웃)
- [ ] Todo 사이드바 UI (목록 표시, 필터)
- [ ] 기본 레이아웃 및 헤더 구성
- [ ] Mock 데이터 구조 정의

#### Mock API 설계
- [ ] Todo, Calendar Event 타입 정의
- [ ] Mock API 함수 작성 (localStorage 활용)
- [ ] 기본 CRUD 동작 시뮬레이션

### Backend 작업 (Spring Boot + Kotlin)
#### 프로젝트 설정
- [ ] Spring Boot 3+ 프로젝트 초기 설정
- [ ] Kotlin 설정 및 코딩 스타일 가이드
- [ ] Gradle 빌드 설정 및 의존성 관리
- [ ] 개발 환경별 설정 파일 구성

#### 데이터베이스 설계
- [ ] PostgreSQL 연결 및 JPA 설정
- [ ] User 엔티티 설계 (id, email, name, googleId, settings)
- [ ] Todo 엔티티 설계 (id, title, description, duration, category, priority, status)
- [ ] TodoSchedule 엔티티 설계 (id, todoId, startTime, endTime, splitInfo)
- [ ] 초기 마이그레이션 스크립트 작성

#### 기본 구조
- [ ] Repository, Service, Controller 레이어 구조
- [ ] 기본 Exception Handling
- [ ] API 응답 형식 표준화 (success, error 응답 래퍼)

### 결과물 (독립 완성)
- **Frontend**: Mock API로 동작하는 완전한 UI 애플리케이션
- **Backend**: 실제 데이터베이스 연결된 독립적인 API 서버
- **공통**: 양 팀이 합의한 API 인터페이스 스펙 문서

---

## Sprint 2: 핵심 데이터 흐름 (Week 3-4)

### 목표
Todo 관리 핵심 기능 구현 및 상태 관리 구축
**⚠️ 여전히 Frontend(Mock) ↔ Backend(Real) 독립 개발**

### Frontend 작업
#### Todo 관리 UI
- [ ] Todo 추가 모달 (제목, 소요시간, 카테고리, 우선순위, 태그)
- [ ] Todo 목록 표시 및 상태별 필터링
- [ ] Todo 수정/삭제 기능
- [ ] 상태 관리 라이브러리 설정 (Zustand/Context API)

#### 캘린더 연동 기초
- [ ] Todo를 캘린더에 정적 배치 표시
- [ ] 색상 체계 구현 (업무/개인 카테고리별)
- [ ] 시간 슬롯 기본 표시 (10AM-8PM)
- [ ] Mock API와 연동된 데이터 흐름

#### 사용자 경험
- [ ] 로딩 스켈레톤 UI
- [ ] 기본적인 반응형 디자인
- [ ] 에러 상태 표시 (Mock)

### Backend 작업
#### Todo API 완전 구현
- [ ] GET /api/v1/todos (목록 조회, 페이징, 필터링)
- [ ] GET /api/v1/todos/{id} (상세 조회)
- [ ] POST /api/v1/todos (생성)
- [ ] PUT /api/v1/todos/{id} (수정)
- [ ] DELETE /api/v1/todos/{id} (삭제)
- [ ] PATCH /api/v1/todos/{id}/status (상태 변경)

#### 인증 기초
- [ ] Google OAuth 2.0 설정 준비
- [ ] JWT 기반 인증 구조 설계
- [ ] 사용자 API 기본 구현

#### 테스트 및 검증
- [ ] Unit Test 작성 (Service 레이어)
- [ ] Integration Test 작성 (API 레이어)
- [ ] API 문서화 (Swagger/OpenAPI)

### 결과물 (독립 완성)
- **Frontend**: Mock API로 완전히 동작하는 Todo 관리 시스템
- **Backend**: 실제 데이터베이스 기반 완전한 Todo API 서버
- **준비 완료**: Sprint 4 API 연동을 위한 모든 준비 완료

---

## Sprint 3: 기본 스케줄링 (Week 5-6)

### 목표
간단한 자동 스케줄링 기능 구현
**⚠️ 마지막 독립 개발 Sprint - Sprint 4부터 통합 시작**

### Frontend 작업
#### 스케줄링 UI
- [ ] "자동 배치" 버튼 및 프로그레스 표시
- [ ] 배치 결과 미리보기 모드
- [ ] 배치된 Todo를 캘린더에 표시
- [ ] 상태별 시각적 구분 (대기중, 배치됨, 완료)

#### 상태 관리
- [ ] Todo 상태 전환 UI (시작/완료 버튼)
- [ ] 필터링 및 정렬 기능 고도화
- [ ] 검색 기능 추가

### Backend 작업
#### 스케줄링 엔진 기초
- [ ] 가용 시간 분석 API (GET /api/v1/scheduling/available-slots)
- [ ] 간단한 스케줄링 알고리즘 (빈 시간 우선 배치)
- [ ] 자동 스케줄링 API (POST /api/v1/scheduling/auto-schedule)

#### 시간 관리
- [ ] 업무시간대 설정 (10AM-8PM, 월-금)
- [ ] 30분 단위 시간 슬롯 처리
- [ ] Todo 상태 전환 로직 (WAITING → SCHEDULED → IN_PROGRESS → COMPLETED)

#### 기본 알고리즘
- [ ] 우선순위 기반 정렬
- [ ] 테트리스 방식 시간 배치 (큰 블록 우선)
- [ ] 데드라인 고려 배치

### 결과물 (독립 개발 완료)
- **Frontend**: Mock 스케줄링 알고리즘으로 완전한 UX 구현
- **Backend**: 실제 스케줄링 로직과 알고리즘 완성
- **통합 준비**: 다음 Sprint API 연동을 위한 모든 기반 완료

---

# 🔗 Phase 2: 통합 개발 (Sprint 4-9, Week 7-18)

> **핵심 전략**: Frontend와 Backend 통합 및 실제 시스템 구축
>
> - **API 연동**: Mock API → Real API 전환
> - **통합 테스트**: Frontend ↔ Backend 연동 검증
> - **시스템 완성**: 프로덕션 레디 애플리케이션 구축

## Sprint 4: 🚀 **첫 번째 API 연동** + Google Calendar 연동 (Week 7-8)

### 목표
**✨ Frontend ↔ Backend 첫 통합** 및 Google Calendar API 연동

### Frontend 작업
#### 인증 UI
- [ ] Google OAuth 로그인 화면
- [ ] 로그인 상태 표시 및 로그아웃
- [ ] 사용자 프로필 정보 표시

#### Calendar 연동 UI
- [ ] Google Calendar 이벤트 표시 (회색 블록)
- [ ] 캘린더 동기화 버튼 및 상태
- [ ] 충돌 감지 시 시각적 표시

### Backend 작업
#### Google OAuth 구현
- [ ] Google OAuth 2.0 완전 구현
- [ ] 토큰 저장 및 갱신 로직
- [ ] 인증 미들웨어 및 보안

#### Google Calendar API 연동
- [ ] Calendar API 클라이언트 설정
- [ ] 캘린더 이벤트 조회 (GET /api/v1/calendar/events)
- [ ] 캘린더 동기화 (POST /api/v1/calendar/sync)

#### 충돌 감지
- [ ] Google Calendar 이벤트와 Todo 스케줄 충돌 체크
- [ ] 충돌 해결 로직 (다음 가능한 시간 찾기)
- [ ] 빈 시간 분석 고도화

### 🔥 **핵심 API 통합 작업**
#### Frontend API 클라이언트 전환
- [ ] Mock API 호출 → 실제 Backend API 호출로 전환
- [ ] API 클라이언트 라이브러리 구성 (axios, fetch)
- [ ] 환경별 API URL 설정 (개발/운영)
- [ ] 인증 토큰 관리 및 자동 갱신

#### 통합 테스트 및 디버깅
- [ ] Todo CRUD API 연동 테스트
- [ ] 네트워크 오류 기본 처리
- [ ] API 응답 포맷 검증 및 타입 안전성
- [ ] Frontend ↔ Backend 데이터 흐름 검증

### 결과물 (첫 번째 통합 완료)
- **🎉 API 연동 성공**: Frontend가 실제 Backend API와 통신
- **Google Calendar 연동**: 실제 캘린더 데이터와 동기화
- **통합 시스템**: Mock 데이터에서 실제 데이터로 완전 전환

---

## Sprint 5: 고급 스케줄링 & UI 인터랙션 (Week 9-10)

### 목표
스마트 스케줄링 알고리즘 고도화 및 드래그앤드롭 기능

### Frontend 작업
#### 드래그앤드롭 구현
- [ ] 사이드바 Todo를 캘린더로 드래그
- [ ] 캘린더 내 Todo 시간/날짜 이동
- [ ] 드래그 중 충돌 감지 및 시각적 피드백
- [ ] Todo 소요시간 조정 (블록 크기 변경)

#### 고급 UI
- [ ] 스케줄링 미리보기 모드 (적용/취소 선택)
- [ ] 분할된 Todo 표시 ("할일명 (1/3)" 형태)
- [ ] 호버 효과 및 툴팁
- [ ] 애니메이션 및 트랜지션 효과

### Backend 작업
#### 스마트 스케줄링
- [ ] 할 일 분할 로직 (4시간 초과 시 자동 분할)
- [ ] 카테고리별 인접 배치 (같은 카테고리 2시간 내)
- [ ] 우선순위 부스트 시스템
- [ ] 더 정교한 빈 시간 분석

#### 드래그앤드롭 지원 API
- [ ] 수동 스케줄링 API (PUT /api/v1/todos/{id}/schedule)
- [ ] 시간 슬롯 유효성 검증
- [ ] 실시간 충돌 체크 API

#### 분할 Todo 관리
- [ ] 분할된 Todo 관계 관리
- [ ] 분할 Todo 개별 상태 관리
- [ ] 분할 Todo 통합/분리 기능

### 결과물
- 직관적인 드래그앤드롭 인터페이스
- 분할 Todo를 지원하는 고급 스케줄링
- 사용자 친화적인 인터랙션이 완성된 UI

---

## Sprint 6: 놓친 할 일 & 상태 관리 (Week 11-12)

### 목표
놓친 할 일 자동 감지 및 재배치 시스템 구현

### Frontend 작업
#### 놓친 할 일 UI
- [ ] 놓친 할 일 섹션 (주황색 구분)
- [ ] 우선순위 부스트 표시 (⭐ 아이콘)
- [ ] 놓친 할 일 재배치 버튼
- [ ] 수동 상태 변경 (놓친 할 일 → 대기중)

#### 실시간 상태 표시
- [ ] 진행중 할 일 애니메이션 효과
- [ ] 완료된 할 일 시각적 구분
- [ ] 상태 전환 히스토리 표시

### Backend 작업
#### 놓친 할 일 감지
- [ ] 백그라운드 작업 설정 (Spring @Scheduled)
- [ ] 5분마다 놓친 할 일 체크 로직
- [ ] 30분 여유 시간 적용한 자동 상태 전환
- [ ] 놓친 할 일 API (GET /api/v1/todos/missed)

#### 우선순위 부스트
- [ ] 놓친 할 일 우선순위 +1 부스트
- [ ] 재배치 시 부스트 적용 로직
- [ ] 부스트 히스토리 및 로깅

#### 상태 관리 완성
- [ ] 모든 상태 전환 규칙 구현
- [ ] 상태 변경 이력 저장
- [ ] 비즈니스 룰 검증

### 결과물
- 완전한 Todo 생명주기 관리 시스템
- 놓친 할 일을 자동으로 감지하고 우선순위를 부여하는 스마트 시스템
- 안정적인 백그라운드 작업이 포함된 시스템

---

## Sprint 7: 에러 처리 & 예외 상황 (Week 13-14)

### 목표
모든 에러 케이스 처리 및 시스템 안정성 확보

### Frontend 작업
#### 네트워크 에러 처리
- [ ] API 호출 실패 시 에러 메시지 표시
- [ ] 재시도 버튼 및 로직
- [ ] 오프라인 상태 감지 및 표시
- [ ] 네트워크 복구 시 자동 동기화

#### 사용자 경험 개선
- [ ] 로딩 상태 표시 개선 (스켈레톤, 프로그래스)
- [ ] 토스트 메시지 시스템
- [ ] 확인 대화상자 (삭제, 중요 작업)
- [ ] 키보드 단축키 지원

#### 예외 상황 UI
- [ ] Google Calendar 연동 실패 처리
- [ ] 스케줄링 실패 시 대안 제시
- [ ] 데이터 충돌 해결 UI
- [ ] 세션 만료 처리

### Backend 작업
#### 예외 처리 강화
- [ ] Global Exception Handler 완성
- [ ] 구체적인 에러 코드 및 메시지
- [ ] API 제한 초과 처리 (Rate Limiting)
- [ ] Google API 에러 처리 (인증 만료, API 제한)

#### 시스템 안정성
- [ ] 데이터베이스 트랜잭션 안정성 확보
- [ ] 동시성 처리 (Optimistic Lock)
- [ ] 데이터 무결성 검증
- [ ] 장애 복구 로직

#### 모니터링 및 로깅
- [ ] 구조화된 로깅 시스템
- [ ] 에러 발생 알림
- [ ] 성능 모니터링 메트릭
- [ ] 헬스체크 API

### 결과물
- 안정적이고 신뢰할 수 있는 애플리케이션
- 모든 에러 상황에 대한 적절한 대응
- 사용자 친화적인 에러 처리 경험

---

## Sprint 8: 성능 최적화 & 배포 준비 (Week 15-16)

### 목표
성능 최적화 및 프로덕션 환경 배포 준비

### Frontend 작업
#### 성능 최적화
- [ ] 코드 스플리팅 (페이지별, 컴포넌트별)
- [ ] 번들 크기 최적화 및 분석
- [ ] 이미지 최적화 (Next.js Image)
- [ ] 메모리 누수 점검 및 수정

#### 캐싱 전략
- [ ] API 응답 캐싱 (SWR/React Query)
- [ ] 브라우저 캐싱 최적화
- [ ] Service Worker (선택사항)

#### UI/UX 완성도
- [ ] 반응형 디자인 완성 (태블릿, 모바일)
- [ ] 접근성 (Accessibility) 개선
- [ ] 다국어 지원 기반 (i18n)
- [ ] SEO 최적화

### Backend 작업
#### 성능 튜닝
- [ ] 데이터베이스 쿼리 최적화
- [ ] 인덱스 튜닝 및 실행계획 분석
- [ ] API 응답 시간 개선 (3초 → 1초 목표)
- [ ] 메모리 사용량 최적화

#### 확장성 준비
- [ ] 커넥션 풀 설정
- [ ] 캐시 시스템 (Redis) 도입 검토
- [ ] 비동기 처리 개선
- [ ] 데이터베이스 백업 전략

#### 배포 환경
- [ ] Docker 컨테이너화
- [ ] 환경별 설정 분리 (dev, staging, prod)
- [ ] CI/CD 파이프라인 구축
- [ ] 보안 설정 강화 (HTTPS, CORS)

### 결과물
- 프로덕션 레디 애플리케이션
- 최적화된 성능과 사용자 경험
- 안정적인 배포 환경

---

## Sprint 9: 테스팅 & 버그 수정 (Week 17-18)

### 목표
종합적인 테스트 및 품질 보증

### Frontend 테스트
#### 자동화 테스트
- [ ] 컴포넌트 단위 테스트 (Jest + Testing Library)
- [ ] 통합 테스트 (사용자 플로우)
- [ ] E2E 테스트 (Playwright/Cypress)
- [ ] 시각적 회귀 테스트

#### 수동 테스트
- [ ] 크로스 브라우저 테스트 (Chrome, Safari, Firefox)
- [ ] 모바일 디바이스 테스트
- [ ] 접근성 테스트 (스크린 리더, 키보드 내비게이션)

### Backend 테스트
#### 테스트 보완
- [ ] Unit Test 커버리지 80% 이상
- [ ] Integration Test 모든 API 엔드포인트
- [ ] 성능 테스트 (부하 테스트, 스트레스 테스트)
- [ ] 보안 테스트 (취약점 스캔)

#### 데이터 검증
- [ ] 데이터 마이그레이션 테스트
- [ ] 백업 및 복구 테스트
- [ ] 데이터 일관성 검증

### 사용자 테스트
- [ ] 알파 테스트 (내부 사용자)
- [ ] 베타 테스트 (외부 사용자 소규모)
- [ ] 피드백 수집 및 분석
- [ ] 우선순위별 버그 수정

### 품질 보증
- [ ] 코드 리뷰 완료
- [ ] 보안 검수 및 취약점 수정
- [ ] 성능 기준 달성 확인
- [ ] 최종 배포 전 체크리스트

### 결과물
- 안정적이고 품질이 검증된 애플리케이션
- 사용자 피드백이 반영된 완성품
- 배포 준비가 완료된 시스템

---

## 주요 마일스톤

### 🎯 Sprint 3 완료 (6주차) - **Phase 1 완료**
**독립 개발 완료 - Frontend(Mock) + Backend(Real)**
- ✅ Frontend: 완전한 Mock API 기반 UI/UX 완성
- ✅ Backend: 실제 데이터베이스 기반 완전한 API 완성
- ✅ 통합 준비: API 연동을 위한 모든 기반 완료

### 🎯 Sprint 4 완료 (8주차) - **첫 번째 통합**
**API 연동 성공 + Google Calendar 연동**
- ✅ Mock API → Real API 성공적 전환
- ✅ Google OAuth 로그인 및 캘린더 연동
- ✅ Frontend ↔ Backend 완전 통합

### 🎯 Sprint 6 완료 (12주차)
**Beta 1.0 - 핵심 기능 완성**
- ✅ 드래그앤드롭 인터페이스
- ✅ 놓친 할 일 자동 관리
- ✅ 스마트 스케줄링 완성

### 🎯 Sprint 9 완료 (18주차)
**Release 1.0 - 프로덕션 배포**
- ✅ 모든 기능 완성 및 안정화
- ✅ 성능 최적화 완료
- ✅ 품질 검증 완료

---

## 리스크 관리

### 기술적 리스크
- **Google API 제한**: API 할당량 관리 및 효율적 호출
- **성능 이슈**: 대용량 데이터 처리 최적화 필요
- **동시성 문제**: 멀티 사용자 환경 동시성 처리

### 일정 리스크
- **API 연동 복잡성 (Sprint 4)**: Frontend↔Backend 통합 시 예상치 못한 호환성 이슈
- **Google Calendar 연동 복잡성**: OAuth 플로우 및 API 제한 사항
- **드래그앤드롭 UI 복잡성**: 단계적 구현으로 리스크 완화
- **독립 개발 동기화**: Sprint 1-3 동안 양 팀 간 인터페이스 불일치 위험

### 대응 방안
- **Phase 1 (Sprint 1-3)**: 주 1회 Frontend↔Backend 팀 인터페이스 동기화 미팅
- **Phase 2 (Sprint 4+)**: 통합 이후 매일 스탠드업 및 즉시 이슈 해결
- 핵심 기능 우선 구현 (Nice-to-have 기능 후순위)
- API 스펙 문서화 및 지속적인 업데이트
- Sprint 4 전 통합 테스트 환경 사전 구축

### API 문서 관리 가이드라인
Sprint 진행 중 API 변경사항이 발생할 때마다 다음 문서들을 반드시 업데이트해야 합니다:

#### 필수 업데이트 대상 문서
1. **API 설계 명세서** (`docs/api/api-specification.md`)
   - 새로운 엔드포인트 추가/변경
   - 요청/응답 데이터 모델 변경
   - 에러 코드 추가/변경
   - 인증 방식 변경

2. **API 사용 가이드** (`docs/api/api-usage-guide.md`)
   - 새로운 기능 사용법 예시
   - 변경된 API 호출 방법
   - 에러 처리 패턴 업데이트
   - 성능 최적화 팁 추가

3. **OpenAPI 스펙** (`docs/api/openapi-spec.yaml`)
   - Swagger 문서 자동 생성용 스펙 파일
   - API 테스트 도구 연동

#### 업데이트 시점
- **Sprint 계획 단계**: API 설계 변경 사항 반영
- **구현 완료 후**: 실제 구현된 API 스펙 업데이트
- **테스트 완료 후**: 검증된 API 동작 방식 문서화

#### 업데이트 책임자
- **Backend 개발자**: API 명세서 및 OpenAPI 스펙 업데이트
- **Frontend 개발자**: API 사용 가이드의 클라이언트 구현 예시 업데이트
- **공통**: 변경사항 발생 시 상호 리뷰 및 피드백

---

## 성공 기준

### 기능적 요구사항
- [ ] Google Calendar와 완전한 양방향 동기화
- [ ] 10개 할 일을 3초 이내 자동 배치
- [ ] 놓친 할 일 30분 이내 자동 감지
- [ ] 드래그앤드롭으로 직관적 일정 조정

### 성능 요구사항
- [ ] 페이지 로딩 시간 2초 이내
- [ ] API 응답 시간 1초 이내 (스케줄링 제외)
- [ ] 모바일 환경 최적화 (Lighthouse 90점 이상)

### 사용성 요구사항
- [ ] 신규 사용자 5분 이내 첫 할 일 배치
- [ ] 에러 발생 시 명확한 안내 메시지
- [ ] 오프라인 상황에서도 기본 기능 동작