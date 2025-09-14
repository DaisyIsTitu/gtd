package com.example.gtd.controller

import com.example.gtd.common.response.ApiResponse
import com.example.gtd.dto.request.UserUpdateRequest
import com.example.gtd.dto.response.UserResponse
import com.example.gtd.service.UserService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

/**
 * 사용자 관리 REST API Controller
 *
 * API 명세서의 Users 섹션 엔드포인트를 구현합니다.
 * - GET /api/v1/users/me : 사용자 프로필 조회
 * - PUT /api/v1/users/me : 사용자 설정 업데이트
 */
@RestController
@RequestMapping("/api/v1/users")
class UserController(
    private val userService: UserService
) {

    /**
     * 사용자 프로필 조회
     * GET /api/v1/users/me
     *
     * @return 현재 로그인한 사용자의 프로필 정보
     */
    @GetMapping("/me")
    fun getCurrentUser(): ResponseEntity<ApiResponse<UserResponse>> {
        // TODO: Implement getCurrentUser endpoint
        // - 인증된 사용자 ID 추출 (Security Context 또는 JWT에서)
        // - userService.getCurrentUser() 호출
        // - ApiResponse 래핑하여 응답
        throw NotImplementedError("getCurrentUser endpoint not yet implemented")
    }

    /**
     * 사용자 설정 업데이트
     * PUT /api/v1/users/me
     *
     * @param request 업데이트할 사용자 설정 정보
     * @return 업데이트된 사용자 프로필 정보
     */
    @PutMapping("/me")
    fun updateUser(
        @Valid @RequestBody request: UserUpdateRequest
    ): ResponseEntity<ApiResponse<UserResponse>> {
        // TODO: Implement updateUser endpoint
        // - 인증된 사용자 ID 추출
        // - @Valid로 요청 데이터 검증
        // - userService.updateUser() 호출
        // - 성공 메시지와 함께 ApiResponse 응답
        throw NotImplementedError("updateUser endpoint not yet implemented")
    }

    /**
     * TODO: Add authentication and authorization logic
     * - JWT 토큰에서 사용자 ID 추출하는 헬퍼 메서드
     * - 공통 예외 처리 (@ExceptionHandler)
     * - API 문서화를 위한 Swagger 어노테이션
     */
}