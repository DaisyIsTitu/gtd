'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Todo, TodoCategory, TodoPriority, TodoStatus, UpdateTodoForm } from '@/types';
// Removed todoApi import - using props instead for API calls

// E2E 테스트 환경에서는 로그 비활성화
const isDev = process.env.NODE_ENV === 'development';
const isE2E = process.env.NODE_ENV === 'test';

interface TodoEditModalProps {
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
  onTodoUpdated?: (updatedTodo: Todo) => void;
  onTodoDeleted?: (todoId: string) => void;
}

const CATEGORY_OPTIONS = [
  { value: 'WORK' as TodoCategory, label: '업무', icon: '💼' },
  { value: 'PERSONAL' as TodoCategory, label: '개인', icon: '👤' },
  { value: 'HEALTH' as TodoCategory, label: '건강', icon: '🏥' },
  { value: 'LEARNING' as TodoCategory, label: '학습', icon: '📚' },
  { value: 'SOCIAL' as TodoCategory, label: '사회', icon: '👥' },
  { value: 'OTHER' as TodoCategory, label: '기타', icon: '📌' },
];

const PRIORITY_OPTIONS = [
  { value: 'URGENT' as TodoPriority, label: '긴급', color: 'text-red-600', bg: 'bg-red-50' },
  { value: 'HIGH' as TodoPriority, label: '높음', color: 'text-orange-600', bg: 'bg-orange-50' },
  { value: 'MEDIUM' as TodoPriority, label: '보통', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { value: 'LOW' as TodoPriority, label: '낮음', color: 'text-gray-600', bg: 'bg-gray-50' },
];

const STATUS_OPTIONS = [
  { value: 'WAITING' as TodoStatus, label: '대기중', icon: '⏳', color: 'text-gray-600' },
  { value: 'SCHEDULED' as TodoStatus, label: '예정', icon: '📅', color: 'text-blue-600' },
  { value: 'IN_PROGRESS' as TodoStatus, label: '진행중', icon: '🔄', color: 'text-yellow-600' },
  { value: 'COMPLETED' as TodoStatus, label: '완료', icon: '✅', color: 'text-green-600' },
  { value: 'MISSED' as TodoStatus, label: '놓침', icon: '❌', color: 'text-red-600' },
  { value: 'CANCELLED' as TodoStatus, label: '취소', icon: '🚫', color: 'text-gray-500' },
];

const DURATION_OPTIONS = [
  { value: 30, label: '30분' },
  { value: 60, label: '1시간' },
  { value: 90, label: '1시간 30분' },
  { value: 120, label: '2시간' },
  { value: 150, label: '2시간 30분' },
  { value: 180, label: '3시간' },
  { value: 240, label: '4시간' },
  { value: 300, label: '5시간' },
  { value: 360, label: '6시간' },
];

export default function TodoEditModal({ 
  todo, 
  isOpen, 
  onClose, 
  onTodoUpdated, 
  onTodoDeleted 
}: TodoEditModalProps) {
  // Form state
  const [formData, setFormData] = useState<UpdateTodoForm>({
    title: '',
    description: '',
    duration: 120,
    category: 'WORK',
    priority: 'MEDIUM',
    status: 'WAITING',
    tags: [],
    deadline: undefined,
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form data when todo changes
  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title,
        description: todo.description || '',
        duration: todo.duration,
        category: todo.category,
        priority: todo.priority,
        status: todo.status,
        tags: [...todo.tags],
        deadline: todo.deadline ? todo.deadline.toISOString().slice(0, 16) : undefined,
      });
      setError(null);
      setShowDeleteConfirm(false);
    }
  }, [todo]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTagInput('');
      setError(null);
      setShowDeleteConfirm(false);
    }
  }, [isOpen]);

  const handleInputChange = useCallback((field: keyof UpdateTodoForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }, [error]);

  const handleTagAdd = useCallback(() => {
    const newTag = tagInput.trim();
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag]
      }));
      setTagInput('');
    }
  }, [tagInput, formData.tags]);

  const handleTagRemove = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  }, []);

  const handleTagKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  }, [handleTagAdd]);

  const validateForm = useCallback((): string | null => {
    if (!formData.title?.trim()) {
      return '제목을 입력해주세요.';
    }
    if (formData.title.trim().length > 200) {
      return '제목은 200자 이하로 입력해주세요.';
    }
    if (formData.description && formData.description.length > 1000) {
      return '설명은 1000자 이하로 입력해주세요.';
    }
    if (!formData.duration || formData.duration < 30 || formData.duration > 480) {
      return '소요시간은 30분에서 8시간 사이로 설정해주세요.';
    }
    return null;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!todo) {
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updateData = {
        ...formData,
        title: formData.title!.trim(),
        description: formData.description?.trim(),
        tags: formData.tags || [],
      };

      if (onTodoUpdated) {
        // Create the updated todo object for the callback
        const updatedTodo: Todo = {
          ...todo,
          ...updateData,
          deadline: updateData.deadline ? new Date(updateData.deadline) : undefined,
          updatedAt: new Date()
        };

        await onTodoUpdated(updatedTodo);
        onClose();
      } else {
        setError('할 일 수정 기능이 연결되지 않았습니다.');
      }
    } catch (error) {
      setError('할 일 수정 중 오류가 발생했습니다.');
      console.error('Todo update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!todo) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('📞 TodoEditModal - onTodoDeleted 호출 시작');
      if (onTodoDeleted) {
        await onTodoDeleted(todo.id);
        onClose();
      } else {
        setError('할 일 삭제 기능이 연결되지 않았습니다.');
      }
    } catch (error) {
      setError('할 일 삭제 중 오류가 발생했습니다.');
      console.error('Todo delete error:', error);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const canChangeStatus = useCallback((currentStatus: TodoStatus, newStatus: TodoStatus): boolean => {
    // Status transition validation logic
    const transitions: Record<TodoStatus, TodoStatus[]> = {
      WAITING: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      SCHEDULED: ['WAITING', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'SCHEDULED', 'CANCELLED'],
      COMPLETED: ['IN_PROGRESS'], // Allow uncompleting
      MISSED: ['WAITING', 'SCHEDULED', 'CANCELLED'],
      CANCELLED: ['WAITING'],
    };

    return transitions[currentStatus]?.includes(newStatus) || currentStatus === newStatus;
  }, []);

  if (!isOpen || !todo) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">할 일 수정</h3>
            <button
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="할 일 제목을 입력하세요"
                maxLength={200}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.title?.length || 0}/200자
              </p>
            </div>

            {/* Duration and Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  소요시간 <span className="text-red-500">*</span>
                </label>
                <select
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', Number(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                >
                  {DURATION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value as TodoCategory)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                >
                  {CATEGORY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority and Status Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  우선순위
                </label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value as TodoPriority)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {PRIORITY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  상태
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as TodoStatus)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {STATUS_OPTIONS.map(option => (
                    <option 
                      key={option.value} 
                      value={option.value}
                      disabled={!canChangeStatus(todo.status, option.value)}
                    >
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="할 일에 대한 상세 설명을 입력하세요"
                maxLength={1000}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.description?.length || 0}/1000자
              </p>
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                마감일
              </label>
              <input
                type="datetime-local"
                id="deadline"
                value={formData.deadline || ''}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tag-input" className="block text-sm font-medium text-gray-700 mb-1">
                태그
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="tag-input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="태그 입력 후 Enter"
                />
                <button
                  type="button"
                  onClick={handleTagAdd}
                  className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  추가
                </button>
              </div>
              
              {formData.tags && formData.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:bg-blue-200 focus:text-blue-600 focus:outline-none"
                      >
                        <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                          <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6-6 6" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              {/* Delete Button */}
              <div>
                {showDeleteConfirm ? (
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isLoading}
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          삭제 중...
                        </>
                      ) : (
                        '확인'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isLoading}
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isLoading}
                    className="inline-flex justify-center rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    삭제
                  </button>
                )}
              </div>

              {/* Submit and Cancel Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      수정 중...
                    </>
                  ) : (
                    '할 일 수정'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}