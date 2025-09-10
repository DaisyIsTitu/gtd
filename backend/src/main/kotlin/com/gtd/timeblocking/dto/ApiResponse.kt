package com.gtd.timeblocking.dto

import com.fasterxml.jackson.annotation.JsonInclude
import java.time.LocalDateTime

/**
 * API 공통 응답 형식
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
data class ApiResponse<T>(
    val success: Boolean,
    val message: String? = null,
    val data: T? = null,
    val timestamp: LocalDateTime = LocalDateTime.now()
) {
    companion object {
        fun <T> success(data: T, message: String? = null): ApiResponse<T> {
            return ApiResponse(
                success = true,
                message = message,
                data = data
            )
        }

        fun <T> success(message: String): ApiResponse<T> {
            return ApiResponse(
                success = true,
                message = message
            )
        }

        fun <T> error(message: String): ApiResponse<T> {
            return ApiResponse(
                success = false,
                message = message
            )
        }
    }
}