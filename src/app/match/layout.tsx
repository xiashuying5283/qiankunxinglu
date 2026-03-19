import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '姻缘匹配 - 八字生肖配对测算',
  description: '基于传统八字命理与生肖配对，测算你们的缘分指数。输入双方生辰八字，了解五行互补、生肖相合关系。民俗文化科普，仅供娱乐参考。',
  keywords: [
    '姻缘匹配',
    '八字配对',
    '生肖配对',
    '缘分测试',
    '八字合婚',
    '生肖相合',
    '五行互补',
    '姻缘测算',
  ],
  openGraph: {
    title: '姻缘匹配 - 八字生肖配对测算 | 占卜问卦',
    description: '基于传统八字命理与生肖配对，测算你们的缘分指数。民俗文化科普，仅供娱乐参考。',
  },
};

export default function MatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
