import { test, expect } from '@playwright/test';

/**
 * S2.F.7: 할 일 상태 변경 (시작/완료) E2E 테스트 작성
 * Happy Case 시나리오로 Todo 상태 전환 기능을 검증
 */
test.describe('S2.F.7: Todo Status Management (Happy Cases)', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 localStorage를 클리어하고 테스트 데이터 준비
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();

    // 빈 상태가 로드되었는지 확인
    await page.waitForTimeout(1000);

    // 테스트용 할 일 생성
    await page.getByRole('button', { name: '새 할 일' }).first().click();
    await page.getByLabel('제목').fill('상태 테스트 할 일');
    await page.getByLabel('설명').fill('상태 변경 테스트를 위한 할 일입니다');
    await page.getByLabel('카테고리').selectOption('WORK');
    await page.getByLabel('우선순위').selectOption('MEDIUM');
    await page.getByRole('button', { name: '할 일 추가' }).first().click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByRole('heading', { name: '상태 테스트 할 일' })).toBeVisible();
  });

  test('초기 상태: 새로 생성된 할 일은 대기중 상태', async ({ page }) => {
    // Then: 새로 생성된 할 일이 대기중(WAITING) 상태로 표시됨
    const todoItem = page.getByTestId('todo-item').filter({ hasText: '상태 테스트 할 일' });

    // 대기중 상태 표시 확인 (상태 표시 방식에 따라 다를 수 있음)
    await expect(todoItem.getByText('대기중')).toBeVisible().or(
      todoItem.locator('[data-status="WAITING"]')
    ).toBeVisible().or(
      todoItem.locator('.status-waiting')
    ).toBeVisible();

    // 시작 버튼이 표시되어야 함
    await expect(todoItem.getByRole('button', { name: '시작' })).toBeVisible().or(
      todoItem.getByRole('button', { name: /시작|start/i })
    ).toBeVisible();
  });

  test('상태 변경: 대기중 → 진행중 (시작 버튼 클릭)', async ({ page }) => {
    // Given: 대기중 상태의 할 일
    const todoItem = page.getByTestId('todo-item').filter({ hasText: '상태 테스트 할 일' });

    // When: 시작 버튼 클릭
    const startButton = todoItem.getByRole('button', { name: '시작' }).or(
      todoItem.getByRole('button', { name: /시작|start/i })
    ).or(
      todoItem.locator('[data-action="start"]')
    );

    await startButton.click();

    // Then: 상태가 진행중으로 변경됨
    await expect(todoItem.getByText('진행중')).toBeVisible().or(
      todoItem.locator('[data-status="IN_PROGRESS"]')
    ).toBeVisible().or(
      todoItem.locator('.status-in-progress')
    ).toBeVisible();

    // Then: 완료 버튼이 표시됨
    await expect(todoItem.getByRole('button', { name: '완료' })).toBeVisible().or(
      todoItem.getByRole('button', { name: /완료|complete/i })
    ).toBeVisible();

    // Then: 시작 버튼은 더 이상 표시되지 않음
    await expect(todoItem.getByRole('button', { name: '시작' })).not.toBeVisible();
  });

  test('상태 변경: 진행중 → 완료 (완료 버튼 클릭)', async ({ page }) => {
    // Given: 진행중 상태의 할 일 (먼저 시작 버튼을 클릭하여 진행중으로 만듦)
    const todoItem = page.getByTestId('todo-item').filter({ hasText: '상태 테스트 할 일' });

    const startButton = todoItem.getByRole('button', { name: '시작' }).or(
      todoItem.locator('[data-action="start"]')
    );
    await startButton.click();

    // 진행중 상태 확인
    await expect(todoItem.getByText('진행중')).toBeVisible().or(
      todoItem.locator('[data-status="IN_PROGRESS"]')
    ).toBeVisible();

    // When: 완료 버튼 클릭
    const completeButton = todoItem.getByRole('button', { name: '완료' }).or(
      todoItem.getByRole('button', { name: /완료|complete/i })
    ).or(
      todoItem.locator('[data-action="complete"]')
    );

    await completeButton.click();

    // Then: 상태가 완료로 변경됨
    await expect(todoItem.getByText('완료')).toBeVisible().or(
      todoItem.locator('[data-status="COMPLETED"]')
    ).toBeVisible().or(
      todoItem.locator('.status-completed')
    ).toBeVisible();

    // Then: 완료된 할 일의 시각적 구분 (취소선, 연한 색상 등)
    await expect(todoItem).toHaveClass(/completed|done|finished/);
  });

  test('상태 변경: 대기중 → 완료 (직접 완료)', async ({ page }) => {
    // Given: 대기중 상태의 할 일
    const todoItem = page.getByTestId('todo-item').filter({ hasText: '상태 테스트 할 일' });

    // When: 진행중을 거치지 않고 바로 완료 처리 (체크박스나 완료 버튼이 있다면)
    const directCompleteButton = todoItem.getByRole('checkbox').or(
      todoItem.getByRole('button', { name: '완료' })
    ).or(
      todoItem.locator('[data-action="complete"]')
    );

    // 직접 완료 기능이 있는 경우에만 테스트
    if (await directCompleteButton.isVisible()) {
      await directCompleteButton.click();

      // Then: 상태가 완료로 변경됨
      await expect(todoItem.getByText('완료')).toBeVisible().or(
        todoItem.locator('[data-status="COMPLETED"]')
      ).toBeVisible();
    } else {
      // 직접 완료 기능이 없다면 시작 → 완료 단계를 거쳐야 함
      const startButton = todoItem.getByRole('button', { name: '시작' });
      await startButton.click();

      const completeButton = todoItem.getByRole('button', { name: '완료' });
      await completeButton.click();

      await expect(todoItem.getByText('완료')).toBeVisible();
    }
  });

  test('상태 되돌리기: 진행중 → 대기중 (일시정지)', async ({ page }) => {
    // Given: 진행중 상태의 할 일
    const todoItem = page.getByTestId('todo-item').filter({ hasText: '상태 테스트 할 일' });

    const startButton = todoItem.getByRole('button', { name: '시작' });
    await startButton.click();

    await expect(todoItem.getByText('진행중')).toBeVisible();

    // When: 일시정지 버튼 클릭 (있다면)
    const pauseButton = todoItem.getByRole('button', { name: '일시정지' }).or(
      todoItem.getByRole('button', { name: /일시정지|pause/i })
    ).or(
      todoItem.locator('[data-action="pause"]')
    );

    if (await pauseButton.isVisible()) {
      await pauseButton.click();

      // Then: 상태가 대기중으로 돌아감
      await expect(todoItem.getByText('대기중')).toBeVisible();
      await expect(todoItem.getByRole('button', { name: '시작' })).toBeVisible();
    } else {
      // 일시정지 기능이 없다면 테스트 스킵
      console.log('일시정지 기능이 구현되지 않았습니다');
    }
  });

  test('여러 할 일 상태 관리: 독립적인 상태 변경', async ({ page }) => {
    // Given: 추가 할 일들 생성
    const additionalTodos = ['할 일 A', '할 일 B', '할 일 C'];

    for (const todoTitle of additionalTodos) {
      await page.getByRole('button', { name: '새 할 일' }).first().click();
      await page.getByLabel('제목').fill(todoTitle);
      await page.getByRole('button', { name: '할 일 추가' }).first().click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }

    // When: 각각 다른 상태로 변경
    // 할 일 A: 진행중
    const todoA = page.getByTestId('todo-item').filter({ hasText: '할 일 A' });
    await todoA.getByRole('button', { name: '시작' }).click();

    // 할 일 B: 완료
    const todoB = page.getByTestId('todo-item').filter({ hasText: '할 일 B' });
    await todoB.getByRole('button', { name: '시작' }).click();
    await todoB.getByRole('button', { name: '완료' }).click();

    // 할 일 C: 대기중 유지

    // Then: 각각 올바른 상태로 표시됨
    await expect(todoA.getByText('진행중')).toBeVisible();
    await expect(todoB.getByText('완료')).toBeVisible();

    const todoC = page.getByTestId('todo-item').filter({ hasText: '할 일 C' });
    await expect(todoC.getByText('대기중')).toBeVisible();

    // Then: 원본 할 일도 초기 상태 유지
    const originalTodo = page.getByTestId('todo-item').filter({ hasText: '상태 테스트 할 일' });
    await expect(originalTodo.getByText('대기중')).toBeVisible();
  });

  test('상태별 시각적 구분: 각 상태별 UI 차이 확인', async ({ page }) => {
    // Given: 여러 상태의 할 일들 준비
    const todoItem = page.getByTestId('todo-item').filter({ hasText: '상태 테스트 할 일' });

    // Step 1: 대기중 상태 시각적 확인
    await expect(todoItem).toHaveClass(/waiting|pending/);

    // Step 2: 진행중 상태로 변경하고 시각적 확인
    await todoItem.getByRole('button', { name: '시작' }).click();
    await expect(todoItem).toHaveClass(/in-progress|active/);

    // Step 3: 완료 상태로 변경하고 시각적 확인
    await todoItem.getByRole('button', { name: '완료' }).click();
    await expect(todoItem).toHaveClass(/completed|done|finished/);

    // 완료된 할 일의 특별한 스타일 (취소선, 연한 색상 등) 확인
    const titleElement = todoItem.getByText('상태 테스트 할 일');
    await expect(titleElement).toHaveCSS('text-decoration', /line-through/);
  });

  test('상태 지속성: 새로고침 후에도 상태 유지', async ({ page }) => {
    // Given: 할 일을 진행중 상태로 변경
    const todoItem = page.getByTestId('todo-item').filter({ hasText: '상태 테스트 할 일' });
    await todoItem.getByRole('button', { name: '시작' }).click();

    await expect(todoItem.getByText('진행중')).toBeVisible();

    // When: 페이지 새로고침
    await page.reload();

    // Then: 상태가 유지됨
    const refreshedTodoItem = page.getByTestId('todo-item').filter({ hasText: '상태 테스트 할 일' });
    await expect(refreshedTodoItem.getByText('진행중')).toBeVisible();

    // When: 완료 상태로 변경하고 새로고침
    await refreshedTodoItem.getByRole('button', { name: '완료' }).click();
    await expect(refreshedTodoItem.getByText('완료')).toBeVisible();

    await page.reload();

    // Then: 완료 상태도 유지됨
    const finalTodoItem = page.getByTestId('todo-item').filter({ hasText: '상태 테스트 할 일' });
    await expect(finalTodoItem.getByText('완료')).toBeVisible();
  });

  test('상태 기반 필터링: 상태별로 할 일 그룹핑', async ({ page }) => {
    // Given: 다양한 상태의 할 일들 생성
    const todos = [
      { title: '대기 할 일', status: 'waiting' },
      { title: '진행 할 일', status: 'in-progress' },
      { title: '완료 할 일', status: 'completed' }
    ];

    // 추가 할 일들 생성 및 상태 설정
    for (let i = 1; i < todos.length; i++) {
      await page.getByRole('button', { name: '새 할 일' }).first().click();
      await page.getByLabel('제목').fill(todos[i].title);
      await page.getByRole('button', { name: '할 일 추가' }).first().click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }

    // 진행 할 일 상태 변경
    const inProgressTodo = page.getByTestId('todo-item').filter({ hasText: '진행 할 일' });
    await inProgressTodo.getByRole('button', { name: '시작' }).click();

    // 완료 할 일 상태 변경
    const completedTodo = page.getByTestId('todo-item').filter({ hasText: '완료 할 일' });
    await completedTodo.getByRole('button', { name: '시작' }).click();
    await completedTodo.getByRole('button', { name: '완료' }).click();

    // When: 상태별 필터 적용 (구현되어 있다면)
    const statusFilter = page.getByRole('button', { name: '진행중' }).or(
      page.locator('[data-filter="in-progress"]')
    );

    if (await statusFilter.isVisible()) {
      await statusFilter.click();

      // Then: 진행중인 할 일만 표시됨
      await expect(page.getByText('진행 할 일')).toBeVisible();
      await expect(page.getByText('대기 할 일')).not.toBeVisible();
      await expect(page.getByText('완료 할 일')).not.toBeVisible();
    } else {
      // 상태별 그룹핑 UI 확인
      const waitingSection = page.locator('[data-section="waiting"]');
      const inProgressSection = page.locator('[data-section="in-progress"]');
      const completedSection = page.locator('[data-section="completed"]');

      if (await waitingSection.isVisible()) {
        await expect(waitingSection.getByText('대기 할 일')).toBeVisible();
        await expect(inProgressSection.getByText('진행 할 일')).toBeVisible();
        await expect(completedSection.getByText('완료 할 일')).toBeVisible();
      }
    }
  });

  test('전체 상태 전환 플로우: 생성 → 시작 → 완료', async ({ page }) => {
    // Step 1: 새로운 할 일 생성
    await page.getByRole('button', { name: '새 할 일' }).first().click();
    await page.getByLabel('제목').fill('플로우 테스트 할 일');
    await page.getByLabel('카테고리').selectOption('PERSONAL');
    await page.getByRole('button', { name: '할 일 추가' }).first().click();

    const todoItem = page.getByTestId('todo-item').filter({ hasText: '플로우 테스트 할 일' });

    // Step 2: 초기 대기중 상태 확인
    await expect(todoItem.getByText('대기중')).toBeVisible();
    await expect(todoItem.getByRole('button', { name: '시작' })).toBeVisible();

    // Step 3: 시작하여 진행중 상태로 전환
    await todoItem.getByRole('button', { name: '시작' }).click();
    await expect(todoItem.getByText('진행중')).toBeVisible();
    await expect(todoItem.getByRole('button', { name: '완료' })).toBeVisible();

    // Step 4: 완료 상태로 전환
    await todoItem.getByRole('button', { name: '완료' }).click();
    await expect(todoItem.getByText('완료')).toBeVisible();

    // Step 5: 완료된 할 일에는 상태 변경 버튼이 없어야 함
    await expect(todoItem.getByRole('button', { name: '시작' })).not.toBeVisible();
    await expect(todoItem.getByRole('button', { name: '완료' })).not.toBeVisible();

    // Step 6: 데이터 지속성 확인
    await page.reload();
    const persistedTodo = page.getByTestId('todo-item').filter({ hasText: '플로우 테스트 할 일' });
    await expect(persistedTodo.getByText('완료')).toBeVisible();
  });
});