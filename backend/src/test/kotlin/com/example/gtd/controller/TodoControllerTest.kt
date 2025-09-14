package com.example.gtd.controller

import com.example.gtd.domain.enum.TodoCategory
import com.example.gtd.domain.enum.TodoPriority
import com.example.gtd.domain.enum.TodoStatus
import com.example.gtd.dto.response.TodoResponse
import com.example.gtd.service.TodoService
import com.fasterxml.jackson.databind.ObjectMapper
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import org.springframework.data.domain.*
import org.springframework.data.web.PageableHandlerMethodArgumentResolver
import org.springframework.data.web.config.EnableSpringDataWebSupport
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import java.time.LocalDateTime

@WebMvcTest(TodoController::class)
@ContextConfiguration(classes = [TodoControllerTest.TestConfig::class])
@EnableSpringDataWebSupport
@DisplayName("TodoController - GET /api/v1/todos 통합 테스트")
class TodoControllerTest {

    @TestConfiguration
    @EnableSpringDataWebSupport
    class TestConfig {
        @Bean
        @Primary
        fun todoService(): TodoService = mockk()
    }

    private lateinit var mockMvc: MockMvc
    private lateinit var todoService: TodoService
    private lateinit var objectMapper: ObjectMapper

    private val testUserId = "test-user"
    private lateinit var sampleTodos: List<TodoResponse>

    @BeforeEach
    fun setUp() {
        todoService = mockk()
        objectMapper = ObjectMapper()

        val todoController = TodoController(todoService)
        mockMvc = MockMvcBuilders.standaloneSetup(todoController)
            .setCustomArgumentResolvers(PageableHandlerMethodArgumentResolver())
            .build()

        // 샘플 할일 응답 데이터 생성
        sampleTodos = listOf(
            TodoResponse(
                id = 1L,
                title = "업무 할일 1",
                description = "업무 관련 할일",
                estimatedDuration = 120,
                category = TodoCategory.WORK,
                priority = TodoPriority.HIGH,
                status = TodoStatus.WAITING,
                deadline = LocalDateTime.now().plusDays(3),
                tags = listOf("업무", "긴급"),
                createdAt = LocalDateTime.now().minusHours(1),
                updatedAt = LocalDateTime.now().minusHours(1),
                userId = testUserId
            ),
            TodoResponse(
                id = 2L,
                title = "개인 할일 1",
                description = "개인 관련 할일",
                estimatedDuration = 60,
                category = TodoCategory.PERSONAL,
                priority = TodoPriority.MEDIUM,
                status = TodoStatus.SCHEDULED,
                deadline = null,
                tags = listOf("개인"),
                createdAt = LocalDateTime.now().minusHours(2),
                updatedAt = LocalDateTime.now().minusHours(2),
                userId = testUserId
            )
        )
    }

    @Test
    @DisplayName("기본 할일 목록 조회 성공")
    fun `GET todos should return success response with default parameters`() {
        // given
        val pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))
        val todosPage = PageImpl(sampleTodos, pageable, sampleTodos.size.toLong())

        every {
            todoService.getTodos(testUserId, null, null, null, any())
        } returns todosPage

        // when & then
        mockMvc.perform(get("/api/v1/todos"))
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("할일 목록이 성공적으로 조회되었습니다."))
            .andExpect(jsonPath("$.data.content").isArray)
            .andExpect(jsonPath("$.data.content.length()").value(2))
            .andExpect(jsonPath("$.data.content[0].id").value(1))
            .andExpect(jsonPath("$.data.content[0].title").value("업무 할일 1"))
            .andExpect(jsonPath("$.data.content[0].category").value("WORK"))
            .andExpect(jsonPath("$.data.content[0].priority").value("HIGH"))
            .andExpect(jsonPath("$.data.content[0].status").value("WAITING"))
            .andExpect(jsonPath("$.data.page.number").value(0))
            .andExpect(jsonPath("$.data.page.size").value(20))
            .andExpect(jsonPath("$.data.page.totalElements").value(2))
            .andExpect(jsonPath("$.data.page.totalPages").value(1))

        verify(exactly = 1) {
            todoService.getTodos(testUserId, null, null, null, any())
        }
    }

    @Test
    @DisplayName("상태 필터로 할일 목록 조회")
    fun `GET todos should filter by status parameter`() {
        // given
        val filteredTodos = sampleTodos.filter { it.status == TodoStatus.WAITING }
        val pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))
        val todosPage = PageImpl(filteredTodos, pageable, filteredTodos.size.toLong())

        every {
            todoService.getTodos(testUserId, TodoStatus.WAITING, null, null, any())
        } returns todosPage

        // when & then
        mockMvc.perform(
            get("/api/v1/todos")
                .param("status", "WAITING")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content.length()").value(1))
            .andExpect(jsonPath("$.data.content[0].status").value("WAITING"))

        verify(exactly = 1) {
            todoService.getTodos(testUserId, TodoStatus.WAITING, null, null, any())
        }
    }

    @Test
    @DisplayName("카테고리 필터로 할일 목록 조회")
    fun `GET todos should filter by category parameter`() {
        // given
        val workTodos = sampleTodos.filter { it.category == TodoCategory.WORK }
        val pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))
        val todosPage = PageImpl(workTodos, pageable, workTodos.size.toLong())

        every {
            todoService.getTodos(testUserId, null, TodoCategory.WORK, null, any())
        } returns todosPage

        // when & then
        mockMvc.perform(
            get("/api/v1/todos")
                .param("category", "WORK")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content.length()").value(1))
            .andExpect(jsonPath("$.data.content[0].category").value("WORK"))

        verify(exactly = 1) {
            todoService.getTodos(testUserId, null, TodoCategory.WORK, null, any())
        }
    }

    @Test
    @DisplayName("우선순위 필터로 할일 목록 조회")
    fun `GET todos should filter by priority parameter`() {
        // given
        val highPriorityTodos = sampleTodos.filter { it.priority == TodoPriority.HIGH }
        val pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))
        val todosPage = PageImpl(highPriorityTodos, pageable, highPriorityTodos.size.toLong())

        every {
            todoService.getTodos(testUserId, null, null, TodoPriority.HIGH, any())
        } returns todosPage

        // when & then
        mockMvc.perform(
            get("/api/v1/todos")
                .param("priority", "HIGH")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content.length()").value(1))
            .andExpect(jsonPath("$.data.content[0].priority").value("HIGH"))

        verify(exactly = 1) {
            todoService.getTodos(testUserId, null, null, TodoPriority.HIGH, any())
        }
    }

    @Test
    @DisplayName("복합 필터로 할일 목록 조회")
    fun `GET todos should filter by multiple parameters`() {
        // given
        val filteredTodos = sampleTodos.filter {
            it.category == TodoCategory.WORK && it.priority == TodoPriority.HIGH && it.status == TodoStatus.WAITING
        }
        val pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))
        val todosPage = PageImpl(filteredTodos, pageable, filteredTodos.size.toLong())

        every {
            todoService.getTodos(testUserId, TodoStatus.WAITING, TodoCategory.WORK, TodoPriority.HIGH, any())
        } returns todosPage

        // when & then
        mockMvc.perform(
            get("/api/v1/todos")
                .param("status", "WAITING")
                .param("category", "WORK")
                .param("priority", "HIGH")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content.length()").value(1))

        verify(exactly = 1) {
            todoService.getTodos(testUserId, TodoStatus.WAITING, TodoCategory.WORK, TodoPriority.HIGH, any())
        }
    }

    @Test
    @DisplayName("페이징 파라미터로 할일 목록 조회")
    fun `GET todos should handle paging parameters`() {
        // given
        val page = 1
        val size = 10
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "title"))
        val todosPage = PageImpl(sampleTodos, pageable, 25L) // 총 25개 중 두 번째 페이지

        every {
            todoService.getTodos(testUserId, null, null, null, any())
        } returns todosPage

        // when & then
        mockMvc.perform(
            get("/api/v1/todos")
                .param("page", page.toString())
                .param("size", size.toString())
                .param("sort", "title,asc")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.page.number").value(page))
            .andExpect(jsonPath("$.data.page.size").value(size))
            .andExpect(jsonPath("$.data.page.totalElements").value(25))
            .andExpect(jsonPath("$.data.page.totalPages").value(3))

        verify(exactly = 1) {
            todoService.getTodos(testUserId, null, null, null, any())
        }
    }

    @Test
    @DisplayName("빈 결과 조회 성공")
    fun `GET todos should return empty result successfully`() {
        // given
        val pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))
        val emptyPage = PageImpl<TodoResponse>(emptyList(), pageable, 0)

        every {
            todoService.getTodos(testUserId, null, null, null, any())
        } returns emptyPage

        // when & then
        mockMvc.perform(get("/api/v1/todos"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content").isArray)
            .andExpect(jsonPath("$.data.content.length()").value(0))
            .andExpect(jsonPath("$.data.page.totalElements").value(0))
            .andExpect(jsonPath("$.data.page.totalPages").value(0))

        verify(exactly = 1) {
            todoService.getTodos(testUserId, null, null, null, any())
        }
    }

    @Test
    @DisplayName("잘못된 상태 값으로 요청 시 400 에러")
    fun `GET todos should return 400 for invalid status parameter`() {
        // when & then
        mockMvc.perform(
            get("/api/v1/todos")
                .param("status", "INVALID_STATUS")
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("잘못된 카테고리 값으로 요청 시 400 에러")
    fun `GET todos should return 400 for invalid category parameter`() {
        // when & then
        mockMvc.perform(
            get("/api/v1/todos")
                .param("category", "INVALID_CATEGORY")
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("잘못된 우선순위 값으로 요청 시 400 에러")
    fun `GET todos should return 400 for invalid priority parameter`() {
        // when & then
        mockMvc.perform(
            get("/api/v1/todos")
                .param("priority", "INVALID_PRIORITY")
        )
            .andExpect(status().isBadRequest)
    }
}