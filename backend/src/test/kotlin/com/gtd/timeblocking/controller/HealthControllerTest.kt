package com.gtd.timeblocking.controller

import com.gtd.timeblocking.dto.ApiResponse
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import org.springframework.boot.info.BuildProperties

/**
 * HealthController 단위 테스트
 */
class HealthControllerTest {

    @Test
    fun `헬스 체크 API가 정상적으로 동작하는지 테스트`() {
        // Given
        val buildProperties: BuildProperties? = null
        val controller = HealthController(buildProperties)
        
        // When
        val response = controller.health()
        
        // Then
        assertEquals(200, response.statusCode.value())
        
        val body = response.body
        assertNotNull(body)
        assertTrue(body!!.success)
        assertEquals("애플리케이션이 정상 작동 중입니다.", body.message)
        
        val healthInfo = body.data
        assertNotNull(healthInfo)
        assertEquals("UP", healthInfo!!.status)
        assertEquals("unknown", healthInfo.version)
        assertEquals("gtd-timeblocking", healthInfo.name)
        assertNotNull(healthInfo.timestamp)
    }
}