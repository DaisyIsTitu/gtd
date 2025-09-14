package com.example.gtd.common.response

import java.time.LocalDateTime

/**
 * 성공 응답을 위한 래퍼 클래스
 */
data class ApiResponse<T>(
    val success: Boolean = true,
    val data: T,
    val message: String = "요청이 성공적으로 처리되었습니다.",
    val timestamp: LocalDateTime = LocalDateTime.now()
) {
    companion object {
        fun <T> success(data: T, message: String = "요청이 성공적으로 처리되었습니다."): ApiResponse<T> {
            return ApiResponse(
                success = true,
                data = data,
                message = message
            )
        }
    }
}