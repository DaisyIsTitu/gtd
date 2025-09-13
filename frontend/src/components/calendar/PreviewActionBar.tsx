'use client';

import React from 'react';

interface PreviewActionBarProps {
  previewResult: any;
  onApply: () => void;
  onRetry: () => void;
  onCancel: () => void;
}

export default function PreviewActionBar({
  previewResult,
  onApply,
  onRetry,
  onCancel,
}: PreviewActionBarProps) {
  return (
    <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-blue-900">자동 배치 미리보기</h3>
          </div>

          {previewResult && (
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-green-700">
                ✅ 성공: {previewResult.scheduledTodos?.length || 0}개
              </span>
              {previewResult.splitTodos && previewResult.splitTodos.length > 0 && (
                <span className="text-blue-700">
                  🔄 분할: {previewResult.splitTodos.length}개
                </span>
              )}
              {previewResult.failedTodos && previewResult.failedTodos.length > 0 && (
                <span className="text-red-700">
                  ⚠️ 실패: {previewResult.failedTodos.length}개
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRetry}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            다시 배치
          </button>

          <button
            onClick={onCancel}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            취소
          </button>

          <button
            onClick={onApply}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            적용
          </button>
        </div>
      </div>
    </div>
  );
}