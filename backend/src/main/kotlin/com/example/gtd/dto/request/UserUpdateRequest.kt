package com.example.gtd.dto.request

import jakarta.validation.constraints.NotBlank
import java.time.LocalTime

/**
 * 사용자 설정 업데이트 요청 DTO
 * API: PUT /api/v1/users/me
 */
data class UserUpdateRequest(

    /** 시간대 설정 */
    @field:NotBlank(message = "시간대는 필수 항목입니다.")
    val timezone: String,

    /** 업무 시작 시간 */
    val workStartTime: LocalTime,

    /** 업무 종료 시간 */
    val workEndTime: LocalTime
)