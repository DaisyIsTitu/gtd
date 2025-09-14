package com.example.gtd.common.response

import com.example.gtd.common.exception.ErrorCode
import java.time.LocalDateTime

/**
 * 에러 응답을 위한 래퍼 클래스
 */
data class ErrorResponse(
    val success: Boolean = false,
    val error: ErrorDetail,
    val timestamp: LocalDateTime = LocalDateTime.now()
) {
    data class ErrorDetail(
        val code: String,
        val message: String,
        val details: String? = null
    )

    companion object {
        fun of(errorCode: ErrorCode, details: String? = null): ErrorResponse {
            return ErrorResponse(
                error = ErrorDetail(
                    code = errorCode.name,
                    message = errorCode.name, // TODO: ErrorCode에서 실제 메시지 가져오기
                    details = details
                )
            )
        }

        fun of(code: String, message: String, details: String? = null): ErrorResponse {
            return ErrorResponse(
                error = ErrorDetail(
                    code = code,
                    message = message,
                    details = details
                )
            )
        }
    }
}