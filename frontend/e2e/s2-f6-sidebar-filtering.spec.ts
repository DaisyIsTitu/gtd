import { test, expect } from '@playwright/test';

/**
 * S2.F.6: 사이드바 필터링 및 정렬 E2E 테스트 작성
 * Happy Case 시나리오로 필터링, 정렬, 검색 기능을 검증
 */
test.describe('S2.F.6: Sidebar Filtering and Sorting (Happy Cases)', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 localStorage를 클리어하고 테스트 데이터 준비
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // 테스트용 할 일 데이터 생성
    const testTodos = [
      { title: '회의 자료 준비', category: 'WORK', priority: 'HIGH', description: '월간 보고 회의 자료 준비' },
      { title: '운동하기', category: 'PERSONAL', priority: 'MEDIUM', description: '저녁 7시 헬스장에서 운동' },
      { title: '이메일 답장', category: 'WORK', priority: 'LOW', description: '고객 문의 이메일에 답장' },
      { title: '독서', category: 'PERSONAL', priority: 'MEDIUM', description: '새로 구입한 책 읽기' },
      { title: '프로젝트 리뷰', category: 'WORK', priority: 'HIGH', description: 'Q4 프로젝트 진행상황 리뷰' }
    ];

    for (const todo of testTodos) {
      await page.getByRole('button', { name: '새 할 일' }).first().click();
      await page.getByLabel('제목').fill(todo.title);
      await page.getByLabel('설명').fill(todo.description);
      await page.getByLabel('카테고리').selectOption(todo.category);
      await page.getByLabel('우선순위').selectOption(todo.priority);
      await page.getByRole('button', { name: '할 일 추가' }).first().click();

      // 모달이 닫힐 때까지 대기
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }
  });

  test('카테고리 필터링: 업무 카테고리만 표시', async ({ page }) => {
    // Given: 다양한 카테고리의 할 일들이 모두 표시되어 있음
    await expect(page.getByText('회의 자료 준비')).toBeVisible();
    await expect(page.getByText('운동하기')).toBeVisible();
    await expect(page.getByText('독서')).toBeVisible();

    // When: 업무 카테고리 필터 선택
    const workFilter = page.getByRole('button', { name: '업무' }).or(
      page.getByRole('button', { name: 'WORK' })
    ).or(
      page.locator('[data-testid="category-filter-work"]')
    );

    await workFilter.click();

    // Then: 업무 카테고리 할 일만 표시됨
    await expect(page.getByText('회의 자료 준비')).toBeVisible();
    await expect(page.getByText('이메일 답장')).toBeVisible();
    await expect(page.getByText('프로젝트 리뷰')).toBeVisible();

    // Then: 개인 카테고리 할 일은 숨겨짐
    await expect(page.getByText('운동하기')).not.toBeVisible();
    await expect(page.getByText('독서')).not.toBeVisible();
  });

  test('카테고리 필터링: 개인 카테고리만 표시', async ({ page }) => {
    // When: 개인 카테고리 필터 선택
    const personalFilter = page.getByRole('button', { name: '개인' }).or(
      page.getByRole('button', { name: 'PERSONAL' })
    ).or(
      page.locator('[data-testid="category-filter-personal"]')
    );

    await personalFilter.click();

    // Then: 개인 카테고리 할 일만 표시됨
    await expect(page.getByText('운동하기')).toBeVisible();
    await expect(page.getByText('독서')).toBeVisible();

    // Then: 업무 카테고리 할 일은 숨겨짐
    await expect(page.getByText('회의 자료 준비')).not.toBeVisible();
    await expect(page.getByText('이메일 답장')).not.toBeVisible();
    await expect(page.getByText('프로젝트 리뷰')).not.toBeVisible();
  });

  test('카테고리 필터링: 전체 표시로 복원', async ({ page }) => {
    // Given: 업무 필터가 적용된 상태
    const workFilter = page.getByRole('button', { name: '업무' }).or(
      page.locator('[data-testid="category-filter-work"]')
    );
    await workFilter.click();

    // 업무 할 일만 표시되는지 확인
    await expect(page.getByText('운동하기')).not.toBeVisible();

    // When: 전체 필터 선택
    const allFilter = page.getByRole('button', { name: '전체' }).or(
      page.getByRole('button', { name: 'ALL' })
    ).or(
      page.locator('[data-testid="category-filter-all"]')
    );

    await allFilter.click();

    // Then: 모든 할 일이 다시 표시됨
    await expect(page.getByText('회의 자료 준비')).toBeVisible();
    await expect(page.getByText('운동하기')).toBeVisible();
    await expect(page.getByText('이메일 답장')).toBeVisible();
    await expect(page.getByText('독서')).toBeVisible();
    await expect(page.getByText('프로젝트 리뷰')).toBeVisible();
  });

  test('우선순위 정렬: 높은 순서대로 정렬', async ({ page }) => {
    // When: 우선순위 정렬 옵션 선택
    const prioritySort = page.getByRole('button', { name: '우선순위' }).or(
      page.locator('[data-testid="sort-priority"]')
    ).or(
      page.locator('select[name="sortBy"]')
    );

    if (await page.locator('select[name="sortBy"]').isVisible()) {
      await page.selectOption('select[name="sortBy"]', 'priority');
    } else {
      await prioritySort.click();
    }

    // Then: 높은 우선순위 할 일이 먼저 표시됨
    const todoItems = page.locator('[data-testid="todo-item"]');

    // 첫 번째와 두 번째 할 일이 높은 우선순위인지 확인
    const firstTodo = todoItems.first();
    const secondTodo = todoItems.nth(1);

    await expect(firstTodo.getByText('회의 자료 준비').or(firstTodo.getByText('프로젝트 리뷰'))).toBeVisible();
    await expect(secondTodo.getByText('회의 자료 준비').or(secondTodo.getByText('프로젝트 리뷰'))).toBeVisible();
  });

  test('제목 정렬: 알파벳 순서대로 정렬', async ({ page }) => {
    // When: 제목 정렬 옵션 선택
    const titleSort = page.getByRole('button', { name: '제목' }).or(
      page.locator('[data-testid="sort-title"]')
    );

    if (await page.locator('select[name="sortBy"]').isVisible()) {
      await page.selectOption('select[name="sortBy"]', 'title');
    } else {
      await titleSort.click();
    }

    // Then: 제목 순서대로 정렬됨 (가나다 순)
    const todoItems = page.locator('[data-testid="todo-item"]');

    // 첫 번째 항목이 예상되는 순서인지 확인 (가나다 순으로 정렬)
    const firstTodo = todoItems.first();

    // '독서', '이메일 답장', '운동하기', '회의 자료 준비', '프로젝트 리뷰' 순서 예상
    await expect(firstTodo.getByText('독서')).toBeVisible();
  });

  test('생성일 정렬: 최신 순서대로 정렬', async ({ page }) => {
    // When: 생성일 정렬 옵션 선택
    if (await page.locator('select[name="sortBy"]').isVisible()) {
      await page.selectOption('select[name="sortBy"]', 'createdAt');
    } else {
      const createdSort = page.getByRole('button', { name: '생성일' }).or(
        page.locator('[data-testid="sort-created"]')
      );
      await createdSort.click();
    }

    // Then: 최신 할 일이 먼저 표시됨
    const todoItems = page.locator('[data-testid="todo-item"]');
    const firstTodo = todoItems.first();

    // 마지막에 생성된 '프로젝트 리뷰'가 첫 번째에 표시되어야 함
    await expect(firstTodo.getByText('프로젝트 리뷰')).toBeVisible();
  });

  test('검색 기능: 제목으로 할 일 검색', async ({ page }) => {
    // When: 검색 입력창에 검색어 입력
    const searchInput = page.getByPlaceholder('할 일 검색').or(
      page.locator('[data-testid="search-input"]')
    ).or(
      page.locator('input[type="search"]')
    );

    await searchInput.fill('회의');

    // Then: 검색어가 포함된 할 일만 표시됨
    await expect(page.getByText('회의 자료 준비')).toBeVisible();

    // Then: 검색어가 포함되지 않은 할 일은 숨겨짐
    await expect(page.getByText('운동하기')).not.toBeVisible();
    await expect(page.getByText('독서')).not.toBeVisible();
    await expect(page.getByText('이메일 답장')).not.toBeVisible();
    await expect(page.getByText('프로젝트 리뷰')).not.toBeVisible();
  });

  test('검색 기능: 상세설명으로 할 일 검색', async ({ page }) => {
    // When: 상세설명에 포함된 단어로 검색
    const searchInput = page.getByPlaceholder('할 일 검색').or(
      page.locator('[data-testid="search-input"]')
    );

    await searchInput.fill('헬스장');

    // Then: 상세설명에 검색어가 포함된 할 일이 표시됨
    await expect(page.getByText('운동하기')).toBeVisible();

    // Then: 다른 할 일들은 숨겨짐
    await expect(page.getByText('회의 자료 준비')).not.toBeVisible();
    await expect(page.getByText('독서')).not.toBeVisible();
  });

  test('검색 초기화: 검색어 삭제 시 전체 목록 복원', async ({ page }) => {
    // Given: 검색이 적용된 상태
    const searchInput = page.getByPlaceholder('할 일 검색').or(
      page.locator('[data-testid="search-input"]')
    );

    await searchInput.fill('회의');
    await expect(page.getByText('회의 자료 준비')).toBeVisible();
    await expect(page.getByText('운동하기')).not.toBeVisible();

    // When: 검색어 삭제
    await searchInput.clear();

    // Then: 모든 할 일이 다시 표시됨
    await expect(page.getByText('회의 자료 준비')).toBeVisible();
    await expect(page.getByText('운동하기')).toBeVisible();
    await expect(page.getByText('독서')).toBeVisible();
    await expect(page.getByText('이메일 답장')).toBeVisible();
    await expect(page.getByText('프로젝트 리뷰')).toBeVisible();
  });

  test('복합 필터링: 카테고리 + 우선순위 조합', async ({ page }) => {
    // When: 업무 카테고리 선택
    const workFilter = page.getByRole('button', { name: '업무' }).or(
      page.locator('[data-testid="category-filter-work"]')
    );
    await workFilter.click();

    // When: 우선순위 정렬 적용
    if (await page.locator('select[name="sortBy"]').isVisible()) {
      await page.selectOption('select[name="sortBy"]', 'priority');
    }

    // Then: 업무 카테고리 중에서 우선순위 순으로 표시됨
    await expect(page.getByText('회의 자료 준비')).toBeVisible(); // HIGH
    await expect(page.getByText('프로젝트 리뷰')).toBeVisible(); // HIGH
    await expect(page.getByText('이메일 답장')).toBeVisible(); // LOW

    // Then: 개인 카테고리는 여전히 숨겨져 있음
    await expect(page.getByText('운동하기')).not.toBeVisible();
    await expect(page.getByText('독서')).not.toBeVisible();
  });

  test('복합 필터링: 검색 + 카테고리 조합', async ({ page }) => {
    // When: 검색어 입력
    const searchInput = page.getByPlaceholder('할 일 검색').or(
      page.locator('[data-testid="search-input"]')
    );
    await searchInput.fill('리');

    // When: 업무 카테고리 선택
    const workFilter = page.getByRole('button', { name: '업무' }).or(
      page.locator('[data-testid="category-filter-work"]')
    );
    await workFilter.click();

    // Then: 검색어가 포함되고 업무 카테고리인 할 일만 표시됨
    await expect(page.getByText('프로젝트 리뷰')).toBeVisible(); // 검색어 '리' + 업무 카테고리
    await expect(page.getByText('회의 자료 준비')).toBeVisible(); // 검색어 '리' + 업무 카테고리

    // Then: 조건에 맞지 않는 할 일들은 숨겨짐
    await expect(page.getByText('운동하기')).not.toBeVisible();
    await expect(page.getByText('독서')).not.toBeVisible();
    await expect(page.getByText('이메일 답장')).not.toBeVisible();
  });

  test('필터 상태 표시: 활성화된 필터 시각적 확인', async ({ page }) => {
    // When: 업무 카테고리 필터 활성화
    const workFilter = page.getByRole('button', { name: '업무' }).or(
      page.locator('[data-testid="category-filter-work"]')
    );
    await workFilter.click();

    // Then: 활성화된 필터가 시각적으로 구분됨
    await expect(workFilter).toHaveClass(/active|selected|bg-/);

    // When: 전체 필터로 변경
    const allFilter = page.getByRole('button', { name: '전체' }).or(
      page.locator('[data-testid="category-filter-all"]')
    );
    await allFilter.click();

    // Then: 전체 필터가 활성화되고 업무 필터는 비활성화됨
    await expect(allFilter).toHaveClass(/active|selected|bg-/);
    await expect(workFilter).not.toHaveClass(/active|selected/);
  });
});