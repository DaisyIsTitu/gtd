package com.example.gtd.common.exception

/**
 * 시스템 전반에서 사용하는 에러 코드 정의
 */
enum class ErrorCode(val code: String, val message: String) {

    // 인증 관련 에러
    AUTH_INVALID_TOKEN("AUTH_001", "유효하지 않은 토큰입니다"),
    AUTH_TOKEN_EXPIRED("AUTH_002", "토큰이 만료되었습니다"),
    AUTH_ACCESS_DENIED("AUTH_003", "접근 권한이 없습니다"),
    AUTH_GOOGLE_OAUTH_FAILED("AUTH_004", "Google OAuth 인증에 실패했습니다"),

    // 요청 관련 에러
    REQ_MISSING_PARAMETER("REQ_001", "필수 파라미터가 누락되었습니다"),
    REQ_INVALID_PARAMETER("REQ_002", "유효하지 않은 파라미터 값입니다"),
    REQ_INVALID_FORMAT("REQ_003", "요청 본문 형식이 올바르지 않습니다"),

    // 비즈니스 로직 에러
    BIZ_TODO_NOT_FOUND("BIZ_001", "할일을 찾을 수 없습니다"),
    BIZ_USER_NOT_FOUND("BIZ_002", "사용자를 찾을 수 없습니다"),
    BIZ_INVALID_STATUS_TRANSITION("BIZ_003", "유효하지 않은 상태 전환입니다"),
    BIZ_SCHEDULING_FAILED("BIZ_004", "스케줄링에 실패했습니다 (가용 시간 부족)"),
    BIZ_GOOGLE_CALENDAR_SYNC_FAILED("BIZ_005", "Google Calendar 동기화에 실패했습니다"),

    // 시스템 에러
    SYS_DATABASE_ERROR("SYS_001", "데이터베이스 오류가 발생했습니다"),
    SYS_EXTERNAL_API_ERROR("SYS_002", "외부 API 호출에 실패했습니다"),
    SYS_INTERNAL_ERROR("SYS_003", "내부 서버 오류가 발생했습니다")
}