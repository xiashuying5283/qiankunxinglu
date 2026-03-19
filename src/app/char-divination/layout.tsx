import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '测字算卦 - 一字断事',
  description: '输入一个汉字，通过笔画数理分析解读命运玄机。一字一世界，解心中疑虑。民俗文化科普，仅供娱乐参考。',
  keywords: [
    '测字算卦',
    '测字',
    '拆字',
    '字义分析',
    '笔画数理',
    '汉字占卜',
    '测字解卦',
  ],
  openGraph: {
    title: '测字算卦 - 一字断事 | 占卜问卦',
    description: '一字断事，解心中疑虑。民俗文化科普，仅供娱乐参考。',
  },
};

export default function CharDivinationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
