package com.example.gtd.common.exception

/**
 * 비즈니스 로직 예외의 기본 클래스
 */
open class BusinessException(
    val errorCode: ErrorCode,
    message: String = "",
    cause: Throwable? = null
) : RuntimeException(message, cause)