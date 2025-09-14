package com.example.gtd.service

import com.example.gtd.domain.enum.TodoCategory
import com.example.gtd.domain.enum.TodoPriority
import com.example.gtd.domain.enum.TodoStatus
import com.example.gtd.dto.request.TodoCreateRequest
import com.example.gtd.dto.request.TodoStatusUpdateRequest
import com.example.gtd.dto.request.TodoUpdateRequest
import com.example.gtd.dto.response.TodoDetailResponse
import com.example.gtd.dto.response.TodoResponse
import com.example.gtd.repository.TodoRepository
import com.example.gtd.repository.UserRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * 할일 관리 서비스 구현체
 */
@Service
@Transactional(readOnly = true)
class TodoServiceImpl(
    private val todoRepository: TodoRepository,
    private val userRepository: UserRepository
) : TodoService {

    /**
     * 할일 목록 조회 (필터링 및 페이징 지원)
     */
    override fun getTodos(
        userId: String,
        status: TodoStatus?,
        category: TodoCategory?,
        priority: TodoPriority?,
        pageable: Pageable
    ): Page<TodoResponse> {
        // 복합 필터링을 지원하는 동적 쿼리를 사용
        val todosPage = todoRepository.findTodosWithFilters(
            userId = userId,
            status = status,
            category = category,
            priority = priority,
            pageable = pageable
        )

        // Page<Todo>를 Page<TodoResponse>로 변환
        return todosPage.map { todo -> TodoResponse.from(todo) }
    }

    /**
     * 할일 상세 조회
     *
     * 사용자 권한을 검증하고, 스케줄 정보를 포함한 할일의 상세 정보를 조회합니다.
     *
     * @param userId 조회할 사용자 ID (보안 검증용)
     * @param todoId 조회할 할일 ID
     * @return 할일 상세 정보 (스케줄 정보 포함)
     * @throws NotFoundException 할일을 찾을 수 없는 경우
     */
    override fun getTodoById(userId: String, todoId: Long): TodoDetailResponse {
        // 사용자 권한 확인과 함께 할일 조회
        val todo = todoRepository.findByUserIdAndId(userId, todoId)
            .orElseThrow {
                com.example.gtd.common.exception.NotFoundException(
                    com.example.gtd.common.exception.ErrorCode.BIZ_TODO_NOT_FOUND,
                    "ID가 $todoId 인 할일을 찾을 수 없습니다."
                )
            }

        // 스케줄 정보를 포함한 상세 응답으로 변환
        return TodoDetailResponse.from(todo)
    }

    /**
     * 새로운 할일 생성
     * TODO: Implement todo creation logic
     * - User 존재 여부 확인
     * - Todo 엔티티 생성 및 연관관계 설정
     * - 기본 상태는 WAITING으로 설정
     * - 저장 후 응답 DTO 반환
     */
    @Transactional
    override fun createTodo(userId: String, request: TodoCreateRequest): TodoResponse {
        // TODO: Implement createTodo method
        throw NotImplementedError("createTodo method not yet implemented")
    }

    /**
     * 기존 할일 수정
     * TODO: Implement todo update logic
     * - 사용자 권한 확인 (findByUserIdAndId)
     * - 업데이트 가능한 상태인지 확인
     * - 필드별 업데이트 수행
     * - 변경 사항 저장 및 응답 반환
     */
    @Transactional
    override fun updateTodo(userId: String, todoId: Long, request: TodoUpdateRequest): TodoResponse {
        // TODO: Implement updateTodo method
        throw NotImplementedError("updateTodo method not yet implemented")
    }

    /**
     * 할일 삭제
     * TODO: Implement todo deletion with business rules
     * - 사용자 권한 확인
     * - 삭제 가능한 상태인지 확인 (진행중인 할일은 삭제 불가 등)
     * - 관련 스케줄도 함께 삭제 (Cascade)
     * - 삭제 수행
     */
    @Transactional
    override fun deleteTodo(userId: String, todoId: Long) {
        // TODO: Implement deleteTodo method
        throw NotImplementedError("deleteTodo method not yet implemented")
    }

    /**
     * 할일 상태 변경
     * TODO: Implement status transition with business rules
     * - 사용자 권한 확인
     * - 유효한 상태 전환인지 검증
     * - 상태 변경에 따른 부가 로직 처리 (시작/완료 시간 기록 등)
     * - 변경 사항 저장 및 응답 반환
     */
    @Transactional
    override fun updateTodoStatus(userId: String, todoId: Long, request: TodoStatusUpdateRequest): TodoResponse {
        // TODO: Implement updateTodoStatus method
        // Validate state transitions according to business rules
        throw NotImplementedError("updateTodoStatus method not yet implemented")
    }

    /**
     * TODO: Add private helper methods
     * - validateStatusTransition(currentStatus, newStatus): Boolean
     * - isUserOwnerOfTodo(userId, todoId): Boolean
     * - canDeleteTodo(todo): Boolean
     * - etc.
     */
}