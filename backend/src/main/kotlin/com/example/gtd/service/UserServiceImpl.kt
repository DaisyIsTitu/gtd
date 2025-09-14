package com.example.gtd.service

import com.example.gtd.dto.request.UserUpdateRequest
import com.example.gtd.dto.response.UserResponse
import com.example.gtd.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * 사용자 관리 서비스 구현체
 */
@Service
@Transactional(readOnly = true)
class UserServiceImpl(
    private val userRepository: UserRepository
) : UserService {

    /**
     * 현재 사용자 정보 조회
     * TODO: Implement user profile retrieval logic
     * - userRepository.findById()로 사용자 조회
     * - NotFoundException 처리
     * - UserResponse.from()으로 응답 DTO 변환
     */
    override fun getCurrentUser(userId: String): UserResponse {
        // TODO: Implement getCurrentUser method
        throw NotImplementedError("getCurrentUser method not yet implemented")
    }

    /**
     * 사용자 설정 업데이트
     * TODO: Implement user settings update logic
     * - 사용자 존재 여부 확인
     * - timezone, workStartTime, workEndTime 업데이트
     * - 유효성 검증 (업무 시간 범위 등)
     * - 변경 사항 저장
     * - 업데이트된 정보 반환
     */
    @Transactional
    override fun updateUser(userId: String, request: UserUpdateRequest): UserResponse {
        // TODO: Implement updateUser method
        throw NotImplementedError("updateUser method not yet implemented")
    }
}