// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '研数精解AI | 考研数学智能助手',
  description: '专业的考研数学AI助手，提供实时数学问题解答和知识点解析。',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}



