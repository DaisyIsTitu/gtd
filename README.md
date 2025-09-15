# Todo Time-blocking 앱

Google Calendar와 연동하여 할 일을 자동으로 최적의 시간에 배치해주는 스마트 시간 관리 웹 애플리케이션

## 🎯 프로젝트 개요

Todo Time-blocking 앱은 바쁜 현대인들의 시간 관리를 혁신적으로 개선하는 웹 애플리케이션입니다. 단순히 할 일을 추가하는 것만으로도, 애플리케이션이 Google Calendar의 빈 시간을 분석하여 자동으로 최적의 시간에 할 일을 배치합니다.

### 🌟 핵심 가치 제안

- **🤖 자동 스케줄링**: 할 일만 추가하면 AI가 Google Calendar의 빈 시간을 분석하여 자동 배치
- **📅 시각적 시간 관리**: 캘린더 뷰를 통한 직관적인 시간 블록 관리
- **✂️ 스마트 분할**: 긴 할 일을 적절한 크기로 분할하여 여러 시간대에 배치
- **⚡ 놓친 할 일 재배치**: 시간이 지난 할 일을 자동으로 감지하여 우선순위로 재배치
- **🎨 유연한 조정**: 언제든지 드래그앤드롭으로 일정 수정 가능

## 🎯 타겟 사용자

- 업무와 개인 일정을 체계적으로 관리하고 싶은 직장인
- Google Calendar를 이미 사용 중인 사용자
- 시간 관리에 어려움을 겪는 개인 사용자

## 🚀 주요 기능

### 📝 Todo 관리 시스템
- **직관적인 Todo 입력**: 제목, 소요시간, 카테고리(업무/개인), 우선순위, 태그 등
- **지능적인 상태 관리**: 대기중 → 배치됨 → 진행중 → 완료 자동 전환
- **놓친 할 일 처리**: 30분 여유 시간 후 자동 감지 및 우선순위 부스트

### 📊 스마트 스케줄링 엔진
- **실시간 빈 시간 분석**: Google Calendar와 연동하여 가용 시간 자동 탐지
- **테트리스 방식 배치**: 큰 블록부터 우선 배치하여 시간 효율성 극대화
- **자동 할 일 분할**: 4시간 초과 작업을 여러 시간대로 스마트 분할
- **우선순위 기반 배치**: 데드라인과 중요도를 고려한 최적 배치

### 🎨 직관적인 사용자 인터페이스
- **주간 캘린더 뷰**: 월~금 업무시간(10AM-8PM) 중심의 시각적 스케줄
- **드래그앤드롭**: 마우스로 간편하게 일정 시간/날짜 변경
- **색상 구분**: 카테고리별(업무: 파란색, 개인: 초록색, 놓친 할 일: 주황색)
- **실시간 충돌 감지**: 일정 변경 시 즉시 충돌 확인 및 대안 제시

## 🛠 기술 스택

### Frontend
- **Next.js 14+** - React 기반 풀스택 프레임워크
- **TypeScript** - 타입 안전성과 개발 생산성 향상
- **TailwindCSS** - 유틸리티 우선 CSS 프레임워크
- **React Query/SWR** - 서버 상태 관리 및 캐싱

### Backend
- **Spring Boot 3+** - 자바 기반 엔터프라이즈 애플리케이션 프레임워크
- **Kotlin** - 현대적이고 간결한 JVM 언어
- **Spring Security** - OAuth 2.0 기반 보안
- **Spring Data JPA** - 객체 관계 매핑

### Database & Storage
- **PostgreSQL** - 고성능 관계형 데이터베이스

### External APIs & Authentication
- **Google Calendar API** - 캘린더 데이터 읽기/쓰기
- **Google OAuth 2.0** - 안전한 사용자 인증
- **JWT** - 상태없는 토큰 기반 인증

## 📦 프로젝트 구조

```
gtd/
├── frontend/                 # Next.js 프론트엔드
│   ├── src/
│   │   ├── components/      # 재사용 가능한 UI 컴포넌트
│   │   ├── pages/          # Next.js 페이지
│   │   ├── hooks/          # 커스텀 React 훅
│   │   ├── services/       # API 클라이언트
│   │   ├── types/          # TypeScript 타입 정의
│   │   └── utils/          # 유틸리티 함수
│   ├── public/             # 정적 자산
│   └── package.json
├── backend/                 # Spring Boot 백엔드
│   ├── src/main/kotlin/
│   │   ├── controller/     # REST API 컨트롤러
│   │   ├── service/        # 비즈니스 로직
│   │   ├── repository/     # 데이터 접근 계층
│   │   ├── entity/         # JPA 엔티티
│   │   ├── dto/            # 데이터 전송 객체
│   │   └── config/         # 설정 클래스
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/   # 데이터베이스 마이그레이션
│   └── build.gradle.kts
├── docs/                   # 프로젝트 문서
│   ├── api/               # API 명세서
│   ├── architecture/      # 시스템 아키텍처
│   ├── database/          # 데이터베이스 스키마
│   └── requirements/      # 요구사항 및 기획
└── README.md
```

## 🚦 개발 로드맵

자세한 개발 계획은 [개발 로드맵](/docs/sprint/development-roadmap.md)을 참고하세요.

## 🎬 데모 시나리오

### 기본 사용 플로우
1. 사용자가 Google 계정으로 로그인
2. "새 할 일" 버튼 클릭하여 Todo 추가
3. 제목, 소요시간, 카테고리, 상세설명 입력
4. "일정 자동 배치" 버튼 클릭
5. 애플리케이션이 Google Calendar 빈 시간을 분석하여 최적 시간에 배치
6. 필요시 긴 할 일을 자동으로 분할하여 여러 시간대에 배치
7. 사용자가 할 일 시간에 "시작" 버튼 클릭하여 "진행중" 상태로 변경
8. 작업 완료 후 "완료" 버튼으로 완료 상태 변경

## 📚 문서

- [📋 제품 요구사항 명세서 (PRD)](/docs/requirement/PRD.md)
- [🏗 시스템 아키텍처](/docs/architecture/system-architecture.md)
- [🔌 API 명세서](/docs/api/api-specification.md)
- [🗄 데이터베이스 스키마](/docs/database/database-schema.md)
- [🚀 개발 로드맵](/docs/sprint/development-roadmap.md)
- [🎨 와이어프레임](/docs/requirement/wireframe.md)
- [📐 정책 및 규칙](/docs/requirement/policy.md)
