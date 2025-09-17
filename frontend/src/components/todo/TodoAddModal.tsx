'use client';

import { useState, useRef, useEffect } from 'react';
import { TodoCategory, TodoPriority, CreateTodoForm } from '@/types';

interface TodoAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTodoCreated?: (todoData: any) => Promise<void>;
}

// 카테고리 옵션
const CATEGORY_OPTIONS: { value: TodoCategory; label: string; icon: string }[] = [
  { value: 'WORK', label: '업무', icon: '💼' },
  { value: 'PERSONAL', label: '개인', icon: '👤' },
  { value: 'HEALTH', label: '건강', icon: '🏥' },
  { value: 'LEARNING', label: '학습', icon: '📚' },
  { value: 'SOCIAL', label: '사회', icon: '👥' },
  { value: 'OTHER', label: '기타', icon: '📌' },
];

// 우선순위 옵션
const PRIORITY_OPTIONS: { value: TodoPriority; label: string; color: string; icon: string }[] = [
  { value: 'URGENT', label: '긴급', color: 'text-red-600', icon: '🔥' },
  { value: 'HIGH', label: '높음', color: 'text-orange-600', icon: '⬆️' },
  { value: 'MEDIUM', label: '보통', color: 'text-yellow-600', icon: '➡️' },
  { value: 'LOW', label: '낮음', color: 'text-gray-600', icon: '⬇️' },
];

// 기본 소요시간 옵션 (분 단위)
const DURATION_PRESETS = [30, 60, 90, 120, 180, 240, 300, 360, 420, 480];

interface FormErrors {
  title?: string;
  duration?: string;
  category?: string;
  priority?: string;
  deadline?: string;
  tags?: string;
}

export default function TodoAddModal({ isOpen, onClose, onTodoCreated }: TodoAddModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [tagInput, setTagInput] = useState('');
  const [showDurationPresets, setShowDurationPresets] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // 폼 데이터 상태
  const [formData, setFormData] = useState<CreateTodoForm>({
    title: '',
    description: '',
    duration: 120, // 기본 2시간
    category: 'WORK',
    priority: 'MEDIUM',
    tags: [],
    deadline: undefined,
  });

  // 모달이 열릴 때마다 폼 초기화 및 포커스
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        duration: 120,
        category: 'WORK',
        priority: 'MEDIUM',
        tags: [],
        deadline: undefined,
      });
      setErrors({});
      setTagInput('');
      setShowDurationPresets(false);
      
      // 약간의 지연 후 포커스 (모달 애니메이션 완료 후)
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isLoading, onClose]);

  // 클릭 외부 영역 클릭시 모달 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, isLoading, onClose]);

  // 입력 변경 핸들러
  const handleInputChange = (field: keyof CreateTodoForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 해당 필드의 에러 클리어
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // 태그 추가 핸들러
  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      
      if (newTag && !formData.tags.includes(newTag)) {
        if (formData.tags.length >= 5) {
          setErrors(prev => ({
            ...prev,
            tags: '태그는 최대 5개까지만 추가할 수 있습니다.'
          }));
          return;
        }
        
        handleInputChange('tags', [...formData.tags, newTag]);
        setTagInput('');
        setErrors(prev => ({
          ...prev,
          tags: undefined
        }));
      }
    }
  };

  // 태그 제거 핸들러
  const handleTagRemove = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 제목 검증
    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = '제목은 200자를 초과할 수 없습니다.';
    }

    // 소요시간 검증
    if (formData.duration < 30) {
      newErrors.duration = '소요시간은 최소 30분 이상이어야 합니다.';
    } else if (formData.duration > 480) {
      newErrors.duration = '소요시간은 최대 480분(8시간)을 초과할 수 없습니다.';
    }

    // 설명 검증
    if (formData.description && formData.description.length > 1000) {
      newErrors.title = '설명은 1000자를 초과할 수 없습니다.';
    }

    // 마감일 검증 (현재 시간보다 이후인지)
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const now = new Date();
      if (deadlineDate <= now) {
        newErrors.deadline = '마감일은 현재 시간보다 이후여야 합니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      // onTodoCreated prop을 통해 store의 createTodo 함수 호출
      if (onTodoCreated) {
        await onTodoCreated(formData);
        onClose();
        // 성공 알림은 부모 컴포넌트에서 처리
      } else {
        setErrors({ title: 'onTodoCreated 함수가 전달되지 않았습니다.' });
      }
    } catch (error) {
      console.error('할 일 생성 오류:', error);
      setErrors({ title: '할 일 생성 중 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 소요시간 프리셋 선택
  const handleDurationPreset = (minutes: number) => {
    handleInputChange('duration', minutes);
    setShowDurationPresets(false);
  };

  // 소요시간 포맷터
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
    }
    return `${mins}분`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">새 할 일 추가</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 모달 콘텐츠 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 제목 입력 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleInputRef}
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="할 일의 제목을 입력해주세요"
              maxLength={200}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* 설명 입력 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="할 일에 대한 자세한 설명을 입력해주세요"
              maxLength={1000}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.description?.length || 0}/1000자
            </p>
          </div>

          {/* 소요시간과 카테고리 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 소요시간 */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                소요시간 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="flex">
                  <input
                    type="number"
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                    min={30}
                    max={480}
                    step={15}
                    className={`flex-1 px-4 py-3 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.duration ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowDurationPresets(!showDurationPresets)}
                    className="px-3 py-3 bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-100 transition-colors"
                    disabled={isLoading}
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                {/* 소요시간 프리셋 드롭다운 */}
                {showDurationPresets && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {DURATION_PRESETS.map(minutes => (
                      <button
                        key={minutes}
                        type="button"
                        onClick={() => handleDurationPreset(minutes)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span>{formatDuration(minutes)}</span>
                        <span className="text-xs text-gray-500">{minutes}분</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                현재: {formatDuration(formData.duration)}
              </p>
            </div>

            {/* 카테고리 */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value as TodoCategory)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isLoading}
              >
                {CATEGORY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 우선순위와 마감일 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 우선순위 */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                우선순위 <span className="text-red-500">*</span>
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value as TodoPriority)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isLoading}
              >
                {PRIORITY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 마감일 */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                마감일
              </label>
              <input
                type="datetime-local"
                id="deadline"
                value={formData.deadline || ''}
                onChange={(e) => handleInputChange('deadline', e.target.value || undefined)}
                min={new Date().toISOString().slice(0, 16)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.deadline ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.deadline && (
                <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
              )}
            </div>
          </div>

          {/* 태그 입력 */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              태그
            </label>
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagAdd}
              placeholder="태그를 입력하고 Enter 또는 쉼표(,)를 눌러주세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isLoading}
            />
            {errors.tags && (
              <p className="mt-1 text-sm text-red-600">{errors.tags}</p>
            )}
            
            {/* 태그 목록 */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      disabled={isLoading}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              태그 {formData.tags.length}/5개 
              {formData.tags.length === 0 && ' • Enter 또는 쉼표(,)로 구분해서 입력하세요'}
            </p>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title.trim()}
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  생성 중...
                </div>
              ) : (
                '할 일 추가'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}