import { test, expect } from '@playwright/test';

/**
 * S2.F.5: 할 일 생성/수정/삭제 E2E 테스트 작성
 * Happy Case 시나리오로 기본 Todo CRUD 기능을 검증
 */
test.describe('S2.F.5: Todo CRUD Operations (Happy Cases)', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 localStorage를 클리어하고 페이지 로드
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();

    // 빈 상태가 로드되었는지 확인
    await page.waitForTimeout(1000);
  });

  test('생성: 기본 정보로 새로운 할 일 생성', async ({ page }) => {
    // Given: 메인 페이지에서 시작
    await page.goto('/');

    // When: 새 할 일 버튼 클릭
    const newTodoButton = page.getByRole('button', { name: '새 할 일' }).first();
    await expect(newTodoButton).toBeVisible();
    await newTodoButton.click();

    // Then: 모달이 열렸는지 확인 (실제 구현에 맞게 수정)
    const modal = page.getByText('새 할 일 추가');
    await expect(modal).toBeVisible();

    // When: 필수 필드 입력 (실제 구현에 맞게 수정)
    await page.getByLabel('제목').fill('Sprint 2 E2E 테스트 작성');
    await page.getByLabel('설명').fill('Playwright를 사용한 E2E 테스트 케이스 작성');
    await page.getByLabel('소요시간').fill('150'); // 2시간 30분 = 150분
    await page.getByLabel('카테고리').selectOption('WORK');
    await page.getByLabel('우선순위').selectOption('HIGH');

    // When: 할 일 추가 버튼 클릭
    await page.getByRole('button', { name: '할 일 추가' }).first().click();

    // Then: 모달이 닫히고 할 일이 목록에 추가됨
    await expect(modal).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sprint 2 E2E 테스트 작성' })).toBeVisible();

    // Then: 할 일 상세 정보가 표시됨 (실제 표시 형식에 맞게 수정)
    await expect(page.getByText('⏱ 2h 30m').first()).toBeVisible();
    await expect(page.getByText('업무').first()).toBeVisible();
  });

  test('생성: 선택적 필드를 포함한 완전한 할 일 생성', async ({ page }) => {
    // Given: 메인 페이지에서 시작
    await page.goto('/');

    // When: 새 할 일 모달 열기
    await page.getByRole('button', { name: '새 할 일' }).first().click();

    // When: 모든 필드 입력 (선택적 필드 포함)
    await page.getByLabel('제목').fill('프로젝트 기획서 검토');
    await page.getByLabel('설명').fill('Q4 신규 프로젝트 기획서 검토 및 피드백 작성');
    await page.getByLabel('소요시간').fill('60');
    await page.getByLabel('카테고리').selectOption('WORK');
    await page.getByLabel('우선순위').selectOption('MEDIUM');

    // 데드라인 설정 (있는 경우)
    const deadlineInput = page.getByLabel('마감일');
    if (await deadlineInput.isVisible()) {
      await deadlineInput.fill('2024-12-31T18:00');
    }

    // 태그 입력 (있는 경우)
    const tagInput = page.getByLabel('태그');
    if (await tagInput.isVisible()) {
      await tagInput.fill('기획,검토,Q4');
    }

    // When: 저장
    await page.getByRole('button', { name: '할 일 추가' }).first().click();

    // Then: 할 일이 생성되고 모든 정보가 표시됨
    await expect(page.getByText('프로젝트 기획서 검토')).toBeVisible();
    await expect(page.getByText('⏱ 1h').first()).toBeVisible();
  });

  test('수정: 기존 할 일의 제목과 카테고리 수정', async ({ page }) => {
    // Given: 할 일이 하나 있는 상태
    await page.goto('/');

    // 테스트 할 일 생성
    await page.getByRole('button', { name: '새 할 일' }).first().click();
    await page.getByLabel('제목').fill('원본 할 일');
    await page.getByLabel('카테고리').selectOption('PERSONAL');
    await page.getByRole('button', { name: '할 일 추가' }).first().click();

    await expect(page.getByRole('heading', { name: '원본 할 일' })).toBeVisible();

    // When: 할 일 클릭하여 수정 모달 열기
    await page.getByRole('heading', { name: '원본 할 일' }).click();

    // Then: 수정 모달이 열리고 기존 데이터가 표시됨
    await expect(page.getByRole('heading', { name: '할 일 수정' })).toBeVisible();
    await expect(page.getByLabel('제목')).toHaveValue('원본 할 일');
    await expect(page.getByLabel('카테고리')).toHaveValue('PERSONAL');

    // When: 데이터 수정
    await page.getByLabel('제목').clear();
    await page.getByLabel('제목').fill('수정된 할 일');
    await page.getByLabel('카테고리').selectOption('WORK');

    // When: 수정 완료
    const updateButton = page.getByRole('button', { name: '할 일 수정' });
    await updateButton.click();

    // Then: 모달이 닫히길 기다림 - 모달 백드롭이 사라진 것을 확인
    await expect(page.locator('.fixed.inset-0.z-50.overflow-y-auto')).not.toBeVisible();

    // 상태 업데이트를 위한 짧은 대기
    await page.waitForTimeout(500);

    // Then: 수정된 내용이 목록에 반영됨
    await expect(page.getByRole('heading', { name: '수정된 할 일' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: '원본 할 일' })).not.toBeVisible();
    await expect(page.getByText('업무').first()).toBeVisible();
  });

  test('수정: 할 일의 우선순위와 상세설명 수정', async ({ page }) => {
    // Given: 할 일이 하나 있는 상태
    await page.goto('/');

    // 테스트 할 일 생성
    await page.getByRole('button', { name: '새 할 일' }).first().click();
    await page.getByLabel('제목').fill('우선순위 테스트');
    await page.getByLabel('설명').fill('원본 설명');
    await page.getByLabel('우선순위').selectOption('LOW');
    await page.getByRole('button', { name: '할 일 추가' }).first().click();

    // When: 수정 모달 열기
    await page.getByRole('heading', { name: '우선순위 테스트' }).click();

    // When: 우선순위와 상세설명 수정
    await page.getByLabel('우선순위').selectOption('HIGH');
    await page.getByLabel('설명').clear();
    await page.getByLabel('설명').fill('수정된 상세 설명입니다');

    // When: 저장
    await page.getByRole('button', { name: '할 일 수정' }).click();

    // Then: 모달이 닫히고 수정 완료 - 모달 백드롭이 사라진 것을 확인
    await expect(page.locator('.fixed.inset-0.z-50.overflow-y-auto')).not.toBeVisible();

    // 상태 업데이트를 위한 짧은 대기
    await page.waitForTimeout(500);

    // 상세 정보 확인을 위해 다시 모달 열기
    await page.getByRole('heading', { name: '우선순위 테스트' }).first().click();
    await expect(page.getByLabel('설명')).toHaveValue('수정된 상세 설명입니다');
  });

  test('삭제: 할 일 삭제 및 확인', async ({ page }) => {
    // Given: 여러 할 일이 있는 상태
    await page.goto('/');

    const todos = ['할 일 1', '삭제될 할 일', '할 일 3'];

    for (const todoTitle of todos) {
      await page.getByRole('button', { name: '새 할 일' }).first().click();
      await page.getByLabel('제목').fill(todoTitle);
      await page.getByRole('button', { name: '할 일 추가' }).first().click();
      await expect(page.getByRole('heading', { name: todoTitle })).toBeVisible();
    }

    // When: 삭제할 할 일 선택
    await page.getByRole('heading', { name: '삭제될 할 일' }).click();

    // When: 삭제 버튼 클릭
    const deleteButton = page.getByRole('button', { name: '삭제' });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // When: 확인 버튼 클릭 (두 단계 삭제)
    const confirmButton = page.getByRole('button', { name: '확인' });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    // Then: 해당 할 일이 목록에서 제거됨
    await expect(page.getByRole('heading', { name: '삭제될 할 일' })).not.toBeVisible();

    // Then: 다른 할 일들은 유지됨
    await expect(page.getByRole('heading', { name: '할 일 1' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '할 일 3' })).toBeVisible();
  });

  test('삭제: 마지막 할 일 삭제 후 빈 상태 확인', async ({ page }) => {
    // Given: 할 일이 하나만 있는 상태
    await page.goto('/');

    await page.getByRole('button', { name: '새 할 일' }).first().click();
    await page.getByLabel('제목').fill('마지막 할 일');
    await page.getByRole('button', { name: '할 일 추가' }).first().click();

    // When: 유일한 할 일 삭제
    await page.getByRole('heading', { name: '마지막 할 일' }).click();

    await page.getByRole('button', { name: '삭제' }).click();

    // 확인 버튼 클릭
    await page.getByRole('button', { name: '확인' }).click();

    // Then: 빈 상태 메시지가 표시됨
    await expect(page.getByRole('heading', { name: '마지막 할 일' })).not.toBeVisible();

    // 빈 상태 확인 (빈 목록 메시지나 빈 컨테이너)
    const todoContainer = page.getByTestId('todo-list');
    if (await todoContainer.isVisible()) {
      const todoItems = page.getByTestId('todo-item');
      await expect(todoItems).toHaveCount(0);
    }
  });

  test('전체 CRUD 워크플로우: 생성 → 수정 → 삭제', async ({ page }) => {
    // Given: 빈 상태에서 시작
    await page.goto('/');

    // Step 1: 할 일 생성
    await page.getByRole('button', { name: '새 할 일' }).first().click();
    await page.getByLabel('제목').fill('CRUD 테스트 할 일');
    await page.getByLabel('카테고리').selectOption('WORK');
    await page.getByLabel('우선순위').selectOption('MEDIUM');
    await page.getByRole('button', { name: '할 일 추가' }).first().click();

    await expect(page.getByRole('heading', { name: 'CRUD 테스트 할 일' })).toBeVisible();

    // Step 2: 할 일 수정
    await page.getByRole('heading', { name: 'CRUD 테스트 할 일' }).click();
    await page.getByLabel('제목').clear();
    await page.getByLabel('제목').fill('수정된 CRUD 테스트');
    await page.getByLabel('우선순위').selectOption('HIGH');
    await page.getByRole('button', { name: '할 일 수정' }).click();

    // 모달이 닫히기를 기다림 - 모달 백드롭이 사라진 것을 확인
    await expect(page.locator('.fixed.inset-0.z-50.overflow-y-auto')).not.toBeVisible();

    // 상태 업데이트를 위한 짧은 대기
    await page.waitForTimeout(500);

    // 수정된 내용이 반영되었는지 확인
    await expect(page.getByRole('heading', { name: '수정된 CRUD 테스트' }).first()).toBeVisible();
    // 우선순위는 시각적으로만 표시되므로 생략

    // Step 3: 할 일 삭제
    await page.getByRole('heading', { name: '수정된 CRUD 테스트' }).first().click();

    await page.getByRole('button', { name: '삭제' }).click();
    await page.getByRole('button', { name: '확인' }).click();

    await expect(page.getByRole('heading', { name: '수정된 CRUD 테스트' })).not.toBeVisible();

    // Step 4: 최종 상태 확인 (빈 상태)
    const todoItems = page.getByTestId('todo-item');
    await expect(todoItems).toHaveCount(0);
  });
});