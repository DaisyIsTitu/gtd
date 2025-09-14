package com.example.gtd.dto.response

import com.example.gtd.domain.enum.TodoCategory
import com.example.gtd.domain.enum.TodoPriority
import com.example.gtd.domain.enum.TodoStatus
import java.time.LocalDateTime

/**
 * 할일 기본 정보 응답 DTO
 * API: GET /api/v1/todos (목록), POST /api/v1/todos (생성)
 */
data class TodoResponse(

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

    /** 생성 일시 */
    val createdAt: LocalDateTime,

    /** 수정 일시 */
    val updatedAt: LocalDateTime,

    /** 사용자 ID (API 명세서 기준) */
    val userId: String
) {
    companion object {
        fun from(todo: com.example.gtd.domain.entity.Todo): TodoResponse {
            return TodoResponse(
                id = todo.id,
                title = todo.title,
                description = todo.description,
                estimatedDuration = todo.estimatedDuration,
                category = todo.category,
                priority = todo.priority,
                status = todo.status,
                deadline = todo.deadline,
                tags = todo.tags.toList(),
                createdAt = todo.createdAt,
                updatedAt = todo.updatedAt,
                userId = todo.user.id
            )
        }
    }
}