'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import { hexagrams, trigrams, type Hexagram } from '@/lib/divination-data';

export default function IChingPage() {
  const [isDivining, setIsDivining] = useState(false);
  const [result, setResult] = useState<Hexagram | null>(null);
  const [changingLine, setChangingLine] = useState<number | null>(null);
  const [coinFlips, setCoinFlips] = useState<number[]>([]);

  // 模拟抛铜钱占卜
  const divine = async () => {
    setIsDivining(true);
    setCoinFlips([]);
    
    // 模拟抛硬币动画
    const flips: number[] = [];
    for (let i = 0; i < 6; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const flip = Math.floor(Math.random() * hexagrams.length);
      flips.push(flip);
      setCoinFlips([...flips]);
    }
    
    // 随机选择一个卦
    const selectedHexagram = hexagrams[Math.floor(Math.random() * hexagrams.length)];
    const randomLine = Math.floor(Math.random() * 6);
    
    setTimeout(() => {
      setResult(selectedHexagram);
      setChangingLine(randomLine);
      setIsDivining(false);
    }, 1000);
  };

  // 获取卦象符号
  const getTrigramSymbol = (trigramName: string) => {
    const trigram = trigrams.find(t => t.name === trigramName);
    return trigram?.symbol || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-amber-200 hover:text-amber-100 hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </Link>

        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-10 h-10 text-amber-300 mr-3" />
            <h1 className="text-4xl font-bold text-amber-100">周易占卜</h1>
            <Sparkles className="w-10 h-10 text-amber-300 ml-3" />
          </div>
          <p className="text-amber-200/80">诚心祈愿，掷币问卦，探知天机</p>
        </div>

        {/* 占卜区域 */}
        <div className="max-w-4xl mx-auto">
          {!result ? (
            <Card className="bg-white/10 backdrop-blur-md border-amber-300/30">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-amber-100">投掷铜钱</CardTitle>
                <CardDescription className="text-amber-200/60">
                  心中默念您想问的问题，点击下方按钮开始占卜
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12">
                {/* 铜钱动画区域 */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                        coinFlips.length > 0
                          ? 'bg-amber-400 border-amber-600 text-amber-900 shadow-lg shadow-amber-500/50'
                          : 'bg-amber-900/50 border-amber-600/30 text-amber-400/30'
                      }`}
                    >
                      {coinFlips.length > 0 ? (Math.random() > 0.5 ? '正' : '反') : '币'}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={divine}
                  disabled={isDivining}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-12 py-6 text-lg"
                >
                  {isDivining ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      占卜中...
                    </>
                  ) : (
                    '开始占卜'
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* 卦象显示 */}
              <Card className="bg-white/10 backdrop-blur-md border-amber-300/30">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl text-amber-100 flex items-center justify-center">
                    <span className="text-6xl mr-4">{result.symbol}</span>
                    <span>{result.name}卦</span>
                  </CardTitle>
                  <CardDescription className="text-amber-200/80 text-lg">
                    第{result.number}卦 · {result.upperTrigram}上{result.lowerTrigram}下
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 上下卦 */}
                  <div className="flex justify-center gap-8">
                    <div className="text-center">
                      <div className="text-5xl mb-2">{getTrigramSymbol(result.upperTrigram)}</div>
                      <div className="text-amber-200">{result.upperTrigram}（上卦）</div>
                    </div>
                    <div className="text-center">
                      <div className="text-5xl mb-2">{getTrigramSymbol(result.lowerTrigram)}</div>
                      <div className="text-amber-200">{result.lowerTrigram}（下卦）</div>
                    </div>
                  </div>

                  {/* 卦辞 */}
                  <div className="bg-amber-900/30 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-amber-100 mb-2">卦辞</h3>
                    <p className="text-amber-200 leading-relaxed">{result.judgement}</p>
                  </div>

                  {/* 彖辞 */}
                  <div className="bg-amber-900/30 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-amber-100 mb-2">象辞</h3>
                    <p className="text-amber-200 leading-relaxed">{result.image}</p>
                  </div>

                  {/* 爻辞 */}
                  <div className="bg-amber-900/30 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-amber-100 mb-4">爻辞</h3>
                    <div className="space-y-2">
                      {result.lines.map((line, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded ${
                            changingLine === index
                              ? 'bg-amber-500/30 border border-amber-400'
                              : ''
                          }`}
                        >
                          <p className="text-amber-200">
                            {line}
                            {changingLine === index && (
                              <span className="ml-2 text-amber-300 font-bold">（动爻）</span>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 解读 */}
                  <div className="bg-gradient-to-r from-amber-900/60 to-orange-900/60 rounded-lg p-6 border border-amber-400/30">
                    <h3 className="text-lg font-bold text-amber-100 mb-3">占卜解读</h3>
                    <p className="text-amber-100 leading-relaxed mb-4">
                      {result.name}卦象征着{result.image.split('，')[1] || '变化与发展'}。
                      此卦提示您在当前情况下，应当秉持{result.judgement.includes('贞') ? '正直坚毅' : '顺应自然'}的态度。
                    </p>
                    {changingLine !== null && (
                      <p className="text-amber-200">
                        <strong>特别提示：</strong>
                        {result.lines[changingLine]}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 重新占卜按钮 */}
              <div className="text-center">
                <Button
                  onClick={() => {
                    setResult(null);
                    setChangingLine(null);
                    setCoinFlips([]);
                  }}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-12 py-6 text-lg"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  重新占卜
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
