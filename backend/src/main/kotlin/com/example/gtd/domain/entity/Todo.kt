package com.example.gtd.domain.entity

import com.example.gtd.domain.enum.TodoCategory
import com.example.gtd.domain.enum.TodoPriority
import com.example.gtd.domain.enum.TodoStatus
import jakarta.persistence.*
import jakarta.validation.constraints.*
import java.time.LocalDateTime

/**
 * 할일(Todo) 엔티티
 * 
 * 사용자가 생성한 할일 정보를 저장하며, 스마트 스케줄링 시스템의 핵심 엔티티입니다.
 * Google Calendar와 연동하여 자동 배치되고, 분할 기능을 통해 긴 할일을 여러 시간대에 나누어 처리할 수 있습니다.
 */
@Entity
@Table(name = "todos")
class Todo(
    
    /** 할일 고유 식별자 */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,
    
    /** 할일을 소유한 사용자 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,
    
    /** 할일 제목 (최대 200자) */
    @Column(name = "title", nullable = false, length = 200)
    @NotBlank
    @Size(max = 200)
    var title: String,
    
    /** 할일 상세 설명 */
    @Column(name = "description")
    var description: String? = null,
    
    /** 예상 소요 시간 (분 단위, 최소 30분) */
    @Column(name = "estimated_duration", nullable = false)
    @Min(30)
    var estimatedDuration: Int,
    
    /** 실제 소요 시간 (분 단위) */
    @Column(name = "actual_duration")
    var actualDuration: Int? = null,
    
    /** 할일 카테고리 (업무/개인) */
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    var category: TodoCategory,
    
    /** 우선순위 (높음/보통/낮음, 기본값: 보통) */
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    var priority: TodoPriority = TodoPriority.MEDIUM,
    
    /** 할일 상태 (대기중/배치됨/진행중/완료/놓친할일, 기본값: 대기중) */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: TodoStatus = TodoStatus.WAITING,
    
    /** 마감일 (선택사항) */
    @Column(name = "deadline")
    var deadline: LocalDateTime? = null,
    
    /** 
     * 태그 목록 (다중 태그 지원)
     * 
     * @ElementCollection: 기본 타입(String, Integer 등)이나 Embeddable 타입의 컬렉션을 매핑할 때 사용
     * - 별도의 엔티티 클래스 없이 간단한 값들의 컬렉션을 저장
     * - 자동으로 별도 테이블(todo_tags)을 생성하여 1:N 관계로 저장
     * - 부모 엔티티(Todo)의 라이프사이클에 따라 자동 관리 (CASCADE 적용)
     * 
     * @CollectionTable: 컬렉션 저장용 테이블의 이름과 조인 컬럼 설정
     * - name = "todo_tags": 태그 저장용 테이블명
     * - joinColumns: 부모 테이블(todos)과의 조인 컬럼 (todo_id)
     * 
     * 결과적으로 todo_tags 테이블 구조:
     * - todo_id (BIGINT, FK) : todos.id 참조
     * - tag (VARCHAR) : 실제 태그 값
     */
    @ElementCollection
    @CollectionTable(name = "todo_tags", joinColumns = [JoinColumn(name = "todo_id")])
    @Column(name = "tag")
    var tags: MutableList<String> = mutableListOf(),
    
    /** 분할된 할일 여부 */
    @Column(name = "is_split", nullable = false)
    var isSplit: Boolean = false,
    
    /** 부모 할일 (분할된 경우 원본 할일) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_todo_id")
    var parentTodo: Todo? = null,
    
    /** 분할 순서 (1, 2, 3, ...) */
    @Column(name = "split_index")
    var splitIndex: Int? = null,
    
    /** 전체 분할 개수 */
    @Column(name = "split_total")
    var splitTotal: Int? = null,
    
    /** 놓친 할일에 대한 우선순위 부스트 (+1 혜택, 기본값: 0) */
    @Column(name = "priority_boost", nullable = false)
    var priorityBoost: Int = 0

) : BaseEntity() {
    
    @OneToMany(mappedBy = "parentTodo", cascade = [CascadeType.ALL], orphanRemoval = true)
    val childTodos: MutableList<Todo> = mutableListOf()
    
    // 비즈니스 로직 메서드들
    fun addChildTodo(childTodo: Todo) {
        childTodos.add(childTodo)
        childTodo.parentTodo = this
        childTodo.isSplit = true
    }
    
    fun removeChildTodo(childTodo: Todo) {
        childTodos.remove(childTodo)
        childTodo.parentTodo = null
        childTodo.isSplit = false
    }
    
    fun isCompleted(): Boolean = status == TodoStatus.COMPLETED
    
    fun isMissed(): Boolean = status == TodoStatus.MISSED
    
    fun canBeStarted(): Boolean = status in listOf(TodoStatus.SCHEDULED, TodoStatus.WAITING)
    
    fun canBeCompleted(): Boolean = status in listOf(TodoStatus.IN_PROGRESS, TodoStatus.SCHEDULED)
    
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Todo) return false
        return id != 0L && id == other.id
    }
    
    override fun hashCode(): Int {
        return javaClass.hashCode()
    }
    
    override fun toString(): String {
        return "Todo(id=$id, title='$title', status=$status, category=$category)"
    }
}