# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🏗️ Project Overview

This is a **Todo Time-blocking** application that automatically schedules tasks by integrating with Google Calendar. It's a full-stack application with a Next.js frontend and Spring Boot + Kotlin backend.

## 🛠️ Development Commands

### Frontend (Next.js + TypeScript)
```bash
cd frontend

# Development
npm run dev                 # Start development server on port 3005
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint
npm run type-check         # TypeScript type checking
npm run format             # Format code with Prettier
npm run format:check       # Check formatting

# Testing (Playwright E2E)
npm run test:e2e           # Run E2E tests headless
npm run test:e2e:ui        # Run E2E tests with UI
npm run test:e2e:debug     # Run E2E tests in debug mode
npm run test:e2e:report    # Show test report
```

### Backend (Spring Boot + Kotlin)
```bash
cd backend

# Development
./gradlew bootRun --args='--spring.profiles.active=local'   # Start development server
./gradlew build                                             # Build application
./gradlew test                                              # Run all tests
./gradlew test --tests ClassName                           # Run specific test class
./gradlew jacocoTestReport                                  # Generate test coverage report

# Database (PostgreSQL via Docker)
cd ../infra && docker-compose up -d postgres               # Start PostgreSQL
docker-compose exec postgres psql -U postgres -d gtd_backend # Connect to DB
```

## 🏛️ Architecture Overview

### Frontend Architecture
- **Framework**: Next.js 14+ with App Router
- **State Management**: Zustand stores (`todoStore`, `uiStore`)
- **Styling**: TailwindCSS with custom components
- **Form Handling**: React Hook Form with Zod validation
- **API Layer**: Mock API service (`mockApi.ts`) for development, designed to switch to real backend later

**Key Frontend Concepts:**
- **Smart Scheduling**: Core logic in `schedulingService.ts` that mimics tetris-style time block placement
- **Drag & Drop**: Calendar allows dragging todos from sidebar to time slots
- **State Management**: Todo states flow: `WAITING` → `SCHEDULED` → `IN_PROGRESS` → `COMPLETED`/`MISSED`
- **Auto-splitting**: Long todos (>4 hours) are automatically split across multiple time slots

### Backend Architecture
- **Framework**: Spring Boot 3.x with Kotlin
- **Database**: PostgreSQL with JPA/Hibernate
- **Architecture**: Standard layered architecture (Controller → Service → Repository → Entity)

**Key Backend Concepts:**
- **Todo Entity**: Core business entity with complex state management and splitting capabilities
- **TodoSchedule Entity**: Represents actual calendar time slots for todos
- **Scheduling Engine**: Business logic for automatic time placement and conflict resolution
- **Status Transitions**: Automatic state changes based on time (e.g., missed todos)

### Domain Model Relationships
```
User 1:N Todo 1:N TodoSchedule
     ↑              ↑
     └── UserSettings
Todo 1:N Todo (parent-child for splits)
TodoSchedule N:1 Todo
```

## 📁 Project Structure

### Frontend Structure
```
frontend/src/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── ui/                # Generic UI components
│   ├── calendar/          # Calendar-specific components
│   └── todo/              # Todo management components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and services
├── store/                 # Zustand state management
├── types/                 # TypeScript type definitions
└── constants/             # App constants
```

### Backend Structure
```
backend/src/main/kotlin/com/example/gtd/
├── controller/            # REST API controllers
├── service/               # Business logic layer
├── repository/            # Data access layer
├── domain/
│   ├── entity/           # JPA entities
│   └── enum/             # Domain enums
├── dto/
│   ├── request/          # API request DTOs
│   └── response/         # API response DTOs
└── common/               # Shared utilities and exceptions
```

## 🎯 Key Business Logic

### Todo Scheduling System
The application implements a "tetris-style" scheduling algorithm:

1. **Availability Detection**: Scans Google Calendar for free time slots
2. **Priority-Based Placement**: Places high-priority and deadline-sensitive todos first
3. **Auto-Splitting**: Breaks down long todos (>4 hours) into manageable chunks
4. **Conflict Resolution**: Automatically resolves scheduling conflicts and suggests alternatives
5. **Missed Todo Handling**: Automatically detects missed todos and boosts their priority

### State Management Flow
- **Frontend**: Zustand stores manage UI state and todo data with optimistic updates
- **Backend**: JPA entities with business logic methods handle state transitions
- **Synchronization**: Mock API layer simulates real backend behavior for development

## 🔧 Configuration

### Environment Variables
- **Frontend**: Copy `.env.local.example` to `.env.local` and configure:
  - `NEXT_PUBLIC_API_BASE_URL`: Backend API endpoint
  - `NEXT_PUBLIC_USE_MOCK_API`: Set to `true` for development with mock data
  - Google OAuth settings (for future sprints)

- **Backend**: Configure `application.yml`:
  - PostgreSQL connection settings
  - JPA/Hibernate configuration
  - Logging levels for development

### Development Mode
- Frontend runs on port **3005** (not default 3000)
- Backend runs on port **8080**
- PostgreSQL runs on port **5432** via Docker Compose in `infra/` directory
- E2E tests are configured to run against localhost:3005

## 🧪 Testing Strategy

### Frontend Testing
- **E2E Tests**: Comprehensive Playwright tests covering user workflows
- **Test Structure**: Sprint-based test organization (`s2-f5-todo-crud.spec.ts`, etc.)
- **Mock Data**: Rich mock data scenarios for testing different states

### Backend Testing
- **Unit Tests**: Service layer testing with MockK for Kotlin
- **Integration Tests**: Repository and controller testing
- **Test Database**: Separate test database configuration

## 🚀 Development Workflow

### Sprint Organization
The project follows a sprint-based development approach:
- **Sprint 1-3**: Frontend development with mock API
- **Sprint 4+**: Backend integration with Google Calendar API

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/sprint-X-feature`: Feature development branches

### Code Style
- **Frontend**: ESLint + Prettier with TypeScript strict mode
- **Backend**: Kotlin coding conventions with ktlint
- **Commits**: Conventional commit format (`feat:`, `fix:`, `docs:`, etc.)

## 🔗 External Integrations

### Planned Integrations
- **Google Calendar API**: For reading/writing calendar events
- **Google OAuth 2.0**: For user authentication
- **JWT**: For stateless authentication between frontend and backend

### Mock Development
The application is designed to work with mock data during early development phases, with a clear migration path to real APIs.