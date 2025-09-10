package com.gtd.timeblocking.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.PropertyNamingStrategies
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.web.servlet.config.annotation.EnableWebMvc
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import java.time.ZoneId
import java.util.*

/**
 * Web MVC 관련 설정
 * 
 * JSON 직렬화, 시간대 설정 등을 구성합니다.
 */
@Configuration
@EnableWebMvc
class WebConfig : WebMvcConfigurer {

    @Bean
    @Primary
    fun objectMapper(): ObjectMapper {
        return ObjectMapper().apply {
            registerKotlinModule()
            propertyNamingStrategy = PropertyNamingStrategies.SNAKE_CASE
            setTimeZone(TimeZone.getTimeZone(ZoneId.of("Asia/Seoul")))
        }
    }
}