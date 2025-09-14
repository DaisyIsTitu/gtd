package com.example.gtd.service

import com.example.gtd.common.exception.ErrorCode
import com.example.gtd.common.exception.NotFoundException
import com.example.gtd.domain.entity.Todo
import com.example.gtd.domain.entity.User
import com.example.gtd.domain.enum.TodoCategory
import com.example.gtd.domain.enum.TodoPriority
import com.example.gtd.domain.enum.TodoStatus
import com.example.gtd.dto.response.TodoResponse
import com.example.gtd.repository.TodoRepository
import com.example.gtd.repository.UserRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.data.domain.*
import org.assertj.core.api.Assertions.*
import java.time.LocalDateTime
import java.util.Optional

@DisplayName("TodoService - 할일 목록 조회 테스트")
class TodoServiceImplTest {

    private lateinit var todoService: TodoService
    private lateinit var todoRepository: TodoRepository
    private lateinit var userRepository: UserRepository

    private lateinit var testUser: User
    private lateinit var testTodos: List<Todo>
    private val testUserId = "test-user"

    @BeforeEach
    fun setUp() {
        todoRepository = mockk()
        userRepository = mockk()
        todoService = TodoServiceImpl(todoRepository, userRepository)

        // 테스트 사용자 생성
        testUser = User(
            id = testUserId,
            email = "test@example.com",
            name = "Test User",
            googleId = "google-123"
        )

        // 테스트 할일 데이터 생성
        testTodos = listOf(
            Todo(
                id = 1L,
                user = testUser,
                title = "업무 할일 1",
                description = "업무 관련 할일",
                estimatedDuration = 120,
                category = TodoCategory.WORK,
                priority = TodoPriority.HIGH,
                status = TodoStatus.WAITING
            ),
            Todo(
                id = 2L,
                user = testUser,
                title = "개인 할일 1",
                description = "개인 관련 할일",
                estimatedDuration = 60,
                category = TodoCategory.PERSONAL,
                priority = TodoPriority.MEDIUM,
                status = TodoStatus.SCHEDULED
            ),
            Todo(
                id = 3L,
                user = testUser,
                title = "업무 할일 2",
                description = "긴급 업무",
                estimatedDuration = 90,
                category = TodoCategory.WORK,
                priority = TodoPriority.HIGH,
                status = TodoStatus.IN_PROGRESS
            )
        )
    }

    @Test
    @DisplayName("필터링 없이 모든 할일 조회")
    fun `getTodos should return all todos when no filters applied`() {
        // given
        val pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))
        val todosPage = PageImpl(testTodos, pageable, testTodos.size.toLong())

        every {
            todoRepository.findTodosWithFilters(testUserId, null, null, null, pageable)
        } returns todosPage

        // when
        val result = todoService.getTodos(testUserId, null, null, null, pageable)

        // then
        assertThat(result.content).hasSize(3)
        assertThat(result.content[0].title).isEqualTo("업무 할일 1")
        assertThat(result.content[1].title).isEqualTo("개인 할일 1")
        assertThat(result.content[2].title).isEqualTo("업무 할일 2")
        assertThat(result.totalElements).isEqualTo(3)

        verify(exactly = 1) {
            todoRepository.findTodosWithFilters(testUserId, null, null, null, pageable)
        }
    }

    @Test
    @DisplayName("상태 필터로 할일 조회")
    fun `getTodos should filter todos by status`() {
        // given
        val pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))
        val filteredTodos = testTodos.filter { it.status == TodoStatus.WAITING }
        val todosPage = PageImpl(filteredTodos, pageable, filteredTodos.size.toLong())

        every {
            todoRepository.findTodosWithFilters(testUserId, TodoStatus.WAITING, null, null, pageable)
        } returns todosPage

        // when
        val result = todoService.getTodos(testUserId, TodoStatus.WAITING, null, null, pageable)

        // then
        assertThat(result.content).hasSize(1)
        assertThat(result.content[0].status).isEqualTo(TodoStatus.WAITING)
        assertThat(result.content[0].title).isEqualTo("업무 할일 1")

        verify(exactly = 1) {
            todoRepository.findTodosWithFilters(testUserId, TodoStatus.WAITING, null, null, pageable)
        }
    }

    @Test
    @DisplayName("카테고리 필터로 할일 조회")
    fun `getTodos should filter todos by category`() {
        // given
        val pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))
        val workTodos = testTodos.filter { it.category == TodoCategory.WORK }
        val todosPage = PageImpl(workTodos, pageable, workTodos.size.toLong())

        every {
            todoRepository.findTodosWithFilters(testUserId, null, TodoCategory.WORK, null, pageable)
        } returns todosPage

        // when
        val result = todoService.getTodos(testUserId, null, TodoCategory.WORK, null, pageable)

        // then
        assertThat(result.content).hasSize(2)
        assertThat(result.content.all { it.category == TodoCategory.WORK }).isTrue()

        verify(exactly = 1) {
            todoRepository.findTodosWithFilters(testUserId, null, TodoCategory.WORK, null, pageable)
        }
    }

    @Test
    @DisplayName("우선순위 필터로 할일 조회")
    fun `getTodos should filter todos by priority`() {
        // given
        val pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))
        val highPriorityTodos = testTodos.filter { it.priority == TodoPriority.HIGH }
        val todosPage = PageImpl(highPriorityTodos, pageable, highPriorityTodos.size.toLong())

        every {
            todoRepository.findTodosWithFilters(testUserId, null, null, TodoPriority.HIGH, pageable)
        } returns todosPage

        // when
        val result = todoService.getTodos(testUserId, null, null, TodoPriority.HIGH, pageable)

        // then
        assertThat(result.content).hasSize(2)
        assertThat(result.content.all { it.priority == TodoPriority.HIGH }).isTrue()

        verify(exactly = 1) {
            todoRepository.findTodosWithFilters(testUserId, null, null, TodoPriority.HIGH, pageable)
        }
    }

    @Test
    @DisplayName("복합 필터로 할일 조회")
    fun `getTodos should filter todos by multiple criteria`() {
        // given
        val pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))
        val filteredTodos = testTodos.filter {
            it.category == TodoCategory.WORK && it.priority == TodoPriority.HIGH && it.status == TodoStatus.WAITING
        }
        val todosPage = PageImpl(filteredTodos, pageable, filteredTodos.size.toLong())

        every {
            todoRepository.findTodosWithFilters(
                testUserId,
                TodoStatus.WAITING,
                TodoCategory.WORK,
                TodoPriority.HIGH,
                pageable
            )
        } returns todosPage

        // when
        val result = todoService.getTodos(
            testUserId,
            TodoStatus.WAITING,
            TodoCategory.WORK,
            TodoPriority.HIGH,
            pageable
        )

        // then
        assertThat(result.content).hasSize(1)
        assertThat(result.content[0].title).isEqualTo("업무 할일 1")
        assertThat(result.content[0].category).isEqualTo(TodoCategory.WORK)
        assertThat(result.content[0].priority).isEqualTo(TodoPriority.HIGH)
        assertThat(result.content[0].status).isEqualTo(TodoStatus.WAITING)

        verify(exactly = 1) {
            todoRepository.findTodosWithFilters(
                testUserId,
                TodoStatus.WAITING,
                TodoCategory.WORK,
                TodoPriority.HIGH,
                pageable
            )
        }
    }

    @Test
    @DisplayName("빈 결과 페이지 처리")
    fun `getTodos should return empty page when no todos found`() {
        // given
        val pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))
        val emptyPage = PageImpl<Todo>(emptyList(), pageable, 0)

        every {
            todoRepository.findTodosWithFilters(testUserId, null, null, null, pageable)
        } returns emptyPage

        // when
        val result = todoService.getTodos(testUserId, null, null, null, pageable)

        // then
        assertThat(result.content).isEmpty()
        assertThat(result.totalElements).isEqualTo(0)
        assertThat(result.totalPages).isEqualTo(0)
        assertThat(result.isEmpty).isTrue()
    }

    @Test
    @DisplayName("페이징 정보 확인")
    fun `getTodos should return correct paging information`() {
        // given
        val pageable = PageRequest.of(1, 2, Sort.by(Sort.Direction.DESC, "createdAt"))
        val todosPage = PageImpl(testTodos.subList(2, 3), pageable, testTodos.size.toLong())

        every {
            todoRepository.findTodosWithFilters(testUserId, null, null, null, pageable)
        } returns todosPage

        // when
        val result = todoService.getTodos(testUserId, null, null, null, pageable)

        // then
        assertThat(result.number).isEqualTo(1) // 현재 페이지
        assertThat(result.size).isEqualTo(2) // 페이지 크기
        assertThat(result.totalElements).isEqualTo(3) // 전체 요소 수
        assertThat(result.totalPages).isEqualTo(2) // 전체 페이지 수
        assertThat(result.content).hasSize(1) // 현재 페이지의 요소 수
    }

    @Test
    @DisplayName("할일 상세 조회 - 성공")
    fun `getTodoById should return todo detail when todo exists and user has access`() {
        // given
        val todoId = 1L
        val testTodo = testTodos[0] // "업무 할일 1"

        every {
            todoRepository.findByUserIdAndId(testUserId, todoId)
        } returns Optional.of(testTodo)

        // when
        val result = todoService.getTodoById(testUserId, todoId)

        // then
        assertThat(result.id).isEqualTo(todoId)
        assertThat(result.title).isEqualTo("업무 할일 1")
        assertThat(result.description).isEqualTo("업무 관련 할일")
        assertThat(result.estimatedDuration).isEqualTo(120)
        assertThat(result.category).isEqualTo(TodoCategory.WORK)
        assertThat(result.priority).isEqualTo(TodoPriority.HIGH)
        assertThat(result.status).isEqualTo(TodoStatus.WAITING)

        verify(exactly = 1) {
            todoRepository.findByUserIdAndId(testUserId, todoId)
        }
    }

    @Test
    @DisplayName("할일 상세 조회 - 할일이 존재하지 않는 경우")
    fun `getTodoById should throw NotFoundException when todo does not exist`() {
        // given
        val todoId = 999L

        every {
            todoRepository.findByUserIdAndId(testUserId, todoId)
        } returns Optional.empty()

        // when & then
        val exception = assertThrows<NotFoundException> {
            todoService.getTodoById(testUserId, todoId)
        }

        assertThat(exception.errorCode).isEqualTo(ErrorCode.BIZ_TODO_NOT_FOUND)
        assertThat(exception.message).isEqualTo("ID가 $todoId 인 할일을 찾을 수 없습니다.")

        verify(exactly = 1) {
            todoRepository.findByUserIdAndId(testUserId, todoId)
        }
    }

    @Test
    @DisplayName("할일 상세 조회 - 다른 사용자의 할일에 접근하는 경우")
    fun `getTodoById should throw NotFoundException when user tries to access other user's todo`() {
        // given
        val todoId = 1L
        val otherUserId = "other-user"

        every {
            todoRepository.findByUserIdAndId(otherUserId, todoId)
        } returns Optional.empty()

        // when & then
        val exception = assertThrows<NotFoundException> {
            todoService.getTodoById(otherUserId, todoId)
        }

        assertThat(exception.errorCode).isEqualTo(ErrorCode.BIZ_TODO_NOT_FOUND)
        assertThat(exception.message).isEqualTo("ID가 $todoId 인 할일을 찾을 수 없습니다.")

        verify(exactly = 1) {
            todoRepository.findByUserIdAndId(otherUserId, todoId)
        }
    }
}