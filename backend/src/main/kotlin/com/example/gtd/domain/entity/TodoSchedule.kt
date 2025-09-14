package com.example.gtd.domain.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit

/**
 * 할일 스케줄링(TodoSchedule) 엔티티
 *
 * 할일의 실제 스케줄 정보를 저장합니다.
 * Todo와 연결되어 구체적인 시작/종료 시간과 Google Calendar 연동 정보를 관리합니다.
 */
@Entity
@Table(name = "todo_schedules")
class TodoSchedule(

    /** 스케줄 고유 식별자 */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,

    /** 스케줄링된 할일 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "todo_id", nullable = false)
    val todo: Todo,

    /** 시작 시간 */
    @Column(name = "start_time", nullable = false)
    @NotNull
    var startTime: LocalDateTime,

    /** 종료 시간 */
    @Column(name = "end_time", nullable = false)
    @NotNull
    var endTime: LocalDateTime,

    /** 실제 소요 시간 (분 단위) */
    @Column(name = "actual_duration")
    var actualDuration: Int? = null,

    /** 완료 여부 */
    @Column(name = "is_completed", nullable = false)
    var isCompleted: Boolean = false,

    /** Google Calendar에 생성된 이벤트 ID */
    @Column(name = "google_calendar_event_id")
    var googleCalendarEventId: String? = null

) : BaseEntity() {

    init {
        require(startTime.isBefore(endTime)) {
            "시작 시간은 종료 시간보다 이전이어야 합니다. startTime: $startTime, endTime: $endTime"
        }
    }

    /**
     * 예약된 시간 계산 (분 단위)
     */
    fun getDuration(): Long {
        return ChronoUnit.MINUTES.between(startTime, endTime)
    }

    /**
     * 다른 스케줄과 시간 겹침 확인
     */
    fun isOverlapping(other: TodoSchedule): Boolean {
        return !(endTime.isBefore(other.startTime) || other.endTime.isBefore(startTime))
    }

    /**
     * 특정 시간 범위와 겹침 확인
     */
    fun isOverlapping(start: LocalDateTime, end: LocalDateTime): Boolean {
        return !(endTime.isBefore(start) || end.isBefore(startTime))
    }

    /**
     * 수정 가능 여부 확인
     * 현재 시간이 시작 시간 이전이고 완료되지 않은 경우 수정 가능
     */
    fun canBeModified(): Boolean {
        return !isCompleted && LocalDateTime.now().isBefore(startTime)
    }

    /**
     * 진행 중 여부 확인
     * 현재 시간이 시작~종료 시간 사이에 있고 완료되지 않은 경우
     */
    fun isInProgress(): Boolean {
        val now = LocalDateTime.now()
        return !isCompleted && (now.isAfter(startTime) || now.isEqual(startTime)) && now.isBefore(endTime)
    }

    /**
     * 놓친 스케줄 여부 확인
     * 종료 시간이 지났지만 완료되지 않은 경우
     */
    fun isMissed(): Boolean {
        return !isCompleted && LocalDateTime.now().isAfter(endTime)
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is TodoSchedule) return false
        return id != 0L && id == other.id
    }

    override fun hashCode(): Int {
        return javaClass.hashCode()
    }

    override fun toString(): String {
        return "TodoSchedule(id=$id, startTime=$startTime, endTime=$endTime, isCompleted=$isCompleted)"
    }
}