package com.example.gtd.common.exception

/**
 * 리소스를 찾을 수 없을 때 사용하는 예외
 */
class NotFoundException(
    errorCode: ErrorCode,
    message: String = "",
    cause: Throwable? = null
) : BusinessException(errorCode, message, cause)