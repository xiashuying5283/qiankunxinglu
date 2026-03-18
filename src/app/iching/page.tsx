'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Sparkles, ChevronDown, ChevronUp, BookOpen, Loader2 } from 'lucide-react';

// 类型定义
interface LineText {
  text: string;
  meaning: string;
}

interface HexagramData {
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
  lines: LineText[];
}

interface TrigramData {
  name: string;
  symbol: string;
  nature: string;
  attribute: string;
}

export default function IChingPage() {
  const [isDivining, setIsDivining] = useState(false);
  const [result, setResult] = useState<HexagramData | null>(null);
  const [changingLine, setChangingLine] = useState<number | null>(null);
  const [coinFlips, setCoinFlips] = useState<number[]>([]);
  const [expandedLines, setExpandedLines] = useState<Set<number>>(new Set());
  
  // 数据状态
  const [hexagrams, setHexagrams] = useState<HexagramData[]>([]);
  const [trigrams, setTrigrams] = useState<TrigramData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载数据
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/hexagrams');
      const data = await response.json();
      
      if (data.needsInit) {
        // 需要初始化数据
        const initResponse = await fetch('/api/hexagrams/init', { method: 'POST' });
        const initData = await initResponse.json();
        
        if (initData.success) {
          // 重新加载数据
          const retryResponse = await fetch('/api/hexagrams');
          const retryData = await retryResponse.json();
          setHexagrams(retryData.hexagrams);
          setTrigrams(retryData.trigrams);
        } else {
          setError('数据初始化失败');
        }
      } else if (data.hexagrams) {
        setHexagrams(data.hexagrams);
        setTrigrams(data.trigrams);
      } else {
        setError(data.error || '加载数据失败');
      }
    } catch (err) {
      setError('加载数据失败，请刷新页面重试');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 模拟抛铜钱占卜
  const divine = async () => {
    if (hexagrams.length === 0) return;
    
    setIsDivining(true);
    setCoinFlips([]);
    setExpandedLines(new Set());
    
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

  // 切换爻辞展开状态
  const toggleLine = (index: number) => {
    setExpandedLines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // 获取卦象符号
  const getTrigramSymbol = (trigramName: string) => {
    const trigram = trigrams.find(t => t.name === trigramName);
    return trigram?.symbol || '';
  };

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-md border-amber-300/30">
          <CardContent className="py-12 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-amber-300 animate-spin mb-4" />
            <p className="text-amber-100">正在加载卦象数据...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-md border-amber-300/30 max-w-md">
          <CardHeader>
            <CardTitle className="text-amber-100">加载失败</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-amber-200 mb-4">{error}</p>
            <Button onClick={loadData} className="bg-amber-500 hover:bg-amber-600 text-white">
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                  <div className="bg-amber-950/60 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-amber-100 mb-2">卦辞</h3>
                    <p className="text-amber-100 text-lg leading-relaxed mb-2">{result.judgement}</p>
                    <p className="text-amber-200/80 text-sm leading-relaxed border-t border-amber-600/30 pt-3 mt-3">
                      💡 {result.judgementMeaning}
                    </p>
                  </div>

                  {/* 象辞 */}
                  <div className="bg-amber-950/60 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-amber-100 mb-2">象辞</h3>
                    <p className="text-amber-100 text-lg leading-relaxed mb-2">{result.image}</p>
                    <p className="text-amber-200/80 text-sm leading-relaxed border-t border-amber-600/30 pt-3 mt-3">
                      💡 {result.imageMeaning}
                    </p>
                  </div>

                  {/* 爻辞 */}
                  <div className="bg-amber-950/60 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-amber-100">爻辞（点击查看注解）</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (expandedLines.size === 6) {
                            setExpandedLines(new Set());
                          } else {
                            setExpandedLines(new Set([0, 1, 2, 3, 4, 5]));
                          }
                        }}
                        className="text-amber-200 hover:text-amber-100"
                      >
                        {expandedLines.size === 6 ? '收起全部' : '展开全部'}
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {result.lines.map((line, index) => (
                        <div
                          key={index}
                          className={`rounded-lg overflow-hidden transition-all ${
                            changingLine === index
                              ? 'bg-amber-500/20 border border-amber-400'
                              : 'bg-amber-900/30'
                          }`}
                        >
                          <div
                            className="p-4 cursor-pointer flex items-start justify-between gap-4 hover:bg-amber-800/20 transition-colors"
                            onClick={() => toggleLine(index)}
                          >
                            <div className="flex-1">
                              <p className="text-amber-100 font-medium">
                                {line.text}
                                {changingLine === index && (
                                  <span className="ml-2 text-amber-300 font-bold text-sm bg-amber-500/30 px-2 py-1 rounded">
                                    动爻
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-amber-300">
                              <BookOpen className="w-4 h-4" />
                              {expandedLines.has(index) ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                          {expandedLines.has(index) && (
                            <div className="px-4 pb-4 pt-0 border-t border-amber-600/20">
                              <div className="bg-amber-900/40 rounded-lg p-4 mt-2">
                                <p className="text-amber-200/90 leading-relaxed">
                                  📖 {line.meaning}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 解读 */}
                  <div className="bg-gradient-to-r from-amber-900/60 to-orange-900/60 rounded-lg p-6 border border-amber-400/30">
                    <h3 className="text-lg font-bold text-amber-100 mb-3">占卜解读</h3>
                    <p className="text-amber-100 leading-relaxed mb-4">
                      {result.name}卦象征着{result.imageMeaning.split('，')[0] || '变化与发展'}。
                      此卦提示您在当前情况下，应当秉持{result.judgementMeaning.includes('吉') ? '积极进取' : '审慎行事'}的态度。
                    </p>
                    {changingLine !== null && (
                      <div className="bg-amber-800/30 rounded-lg p-4">
                        <p className="text-amber-200 font-medium mb-2">⚡ 动爻提示</p>
                        <p className="text-amber-100">{result.lines[changingLine].meaning}</p>
                      </div>
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
                    setExpandedLines(new Set());
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
