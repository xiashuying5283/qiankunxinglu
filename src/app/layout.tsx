import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PreloadProvider } from '@/components/PreloadProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '乾坤星路 - 东方智慧学习平台',
    template: '%s | 乾坤星路',
  },
  description:
    '探索周易六十四卦、塔罗牌等传统智慧。从卦象到注疏，系统化学习东方神秘文化。不止于占卜预测，更在于洞察规律、顺势而为。',
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
    '乾坤星路',
  ],
  authors: [{ name: '乾坤星路' }],
  generator: 'Coze Code',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: '乾坤星路 - 东方智慧学习平台',
    description:
      '探索周易六十四卦、塔罗牌等传统智慧。从卦象到注疏，系统化学习东方神秘文化。',
    type: 'website',
    locale: 'zh_CN',
    images: ['/logo.png'],
    siteName: '乾坤星路',
  },
  twitter: {
    card: 'summary',
    title: '乾坤星路 - 东方智慧学习平台',
    description: '探索周易六十四卦、塔罗牌等传统智慧，系统化学习东方神秘文化。',
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
    <html lang="zh-CN" className="dark">
      <body className={`antialiased`}>
        <ThemeProvider>
          <PreloadProvider>
            <AuthProvider>
              {isDev && <Inspector />}
              {children}
            </AuthProvider>
          </PreloadProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
