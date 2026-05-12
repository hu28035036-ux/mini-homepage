import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: '미니홈피',
  description: '나만의 URL 보관함, 앨범, 메모를 모아 꾸미는 개인 미니홈피',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
