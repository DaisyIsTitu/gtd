package com.example.gtd.dto.response

import java.time.LocalDateTime

/**
 * 할일 스케줄 정보 응답 DTO
 * API: GET /api/v1/todos/{todoId} (상세 조회 시 포함)
 */
data class TodoScheduleResponse(

    /** 스케줄 고유 식별자 */
    val id: Long,

    /** 시작 시간 */
    val startTime: LocalDateTime,

    /** 종료 시간 */
    val endTime: LocalDateTime,

    /** 분할 순서 (분할된 경우) */
    val splitIndex: Int? = null,

    /** 전체 분할 개수 (분할된 경우) */
    val splitTotal: Int? = null
) {
    companion object {
        fun from(schedule: com.example.gtd.domain.entity.TodoSchedule): TodoScheduleResponse {
            return TodoScheduleResponse(
                id = schedule.id,
                startTime = schedule.startTime,
                endTime = schedule.endTime,
                splitIndex = schedule.todo.splitIndex,
                splitTotal = schedule.todo.splitTotal
            )
        }
    }
}