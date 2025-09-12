// 스케줄링 서비스 - Mock API와 연동하여 자동 스케줄링 기능 제공

import { Todo, TodoSchedule, AvailableSlot, SchedulingRequest, SchedulingResult } from '@/types';
import { scheduleApi, schedulingApi } from '@/lib/mockApi';
import { 
  WORK_HOURS, 
  SCHEDULING, 
  CALENDAR_HOURS, 
  isWorkHour, 
  isLunchTime, 
  isWeekend 
} from '@/lib/constants';

export interface TimeSlot {
  date: Date;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  duration: number; // minutes
  isWorkTime: boolean;
  isAvailable: boolean;
}

export interface SchedulingOptions {
  preferWorkHours?: boolean;
  respectPriority?: boolean;
  groupSimilarTasks?: boolean;
  maxDailyHours?: number;
  breakTime?: number;
}

class SchedulingService {
  private defaultOptions: SchedulingOptions = {
    preferWorkHours: true,
    respectPriority: true,
    groupSimilarTasks: true,
    maxDailyHours: 8,
    breakTime: SCHEDULING.BREAK_TIME,
  };

  /**
   * WAITING 상태의 Todo들을 자동으로 스케줄링
   */
  async autoScheduleWaitingTodos(
    todos: Todo[],
    existingSchedules: TodoSchedule[] = [],
    options: SchedulingOptions = {}
  ): Promise<SchedulingResult> {
    const opts = { ...this.defaultOptions, ...options };
    
    // WAITING 상태의 Todo만 필터링
    const waitingTodos = todos.filter(todo => todo.status === 'WAITING');
    
    if (waitingTodos.length === 0) {
      return {
        success: true,
        scheduledTodos: [],
        conflicts: [],
        suggestions: ['스케줄링할 대기중인 할 일이 없습니다.'],
        message: '스케줄링할 할 일이 없습니다.'
      };
    }

    // Todo를 우선순위별로 정렬
    const sortedTodos = this.sortTodosByPriority(waitingTodos, opts.respectPriority);
    
    // 가용 시간 슬롯 생성 (다음 7일)
    const availableSlots = this.generateAvailableSlots(7, existingSchedules, opts.preferWorkHours);
    
    // 스케줄링 실행
    const schedulingRequest: SchedulingRequest = {
      todoIds: sortedTodos.map(todo => todo.id),
      preferences: {
        groupSimilarTasks: opts.groupSimilarTasks,
        respectDeadlines: true,
      }
    };

    // Mock API 호출
    const result = await schedulingApi.autoSchedule(schedulingRequest);
    
    return result.data || {
      success: false,
      scheduledTodos: [],
      conflicts: [],
      suggestions: [],
      message: '스케줄링에 실패했습니다.'
    };
  }

  /**
   * 특정 Todo를 원하는 시간에 수동 스케줄링
   */
  async scheduleToSpecificTime(
    todo: Todo,
    targetDate: Date,
    targetHour: number,
    targetMinute: number = 0,
    existingSchedules: TodoSchedule[] = []
  ): Promise<{ success: boolean; schedule?: TodoSchedule; error?: string }> {
    const startTime = new Date(targetDate);
    startTime.setHours(targetHour, targetMinute, 0, 0);
    
    const endTime = new Date(startTime.getTime() + todo.duration * 60000);
    
    // 충돌 검사
    const conflicts = this.checkTimeConflicts(startTime, endTime, existingSchedules);
    
    if (conflicts.length > 0) {
      return {
        success: false,
        error: `다른 일정과 겹칩니다: ${conflicts[0].startTime} - ${conflicts[0].endTime}`
      };
    }

    // 스케줄 생성
    const newSchedule: Omit<TodoSchedule, 'id' | 'createdAt'> = {
      todoId: todo.id,
      startTime,
      endTime,
      status: 'SCHEDULED',
    };

    try {
      // Mock API를 통해 스케줄 생성
      const result = await scheduleApi.createSchedule(newSchedule);
      
      if (result.success && result.data) {
        return {
          success: true,
          schedule: result.data
        };
      } else {
        return {
          success: false,
          error: result.message || '스케줄 생성에 실패했습니다.'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: '스케줄 생성 중 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 다음 주 가용 시간 슬롯 생성
   */
  generateAvailableSlots(
    days: number = 7,
    existingSchedules: TodoSchedule[] = [],
    preferWorkHours: boolean = true
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const today = new Date();
    
    for (let day = 0; day < days; day++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + day);
      
      // 주말 건너뛰기 (옵션)
      if (isWeekend(currentDate) && preferWorkHours) {
        continue;
      }

      // 하루의 시간 슬롯 생성
      const daySlots = this.generateDayTimeSlots(currentDate, existingSchedules, preferWorkHours);
      slots.push(...daySlots);
    }

    return slots;
  }

  /**
   * 특정 날짜의 시간 슬롯 생성
   */
  private generateDayTimeSlots(
    date: Date,
    existingSchedules: TodoSchedule[],
    preferWorkHours: boolean
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const startHour = preferWorkHours ? WORK_HOURS.START : CALENDAR_HOURS.START;
    const endHour = preferWorkHours ? WORK_HOURS.END : CALENDAR_HOURS.END;

    // 해당 날짜의 기존 스케줄 필터링
    const daySchedules = existingSchedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startTime);
      return (
        scheduleDate.getFullYear() === date.getFullYear() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getDate() === date.getDate()
      );
    });

    // 30분 단위로 시간 슬롯 생성
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(slotStart.getTime() + 30 * 60000); // 30분 추가

        // 기존 스케줄과 겹치는지 확인
        const isAvailable = !this.hasTimeConflict(slotStart, slotEnd, daySchedules);
        
        const slot: TimeSlot = {
          date,
          startHour: hour,
          startMinute: minute,
          endHour: slotEnd.getHours(),
          endMinute: slotEnd.getMinutes(),
          duration: 30,
          isWorkTime: isWorkHour(hour) && !isLunchTime(hour),
          isAvailable,
        };

        slots.push(slot);
      }
    }

    return slots;
  }

  /**
   * Todo를 우선순위순으로 정렬
   */
  private sortTodosByPriority(todos: Todo[], respectPriority: boolean = true): Todo[] {
    if (!respectPriority) {
      return [...todos];
    }

    const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    
    return [...todos].sort((a, b) => {
      // 1. 우선순위
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // 2. 마감일 (가까운 순)
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (a.deadline && !b.deadline) return -1;
      if (!a.deadline && b.deadline) return 1;

      // 3. 생성일 (최신 순)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  /**
   * 시간 충돌 검사
   */
  private checkTimeConflicts(
    startTime: Date,
    endTime: Date,
    existingSchedules: TodoSchedule[]
  ): TodoSchedule[] {
    return existingSchedules.filter(schedule =>
      this.hasTimeConflict(startTime, endTime, [schedule])
    );
  }

  /**
   * 특정 시간 범위가 기존 스케줄과 겹치는지 확인
   */
  private hasTimeConflict(
    startTime: Date,
    endTime: Date,
    schedules: TodoSchedule[]
  ): boolean {
    return schedules.some(schedule => {
      const scheduleStart = new Date(schedule.startTime);
      const scheduleEnd = new Date(schedule.endTime);

      // 시간 범위 겹침 체크
      return (
        (startTime < scheduleEnd && endTime > scheduleStart)
      );
    });
  }

  /**
   * 가용한 시간 블록 찾기 (연속된 시간)
   */
  findAvailableTimeBlocks(
    duration: number, // 필요한 시간 (분)
    slots: TimeSlot[]
  ): TimeSlot[] {
    const availableSlots = slots.filter(slot => slot.isAvailable);
    const blocks: TimeSlot[] = [];

    for (let i = 0; i < availableSlots.length; i++) {
      const block = this.findContinuousBlock(availableSlots, i, duration);
      if (block) {
        blocks.push(block);
        // 겹치지 않는 다음 블록을 찾기 위해 i를 조정
        const blockEndMinutes = (block.endHour * 60) + block.endMinute;
        while (i < availableSlots.length - 1) {
          const nextSlot = availableSlots[i + 1];
          const nextSlotMinutes = (nextSlot.startHour * 60) + nextSlot.startMinute;
          if (nextSlotMinutes >= blockEndMinutes) break;
          i++;
        }
      }
    }

    return blocks;
  }

  /**
   * 연속된 시간 블록 찾기
   */
  private findContinuousBlock(
    slots: TimeSlot[],
    startIndex: number,
    requiredDuration: number
  ): TimeSlot | null {
    let totalDuration = 0;
    const startSlot = slots[startIndex];
    let endSlot = startSlot;

    for (let i = startIndex; i < slots.length; i++) {
      const currentSlot = slots[i];
      
      // 같은 날짜인지 확인
      if (currentSlot.date.toDateString() !== startSlot.date.toDateString()) {
        break;
      }

      // 연속된 시간인지 확인
      if (i > startIndex) {
        const prevSlot = slots[i - 1];
        const prevEndMinutes = (prevSlot.endHour * 60) + prevSlot.endMinute;
        const currentStartMinutes = (currentSlot.startHour * 60) + currentSlot.startMinute;
        
        if (currentStartMinutes !== prevEndMinutes) {
          break; // 연속되지 않음
        }
      }

      totalDuration += currentSlot.duration;
      endSlot = currentSlot;

      if (totalDuration >= requiredDuration) {
        return {
          date: startSlot.date,
          startHour: startSlot.startHour,
          startMinute: startSlot.startMinute,
          endHour: endSlot.endHour,
          endMinute: endSlot.endMinute,
          duration: totalDuration,
          isWorkTime: startSlot.isWorkTime,
          isAvailable: true,
        };
      }
    }

    return null;
  }

  /**
   * 스케줄링 가능성 분석
   */
  async analyzeSchedulingFeasibility(
    todos: Todo[],
    existingSchedules: TodoSchedule[] = [],
    days: number = 7
  ): Promise<{
    totalRequiredTime: number;
    totalAvailableTime: number;
    canScheduleAll: boolean;
    problematicTodos: Todo[];
    suggestions: string[];
  }> {
    const waitingTodos = todos.filter(todo => todo.status === 'WAITING');
    const totalRequiredTime = waitingTodos.reduce((sum, todo) => sum + todo.duration, 0);
    
    const availableSlots = this.generateAvailableSlots(days, existingSchedules, true);
    const totalAvailableTime = availableSlots
      .filter(slot => slot.isAvailable)
      .reduce((sum, slot) => sum + slot.duration, 0);

    const problematicTodos = waitingTodos.filter(todo => {
      const availableBlocks = this.findAvailableTimeBlocks(todo.duration, availableSlots);
      return availableBlocks.length === 0;
    });

    const canScheduleAll = totalRequiredTime <= totalAvailableTime && problematicTodos.length === 0;

    const suggestions: string[] = [];
    if (!canScheduleAll) {
      suggestions.push(`총 필요 시간: ${Math.ceil(totalRequiredTime / 60)}시간, 가용 시간: ${Math.ceil(totalAvailableTime / 60)}시간`);
      if (problematicTodos.length > 0) {
        suggestions.push(`${problematicTodos.length}개 할 일이 너무 길어서 배치하기 어렵습니다.`);
      }
      suggestions.push('일부 할 일의 소요시간을 줄이거나 더 많은 시간을 확보해보세요.');
    }

    return {
      totalRequiredTime,
      totalAvailableTime,
      canScheduleAll,
      problematicTodos,
      suggestions,
    };
  }
}

// 싱글톤 인스턴스
export const schedulingService = new SchedulingService();
export default schedulingService;