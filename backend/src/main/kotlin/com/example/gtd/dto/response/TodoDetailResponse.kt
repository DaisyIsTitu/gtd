package com.example.gtd.dto.response

import com.example.gtd.domain.enum.TodoCategory
import com.example.gtd.domain.enum.TodoPriority
import com.example.gtd.domain.enum.TodoStatus
import java.time.LocalDateTime

/**
 * 할일 상세 정보 응답 DTO
 * API: GET /api/v1/todos/{todoId}
 */
data class TodoDetailResponse(

    /** 할일 고유 식별자 */
    val id: Long,

    /** 할일 제목 */
    val title: String,

    /** 할일 상세 설명 */
    val description: String? = null,

    /** 예상 소요 시간 (분 단위) */
    val estimatedDuration: Int,

    /** 할일 카테고리 */
    val category: TodoCategory,

    /** 우선순위 */
    val priority: TodoPriority,

    /** 할일 상태 */
    val status: TodoStatus,

    /** 마감일 */
    val deadline: LocalDateTime? = null,

    /** 태그 목록 */
    val tags: List<String>,

    /** 관련 스케줄 목록 */
    val schedules: List<TodoScheduleResponse>,

    /** 생성 일시 */
    val createdAt: LocalDateTime,

    /** 수정 일시 */
    val updatedAt: LocalDateTime
) {
    companion object {
        fun from(todo: com.example.gtd.domain.entity.Todo): TodoDetailResponse {
            return TodoDetailResponse(
                id = todo.id,
                title = todo.title,
                description = todo.description,
                estimatedDuration = todo.estimatedDuration,
                category = todo.category,
                priority = todo.priority,
                status = todo.status,
                deadline = todo.deadline,
                tags = todo.tags.toList(),
                schedules = todo.schedules.map { TodoScheduleResponse.from(it) },
                createdAt = todo.createdAt,
                updatedAt = todo.updatedAt
            )
        }
    }
}