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
  const totalScheduled = previewResult?.scheduledTodos?.length || 0;
  const totalSplit = previewResult?.splitTodos?.length || 0;
  const totalFailed = previewResult?.failedTodos?.length || 0;

  return (
    <div className="preview-action-bar px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">🔍 자동 배치 미리보기</h3>
              <p className="text-sm text-emerald-100 opacity-90">
                배치 결과를 확인한 후 적용하세요
              </p>
            </div>
          </div>

          {previewResult && (
            <div className="preview-stats">
              <div className="preview-stat-item">
                <div className="preview-stat-number preview-success">{totalScheduled}</div>
                <div className="preview-stat-label">성공</div>
              </div>
              {totalSplit > 0 && (
                <div className="preview-stat-item">
                  <div className="preview-stat-number text-blue-600">{totalSplit}</div>
                  <div className="preview-stat-label">분할</div>
                </div>
              )}
              {totalFailed > 0 && (
                <div className="preview-stat-item">
                  <div className="preview-stat-number preview-failed">{totalFailed}</div>
                  <div className="preview-stat-label">실패</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-emerald-700 bg-white bg-opacity-90 border border-emerald-200 rounded-lg hover:bg-opacity-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            다시 배치
          </button>

          <button
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg hover:bg-opacity-30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            취소
          </button>

          <button
            onClick={onApply}
            className="inline-flex items-center px-6 py-2 text-sm font-semibold text-emerald-700 bg-white border border-transparent rounded-lg hover:bg-gray-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200 transform hover:scale-105"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
}