package com.example.gtd.common.response

import org.springframework.data.domain.Page

/**
 * 페이징 처리된 응답을 위한 래퍼 클래스
 */
data class PageResponse<T>(
    val content: List<T>,
    val page: PageInfo
) {
    data class PageInfo(
        val number: Int,
        val size: Int,
        val totalElements: Long,
        val totalPages: Int,
        val first: Boolean,
        val last: Boolean
    )

    companion object {
        fun <T> of(page: Page<T>): PageResponse<T> {
            return PageResponse(
                content = page.content,
                page = PageInfo(
                    number = page.number,
                    size = page.size,
                    totalElements = page.totalElements,
                    totalPages = page.totalPages,
                    first = page.isFirst,
                    last = page.isLast
                )
            )
        }
    }
}