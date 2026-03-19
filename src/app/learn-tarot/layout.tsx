import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '塔罗学习 - 78张牌详解',
  description: '系统学习塔罗牌知识，包括78张牌正逆位详解、牌阵使用指南、塔罗入门教程。适合塔罗初学者。传统民俗文化科普。',
  keywords: [
    '塔罗学习',
    '塔罗牌详解',
    '大阿卡纳',
    '小阿卡纳',
    '塔罗牌阵',
    '塔罗入门',
    '塔罗教程',
    '韦特塔罗',
  ],
  openGraph: {
    title: '塔罗学习 - 78张牌详解 | 占卜问卦',
    description: '系统学习塔罗牌知识，传统民俗文化科普。',
  },
};

export default function LearnTarotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
