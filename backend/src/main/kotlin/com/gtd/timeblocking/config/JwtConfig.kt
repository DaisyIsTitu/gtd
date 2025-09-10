package com.gtd.timeblocking.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

/**
 * JWT 토큰 관련 설정
 */
@Configuration
@ConfigurationProperties(prefix = "jwt")
data class JwtProperties(
    var secret: String = "",
    var expiration: Long = 86400000L, // 24시간
    var refreshExpiration: Long = 604800000L // 7일
)