import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: '古籍阅读 - 传统智慧',
  description: '阅读周易、八字等传统文化经典',
};

// 八卦信息
const TRIGRAMS = [
  { name: '乾', symbol: '☰', nature: '天', attribute: '刚健' },
  { name: '坤', symbol: '☷', nature: '地', attribute: '柔顺' },
  { name: '震', symbol: '☳', nature: '雷', attribute: '动' },
  { name: '巽', symbol: '☴', nature: '风', attribute: '入' },
  { name: '坎', symbol: '☵', nature: '水', attribute: '险' },
  { name: '离', symbol: '☲', nature: '火', attribute: '明' },
  { name: '艮', symbol: '☶', nature: '山', attribute: '止' },
  { name: '兑', symbol: '☱', nature: '泽', attribute: '悦' },
];

// 书籍列表
const BOOKS = [
  {
    id: 'zhouyi',
    title: '周易',
    subtitle: '六十四卦',
    author: '佚名',
    description: '群经之首，设教之书。包含六十四卦卦辞、爻辞，阐述天地万物变化规律。',
    chapters: 64,
    color: 'from-amber-500 to-orange-500',
  },
];

export default function ReadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-10 h-10 text-amber-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">古籍阅读</h1>
          </div>
          <p className="text-white/60">研习经典，传承智慧</p>
        </div>

        {/* 八卦图 */}
        <div className="flex justify-center mb-12">
          <div className="grid grid-cols-4 gap-4 p-6 bg-white/5 rounded-2xl border border-white/10">
            {TRIGRAMS.map((trigram) => (
              <div
                key={trigram.name}
                className="flex flex-col items-center p-4 hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="text-4xl text-amber-400 mb-2">{trigram.symbol}</span>
                <span className="text-white font-medium">{trigram.name}</span>
                <span className="text-white/50 text-sm">{trigram.nature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 书籍列表 */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-medium text-white/80 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            经典典籍
          </h2>
          
          <div className="grid gap-6">
            {BOOKS.map((book) => (
              <Link key={book.id} href={`/read/${book.id}`}>
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-amber-500/50 transition-all cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className={`text-2xl bg-gradient-to-r ${book.color} bg-clip-text text-transparent`}>
                          {book.title}
                        </CardTitle>
                        <p className="text-white/50 text-sm mt-1">{book.subtitle} · {book.author}</p>
                      </div>
                      <Badge className={`bg-gradient-to-r ${book.color} text-white`}>
                        {book.chapters} 章
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/70 leading-relaxed">{book.description}</p>
                    <div className="flex items-center mt-4 text-amber-400 text-sm">
                      开始阅读
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* 版权说明 */}
        <div className="text-center mt-12 text-white/40 text-sm">
          <p>内容来源于公开领域古籍文献</p>
          <p className="mt-1">仅供学习研究使用</p>
        </div>
      </div>
    </div>
  );
}
