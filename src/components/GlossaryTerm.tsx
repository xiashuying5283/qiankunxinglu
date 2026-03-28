'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';

interface GlossaryTermProps {
  term: string;
  children: React.ReactNode;
  category?: 'iching' | 'bazi' | 'qimen' | 'general';
}

/**
 * 术语链接组件
 * 点击后跳转到独立的词条详情页面
 */
export function GlossaryTerm({ term, children }: GlossaryTermProps) {
  return (
    <Link
      href={`/glossary/${encodeURIComponent(term)}`}
      className="inline-flex items-center cursor-pointer text-primary underline decoration-dotted underline-offset-2 hover:decoration-solid transition-all"
      title={`点击查看"${term}"的详细解释`}
      onClick={(e) => {
        // 阻止事件冒泡，防止触发父元素的点击事件
        e.stopPropagation();
      }}
    >
      {children}
      <BookOpen className="w-3 h-3 ml-0.5 opacity-50 flex-shrink-0" />
    </Link>
  );
}

/**
 * 简化版本 - 仅显示链接图标
 */
export function GlossaryTermIcon({ term }: { term: string }) {
  return (
    <Link
      href={`/glossary/${encodeURIComponent(term)}`}
      className="inline-flex items-center justify-center w-4 h-4 text-primary hover:text-primary/80 transition-colors"
      title={`查看"${term}"的解释`}
      onClick={(e) => e.stopPropagation()}
    >
      <BookOpen className="w-3 h-3" />
    </Link>
  );
}
