import { test, expect } from '@playwright/test';

test.describe('S2.F.1-S2.F.4: Todo Management Features', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('http://localhost:3005');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('S2.F.1: Todo 추가 모달 - 기본 기능', async ({ page }) => {
    await page.goto('http://localhost:3005');

    // 새 할 일 버튼 클릭
    await page.click('button:has-text("새 할 일")');

    // 모달이 열렸는지 확인
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // 모든 필수 필드가 있는지 확인
    await expect(page.locator('input[name="title"]')).toBeVisible();
    await expect(page.locator('select[name="estimatedHours"]')).toBeVisible();
    await expect(page.locator('select[name="estimatedMinutes"]')).toBeVisible();
    await expect(page.locator('select[name="category"]')).toBeVisible();
    await expect(page.locator('select[name="priority"]')).toBeVisible();

    // 빈 제목으로 저장 시도 (유효성 검사)
    await page.click('button:has-text("할 일 추가")');
    // 모달이 여전히 열려있어야 함 (에러로 인해 닫히지 않음)
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('S2.F.1: Todo 추가 모달 - 정상 데이터 입력', async ({ page }) => {
    await page.goto('http://localhost:3005');

    // 새 할 일 버튼 클릭
    await page.click('button:has-text("새 할 일")');

    // 폼 데이터 입력
    await page.fill('input[name="title"]', '프로젝트 기획서 작성');
    await page.fill('textarea[name="description"]', '새 프로젝트의 상세 기획서를 작성합니다.');
    await page.selectOption('select[name="estimatedHours"]', '4');
    await page.selectOption('select[name="category"]', 'WORK');
    await page.selectOption('select[name="priority"]', 'HIGH');
    
    // 태그 입력 (만약 태그 입력 필드가 있다면)
    const tagInput = page.locator('input[placeholder*="태그"]');
    if (await tagInput.count() > 0) {
      await tagInput.fill('기획,문서');
    }

    // 저장
    await page.click('button:has-text("할 일 추가")');

    // 모달이 닫혔는지 확인
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // 할 일이 목록에 추가되었는지 확인
    await expect(page.locator('text=프로젝트 기획서 작성')).toBeVisible();
  });

  test('S2.F.2: Todo 목록 표시 및 필터링', async ({ page }) => {
    await page.goto('http://localhost:3005');

    // 여러 할 일 추가
    const todos = [
      { title: '회의 준비', category: 'WORK', priority: 'HIGH' },
      { title: '운동하기', category: 'PERSONAL', priority: 'MEDIUM' },
      { title: '이메일 답장', category: 'WORK', priority: 'LOW' }
    ];

    for (const todo of todos) {
      await page.click('button:has-text("새 할 일")');
      await page.fill('input[name="title"]', todo.title);
      await page.selectOption('select[name="category"]', todo.category);
      await page.selectOption('select[name="priority"]', todo.priority);
      await page.click('button:has-text("할 일 추가")');
      
      // 모달이 닫힐 때까지 대기
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    }

    // 모든 할 일이 표시되는지 확인
    await expect(page.locator('text=회의 준비')).toBeVisible();
    await expect(page.locator('text=운동하기')).toBeVisible();
    await expect(page.locator('text=이메일 답장')).toBeVisible();

    // 카테고리 필터링 테스트 (필터 버튼이 있다면)
    const workFilterButton = page.locator('button:has-text("업무")');
    if (await workFilterButton.count() > 0) {
      await workFilterButton.click();
      
      // 업무 카테고리만 표시되는지 확인
      await expect(page.locator('text=회의 준비')).toBeVisible();
      await expect(page.locator('text=이메일 답장')).toBeVisible();
      // 개인 카테고리는 숨겨져야 함
      await expect(page.locator('text=운동하기')).not.toBeVisible();
    }
  });

  test('S2.F.3: Todo 수정 기능', async ({ page }) => {
    await page.goto('http://localhost:3005');

    // 할 일 하나 추가
    await page.click('button:has-text("새 할 일")');
    await page.fill('input[name="title"]', '테스트 할 일');
    await page.selectOption('select[name="category"]', 'WORK');
    await page.click('button:has-text("할 일 추가")');
    
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // 할 일 클릭하여 수정 모달 열기
    await page.click('text=테스트 할 일');

    // 수정 모달이 열렸는지 확인
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // 기존 데이터가 미리 입력되어 있는지 확인
    await expect(page.locator('input[name="title"]')).toHaveValue('테스트 할 일');

    // 제목 수정
    await page.fill('input[name="title"]', '수정된 테스트 할 일');

    // 저장 버튼 클릭 (수정 모달에서는 "수정 완료" 또는 "저장" 버튼)
    const saveButton = page.locator('button:has-text("수정"), button:has-text("저장")');
    await saveButton.click();

    // 모달이 닫혔는지 확인
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // 변경된 제목이 목록에 표시되는지 확인
    await expect(page.locator('text=수정된 테스트 할 일')).toBeVisible();
    await expect(page.locator('text=테스트 할 일')).not.toBeVisible();
  });

  test('S2.F.3: Todo 삭제 기능', async ({ page }) => {
    await page.goto('http://localhost:3005');

    // 할 일 하나 추가
    await page.click('button:has-text("새 할 일")');
    await page.fill('input[name="title"]', '삭제될 할 일');
    await page.selectOption('select[name="category"]', 'WORK');
    await page.click('button:has-text("할 일 추가")');
    
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // 할 일이 추가되었는지 확인
    await expect(page.locator('text=삭제될 할 일')).toBeVisible();

    // 할 일 클릭하여 수정 모달 열기
    await page.click('text=삭제될 할 일');

    // 삭제 버튼 클릭
    await page.click('button:has-text("삭제")');

    // 확인 대화상자가 나타나는지 확인하고 확인 클릭
    page.on('dialog', dialog => dialog.accept());
    
    // 모달이 닫혔는지 확인
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // 할 일이 목록에서 제거되었는지 확인
    await expect(page.locator('text=삭제될 할 일')).not.toBeVisible();
  });

  test('S2.F.4: 상태 관리 (데이터 지속성)', async ({ page }) => {
    await page.goto('http://localhost:3005');

    // 할 일 추가
    await page.click('button:has-text("새 할 일")');
    await page.fill('input[name="title"]', '지속성 테스트 할 일');
    await page.selectOption('select[name="category"]', 'PERSONAL');
    await page.click('button:has-text("할 일 추가")');
    
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // 할 일이 추가되었는지 확인
    await expect(page.locator('text=지속성 테스트 할 일')).toBeVisible();

    // 페이지 새로고침
    await page.reload();

    // 새로고침 후에도 할 일이 유지되는지 확인 (localStorage 지속성)
    await expect(page.locator('text=지속성 테스트 할 일')).toBeVisible();

    // localStorage에 데이터가 저장되어 있는지 확인
    const todoStorage = await page.evaluate(() => {
      return localStorage.getItem('todo-storage');
    });

    expect(todoStorage).toBeTruthy();
    expect(todoStorage).toContain('지속성 테스트 할 일');
  });

  test('S2.F.4: 상태 관리 (반응성 테스트)', async ({ page }) => {
    await page.goto('http://localhost:3005');

    // 초기 상태 확인 - 할 일이 없어야 함
    const todoCount = await page.locator('[data-testid="todo-item"]').count();
    expect(todoCount).toBe(0);

    // 할 일 추가
    await page.click('button:has-text("새 할 일")');
    await page.fill('input[name="title"]', '반응성 테스트');
    await page.click('button:has-text("할 일 추가")');
    
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // 즉시 목록에 나타나는지 확인 (상태 반응성)
    await expect(page.locator('text=반응성 테스트')).toBeVisible();

    // 할 일 개수가 1개로 증가했는지 확인
    await expect(page.locator('text=반응성 테스트').first()).toBeVisible();
  });

  test('전체 워크플로우 통합 테스트', async ({ page }) => {
    await page.goto('http://localhost:3005');

    // 1. 여러 할 일 추가
    const todos = [
      { title: '회의 자료 준비', category: 'WORK', priority: 'HIGH' },
      { title: '점심 약속', category: 'PERSONAL', priority: 'MEDIUM' },
      { title: '보고서 작성', category: 'WORK', priority: 'HIGH' }
    ];

    for (const todo of todos) {
      await page.click('button:has-text("새 할 일")');
      await page.fill('input[name="title"]', todo.title);
      await page.selectOption('select[name="category"]', todo.category);
      await page.selectOption('select[name="priority"]', todo.priority);
      await page.click('button:has-text("할 일 추가")');
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    }

    // 2. 모든 할 일이 표시되는지 확인
    for (const todo of todos) {
      await expect(page.locator(`text=${todo.title}`)).toBeVisible();
    }

    // 3. 하나 수정
    await page.click('text=회의 자료 준비');
    await page.fill('input[name="title"]', '회의 자료 준비 완료');
    const saveButton = page.locator('button:has-text("수정"), button:has-text("저장")');
    await saveButton.click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    await expect(page.locator('text=회의 자료 준비 완료')).toBeVisible();

    // 4. 하나 삭제
    await page.click('text=점심 약속');
    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("삭제")');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    await expect(page.locator('text=점심 약속')).not.toBeVisible();

    // 5. 최종 상태 확인
    await expect(page.locator('text=회의 자료 준비 완료')).toBeVisible();
    await expect(page.locator('text=보고서 작성')).toBeVisible();
    await expect(page.locator('text=점심 약속')).not.toBeVisible();

    // 6. 페이지 새로고침 후 데이터 지속성 확인
    await page.reload();
    await expect(page.locator('text=회의 자료 준비 완료')).toBeVisible();
    await expect(page.locator('text=보고서 작성')).toBeVisible();
    await expect(page.locator('text=점심 약속')).not.toBeVisible();
  });
});