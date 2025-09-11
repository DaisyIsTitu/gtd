// localStorage 직접 확인용 유틸리티
export const localStorageInspector = {
  // 현재 저장된 데이터 출력
  inspect: () => {
    console.group('📦 localStorage 현재 상태');
    
    const keys = ['gtd_todos', 'gtd_schedules', 'gtd_last_todo_id', 'gtd_last_schedule_id'];
    
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          console.log(`${key}:`, parsed);
        } catch {
          console.log(`${key}:`, data);
        }
      } else {
        console.log(`${key}: null`);
      }
    });
    
    console.groupEnd();
  },

  // 용량 확인
  getUsage: () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage.getItem(key)?.length || 0;
      }
    }
    console.log(`💾 localStorage 사용량: ${(total / 1024).toFixed(2)}KB`);
    return total;
  },

  // GTD 관련 데이터만 확인
  inspectGTD: () => {
    console.group('🎯 GTD App 데이터');
    
    try {
      const todos = JSON.parse(localStorage.getItem('gtd_todos') || '[]');
      const schedules = JSON.parse(localStorage.getItem('gtd_schedules') || '[]');
      
      console.log(`📋 Todos: ${todos.length}개`);
      console.table(todos.map((t: any) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        category: t.category,
        priority: t.priority
      })));
      
      console.log(`📅 Schedules: ${schedules.length}개`);
      console.table(schedules.map((s: any) => ({
        id: s.id,
        todoId: s.todoId,
        startTime: new Date(s.startTime).toLocaleString(),
        endTime: new Date(s.endTime).toLocaleString(),
        status: s.status
      })));
      
    } catch (error) {
      console.error('❌ 데이터 파싱 오류:', error);
    }
    
    console.groupEnd();
  }
};

// 브라우저 콘솔에서 사용할 수 있도록 window에 추가
if (typeof window !== 'undefined') {
  (window as any).inspectStorage = localStorageInspector.inspect;
  (window as any).inspectGTD = localStorageInspector.inspectGTD;
  (window as any).getStorageUsage = localStorageInspector.getUsage;
}