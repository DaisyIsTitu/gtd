# Todo Time-blocking 앱 - 시스템 아키텍처

## 개요
이 문서는 Google Calendar와 연동하여 할 일을 자동으로 스케줄링하는 Todo Time-blocking 웹 애플리케이션의 시스템 아키텍처를 설명합니다.

## 기술 스택
- **프론트엔드**: NextJS + TypeScript
- **백엔드**: Spring Boot + Kotlin  
- **데이터베이스**: PostgreSQL
- **외부 연동**: Google Calendar API
- **인증**: Google OAuth 2.0
- **통신**: REST API (WebSocket/SSE 사용 안함)

## 시스템 아키텍처 다이어그램

```mermaid
graph TB
    subgraph "클라이언트 레이어"
        WEB[("NextJS 프론트엔드<br/>(TypeScript)")]
        subgraph "프론트엔드 컴포넌트"
            CAL["캘린더 인터페이스<br/>(주간 뷰)"]
            TODO["할일 관리<br/>(사이드바)"]
            AUTH["인증<br/>(Google OAuth)"]
        end
    end

    subgraph "애플리케이션 레이어 (Spring Boot + Kotlin)"
        subgraph "핵심 서비스"
            TODOS["할일서비스<br/>(CRUD 작업)"]
            SCHED["스케줄링서비스<br/>(스마트 알고리즘)"]
            GCAL["구글캘린더서비스<br/>(API 연동)"]
            TSA["시간슬롯분석기<br/>(빈 시간 분석)"]
            USR["사용자서비스<br/>(사용자 관리)"]
            STATE["할일상태관리자<br/>(상태 전환)"]
        end
    end

    subgraph "백그라운드 작업"
        CRON["스케줄 작업"]
        MISSED["놓친 할일 탐지<br/>(30분 간격)"]
        SYNC["캘린더 동기화<br/>(주기적)"]
    end

    subgraph "데이터 레이어"
        DB[(PostgreSQL 데이터베이스)]
        subgraph "데이터 엔티티"
            USERS["사용자 테이블"]
            TODOTBL["할일 테이블"]
            SCHEDTBL["할일스케줄링 테이블"]
            SYNCTBL["캘린더동기화 테이블"]
        end
    end

    subgraph "외부 서비스"
        GAPI["Google Calendar API"]
        GAUTH["Google OAuth 2.0"]
    end

    %% 프론트엔드에서 백엔드로 직접 연결
    WEB --> TODOS
    CAL --> SCHED
    TODO --> TODOS
    AUTH --> USR

    %% 서비스 간 상호작용
    SCHED --> TSA
    SCHED --> TODOS
    GCAL --> TSA
    STATE --> TODOS
    TODOS --> DB
    GCAL --> DB
    USR --> DB

    %% 백그라운드 작업
    CRON --> MISSED
    CRON --> SYNC
    MISSED --> STATE
    SYNC --> GCAL

    %% 외부 연동
    AUTH --> GAUTH
    GCAL --> GAPI

    %% 데이터베이스 연결
    TODOS -.-> USERS
    TODOS -.-> TODOTBL
    SCHED -.-> SCHEDTBL
    GCAL -.-> SYNCTBL

    %% 스타일링
    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef database fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef external fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef jobs fill:#fce4ec,stroke:#880e4f,stroke-width:2px

    class WEB,CAL,TODO,AUTH frontend
    class TODOS,SCHED,GCAL,TSA,USR,STATE backend
    class DB,USERS,TODOTBL,SCHEDTBL,SYNCTBL database
    class GAPI,GAUTH external
    class CRON,MISSED,SYNC jobs
```

## 아키텍처 컴포넌트

### 클라이언트 레이어 (NextJS + TypeScript)
- **캘린더 인터페이스**: 드래그앤드롭 기능이 있는 주간 캘린더 뷰
- **할일 관리**: 할일 목록, 필터링, CRUD 작업이 있는 사이드바  
- **인증**: 안전한 로그인을 위한 Google OAuth 연동

### 애플리케이션 레이어 (Spring Boot + Kotlin)
- **할일서비스**: 할일 CRUD 작업 및 생명주기 관리
- **스케줄링서비스**: 스마트 스케줄링 알고리즘 구현
- **구글캘린더서비스**: Google Calendar API 연동 처리
- **시간슬롯분석기**: 사용 가능한 시간 슬롯 및 충돌 분석
- **사용자서비스**: 사용자 프로필 및 환경설정 관리
- **할일상태관리자**: 할일 상태 전환 및 놓친 할일 감지 처리

### 백그라운드 작업
- **놓친 할일 탐지**: 30분마다 실행하여 기한이 지난 할일 식별
- **캘린더 동기화**: Google Calendar와 주기적 동기화

### 데이터 레이어 (PostgreSQL)
- **사용자**: 사용자 프로필 및 Google 계정 연동 정보
- **할일**: 제목, 소요시간, 카테고리, 상태 등 메타데이터를 포함한 할일 항목
- **할일스케줄링**: 예약된 시간 슬롯 및 분할된 할일 관계 정보
- **캘린더동기화**: Google Calendar 동기화 메타데이터

### 외부 서비스
- **Google Calendar API**: 캘린더 데이터 연동
- **Google OAuth 2.0**: 인증 및 권한 부여

## 주요 데이터 플로우

### 1. 할일 생성 & 자동 스케줄링
```
프론트엔드 → POST /api/v1/todos → 할일서비스 → 데이터베이스
프론트엔드 → POST /api/v1/scheduling/auto-schedule → 스케줄링서비스
스케줄링서비스 → 구글캘린더서비스 → 시간슬롯분석기 → 데이터베이스
```

### 2. 캘린더 동기화  
```
백그라운드 작업 → 구글캘린더서비스 → Google Calendar API
Google Calendar API → 데이터베이스 업데이트 → 할일상태관리자
```

### 3. 놓친 할일 탐지
```
스케줄 작업 → 할일상태관리자 → 데이터베이스 쿼리
상태 업데이트 → 우선순위 부스트 → 다음 자동 스케줄링
```

## 품질 특성

- **확장성**: 상태 없는 백엔드 서비스로 수평 확장 가능
- **신뢰성**: 데이터베이스 트랜잭션으로 데이터 일관성 보장
- **보안**: OAuth 2.0 인증과 안전한 API 엔드포인트
- **성능**: 백그라운드 작업으로 무거운 연산 처리
- **유지보수성**: 깔끔한 서비스 분리 및 의존성 주입
- **연동성**: Google Calendar와 원활한 양방향 동기화

## 배포 아키텍처

```mermaid
graph TB
    subgraph "운영 환경"
        CDN["CDN<br/>(정적 자산)"]
        FE["NextJS 앱<br/>(Vercel/클라우드)"]
        
        subgraph "백엔드 클러스터"
            BE1["Spring Boot 인스턴스 1"]
            BE2["Spring Boot 인스턴스 2"]
            BEN["Spring Boot 인스턴스 N"]
        end
        
        DB["PostgreSQL<br/>(관리형 데이터베이스)"]
        
        subgraph "모니터링"
            LOGS["애플리케이션 로그"]
            METRICS["성능 메트릭"]
            ALERTS["알림 시스템"]
        end
    end

    subgraph "외부"
        GOOGLE["Google 서비스<br/>(Calendar API + OAuth)"]
    end

    CDN --> FE
    FE --> BE1
    FE --> BE2
    FE --> BEN
    BE1 --> DB
    BE2 --> DB
    BEN --> DB
    BE1 --> GOOGLE
    BE2 --> GOOGLE
    BEN --> GOOGLE
    
    BE1 --> LOGS
    BE2 --> LOGS
    BEN --> LOGS
    LOGS --> METRICS
    METRICS --> ALERTS

    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef database fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef external fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef infra fill:#f5f5f5,stroke:#616161,stroke-width:2px

    class CDN,FE frontend
    class BE1,BE2,BEN backend
    class DB database
    class GOOGLE external
    class LOGS,METRICS,ALERTS infra
```