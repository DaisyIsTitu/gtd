package com.gtd.timeblocking.exception

import com.gtd.timeblocking.dto.ApiResponse
import jakarta.validation.ConstraintViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.context.request.WebRequest

/**
 * 전역 예외 처리기
 * 
 * 애플리케이션의 모든 예외를 통합적으로 처리합니다.
 */
@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException::class)
    fun handleBusinessException(
        ex: BusinessException,
        request: WebRequest
    ): ResponseEntity<ApiResponse<Any>> {
        val response = ApiResponse.error<Any>(ex.message ?: "비즈니스 로직 오류가 발생했습니다.")
        return ResponseEntity.status(ex.status).body(response)
    }

    @ExceptionHandler(BadCredentialsException::class)
    fun handleBadCredentialsException(
        ex: BadCredentialsException,
        request: WebRequest
    ): ResponseEntity<ApiResponse<Any>> {
        val response = ApiResponse.error<Any>("인증 정보가 올바르지 않습니다.")
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response)
    }

    @ExceptionHandler(AccessDeniedException::class)
    fun handleAccessDeniedException(
        ex: AccessDeniedException,
        request: WebRequest
    ): ResponseEntity<ApiResponse<Any>> {
        val response = ApiResponse.error<Any>("접근 권한이 없습니다.")
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response)
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationException(
        ex: MethodArgumentNotValidException,
        request: WebRequest
    ): ResponseEntity<ApiResponse<Any>> {
        val errors = ex.bindingResult.fieldErrors
            .map { "${it.field}: ${it.defaultMessage}" }
            .joinToString(", ")
        
        val response = ApiResponse.error<Any>("입력값 검증에 실패했습니다: $errors")
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response)
    }

    @ExceptionHandler(ConstraintViolationException::class)
    fun handleConstraintViolationException(
        ex: ConstraintViolationException,
        request: WebRequest
    ): ResponseEntity<ApiResponse<Any>> {
        val errors = ex.constraintViolations
            .map { "${it.propertyPath}: ${it.message}" }
            .joinToString(", ")
        
        val response = ApiResponse.error<Any>("제약 조건 위반: $errors")
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response)
    }

    @ExceptionHandler(Exception::class)
    fun handleGenericException(
        ex: Exception,
        request: WebRequest
    ): ResponseEntity<ApiResponse<Any>> {
        val response = ApiResponse.error<Any>("서버 내부 오류가 발생했습니다.")
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response)
    }
}