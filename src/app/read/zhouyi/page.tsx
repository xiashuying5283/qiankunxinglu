import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: '周易 · 六十四卦 - 古籍阅读',
  description: '阅读周易六十四卦原文、卦辞、爻辞',
};

// 八卦信息
const TRIGRAMS: Record<string, { symbol: string; nature: string }> = {
  '乾': { symbol: '☰', nature: '天' },
  '坤': { symbol: '☷', nature: '地' },
  '震': { symbol: '☳', nature: '雷' },
  '巽': { symbol: '☴', nature: '风' },
  '坎': { symbol: '☵', nature: '水' },
  '离': { symbol: '☲', nature: '火' },
  '艮': { symbol: '☶', nature: '山' },
  '兑': { symbol: '☱', nature: '泽' },
};

async function getHexagrams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/hexagrams`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.hexagrams || [];
  } catch {
    return [];
  }
}

export default async function ZhouyiListPage() {
  const hexagrams = await getHexagrams();
  
  // 上经三十卦
  const upperClassic = hexagrams.slice(0, 30);
  // 下经三十四卦
  const lowerClassic = hexagrams.slice(30);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/read">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回书目
            </Button>
          </Link>
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
            共 64 卦
          </Badge>
        </div>

        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              周易
            </span>
          </h1>
          <p className="text-white/60">群经之首，设教之书</p>
        </div>

        {/* 上经 */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="flex items-center gap-2 text-xl font-medium text-amber-400 mb-6">
            <Grid3X3 className="w-5 h-5" />
            上经（三十卦）
          </h2>
          <p className="text-white/50 text-sm mb-4">
            从乾坤到坎离，侧重天道自然
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {upperClassic.map((h: { number: number; name: string; symbol: string }) => (
              <Link key={h.number} href={`/read/zhouyi/${h.number}`}>
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-amber-500/50 transition-all cursor-pointer text-center">
                  <CardContent className="py-4 px-2">
                    <div className="text-2xl text-amber-400 mb-1">{h.symbol}</div>
                    <div className="text-white font-medium text-sm">{h.name}</div>
                    <div className="text-white/40 text-xs mt-1">第{h.number}卦</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* 下经 */}
        <div className="max-w-5xl mx-auto">
          <h2 className="flex items-center gap-2 text-xl font-medium text-amber-400 mb-6">
            <Grid3X3 className="w-5 h-5" />
            下经（三十四卦）
          </h2>
          <p className="text-white/50 text-sm mb-4">
            从咸恒到既济未济，侧重人事社会
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {lowerClassic.map((h: { number: number; name: string; symbol: string }) => (
              <Link key={h.number} href={`/read/zhouyi/${h.number}`}>
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-amber-500/50 transition-all cursor-pointer text-center">
                  <CardContent className="py-4 px-2">
                    <div className="text-2xl text-amber-400 mb-1">{h.symbol}</div>
                    <div className="text-white font-medium text-sm">{h.name}</div>
                    <div className="text-white/40 text-xs mt-1">第{h.number}卦</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* 说明 */}
        <div className="max-w-3xl mx-auto mt-12 text-center text-white/40 text-sm">
          <p>《周易》原文属公开领域文献</p>
          <p className="mt-1">本站内容仅供学习研究使用</p>
        </div>
      </div>
    </div>
  );
}
