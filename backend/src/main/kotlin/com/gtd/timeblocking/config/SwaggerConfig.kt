package com.gtd.timeblocking.config

import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

/**
 * Swagger/OpenAPI 3.0 설정
 * 
 * API 문서화를 위한 구성입니다.
 */
@Configuration
class SwaggerConfig {

    @Bean
    fun openAPI(): OpenAPI {
        val jwtSchemeName = "JWT"
        val securityRequirement = SecurityRequirement().addList(jwtSchemeName)
        
        val components = Components()
            .addSecuritySchemes(
                jwtSchemeName,
                SecurityScheme()
                    .name(jwtSchemeName)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
            )

        return OpenAPI()
            .components(components)
            .info(
                Info()
                    .title("GTD Time-blocking API")
                    .description("Todo 관리 및 Google Calendar 연동을 위한 REST API")
                    .version("1.0.0")
            )
            .addSecurityItem(securityRequirement)
    }
}