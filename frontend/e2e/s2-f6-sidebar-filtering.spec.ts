import { test, expect } from '@playwright/test';

/**
 * S2.F.6: 사이드바 필터링 및 정렬 E2E 테스트 작성
 * 실제 Mock 데이터를 활용한 필터링, 정렬, 검색 기능 검증
 */
test.describe('S2.F.6: Sidebar Filtering and Sorting (Happy Cases)', () => {
  test.beforeEach(async ({ page }) => {
    // 페이지 로드 시 Mock 데이터가 자동으로 로드됨
    await page.goto('/');

    // Mock 데이터 로드 대기 (할일 목록이 보일 때까지)
    await page.waitForLoadState('networkidle');
  });

  test('카테고리 필터링: 업무 카테고리만 표시', async ({ page }) => {
    // 🎯 CRITICAL FIX: 데이터 로딩 완료까지 기다리기
    // Direct store injection이 완료되고 TodoSidebar가 데이터를 받을 때까지 대기
    await page.waitForTimeout(2000); // 데이터 로딩 및 재렌더링 완료 대기

    // Given: 다양한 카테고리의 할 일들이 모두 표시되어 있음 (실제 Mock 데이터 기준)
    await expect(page.getByRole('heading', { name: '프로젝트 미팅' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '운동하기' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '개인 프로젝트' })).toBeVisible();

    // When: 필터 패널 확장 후 업무 카테고리 필터 선택
    await page.locator('[data-testid="filter-expand-button"]').click();

    // 🎯 CRITICAL FIX: 필터 버튼이 완전히 렌더링되고 안정화될 때까지 대기
    const workFilter = page.locator('[data-testid="category-filter-WORK"]');
    await expect(workFilter).toBeVisible({ timeout: 10000 });
    await workFilter.waitFor({ state: 'attached' });
    await workFilter.click();

    // Then: 업무 카테고리 할 일만 표시됨 (실제 Mock 데이터의 WORK 카테고리)
    await expect(page.getByRole('heading', { name: '프로젝트 미팅' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: '긴급 버그 수정' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: '코드 리뷰' }).first()).toBeVisible();

    // Then: 다른 카테고리 할 일은 숨겨짐
    await expect(page.getByRole('heading', { name: '운동하기' })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: '개인 프로젝트' })).not.toBeVisible();
  });

  test('카테고리 필터링: 개인 카테고리만 표시', async ({ page }) => {
    // When: 필터 패널 확장 후 개인 카테고리 필터 선택
    await page.locator('[data-testid="filter-expand-button"]').click();
    const personalFilter = page.locator('[data-testid="category-filter-PERSONAL"]');
    await personalFilter.click();

    // Then: 개인 카테고리 할 일만 표시됨 (실제 Mock 데이터의 PERSONAL 카테고리)
    await expect(page.getByRole('heading', { name: '개인 프로젝트' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: '세금 신고' }).first()).toBeVisible();

    // Then: 업무 카테고리 할 일은 숨겨짐
    await expect(page.getByRole('heading', { name: '프로젝트 미팅' })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: '긴급 버그 수정' })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: '코드 리뷰' })).not.toBeVisible();
  });

  test('카테고리 필터링: 전체 표시로 복원', async ({ page }) => {
    // Given: 업무 필터가 적용된 상태
    await page.locator('[data-testid="filter-expand-button"]').click();
    const workFilter = page.locator('[data-testid="category-filter-WORK"]');
    await workFilter.click();

    // 업무 할 일만 표시되는지 확인
    await expect(page.getByRole('heading', { name: '운동하기' })).not.toBeVisible();

    // When: 필터 해제 (같은 필터 버튼을 다시 클릭)
    await workFilter.click();

    // Then: 모든 할 일이 다시 표시됨
    await expect(page.getByRole('heading', { name: '프로젝트 미팅' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: '운동하기' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: '개인 프로젝트' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: '긴급 버그 수정' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'TypeScript 공부' }).first()).toBeVisible();
  });

  test('우선순위 정렬: 높은 순서대로 정렬', async ({ page }) => {
    // When: 필터 패널 확장
    await page.locator('[data-testid="filter-expand-button"]').click();

    // When: 정렬 탭으로 이동
    await page.locator('[data-testid="sort-tab"]').click();

    // 우선순위 내림차순 정렬 선택
    await page.locator('[data-testid="sort-option-priority-desc"]').click();

    // Debug: Check if any todo items exist
    const todoItems = page.locator('[data-testid="todo-item"]');
    const todoCount = await todoItems.count();
    console.log(`Debug: Found ${todoCount} todo items`);

    // Debug: Log all visible todo titles
    if (todoCount > 0) {
      console.log('Debug: All todos in order:');
      for (let i = 0; i < todoCount; i++) {
        const todoItem = todoItems.nth(i);
        const titleElement = todoItem.getByRole('heading').first();
        try {
          const title = await titleElement.textContent();
          console.log(`Debug: Todo ${i + 1}: ${title}`);
        } catch (e) {
          console.log(`Debug: Todo ${i + 1}: Could not get title`);
        }
      }
    } else {
      console.log('Debug: No todo items found!');
    }

    // Then: 높은 우선순위 할 일이 먼저 표시됨
    const firstTodo = todoItems.first();

    // 정렬이 완료될 때까지 잠시 대기
    await page.waitForTimeout(1000);

    // URGENT 우선순위 할 일이 첫 번째에 있어야 함 (긴급 버그 수정이 더 최근 생성)
    await expect(firstTodo.getByText('긴급 버그 수정')).toBeVisible();
  });

  test('제목 정렬: 알파벳 순서대로 정렬', async ({ page }) => {
    // When: 필터 패널 확장
    await page.locator('[data-testid="filter-expand-button"]').click();

    // When: 정렬 탭으로 이동
    await page.locator('[data-testid="sort-tab"]').click();

    // 제목 오름차순 정렬 선택
    await page.locator('[data-testid="sort-option-title-asc"]').click();

    // Then: 제목 순서대로 정렬됨 (가나다 순)
    const todoItems = page.locator('[data-testid="todo-item"]');
    const firstTodo = todoItems.first();

    // 정렬이 완료될 때까지 잠시 대기
    await page.waitForTimeout(1000);

    // 가나다 순으로 첫 번째에 올 할 일 확인
    await expect(firstTodo.getByText('개인 프로젝트')).toBeVisible();
  });

  test('생성일 정렬: 최신 순서대로 정렬', async ({ page }) => {
    // When: 필터 패널 확장
    await page.locator('[data-testid="filter-expand-button"]').click();

    // When: 정렬 탭으로 이동
    await page.locator('[data-testid="sort-tab"]').click();

    // 생성일 내림차순 정렬 선택
    await page.locator('[data-testid="sort-option-created-desc"]').click();

    // Then: 최신 할 일이 먼저 표시됨
    const todoItems = page.locator('[data-testid="todo-item"]');
    const firstTodo = todoItems.first();

    // 정렬이 완료될 때까지 잠시 대기
    await page.waitForTimeout(1000);

    // 마지막에 생성된 할 일이 첫 번째에 표시되어야 함 (독서 시간이 가장 최신: 2024-12-13)
    await expect(firstTodo.getByText('독서 시간')).toBeVisible();
  });

  test('검색 기능: 제목으로 할 일 검색', async ({ page }) => {
    // When: 검색 입력창에 검색어 입력
    const searchInput = page.getByPlaceholder('할 일 검색').or(
      page.locator('[data-testid="search-input"]')
    ).or(
      page.locator('input[type="search"]')
    );

    await searchInput.fill('프로젝트');

    // Then: 검색어가 포함된 할 일만 표시됨
    await expect(page.getByRole('heading', { name: '프로젝트 미팅' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: '개인 프로젝트' }).first()).toBeVisible();

    // Then: 검색어가 포함되지 않은 할 일은 숨겨짐
    await expect(page.getByRole('heading', { name: '운동하기' })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'TypeScript 공부' })).not.toBeVisible();
  });

  test('검색 기능: 상세설명으로 할 일 검색', async ({ page }) => {
    // When: 상세설명에 포함된 단어로 검색
    const searchInput = page.getByPlaceholder('할 일 검색').or(
      page.locator('[data-testid="search-input"]')
    );

    await searchInput.fill('헬스장');

    // Then: 상세설명에 검색어가 포함된 할 일이 표시됨
    await expect(page.getByRole('heading', { name: '운동하기' }).first()).toBeVisible();

    // Then: 다른 할 일들은 숨겨짐
    await expect(page.getByRole('heading', { name: '프로젝트 미팅' })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'TypeScript 공부' })).not.toBeVisible();
  });

  test('검색 초기화: 검색어 삭제 시 전체 목록 복원', async ({ page }) => {
    // Given: 검색이 적용된 상태
    const searchInput = page.getByPlaceholder('할 일 검색').or(
      page.locator('[data-testid="search-input"]')
    );

    await searchInput.fill('프로젝트');
    await expect(page.getByRole('heading', { name: '프로젝트 미팅' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: '운동하기' })).not.toBeVisible();

    // When: 검색어 삭제
    await searchInput.clear();

    // Then: 모든 할 일이 다시 표시됨
    await expect(page.getByRole('heading', { name: '프로젝트 미팅' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: '운동하기' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'TypeScript 공부' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: '개인 프로젝트' }).first()).toBeVisible();
  });

  test('복합 필터링: 카테고리 + 우선순위 조합', async ({ page }) => {
    // When: 필터 패널 확장 후 업무 카테고리 선택
    await page.locator('[data-testid="filter-expand-button"]').click();
    const workFilter = page.locator('[data-testid="category-filter-WORK"]');
    await workFilter.click();

    // When: 정렬 탭으로 이동 및 우선순위 정렬 적용
    await page.locator('[data-testid="sort-tab"]').click();
    await page.locator('[data-testid="sort-option-priority-desc"]').click();

    // Then: 업무 카테고리 중에서 우선순위 순으로 표시됨
    await expect(page.getByRole('heading', { name: '긴급 버그 수정' }).first()).toBeVisible(); // URGENT
    await expect(page.getByRole('heading', { name: '프로젝트 미팅' }).first()).toBeVisible(); // HIGH
    await expect(page.getByRole('heading', { name: '코드 리뷰' }).first()).toBeVisible(); // HIGH

    // Then: 다른 카테고리는 여전히 숨겨져 있음
    await expect(page.getByRole('heading', { name: '운동하기' })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: '개인 프로젝트' })).not.toBeVisible();
  });

  test('복합 필터링: 검색 + 카테고리 조합', async ({ page }) => {
    // When: 검색어 입력 ('버그' 검색)
    const searchInput = page.getByPlaceholder('할 일 검색').or(
      page.locator('[data-testid="search-input"]')
    );
    await searchInput.fill('버그');

    // When: 필터 패널 확장 후 업무 카테고리 선택
    await page.locator('[data-testid="filter-expand-button"]').click();
    const workFilter = page.locator('[data-testid="category-filter-WORK"]');
    await workFilter.click();

    // Then: 검색어가 포함되고 업무 카테고리인 할 일만 표시됨
    await expect(page.getByRole('heading', { name: '긴급 버그 수정' }).first()).toBeVisible(); // 검색어 '버그' + 업무 카테고리

    // Then: 조건에 맞지 않는 할 일들은 숨겨짐
    await expect(page.getByRole('heading', { name: '운동하기' })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: '개인 프로젝트' })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: '프로젝트 미팅' })).not.toBeVisible();
  });

  test('필터 상태 표시: 활성화된 필터 시각적 확인', async ({ page }) => {
    // When: 필터 패널 확장 후 업무 카테고리 필터 활성화
    await page.locator('[data-testid="filter-expand-button"]').click();
    const workFilter = page.locator('[data-testid="category-filter-WORK"]');
    await workFilter.click();

    // Then: 활성화된 필터가 시각적으로 구분됨 (색상 클래스 확인)
    await expect(workFilter).toHaveClass(/bg-blue-100|text-blue-800/);

    // When: 필터 해제 (같은 버튼 다시 클릭)
    await workFilter.click();

    // Then: 필터가 비활성화됨
    await expect(workFilter).toHaveClass(/bg-gray-50|text-gray-600/);
  });
});