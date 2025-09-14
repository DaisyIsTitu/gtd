package com.example.gtd.dto.request

import com.example.gtd.domain.enum.TodoCategory
import com.example.gtd.domain.enum.TodoPriority
import jakarta.validation.constraints.*
import java.time.LocalDateTime

/**
 * 할일 생성 요청 DTO
 * API: POST /api/v1/todos
 */
data class TodoCreateRequest(

    /** 할일 제목 (필수, 최대 200자) */
    @field:NotBlank(message = "제목은 필수 항목입니다.")
    @field:Size(max = 200, message = "제목은 최대 200자까지 입력할 수 있습니다.")
    val title: String,

    /** 할일 상세 설명 (선택사항, 최대 1000자) */
    @field:Size(max = 1000, message = "설명은 최대 1000자까지 입력할 수 있습니다.")
    val description: String? = null,

    /** 예상 소요 시간 (분 단위, 최소 30분) */
    @field:Min(30, message = "소요 시간은 최소 30분 이상이어야 합니다.")
    val estimatedDuration: Int,

    /** 할일 카테고리 (업무/개인) */
    @field:NotNull(message = "카테고리는 필수 항목입니다.")
    val category: TodoCategory,

    /** 우선순위 (높음/보통/낮음, 기본값: 보통) */
    val priority: TodoPriority = TodoPriority.MEDIUM,

    /** 마감일 (선택사항) */
    val deadline: LocalDateTime? = null,

    /** 태그 목록 */
    val tags: List<String> = emptyList()
)