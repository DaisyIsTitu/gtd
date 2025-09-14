package com.example.gtd.repository

import com.example.gtd.domain.entity.TodoSchedule
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

/**
 * TodoSchedule 저장소
 *
 * 할일 스케줄 데이터의 CRUD 작업을 담당합니다.
 * Spring Data JPA의 기본 기능을 활용하여 데이터베이스와 상호작용합니다.
 */
@Repository
interface TodoScheduleRepository : JpaRepository<TodoSchedule, Long>