package com.example.gtd.repository

import com.example.gtd.domain.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

/**
 * 사용자(User) 리포지토리
 *
 * 사용자 엔티티에 대한 기본 CRUD 작업을 제공합니다.
 */
@Repository
interface UserRepository : JpaRepository<User, String>