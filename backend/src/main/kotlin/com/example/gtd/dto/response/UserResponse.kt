package com.example.gtd.dto.response

import java.time.LocalTime

/**
 * 사용자 정보 응답 DTO
 * API: GET /api/v1/users/me
 */
data class UserResponse(

    /** 사용자 고유 식별자 */
    val id: String,

    /** 이메일 주소 */
    val email: String,

    /** 사용자 이름 */
    val name: String,

    /** 시간대 */
    val timezone: String,

    /** 업무 시작 시간 (HH:mm 형식) */
    val workStartTime: String,

    /** 업무 종료 시간 (HH:mm 형식) */
    val workEndTime: String
) {
    companion object {
        fun from(user: com.example.gtd.domain.entity.User): UserResponse {
            return UserResponse(
                id = user.id,
                email = user.email,
                name = user.name,
                timezone = user.timezone,
                workStartTime = user.workStartTime.toString(),
                workEndTime = user.workEndTime.toString()
            )
        }
    }
}