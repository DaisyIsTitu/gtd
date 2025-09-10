# Todo Time-blocking 앱

## 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [시작하기](#시작하기)
4. [프로젝트 구조](#프로젝트-구조)
5. [개발 가이드](#개발-가이드)
6. [Sprint 진행 상황](#sprint-진행-상황)

## 프로젝트 개요

Google Calendar와 연동하여 할 일을 자동으로 최적의 시간에 배치하는 스마트 시간 관리 웹 애플리케이션입니다.

### 주요 기능
- 📅 Google Calendar 연동 및 실시간 동기화
- 🤖 AI 기반 자동 스케줄링 알고리즘
- 📋 직관적인 Todo 관리 인터페이스
- 🎯 드래그앤드롭으로 일정 조정
- ⚡ 놓친 할 일 자동 감지 및 재배치
- 📊 카테고리별 우선순위 관리

## 기술 스택

- **Frontend**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Icons**: Heroicons
- **Date Handling**: date-fns

## 시작하기

### 사전 요구사항
- Node.js 18.17.0 이상
- npm 9.0.0 이상

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일을 편집하여 필요한 환경 변수를 설정

# 개발 서버 실행
npm run dev

# 타입 체크
npm run type-check

# 린트 실행
npm run lint

# 코드 포맷팅
npm run format
```

### 환경 변수 설정

`.env.local` 파일에 다음 환경 변수들을 설정해주세요:

```bash
# Google OAuth (Sprint 4에서 필요)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# API 엔드포인트
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

# 개발 단계 설정 (Sprint 1-3)
NEXT_PUBLIC_USE_MOCK_API=true
```

## 프로젝트 구조

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── globals.css        # 전역 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈페이지
├── components/            # React 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   ├── calendar/         # 캘린더 관련 컴포넌트
│   ├── todo/             # Todo 관련 컴포넌트
│   └── layout/           # 레이아웃 컴포넌트
├── lib/                   # 유틸리티 및 설정
├── types/                 # TypeScript 타입 정의
├── hooks/                 # Custom React Hooks
├── store/                 # 상태 관리 (Zustand)
└── constants/             # 상수 정의
```

## 개발 가이드

### Sprint 1 완료 사항 ✅

- [x] S1.F.1 NextJS 13+ 프로젝트 초기 설정
- [x] TypeScript 구성 및 타입 정의
- [x] TailwindCSS 설정 및 커스텀 스타일
- [x] ESLint, Prettier 코드 품질 도구 설정
- [x] 기본 디렉토리 구조 생성
- [x] App Router 기반 레이아웃 설정

### 다음 작업 (Sprint 1 계속)

Sprint 1의 나머지 작업들을 계속 진행해야 합니다:

- [ ] S1.F.5 주간 캘린더 UI 컴포넌트 (정적, 그리드 레이아웃)
- [ ] S1.F.6 Todo 사이드바 UI (목록 표시, 필터)
- [ ] S1.F.7 기본 레이아웃 및 헤더 구성
- [ ] S1.F.8 Mock 데이터 구조 정의
- [ ] S1.F.9 Todo, Calendar Event 타입 정의 (완료)
- [ ] S1.F.10 Mock API 함수 작성 (localStorage 활용)
- [ ] S1.F.11 기본 CRUD 동작 시뮬레이션

### 개발 규칙

1. **컴포넌트 네이밍**: PascalCase 사용
2. **파일 구조**: 기능별 폴더 구조 유지
3. **타입 안전성**: 모든 데이터에 대한 타입 정의 필수
4. **Mock API**: Sprint 1-3 동안 localStorage 기반 Mock API 사용
5. **코드 품질**: 커밋 전 lint 및 type-check 통과 필수

## Sprint 진행 상황

### 🚀 Phase 1: 독립 병렬 개발 (Sprint 1-3, Week 1-6)

**현재: Sprint 1 (Week 1-2) - 프로젝트 기반 구축**

#### 완료된 작업 ✅
- NextJS 13+ 프로젝트 초기 설정
- TypeScript 설정 및 기본 타입 정의
- TailwindCSS 및 개발 도구 설정
- 기본 프로젝트 구조 생성
- App Router 기반 레이아웃 구현

#### 진행 중인 작업 🔄
- 핵심 UI 컴포넌트 개발
- Mock API 설계 및 구현

Sprint 1 목표: Mock API로 동작하는 완전한 UI 애플리케이션 완성
