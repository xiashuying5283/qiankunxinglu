import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '每日运势 - 生肖运势速查',
  description: '选择您的生肖，查看今日运势、幸运颜色、幸运数字、贵人方位等信息。了解每日宜忌，把握幸运时机。民俗文化科普，仅供娱乐参考。',
  keywords: [
    '每日运势',
    '生肖运势',
    '今日运势',
    '运势查询',
    '幸运数字',
    '幸运颜色',
    '贵人方位',
    '十二生肖',
  ],
  openGraph: {
    title: '每日运势 - 生肖运势速查 | 占卜问卦',
    description: '选择生肖查看今日运势，把握幸运时机。民俗文化科普，仅供娱乐参考。',
  },
};

export default function DailyFortuneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
