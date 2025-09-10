package com.gtd.timeblocking

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaAuditing

/**
 * GTD Time-blocking 애플리케이션 메인 클래스
 * 
 * Spring Boot 3+ 기반 Kotlin 애플리케이션으로
 * Todo 관리 및 Google Calendar 연동 기능을 제공합니다.
 */
@SpringBootApplication
@EnableJpaAuditing
class GtdTimeblockingApplication

fun main(args: Array<String>) {
    runApplication<GtdTimeblockingApplication>(*args)
}