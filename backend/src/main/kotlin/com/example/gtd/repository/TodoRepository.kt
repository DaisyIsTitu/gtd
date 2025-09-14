package com.example.gtd.repository

import com.example.gtd.domain.entity.Todo
import com.example.gtd.domain.enum.TodoCategory
import com.example.gtd.domain.enum.TodoPriority
import com.example.gtd.domain.enum.TodoStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface TodoRepository : JpaRepository<Todo, Long> {

    /**
     * 사용자별 할일 조회 (페이징)
     */
    fun findByUserId(userId: String, pageable: Pageable): Page<Todo>

    /**
     * 사용자 + 상태별 할일 조회 (페이징)
     */
    fun findByUserIdAndStatus(userId: String, status: TodoStatus, pageable: Pageable): Page<Todo>

    /**
     * 사용자 + 카테고리별 할일 조회 (페이징)
     */
    fun findByUserIdAndCategory(userId: String, category: TodoCategory, pageable: Pageable): Page<Todo>

    /**
     * 사용자 + 우선순위별 할일 조회 (페이징)
     */
    fun findByUserIdAndPriority(userId: String, priority: TodoPriority, pageable: Pageable): Page<Todo>

    /**
     * 사용자 + 상태 + 카테고리별 할일 조회 (페이징)
     */
    fun findByUserIdAndStatusAndCategory(
        userId: String,
        status: TodoStatus,
        category: TodoCategory,
        pageable: Pageable
    ): Page<Todo>

    /**
     * 사용자별 특정 할일 조회 (보안을 위한 사용자 검증 포함)
     */
    fun findByUserIdAndId(userId: String, id: Long): Optional<Todo>

    /**
     * 사용자별 놓친 할일 조회
     */
    fun findByUserIdAndStatusOrderByDeadlineAsc(userId: String, status: TodoStatus): List<Todo>

    /**
     * 복합 조건으로 할일 조회 (Dynamic Query)
     * 실제 구현은 Service에서 Specification 또는 QueryDSL 사용 예정
     */
    @Query("""
        SELECT t FROM Todo t
        WHERE t.user.id = :userId
        AND (:status IS NULL OR t.status = :status)
        AND (:category IS NULL OR t.category = :category)
        AND (:priority IS NULL OR t.priority = :priority)
    """)
    fun findTodosWithFilters(
        @Param("userId") userId: String,
        @Param("status") status: TodoStatus?,
        @Param("category") category: TodoCategory?,
        @Param("priority") priority: TodoPriority?,
        pageable: Pageable
    ): Page<Todo>
}