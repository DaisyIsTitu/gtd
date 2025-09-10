package com.gtd.timeblocking

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

/**
 * Spring Boot 애플리케이션 통합 테스트
 */
@SpringBootTest
@ActiveProfiles("test")
class GtdTimeblockingApplicationTests {

    @Test
    fun contextLoads() {
        // Spring Context가 정상적으로 로드되는지 테스트
        // 이 테스트가 통과하면 기본적인 애플리케이션 설정이 올바름을 의미
    }
}