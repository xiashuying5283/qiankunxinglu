import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '占卜问卦 | 神秘命运解读',
    template: '%s | 占卜问卦',
  },
  description:
    '融合周易、塔罗、测字、梅花易数等传统占卜智慧，为您提供专业的命运解读服务。',
  keywords: [
    '占卜',
    '周易',
    '塔罗',
    '测字',
    '梅花易数',
    '观音灵签',
    '周公解梦',
    '生辰八字',
    '姻缘匹配',
  ],
  authors: [{ name: 'Divination App' }],
  generator: 'Coze Code',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: '占卜问卦 | 神秘命运解读',
    description:
      '融合周易、塔罗、测字、梅花易数等传统占卜智慧，为您提供专业的命运解读服务。',
    type: 'website',
    locale: 'zh_CN',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        <AuthProvider>
          {isDev && <Inspector />}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
