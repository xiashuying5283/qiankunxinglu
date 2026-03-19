import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '周易占卜 - 六十四卦在线起卦',
  description: '运用传统周易六十四卦智慧，通过铜钱占卜法为您解答人生疑惑。了解卦辞爻辞含义，探索周易文化精髓。民俗文化科普，仅供娱乐参考。',
  keywords: [
    '周易占卜',
    '六十四卦',
    '在线起卦',
    '铜钱占卜',
    '卦辞解读',
    '爻辞详解',
    '周易学习',
    '易经入门',
  ],
  openGraph: {
    title: '周易占卜 - 六十四卦在线起卦 | 占卜问卦',
    description: '运用传统周易六十四卦智慧，通过铜钱占卜法为您解答人生疑惑。民俗文化科普，仅供娱乐参考。',
  },
};

export default function IChingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
