package com.gtd.timeblocking.exception

import org.springframework.http.HttpStatus

/**
 * 비즈니스 로직 예외
 * 
 * 애플리케이션의 비즈니스 로직에서 발생하는 예외를 나타냅니다.
 */
open class BusinessException(
    message: String,
    val status: HttpStatus = HttpStatus.BAD_REQUEST
) : RuntimeException(message)

/**
 * 리소스를 찾을 수 없는 경우의 예외
 */
class ResourceNotFoundException(
    message: String
) : BusinessException(message, HttpStatus.NOT_FOUND)

/**
 * 권한이 없는 경우의 예외
 */
class UnauthorizedException(
    message: String
) : BusinessException(message, HttpStatus.UNAUTHORIZED)

/**
 * 중복 리소스가 있는 경우의 예외
 */
class DuplicateResourceException(
    message: String
) : BusinessException(message, HttpStatus.CONFLICT)