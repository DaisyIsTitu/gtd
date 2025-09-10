package com.gtd.timeblocking.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.domain.AuditorAware
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.security.core.context.SecurityContextHolder
import java.util.*

/**
 * 데이터베이스 관련 설정
 * 
 * JPA, PostgreSQL, 감사(Auditing) 기능 등을 구성합니다.
 */
@Configuration
@EnableJpaRepositories(basePackages = ["com.gtd.timeblocking.repository"])
class DatabaseConfig {

    /**
     * JPA Auditing을 위한 현재 사용자 제공
     */
    @Bean
    fun auditorProvider(): AuditorAware<String> {
        return AuditorAware {
            val authentication = SecurityContextHolder.getContext().authentication
            Optional.ofNullable(authentication?.name ?: "system")
        }
    }
}

/**
 * 데이터베이스 연결 설정 프로퍼티
 */
@ConfigurationProperties(prefix = "spring.datasource")
data class DatabaseProperties(
    var url: String = "",
    var username: String = "",
    var password: String = "",
    var driverClassName: String = "org.postgresql.Driver"
)