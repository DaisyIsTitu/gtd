package com.gtd.timeblocking.controller

import com.gtd.timeblocking.dto.ApiResponse
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.boot.info.BuildProperties
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDateTime

/**
 * 헬스 체크 컨트롤러
 * 
 * 애플리케이션 상태 확인을 위한 API를 제공합니다.
 */
@Tag(name = "Health", description = "헬스 체크 API")
@RestController
@RequestMapping("/api/v1/health")
class HealthController(
    private val buildProperties: BuildProperties?
) {

    @Operation(summary = "헬스 체크", description = "애플리케이션 상태를 확인합니다.")
    @GetMapping
    fun health(): ResponseEntity<ApiResponse<HealthInfo>> {
        val healthInfo = HealthInfo(
            status = "UP",
            timestamp = LocalDateTime.now(),
            version = buildProperties?.version ?: "unknown",
            name = buildProperties?.name ?: "gtd-timeblocking"
        )
        
        return ResponseEntity.ok(
            ApiResponse.success(healthInfo, "애플리케이션이 정상 작동 중입니다.")
        )
    }
}

/**
 * 헬스 정보 데이터 클래스
 */
data class HealthInfo(
    val status: String,
    val timestamp: LocalDateTime,
    val version: String,
    val name: String
)