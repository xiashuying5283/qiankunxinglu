import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '生辰八字 - 八字命盘推算',
  description: '输入出生时间，推算您的八字命盘、五行属性、生肖属相等信息。了解命理基础知识。民俗文化科普，仅供娱乐参考。',
  keywords: [
    '生辰八字',
    '八字命盘',
    '四柱八字',
    '五行属性',
    '八字排盘',
    '命理分析',
    '天干地支',
    '五行查询',
  ],
  openGraph: {
    title: '生辰八字 - 八字命盘推算 | 占卜问卦',
    description: '推算八字命盘，了解五行属性。民俗文化科普，仅供娱乐参考。',
  },
};

export default function BaziLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
