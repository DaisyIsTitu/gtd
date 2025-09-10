import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home | Todo Time-blocking',
  description: '할 일을 스마트하게 관리하고 자동으로 최적의 시간에 배치하세요',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Todo Time-blocking
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Google Calendar와 연동하여 할 일을 자동으로 최적의 시간에 배치하는 
            스마트 시간 관리 웹 애플리케이션
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Calendar Preview */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  📅 주간 캘린더
                </h2>
                <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
                  <p className="text-gray-500">캘린더 UI가 여기에 표시됩니다</p>
                </div>
              </div>

              {/* Todo Sidebar Preview */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  📋 Todo 목록
                </h2>
                <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
                  <p className="text-gray-500">Todo 목록이 여기에 표시됩니다</p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-4">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  ✅ NextJS 13+ 설정 완료
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  🚀 App Router 활성화
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  🎨 TypeScript + TailwindCSS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}