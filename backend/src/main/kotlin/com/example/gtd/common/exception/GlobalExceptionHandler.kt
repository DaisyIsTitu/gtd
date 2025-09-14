package com.example.gtd.common.exception

import com.example.gtd.common.response.ErrorResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

/**
 * 전역 예외 처리를 담당하는 핸들러
 */
@RestControllerAdvice
class GlobalExceptionHandler {

    /**
     * BusinessException 처리
     */
    @ExceptionHandler(BusinessException::class)
    fun handleBusinessException(e: BusinessException): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse.of(e.errorCode, e.message)
        return ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST)
    }

    /**
     * NotFoundException 처리
     */
    @ExceptionHandler(NotFoundException::class)
    fun handleNotFoundException(e: NotFoundException): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse.of(e.errorCode, e.message)
        return ResponseEntity(errorResponse, HttpStatus.NOT_FOUND)
    }

    /**
     * ValidationException 처리
     */
    @ExceptionHandler(ValidationException::class)
    fun handleValidationException(e: ValidationException): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse.of(e.errorCode, e.message)
        return ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST)
    }

    /**
     * Spring Validation 에러 처리 (@Valid 등)
     */
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleMethodArgumentNotValidException(e: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val errorMessage = e.bindingResult.allErrors
            .joinToString(", ") { it.defaultMessage ?: "유효하지 않은 값입니다." }

        val errorResponse = ErrorResponse.of(
            code = "REQ_002",
            message = "유효하지 않은 파라미터 값입니다.",
            details = errorMessage
        )
        return ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST)
    }

    /**
     * IllegalArgumentException 처리
     */
    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgumentException(e: IllegalArgumentException): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse.of(
            code = "REQ_002",
            message = "유효하지 않은 파라미터 값입니다.",
            details = e.message
        )
        return ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST)
    }

    /**
     * 기타 예상하지 못한 예외 처리
     */
    @ExceptionHandler(Exception::class)
    fun handleException(e: Exception): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse.of(
            code = "SYS_003",
            message = "내부 서버 오류가 발생했습니다.",
            details = e.message
        )
        return ResponseEntity(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR)
    }
}