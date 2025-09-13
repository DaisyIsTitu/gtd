import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Todo Time-blocking',
  description: 'Google Calendar 연동 스마트 시간 관리 웹 애플리케이션',
  keywords: ['todo', 'timeblocking', 'calendar', 'productivity', 'scheduling'],
  authors: [{ name: 'GTD Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div id="root">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </body>
    </html>
  );
}