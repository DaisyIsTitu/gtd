package com.example.gtd.domain.enum

/**
 * 할일 우선순위 열거형
 * 
 * 우선순위 정렬 시 사용되는 값:
 * HIGH = 1, MEDIUM = 2, LOW = 3
 */
enum class TodoPriority {
    HIGH,       // 높음 - 긴급하고 중요한 할 일
    MEDIUM,     // 보통 - 일반적인 우선순위 (기본값)
    LOW         // 낮음 - 여유가 있을 때 처리하는 할 일
}