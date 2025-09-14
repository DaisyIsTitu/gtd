package com.example.gtd.controller

import com.example.gtd.common.response.ApiResponse
import com.example.gtd.common.response.PageResponse
import com.example.gtd.domain.enum.TodoCategory
import com.example.gtd.domain.enum.TodoPriority
import com.example.gtd.domain.enum.TodoStatus
import com.example.gtd.dto.request.TodoCreateRequest
import com.example.gtd.dto.request.TodoStatusUpdateRequest
import com.example.gtd.dto.request.TodoUpdateRequest
import com.example.gtd.dto.response.TodoDetailResponse
import com.example.gtd.dto.response.TodoResponse
import com.example.gtd.service.TodoService
import jakarta.validation.Valid
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

/**
 * 할일 관리 REST API Controller
 *
 * API 명세서의 Todos 섹션 엔드포인트를 구현합니다.
 * - GET /api/v1/todos : 할일 목록 조회
 * - GET /api/v1/todos/{todoId} : 할일 상세 조회
 * - POST /api/v1/todos : 할일 생성
 * - PUT /api/v1/todos/{todoId} : 할일 수정
 * - DELETE /api/v1/todos/{todoId} : 할일 삭제
 * - PATCH /api/v1/todos/{todoId}/status : 할일 상태 변경
 */
@RestController
@RequestMapping("/api/v1/todos")
class TodoController(
    private val todoService: TodoService
) {

    /**
     * 할일 목록 조회 (필터링 및 페이징 지원)
     * GET /api/v1/todos
     *
     * @param status 상태 필터 (WAITING, SCHEDULED, IN_PROGRESS, MISSED, COMPLETED)
     * @param category 카테고리 필터 (WORK, PERSONAL)
     * @param priority 우선순위 필터 (HIGH, MEDIUM, LOW)
     * @param pageable 페이징 정보 (page, size, sort, direction)
     * @return 필터링된 할일 목록 (페이징)
     */
    @GetMapping
    fun getTodos(
        @RequestParam(required = false) status: TodoStatus?,
        @RequestParam(required = false) category: TodoCategory?,
        @RequestParam(required = false) priority: TodoPriority?,
        @PageableDefault(
            size = 20,
            sort = ["createdAt"],
            direction = Sort.Direction.DESC
        ) pageable: Pageable
    ): ResponseEntity<ApiResponse<PageResponse<TodoResponse>>> {
        // TODO: Spring Security 구현 후 실제 인증된 사용자 ID 추출
        // SecurityContextHolder.getContext().authentication.name 등 사용 예정
        val userId = "test-user" // 임시 하드코딩

        val todosPage = todoService.getTodos(userId, status, category, priority, pageable)
        val pageResponse = PageResponse.of(todosPage)

        return ResponseEntity.ok(
            ApiResponse.success(
                data = pageResponse,
                message = "할일 목록이 성공적으로 조회되었습니다."
            )
        )
    }

    /**
     * 할일 상세 조회
     * GET /api/v1/todos/{todoId}
     *
     * @param todoId 조회할 할일 ID
     * @return 할일 상세 정보 (스케줄 정보 포함)
     */
    @GetMapping("/{todoId}")
    fun getTodoById(
        @PathVariable todoId: Long
    ): ResponseEntity<ApiResponse<TodoDetailResponse>> {
        // TODO: Implement getTodoById endpoint
        // - 인증된 사용자 ID 추출
        // - todoService.getTodoById() 호출
        // - 보안 검증 (사용자별 할일 접근 권한)
        // - ApiResponse 래핑하여 응답
        throw NotImplementedError("getTodoById endpoint not yet implemented")
    }

    /**
     * 새로운 할일 생성
     * POST /api/v1/todos
     *
     * @param request 할일 생성 요청 정보
     * @return 생성된 할일 정보
     */
    @PostMapping
    fun createTodo(
        @Valid @RequestBody request: TodoCreateRequest
    ): ResponseEntity<ApiResponse<TodoResponse>> {
        // TODO: Implement createTodo endpoint
        // - 인증된 사용자 ID 추출
        // - @Valid로 요청 데이터 검증
        // - todoService.createTodo() 호출
        // - 201 Created 상태 코드와 함께 응답
        // - "할일이 성공적으로 생성되었습니다." 메시지 포함
        throw NotImplementedError("createTodo endpoint not yet implemented")
    }

    /**
     * 기존 할일 수정
     * PUT /api/v1/todos/{todoId}
     *
     * @param todoId 수정할 할일 ID
     * @param request 할일 수정 요청 정보
     * @return 수정된 할일 정보
     */
    @PutMapping("/{todoId}")
    fun updateTodo(
        @PathVariable todoId: Long,
        @Valid @RequestBody request: TodoUpdateRequest
    ): ResponseEntity<ApiResponse<TodoResponse>> {
        // TODO: Implement updateTodo endpoint
        // - 인증된 사용자 ID 추출
        // - 사용자 권한 확인 (본인의 할일만 수정 가능)
        // - todoService.updateTodo() 호출
        // - ApiResponse 래핑하여 응답
        throw NotImplementedError("updateTodo endpoint not yet implemented")
    }

    /**
     * 할일 삭제
     * DELETE /api/v1/todos/{todoId}
     *
     * @param todoId 삭제할 할일 ID
     * @return 삭제 완료 메시지
     */
    @DeleteMapping("/{todoId}")
    fun deleteTodo(
        @PathVariable todoId: Long
    ): ResponseEntity<ApiResponse<Void>> {
        // TODO: Implement deleteTodo endpoint
        // - 인증된 사용자 ID 추출
        // - 사용자 권한 확인
        // - todoService.deleteTodo() 호출
        // - 204 No Content 또는 200 OK with success message
        throw NotImplementedError("deleteTodo endpoint not yet implemented")
    }

    /**
     * 할일 상태 변경
     * PATCH /api/v1/todos/{todoId}/status
     *
     * @param todoId 상태를 변경할 할일 ID
     * @param request 상태 변경 요청 정보
     * @return 상태가 변경된 할일 정보
     */
    @PatchMapping("/{todoId}/status")
    fun updateTodoStatus(
        @PathVariable todoId: Long,
        @Valid @RequestBody request: TodoStatusUpdateRequest
    ): ResponseEntity<ApiResponse<TodoResponse>> {
        // TODO: Implement updateTodoStatus endpoint
        // - 인증된 사용자 ID 추출
        // - 사용자 권한 확인
        // - todoService.updateTodoStatus() 호출
        // - 상태 전환 규칙 검증
        // - ApiResponse 래핑하여 응답
        throw NotImplementedError("updateTodoStatus endpoint not yet implemented")
    }

    /**
     * TODO: Add common functionality
     * - 인증된 사용자 ID 추출 헬퍼 메서드
     * - 페이징 응답 변환 헬퍼 메서드
     * - API 문서화를 위한 Swagger 어노테이션
     * - 공통 예외 처리 로직
     */
}