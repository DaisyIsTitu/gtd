package com.example.gtd.service

import com.example.gtd.dto.request.UserUpdateRequest
import com.example.gtd.dto.response.UserResponse

/**
 * 사용자 관리 서비스 인터페이스
 *
 * 사용자 정보 조회 및 설정 업데이트 기능을 제공합니다.
 * API 명세서의 Users 섹션에 해당하는 비즈니스 로직을 처리합니다.
 */
interface UserService {

    /**
     * 현재 사용자 정보 조회
     *
     * @param userId 조회할 사용자 ID
     * @return 사용자 정보 응답 DTO
     * @throws NotFoundException 사용자를 찾을 수 없는 경우
     */
    fun getCurrentUser(userId: String): UserResponse

    /**
     * 사용자 설정 업데이트
     *
     * @param userId 업데이트할 사용자 ID
     * @param request 업데이트 요청 정보 (timezone, workStartTime, workEndTime)
     * @return 업데이트된 사용자 정보 응답 DTO
     * @throws NotFoundException 사용자를 찾을 수 없는 경우
     * @throws ValidationException 요청 데이터가 유효하지 않은 경우
     */
    fun updateUser(userId: String, request: UserUpdateRequest): UserResponse
}