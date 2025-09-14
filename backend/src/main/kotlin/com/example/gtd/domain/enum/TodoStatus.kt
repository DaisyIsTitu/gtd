package com.example.gtd.domain.enum

/**
 * 할일 상태 열거형
 * 
 * 상태 전환 흐름:
 * WAITING(대기중) → SCHEDULED(배치됨) → IN_PROGRESS(진행중) → COMPLETED(완료)
 *                            ↓
 *                      MISSED(놓친 할 일)
 */
enum class TodoStatus {
    WAITING,        // 대기중 - 아직 배치되지 않은 상태
    SCHEDULED,      // 배치됨 - 캘린더에 자동 배치된 상태  
    SPLIT,          // 분할됨 - 긴 할 일이 여러 부분으로 나뉜 상태
    IN_PROGRESS,    // 진행중 - 사용자가 "시작" 버튼을 클릭한 상태
    MISSED,         // 놓친 할 일 - 배치된 시간이 종료된 후 30분 경과했지만 시작하지 않은 상태
    COMPLETED       // 완료 - 작업이 완료된 상태
}