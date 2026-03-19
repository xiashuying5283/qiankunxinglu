import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '塔罗占卜 - 在线抽牌解读',
  description: '神秘塔罗牌为您指引方向，支持单张牌、三张牌、凯尔特十字等多种牌阵。了解78张塔罗牌正逆位含义，探索塔罗文化。民俗文化科普，仅供娱乐参考。',
  keywords: [
    '塔罗占卜',
    '塔罗牌',
    '在线抽牌',
    '塔罗牌阵',
    '凯尔特十字',
    '大阿卡纳',
    '小阿卡纳',
    '塔罗学习',
    '塔罗解读',
  ],
  openGraph: {
    title: '塔罗占卜 - 在线抽牌解读 | 占卜问卦',
    description: '神秘塔罗牌为您指引方向，支持多种牌阵。民俗文化科普，仅供娱乐参考。',
  },
};

export default function TarotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
