package com.example.gtd.domain.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
import java.time.LocalDateTime
import java.time.LocalTime

/**
 * 사용자(User) 엔티티
 *
 * Google OAuth를 통해 인증된 사용자의 정보를 저장하며, Google Calendar 연동에 필요한 토큰 정보와
 * 사용자별 업무 시간 설정을 관리합니다.
 */
@Entity
@Table(name = "users")
class User(

    /** 사용자 고유 식별자 (UUID 등) */
    @Id
    @Column(name = "id", length = 255)
    val id: String,

    /** 이메일 주소 (Google 계정) */
    @Column(name = "email", nullable = false, unique = true)
    @Email
    @NotBlank
    var email: String,

    /** 사용자 이름 */
    @Column(name = "name", nullable = false)
    @NotBlank
    var name: String,

    /** Google OAuth ID */
    @Column(name = "google_id", nullable = false, unique = true)
    @NotBlank
    var googleId: String,

    /** Google API 액세스 토큰 (암호화되어 저장) */
    @Column(name = "access_token", columnDefinition = "TEXT")
    var accessToken: String? = null,

    /** 리프레시 토큰 (암호화되어 저장) */
    @Column(name = "refresh_token", columnDefinition = "TEXT")
    var refreshToken: String? = null,

    /** 토큰 만료 시간 */
    @Column(name = "token_expires_at")
    var tokenExpiresAt: LocalDateTime? = null,

    /** 시간대 (기본값: Asia/Seoul) */
    @Column(name = "timezone", nullable = false, length = 50)
    var timezone: String = "Asia/Seoul",

    /** 업무 시작 시간 (기본값: 10:00) */
    @Column(name = "work_start_time", nullable = false)
    var workStartTime: LocalTime = LocalTime.of(10, 0),

    /** 업무 종료 시간 (기본값: 20:00) */
    @Column(name = "work_end_time", nullable = false)
    var workEndTime: LocalTime = LocalTime.of(20, 0),

    /** 마지막 로그인 시간 */
    @Column(name = "last_login_at")
    var lastLoginAt: LocalDateTime? = null

) : BaseEntity() {

    /** 사용자가 생성한 할일 목록 */
    @OneToMany(mappedBy = "user", cascade = [CascadeType.ALL], orphanRemoval = true)
    val todos: MutableList<Todo> = mutableListOf()

    // 비즈니스 로직 메서드들
    fun updateLastLogin() {
        lastLoginAt = LocalDateTime.now()
    }

    fun updateTokens(accessToken: String?, refreshToken: String?, expiresAt: LocalDateTime?) {
        this.accessToken = accessToken
        this.refreshToken = refreshToken
        this.tokenExpiresAt = expiresAt
    }

    fun isTokenExpired(): Boolean {
        return tokenExpiresAt?.isBefore(LocalDateTime.now()) ?: true
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is User) return false
        return id == other.id
    }

    override fun hashCode(): Int {
        return id.hashCode()
    }

    override fun toString(): String {
        return "User(id='$id', email='$email', name='$name')"
    }
}