package com.example.gtd.dto.request

import com.example.gtd.domain.enum.TodoStatus
import jakarta.validation.constraints.NotNull

/**
 * 할일 상태 변경 요청 DTO
 * API: PATCH /api/v1/todos/{todoId}/status
 */
data class TodoStatusUpdateRequest(

    /** 변경할 상태 */
    @field:NotNull(message = "상태는 필수 항목입니다.")
    val status: TodoStatus
)