import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  BookOpen, ChevronLeft, ChevronRight, 
  ArrowLeft, Sparkles, BookText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Hexagram {
  number: number;
  name: string;
  symbol: string;
  upperTrigram: string;
  lowerTrigram: string;
  binary: string;
  judgement: string;
  judgementMeaning: string;
  image: string;
  imageMeaning: string;
  lines: Array<{
    text: string;
    meaning: string;
  }>;
}

// 八卦映射
const TRIGRAM_MAP: Record<string, { symbol: string; nature: string }> = {
  '乾': { symbol: '☰', nature: '天' },
  '坤': { symbol: '☷', nature: '地' },
  '震': { symbol: '☳', nature: '雷' },
  '巽': { symbol: '☴', nature: '风' },
  '坎': { symbol: '☵', nature: '水' },
  '离': { symbol: '☲', nature: '火' },
  '艮': { symbol: '☶', nature: '山' },
  '兑': { symbol: '☱', nature: '泽' },
};

async function getHexagram(number: number): Promise<Hexagram | null> {
  try {
    // 服务端获取数据需要使用绝对 URL
    const baseUrl = process.env.DEPLOY_RUN_PORT 
      ? `http://localhost:${process.env.DEPLOY_RUN_PORT}` 
      : 'http://localhost:5000';
    const res = await fetch(`${baseUrl}/api/hexagrams?number=${number}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.hexagram;
  } catch {
    return null;
  }
}

async function getAllHexagrams() {
  try {
    // 服务端获取数据需要使用绝对 URL
    const baseUrl = process.env.DEPLOY_RUN_PORT 
      ? `http://localhost:${process.env.DEPLOY_RUN_PORT}` 
      : 'http://localhost:5000';
    const res = await fetch(`${baseUrl}/api/hexagrams`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.hexagrams || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const number = parseInt(id);
  if (isNaN(number) || number < 1 || number > 64) {
    return { title: '卦象不存在' };
  }
  
  const hexagram = await getHexagram(number);
  if (!hexagram) {
    return { title: '卦象不存在' };
  }
  
  return {
    title: `第${number}卦 · ${hexagram.name} - 周易`,
    description: `${hexagram.judgement} - ${hexagram.judgementMeaning}`,
  };
}

export async function generateStaticParams() {
  return Array.from({ length: 64 }, (_, i) => ({ id: String(i + 1) }));
}

export default async function HexagramReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const number = parseInt(id);
  
  if (isNaN(number) || number < 1 || number > 64) {
    notFound();
  }
  
  const [hexagram, allHexagrams] = await Promise.all([
    getHexagram(number),
    getAllHexagrams(),
  ]);
  
  if (!hexagram) {
    notFound();
  }
  
  const prevNumber = number > 1 ? number - 1 : null;
  const nextNumber = number < 64 ? number + 1 : null;
  
  const upperTrigram = TRIGRAM_MAP[hexagram.upperTrigram] || { symbol: '?', nature: '?' };
  const lowerTrigram = TRIGRAM_MAP[hexagram.lowerTrigram] || { symbol: '?', nature: '?' };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/read">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回目录
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
              第 {number} / 64 卦
            </Badge>
          </div>
        </div>

        {/* 卦象标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-6xl text-amber-400 font-serif">{hexagram.symbol}</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-2">{hexagram.name}卦</h1>
          <div className="flex items-center justify-center gap-4 text-white/60">
            <span>{lowerTrigram.symbol} {hexagram.lowerTrigram}（{lowerTrigram.nature}）↓</span>
            <span className="text-amber-400">+</span>
            <span>{upperTrigram.symbol} {hexagram.upperTrigram}（{upperTrigram.nature}）↑</span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          {/* 卦辞 */}
          <Card className="bg-white/5 border-amber-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <BookText className="w-5 h-5" />
                卦辞
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-2xl text-white font-serif leading-relaxed">
                {hexagram.judgement}
              </p>
              <p className="text-white/70 leading-relaxed">
                {hexagram.judgementMeaning}
              </p>
            </CardContent>
          </Card>

          {/* 象传 */}
          <Card className="bg-white/5 border-amber-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <Sparkles className="w-5 h-5" />
                象传
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xl text-white font-serif leading-relaxed">
                {hexagram.image}
              </p>
              <p className="text-white/70 leading-relaxed">
                {hexagram.imageMeaning}
              </p>
            </CardContent>
          </Card>

          {/* 爻辞 */}
          <Card className="bg-white/5 border-amber-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <BookOpen className="w-5 h-5" />
                爻辞
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {hexagram.lines.map((line, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Badge 
                        variant="outline" 
                        className="mt-0.5 border-amber-500/50 text-amber-300 shrink-0"
                      >
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="text-lg text-white font-serif">{line.text}</p>
                        <p className="text-white/60 text-sm mt-1">{line.meaning}</p>
                      </div>
                    </div>
                    {index < hexagram.lines.length - 1 && (
                      <Separator className="bg-white/10" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 章节导航 */}
          <div className="flex items-center justify-between pt-8">
            {prevNumber ? (
              <Link href={`/read/zhouyi/${prevNumber}`}>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  第{prevNumber}卦
                </Button>
              </Link>
            ) : (
              <div />
            )}
            {nextNumber ? (
              <Link href={`/read/zhouyi/${nextNumber}`}>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  第{nextNumber}卦
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <div />
            )}
          </div>

          {/* 快速跳转 */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {allHexagrams.slice(0, 10).map((h: { number: number; name: string }) => (
                  <Link key={h.number} href={`/read/zhouyi/${h.number}`}>
                    <Badge 
                      variant={h.number === number ? 'default' : 'outline'}
                      className={h.number === number 
                        ? 'bg-amber-500 text-white' 
                        : 'border-white/20 text-white/70 hover:bg-white/10 cursor-pointer'
                      }
                    >
                      {h.name}
                    </Badge>
                  </Link>
                ))}
                {allHexagrams.length > 10 && (
                  <Badge variant="outline" className="border-white/20 text-white/50">
                    ...
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
