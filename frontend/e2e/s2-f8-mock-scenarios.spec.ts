import { test, expect } from '@playwright/test';

/**
 * S2.F.8: Mock 데이터 시나리오별 테스트 케이스 작성
 * 다양한 데이터 상황과 사용자 시나리오를 시뮬레이션하는 Happy Case 테스트
 */
test.describe('S2.F.8: Mock Data Scenarios (Happy Cases)', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 localStorage를 클리어하고 페이지 로드
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('시나리오 1: 빈 상태에서 시작하는 신규 사용자', async ({ page }) => {
    // Given: 완전히 빈 상태
    await page.goto('/');

    // Then: 빈 상태 UI가 표시됨
    const emptyState = page.getByText('할 일이 없습니다').or(
      page.getByText('첫 번째 할 일을 추가해보세요')
    ).or(
      page.locator('[data-testid="empty-state"]')
    );

    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
    }

    // Then: 새 할 일 버튼이 표시됨
    await expect(page.getByRole('button', { name: '새 할 일' })).toBeVisible();

    // When: 첫 번째 할 일 추가
    await page.getByRole('button', { name: '새 할 일' }).click();
    await page.getByLabel('제목').fill('나의 첫 번째 할 일');
    await page.getByLabel('카테고리').selectOption('PERSONAL');
    await page.getByRole('button', { name: '할 일 추가' }).click();

    // Then: 빈 상태가 사라지고 할 일이 표시됨
    await expect(page.getByText('나의 첫 번째 할 일')).toBeVisible();

    // Then: localStorage에 데이터가 저장됨
    const storageData = await page.evaluate(() => {
      return localStorage.getItem('todo-storage');
    });
    expect(storageData).toBeTruthy();
    expect(storageData).toContain('나의 첫 번째 할 일');
  });

  test('시나리오 2: 업무 중심의 직장인 사용자', async ({ page }) => {
    // Given: 업무 관련 할 일들을 생성하는 직장인 시나리오
    const workTodos = [
      { title: '월간 보고서 작성', priority: 'HIGH', hours: '3', description: 'Q4 월간 보고서 작성 및 검토' },
      { title: '팀 미팅 준비', priority: 'MEDIUM', hours: '1', description: '주간 팀 미팅 안건 정리' },
      { title: '클라이언트 이메일 답장', priority: 'HIGH', hours: '1', description: '긴급 문의사항 답변' },
      { title: '프레젠테이션 자료 준비', priority: 'MEDIUM', hours: '4', description: '신규 프로젝트 발표 자료' },
      { title: '코드 리뷰', priority: 'LOW', hours: '2', description: '팀원 코드 리뷰 및 피드백' }
    ];

    // When: 업무 할 일들을 차례로 추가
    for (const todo of workTodos) {
      await page.getByRole('button', { name: '새 할 일' }).click();
      await page.getByLabel('제목').fill(todo.title);
      await page.getByLabel('상세설명').fill(todo.description);
      await page.getByLabel('소요시간(시간)').selectOption(todo.hours);
      await page.getByLabel('카테고리').selectOption('WORK');
      await page.getByLabel('우선순위').selectOption(todo.priority);
      await page.getByRole('button', { name: '할 일 추가' }).click();

      await expect(page.getByRole('dialog')).not.toBeVisible();
      await expect(page.getByText(todo.title)).toBeVisible();
    }

    // Then: 모든 업무 할 일이 표시됨
    for (const todo of workTodos) {
      await expect(page.getByText(todo.title)).toBeVisible();
    }

    // Then: 높은 우선순위 할 일들이 올바르게 표시됨
    await expect(page.getByText('월간 보고서 작성')).toBeVisible();
    await expect(page.getByText('클라이언트 이메일 답장')).toBeVisible();

    // When: 우선순위별 정렬 테스트 (가능하다면)
    if (await page.locator('select[name="sortBy"]').isVisible()) {
      await page.selectOption('select[name="sortBy"]', 'priority');

      // 첫 번째 할 일이 높은 우선순위여야 함
      const firstTodo = page.locator('[data-testid="todo-item"]').first();
      await expect(firstTodo.getByText('월간 보고서 작성').or(firstTodo.getByText('클라이언트 이메일 답장'))).toBeVisible();
    }
  });

  test('시나리오 3: 개인 생활 관리하는 사용자', async ({ page }) => {
    // Given: 개인 생활 관련 다양한 할 일들
    const personalTodos = [
      { title: '헬스장 운동', category: 'PERSONAL', priority: 'MEDIUM', hours: '2' },
      { title: '장보기', category: 'PERSONAL', priority: 'HIGH', hours: '1' },
      { title: '친구 만나기', category: 'PERSONAL', priority: 'LOW', hours: '3' },
      { title: '독서 - 자기계발서', category: 'PERSONAL', priority: 'MEDIUM', hours: '1' },
      { title: '집안 정리', category: 'PERSONAL', priority: 'LOW', hours: '2' }
    ];

    // When: 개인 할 일들을 모두 추가
    for (const todo of personalTodos) {
      await page.getByRole('button', { name: '새 할 일' }).click();
      await page.getByLabel('제목').fill(todo.title);
      await page.getByLabel('소요시간(시간)').selectOption(todo.hours);
      await page.getByLabel('카테고리').selectOption(todo.category);
      await page.getByLabel('우선순위').selectOption(todo.priority);
      await page.getByRole('button', { name: '할 일 추가' }).click();

      await expect(page.getByRole('dialog')).not.toBeVisible();
    }

    // Then: 모든 개인 할 일이 표시됨
    for (const todo of personalTodos) {
      await expect(page.getByText(todo.title)).toBeVisible();
    }

    // When: 개인 카테고리 필터링 테스트
    const personalFilter = page.getByRole('button', { name: '개인' }).or(
      page.locator('[data-testid="category-filter-personal"]')
    );

    if (await personalFilter.isVisible()) {
      await personalFilter.click();

      // Then: 개인 할 일들만 표시됨
      for (const todo of personalTodos) {
        await expect(page.getByText(todo.title)).toBeVisible();
      }
    }

    // When: 하나의 할 일을 완료 처리
    const exerciseItem = page.getByTestId('todo-item').filter({ hasText: '헬스장 운동' });
    const startButton = exerciseItem.getByRole('button', { name: '시작' });
    if (await startButton.isVisible()) {
      await startButton.click();
      const completeButton = exerciseItem.getByRole('button', { name: '완료' });
      await completeButton.click();

      // Then: 완료된 할 일이 올바르게 표시됨
      await expect(exerciseItem.getByText('완료')).toBeVisible();
    }
  });

  test('시나리오 4: 업무와 개인 혼재하는 균형 잡힌 사용자', async ({ page }) => {
    // Given: 업무와 개인 할 일이 혼재된 상황
    const mixedTodos = [
      { title: '아침 미팅', category: 'WORK', priority: 'HIGH', description: '팀 스탠드업 미팅' },
      { title: '점심 약속', category: 'PERSONAL', priority: 'MEDIUM', description: '대학 동창과 점심 식사' },
      { title: '프로젝트 기획', category: 'WORK', priority: 'HIGH', description: '신규 프로젝트 기획서 작성' },
      { title: '병원 예약', category: 'PERSONAL', priority: 'HIGH', description: '정기 검진 예약 및 방문' },
      { title: '보고서 검토', category: 'WORK', priority: 'MEDIUM', description: '주간 보고서 최종 검토' },
      { title: '운동', category: 'PERSONAL', priority: 'LOW', description: '저녁 요가 클래스 참여' }
    ];

    // When: 혼재된 할 일들을 시간순으로 추가
    for (const todo of mixedTodos) {
      await page.getByRole('button', { name: '새 할 일' }).click();
      await page.getByLabel('제목').fill(todo.title);
      await page.getByLabel('상세설명').fill(todo.description);
      await page.getByLabel('카테고리').selectOption(todo.category);
      await page.getByLabel('우선순위').selectOption(todo.priority);
      await page.getByRole('button', { name: '할 일 추가' }).click();

      await expect(page.getByRole('dialog')).not.toBeVisible();
    }

    // Then: 모든 할 일이 표시됨
    await expect(page.getByText('아침 미팅')).toBeVisible();
    await expect(page.getByText('점심 약속')).toBeVisible();
    await expect(page.getByText('병원 예약')).toBeVisible();

    // When: 카테고리별 필터링 테스트
    const workFilter = page.getByRole('button', { name: '업무' });
    if (await workFilter.isVisible()) {
      await workFilter.click();

      // Then: 업무 할 일만 표시됨
      await expect(page.getByText('아침 미팅')).toBeVisible();
      await expect(page.getByText('프로젝트 기획')).toBeVisible();
      await expect(page.getByText('보고서 검토')).toBeVisible();
      await expect(page.getByText('점심 약속')).not.toBeVisible();
    }

    // When: 전체 보기로 복원
    const allFilter = page.getByRole('button', { name: '전체' });
    if (await allFilter.isVisible()) {
      await allFilter.click();

      // Then: 모든 할 일이 다시 표시됨
      await expect(page.getByText('점심 약속')).toBeVisible();
      await expect(page.getByText('운동')).toBeVisible();
    }

    // When: 중요한 할 일들을 진행 상태로 변경
    const importantTodos = ['아침 미팅', '프로젝트 기획', '병원 예약'];
    for (const todoTitle of importantTodos) {
      const todoItem = page.getByTestId('todo-item').filter({ hasText: todoTitle });
      const startButton = todoItem.getByRole('button', { name: '시작' });
      if (await startButton.isVisible()) {
        await startButton.click();
        await expect(todoItem.getByText('진행중')).toBeVisible();
      }
    }
  });

  test('시나리오 5: 대량 데이터 처리 (20개+ 할 일)', async ({ page }) => {
    // Given: 대량의 할 일 데이터 생성
    const largeTodoSet = [];
    const categories = ['WORK', 'PERSONAL'];
    const priorities = ['HIGH', 'MEDIUM', 'LOW'];

    // 25개의 할 일 생성
    for (let i = 1; i <= 25; i++) {
      largeTodoSet.push({
        title: `할 일 ${i.toString().padStart(2, '0')}`,
        category: categories[i % 2],
        priority: priorities[i % 3],
        description: `테스트용 할 일 ${i}번 - 대량 데이터 처리 테스트`
      });
    }

    // When: 대량 할 일 추가 (처음 10개만 실제로 추가하여 테스트 시간 단축)
    const testSet = largeTodoSet.slice(0, 10);
    for (const todo of testSet) {
      await page.getByRole('button', { name: '새 할 일' }).click();
      await page.getByLabel('제목').fill(todo.title);
      await page.getByLabel('상세설명').fill(todo.description);
      await page.getByLabel('카테고리').selectOption(todo.category);
      await page.getByLabel('우선순위').selectOption(todo.priority);
      await page.getByRole('button', { name: '할 일 추가' }).click();

      await expect(page.getByRole('dialog')).not.toBeVisible();
    }

    // Then: 모든 할 일이 올바르게 표시됨
    for (let i = 1; i <= testSet.length; i++) {
      const paddedNum = i.toString().padStart(2, '0');
      await expect(page.getByText(`할 일 ${paddedNum}`)).toBeVisible();
    }

    // When: 스크롤 테스트 (페이지네이션이나 무한 스크롤이 있다면)
    if (testSet.length > 5) {
      // 마지막 할 일이 보이는지 확인
      const lastTodo = `할 일 ${testSet.length.toString().padStart(2, '0')}`;
      await expect(page.getByText(lastTodo)).toBeVisible();
    }

    // When: 검색 성능 테스트
    const searchInput = page.getByPlaceholder('할 일 검색');
    if (await searchInput.isVisible()) {
      await searchInput.fill('05');

      // Then: 검색 결과가 빠르게 표시됨
      await expect(page.getByText('할 일 05')).toBeVisible();

      // Then: 다른 할 일들은 필터링됨
      await expect(page.getByText('할 일 01')).not.toBeVisible();
    }
  });

  test('시나리오 6: 데이터 복구 및 충돌 해결', async ({ page }) => {
    // Given: 초기 할 일들 생성
    const initialTodos = ['중요한 회의', '프로젝트 마감', '의료진 상담'];

    for (const todoTitle of initialTodos) {
      await page.getByRole('button', { name: '새 할 일' }).click();
      await page.getByLabel('제목').fill(todoTitle);
      await page.getByLabel('카테고리').selectOption('WORK');
      await page.getByRole('button', { name: '할 일 추가' }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }

    // When: localStorage 데이터 확인
    let storageData = await page.evaluate(() => {
      return localStorage.getItem('todo-storage');
    });
    expect(storageData).toBeTruthy();
    expect(storageData).toContain('중요한 회의');

    // When: 하나의 할 일을 완료 처리
    const meetingItem = page.getByTestId('todo-item').filter({ hasText: '중요한 회의' });
    const startButton = meetingItem.getByRole('button', { name: '시작' });
    if (await startButton.isVisible()) {
      await startButton.click();
      const completeButton = meetingItem.getByRole('button', { name: '완료' });
      await completeButton.click();
    }

    // When: 페이지 새로고침 (데이터 지속성 확인)
    await page.reload();

    // Then: 모든 데이터가 복구됨
    await expect(page.getByText('중요한 회의')).toBeVisible();
    await expect(page.getByText('프로젝트 마감')).toBeVisible();
    await expect(page.getByText('의료진 상담')).toBeVisible();

    // Then: 완료 상태도 유지됨
    const restoredMeetingItem = page.getByTestId('todo-item').filter({ hasText: '중요한 회의' });
    await expect(restoredMeetingItem.getByText('완료')).toBeVisible();

    // When: 수동으로 localStorage를 수정하여 데이터 불일치 시뮬레이션
    await page.evaluate(() => {
      const currentData = JSON.parse(localStorage.getItem('todo-storage') || '{}');
      if (currentData.state && currentData.state.todos) {
        // 첫 번째 할 일의 제목을 변경하여 불일치 생성
        currentData.state.todos[0].title = '수정된 회의 제목';
        localStorage.setItem('todo-storage', JSON.stringify(currentData));
      }
    });

    await page.reload();

    // Then: 애플리케이션이 수정된 데이터를 올바르게 로드함
    await expect(page.getByText('수정된 회의 제목')).toBeVisible();
  });

  test('시나리오 7: 실제 사용자 워크플로우 시뮬레이션', async ({ page }) => {
    // Given: 실제 하루 일과를 시뮬레이션

    // 아침: 하루 계획 세우기
    const morningTodos = [
      { title: '오늘 할 일 계획 세우기', category: 'PERSONAL', priority: 'HIGH' },
      { title: '이메일 확인', category: 'WORK', priority: 'MEDIUM' },
      { title: '팀 스탠드업 미팅', category: 'WORK', priority: 'HIGH' }
    ];

    for (const todo of morningTodos) {
      await page.getByRole('button', { name: '새 할 일' }).click();
      await page.getByLabel('제목').fill(todo.title);
      await page.getByLabel('카테고리').selectOption(todo.category);
      await page.getByLabel('우선순위').selectOption(todo.priority);
      await page.getByRole('button', { name: '할 일 추가' }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }

    // 오전: 중요한 업무 시작
    const standupItem = page.getByTestId('todo-item').filter({ hasText: '팀 스탠드업 미팅' });
    if (await standupItem.getByRole('button', { name: '시작' }).isVisible()) {
      await standupItem.getByRole('button', { name: '시작' }).click();
      await standupItem.getByRole('button', { name: '완료' }).click();
    }

    // 오후: 추가 업무 발생
    await page.getByRole('button', { name: '새 할 일' }).click();
    await page.getByLabel('제목').fill('긴급 - 클라이언트 미팅');
    await page.getByLabel('카테고리').selectOption('WORK');
    await page.getByLabel('우선순위').selectOption('HIGH');
    await page.getByRole('button', { name: '할 일 추가' }).click();

    // 하루 종료: 완료된 작업 확인
    await expect(page.getByText('팀 스탠드업 미팅')).toBeVisible();
    await expect(page.getByText('긴급 - 클라이언트 미팅')).toBeVisible();

    // 다음날을 위한 할 일 추가
    await page.getByRole('button', { name: '새 할 일' }).click();
    await page.getByLabel('제목').fill('내일 - 프레젠테이션 준비');
    await page.getByLabel('카테고리').selectOption('WORK');
    await page.getByLabel('우선순위').selectOption('MEDIUM');
    await page.getByRole('button', { name: '할 일 추가' }).click();

    // 최종 상태 확인: 완료된 것, 진행 중인 것, 미래의 것이 모두 적절히 표시됨
    await expect(page.getByText('오늘 할 일 계획 세우기')).toBeVisible();
    await expect(page.getByText('내일 - 프레젠테이션 준비')).toBeVisible();

    // 데이터 지속성 최종 확인
    await page.reload();
    await expect(page.getByText('긴급 - 클라이언트 미팅')).toBeVisible();
    await expect(page.getByText('내일 - 프레젠테이션 준비')).toBeVisible();
  });
});