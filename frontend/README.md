# Todo Time-blocking 앱 개발 환경

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

## 기술 스택

### 핵심 프레임워크
- **Next.js 14+**: App Router를 사용한 React 기반 풀스택 웹 프레임워크
- **TypeScript**: 타입 안전성을 위한 정적 타입 검사 언어
- **React 18**: 최신 React 기능 (Concurrent Features, Suspense 등)

### 스타일링 & UI
- **Tailwind CSS**: 유틸리티 우선 CSS 프레임워크
- **@tailwindcss/forms**: 폼 요소 스타일링 플러그인
- **@tailwindcss/typography**: 타이포그래피 스타일링 플러그인
- **Heroicons**: React용 SVG 아이콘 라이브러리
- **clsx**: 조건부 CSS 클래스 결합 유틸리티

### 상태 관리 & 폼
- **Zustand**: 가벼운 상태 관리 라이브러리
- **React Hook Form**: 성능 최적화된 폼 라이브러리
- **Zod**: TypeScript 우선 스키마 검증 라이브러리
- **@hookform/resolvers**: React Hook Form과 Zod 통합

### 유틸리티
- **date-fns**: 모던 JavaScript 날짜 유틸리티 라이브러리

### 개발 도구
- **ESLint**: JavaScript/TypeScript 코드 품질 검사
- **Prettier**: 코드 포맷터
- **prettier-plugin-tailwindcss**: Tailwind CSS 클래스 자동 정렬

## 프로젝트 구조

```
src/
├── app/                    # Next.js 14+ App Router
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
