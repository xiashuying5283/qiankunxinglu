'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Sparkles, PenTool } from 'lucide-react';
import { charStrokes, trigrams } from '@/lib/divination-data';

export default function CharDivinationPage() {
  const [inputChar, setInputChar] = useState('');
  const [result, setResult] = useState<{
    char: string;
    strokes: number;
    upperTrigram: typeof trigrams[0];
    lowerTrigram: typeof trigrams[0];
    interpretation: string;
  } | null>(null);

  // 根据笔画数获取八卦
  const getTrigramByStrokes = (strokes: number) => {
    const index = strokes % 8;
    return trigrams[index];
  };

  // 计算笔画数（简化版）
  const calculateStrokes = (char: string): number => {
    if (charStrokes[char]) {
      return charStrokes[char];
    }
    // 如果没有预设数据，返回字符编码的简化计算
    return (char.charCodeAt(0) % 20) + 1;
  };

  // 生成解读
  const generateInterpretation = (upper: typeof trigrams[0], lower: typeof trigrams[0], char: string) => {
    const interpretations = [
      `${upper.name}${lower.name}卦，上${upper.nature}下${lower.nature}。`,
      `${upper.nature}道${upper.attribute}，${lower.nature}道${lower.attribute}。`,
      `此字\"${char}\"所成之卦，象征${upper.nature}与${lower.nature}的结合。`,
      `上卦${upper.name}代表${upper.attribute}，下卦${lower.name}代表${lower.attribute}。`,
      `整体运势呈现${upper.attribute}与${lower.attribute}交织的状态。`,
    ];
    return interpretations.join('\n');
  };

  // 开始测字
  const divine = () => {
    if (!inputChar.trim()) return;

    const char = inputChar.trim().charAt(0);
    const strokes = calculateStrokes(char);
    
    // 上卦取笔画数除以8的余数
    const upperStrokes = strokes;
    // 下卦取时间或随机数
    const lowerStrokes = Math.floor(Date.now() / 1000) % 8;
    
    const upperTrigram = getTrigramByStrokes(upperStrokes);
    const lowerTrigram = getTrigramByStrokes(lowerStrokes);
    
    const interpretation = generateInterpretation(upperTrigram, lowerTrigram, char);

    setResult({
      char,
      strokes,
      upperTrigram,
      lowerTrigram,
      interpretation,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-cyan-200 hover:text-cyan-100 hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </Link>

        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <PenTool className="w-10 h-10 text-cyan-300 mr-3" />
            <h1 className="text-4xl font-bold text-cyan-100">测字算卦</h1>
            <PenTool className="w-10 h-10 text-cyan-300 ml-3" />
          </div>
          <p className="text-cyan-200/80">一字一世界，一笔一乾坤，通过文字探索命运的奥秘</p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* 输入区域 */}
          <Card className="bg-white/10 backdrop-blur-md border-cyan-300/30 mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-cyan-100">请输入您想测算的汉字</CardTitle>
              <CardDescription className="text-cyan-200/60">
                输入一个汉字，我们将根据其笔画数为您推算卦象
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  type="text"
                  maxLength={1}
                  value={inputChar}
                  onChange={(e) => setInputChar(e.target.value)}
                  placeholder="请输入一个汉字"
                  className="bg-white/10 border-cyan-300/30 text-cyan-100 placeholder:text-cyan-200/40 text-center text-2xl h-14"
                />
                <Button
                  onClick={divine}
                  disabled={!inputChar.trim()}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  开始测字
                </Button>
              </div>

              {/* 常用字推荐 */}
              <div className="pt-4">
                <p className="text-sm text-cyan-200/60 mb-2 text-center">常用测字：</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['福', '禄', '寿', '喜', '财', '爱', '缘', '命', '运', '吉'].map((char) => (
                    <Button
                      key={char}
                      variant="outline"
                      size="sm"
                      onClick={() => setInputChar(char)}
                      className="bg-white/5 border-cyan-300/20 text-cyan-200 hover:bg-white/10 hover:text-cyan-100"
                    >
                      {char}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 结果显示 */}
          {result && (
            <div className="space-y-6">
              {/* 字和笔画 */}
              <Card className="bg-white/10 backdrop-blur-md border-cyan-300/30">
                <CardContent className="py-8">
                  <div className="text-center">
                    <div className="text-8xl font-bold text-cyan-100 mb-4" style={{ fontFamily: 'serif' }}>
                      {result.char}
                    </div>
                    <div className="text-xl text-cyan-200">
                      笔画数：<span className="text-cyan-100 font-bold">{result.strokes}</span> 画
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 卦象显示 */}
              <Card className="bg-white/10 backdrop-blur-md border-cyan-300/30">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-cyan-100">所成卦象</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center items-center gap-8 mb-6">
                    <div className="text-center">
                      <div className="text-6xl mb-2">{result.upperTrigram.symbol}</div>
                      <div className="text-lg text-cyan-100">{result.upperTrigram.name}</div>
                      <div className="text-sm text-cyan-200/60">（上卦·{result.upperTrigram.nature}）</div>
                    </div>
                    <div className="text-4xl text-cyan-300">—</div>
                    <div className="text-center">
                      <div className="text-6xl mb-2">{result.lowerTrigram.symbol}</div>
                      <div className="text-lg text-cyan-100">{result.lowerTrigram.name}</div>
                      <div className="text-sm text-cyan-200/60">（下卦·{result.lowerTrigram.nature}）</div>
                    </div>
                  </div>

                  <div className="bg-cyan-900/40 rounded-lg p-6 space-y-3">
                    <div className="text-sm text-cyan-200/80">
                      <strong className="text-cyan-100">上卦属性：</strong>
                      {result.upperTrigram.nature} · {result.upperTrigram.attribute}
                    </div>
                    <div className="text-sm text-cyan-200/80">
                      <strong className="text-cyan-100">下卦属性：</strong>
                      {result.lowerTrigram.nature} · {result.lowerTrigram.attribute}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 解读 */}
              <Card className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-cyan-400/30">
                <CardHeader>
                  <CardTitle className="text-xl text-cyan-100">测字解读</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-cyan-200 leading-relaxed">
                    {result.interpretation.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                    <div className="mt-4 p-4 bg-cyan-900/40 rounded-lg">
                      <p className="text-sm">
                        <strong className="text-cyan-100">温馨提示：</strong>
                        测字算卦仅供参考，人生道路需要自己把握。愿此字带给您启示与力量。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 重新测字 */}
              <div className="text-center">
                <Button
                  onClick={() => {
                    setInputChar('');
                    setResult(null);
                  }}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-12 py-6 text-lg"
                >
                  重新测字
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
