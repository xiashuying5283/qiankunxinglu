import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '占卜问卦 - 传统民俗文化科普平台',
    template: '%s | 占卜问卦',
  },
  description:
    '探索周易六十四卦、塔罗牌、测字、梅花易数等传统智慧。本站为民俗文化科普与娱乐参考，提供每日运势、生辰八字、姻缘匹配等文化体验服务。',
  keywords: [
    '周易占卜',
    '六十四卦详解',
    '塔罗牌占卜',
    '塔罗牌阵',
    '测字算卦',
    '梅花易数',
    '观音灵签',
    '周公解梦',
    '生辰八字',
    '八字命盘',
    '姻缘匹配',
    '生肖配对',
    '每日运势',
    '传统民俗文化',
    '易经学习',
  ],
  authors: [{ name: '占卜问卦' }],
  generator: 'Coze Code',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: '占卜问卦 - 传统民俗文化科普平台',
    description:
      '探索周易六十四卦、塔罗牌、测字、梅花易数等传统智慧。民俗文化科普与娱乐参考，仅供学习交流。',
    type: 'website',
    locale: 'zh_CN',
    images: ['/logo.png'],
    siteName: '占卜问卦',
  },
  twitter: {
    card: 'summary',
    title: '占卜问卦 - 传统民俗文化科普平台',
    description: '探索周易六十四卦、塔罗牌等传统智慧，民俗文化科普与娱乐参考。',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
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
