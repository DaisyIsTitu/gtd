package com.example.gtd.common.exception

/**
 * 유효성 검증 실패 시 사용하는 예외
 */
class ValidationException(
    errorCode: ErrorCode,
    message: String = "",
    cause: Throwable? = null
) : BusinessException(errorCode, message, cause)