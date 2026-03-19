import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '周易学习 - 六十四卦详解',
  description: '系统学习周易六十四卦知识，包括八卦基础、卦辞爻辞详解、起卦方法教程。适合周易入门爱好者。传统民俗文化科普。',
  keywords: [
    '周易学习',
    '六十四卦详解',
    '易经入门',
    '八卦知识',
    '卦辞解读',
    '爻辞详解',
    '周易教程',
    '易学基础',
  ],
  openGraph: {
    title: '周易学习 - 六十四卦详解 | 占卜问卦',
    description: '系统学习周易六十四卦知识，传统民俗文化科普。',
  },
};

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
