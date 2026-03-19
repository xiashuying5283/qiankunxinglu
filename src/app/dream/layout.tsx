import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '周公解梦 - 梦境解读',
  description: '输入您的梦境内容，了解梦中意象的象征含义。探索潜意识密码，解读梦境玄机。民俗文化科普，仅供娱乐参考。',
  keywords: [
    '周公解梦',
    '梦境解读',
    '解梦大全',
    '梦的含义',
    '梦境分析',
    '潜意识',
    '做梦解析',
  ],
  openGraph: {
    title: '周公解梦 - 梦境解读 | 占卜问卦',
    description: '解读梦境中的玄机，揭示潜意识密码。民俗文化科普，仅供娱乐参考。',
  },
};

export default function DreamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
