package com.example.gtd.service

import com.example.gtd.domain.enum.TodoCategory
import com.example.gtd.domain.enum.TodoPriority
import com.example.gtd.domain.enum.TodoStatus
import com.example.gtd.dto.request.TodoCreateRequest
import com.example.gtd.dto.request.TodoStatusUpdateRequest
import com.example.gtd.dto.request.TodoUpdateRequest
import com.example.gtd.dto.response.TodoDetailResponse
import com.example.gtd.dto.response.TodoResponse
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable

/**
 * 할일 관리 서비스 인터페이스
 *
 * 할일의 CRUD 작업, 상태 관리, 필터링 등의 핵심 비즈니스 로직을 제공합니다.
 * API 명세서의 Todos 섹션에 해당하는 모든 기능을 구현합니다.
 */
interface TodoService {

    /**
     * 할일 목록 조회 (필터링 및 페이징 지원)
     *
     * @param userId 조회할 사용자 ID
     * @param status 상태 필터 (선택사항)
     * @param category 카테고리 필터 (선택사항)
     * @param priority 우선순위 필터 (선택사항)
     * @param pageable 페이징 정보 (page, size, sort)
     * @return 페이징된 할일 목록
     */
    fun getTodos(
        userId: String,
        status: TodoStatus?,
        category: TodoCategory?,
        priority: TodoPriority?,
        pageable: Pageable
    ): Page<TodoResponse>

    /**
     * 할일 상세 조회
     *
     * @param userId 조회할 사용자 ID (보안 검증용)
     * @param todoId 조회할 할일 ID
     * @return 할일 상세 정보 (스케줄 정보 포함)
     * @throws NotFoundException 할일을 찾을 수 없는 경우
     * @throws AccessDeniedException 다른 사용자의 할일에 접근하는 경우
     */
    fun getTodoById(userId: String, todoId: Long): TodoDetailResponse

    /**
     * 새로운 할일 생성
     *
     * @param userId 할일을 생성할 사용자 ID
     * @param request 할일 생성 요청 정보
     * @return 생성된 할일 정보
     * @throws ValidationException 요청 데이터가 유효하지 않은 경우
     * @throws NotFoundException 사용자를 찾을 수 없는 경우
     */
    fun createTodo(userId: String, request: TodoCreateRequest): TodoResponse

    /**
     * 기존 할일 수정
     *
     * @param userId 할일을 수정할 사용자 ID (보안 검증용)
     * @param todoId 수정할 할일 ID
     * @param request 할일 수정 요청 정보
     * @return 수정된 할일 정보
     * @throws NotFoundException 할일을 찾을 수 없는 경우
     * @throws AccessDeniedException 다른 사용자의 할일을 수정하려는 경우
     * @throws ValidationException 요청 데이터가 유효하지 않은 경우
     */
    fun updateTodo(userId: String, todoId: Long, request: TodoUpdateRequest): TodoResponse

    /**
     * 할일 삭제
     *
     * @param userId 할일을 삭제할 사용자 ID (보안 검증용)
     * @param todoId 삭제할 할일 ID
     * @throws NotFoundException 할일을 찾을 수 없는 경우
     * @throws AccessDeniedException 다른 사용자의 할일을 삭제하려는 경우
     * @throws BusinessException 삭제할 수 없는 상태인 경우 (예: 진행중인 할일)
     */
    fun deleteTodo(userId: String, todoId: Long)

    /**
     * 할일 상태 변경
     *
     * 상태 전환 규칙:
     * - WAITING → SCHEDULED, IN_PROGRESS, COMPLETED
     * - SCHEDULED → IN_PROGRESS, COMPLETED, MISSED
     * - IN_PROGRESS → COMPLETED, SCHEDULED
     * - MISSED → WAITING, SCHEDULED
     *
     * @param userId 할일 소유자 사용자 ID (보안 검증용)
     * @param todoId 상태를 변경할 할일 ID
     * @param request 상태 변경 요청 정보
     * @return 상태가 변경된 할일 정보
     * @throws NotFoundException 할일을 찾을 수 없는 경우
     * @throws AccessDeniedException 다른 사용자의 할일 상태를 변경하려는 경우
     * @throws BusinessException 유효하지 않은 상태 전환인 경우
     */
    fun updateTodoStatus(userId: String, todoId: Long, request: TodoStatusUpdateRequest): TodoResponse
}