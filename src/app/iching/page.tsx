'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Sparkles, ChevronDown, ChevronUp, BookOpen, Loader2, Circle } from 'lucide-react';

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

// 爻的类型
type LineType = 'old-yang' | 'young-yang' | 'old-yin' | 'young-yin';

// 单次抛币结果
interface CoinThrow {
  coins: boolean[];
  lineType: LineType;
  lineValue: number;
}

// 占卜结果
interface DivinationResult {
  originalHexagram: HexagramData;
  changedHexagram: HexagramData | null;
  coinThrows: CoinThrow[];
  changingLines: number[];
  originalBinary: string;
  changedBinary: string;
}

export default function IChingPage() {
  const [question, setQuestion] = useState('');
  const [isDivining, setIsDivining] = useState(false);
  const [result, setResult] = useState<DivinationResult | null>(null);
  const [currentThrow, setCurrentThrow] = useState<number>(0);
  const [expandedLines, setExpandedLines] = useState<Set<number>>(new Set());
  const [showChangedHexagram, setShowChangedHexagram] = useState(false);
  
  // AI解读状态
  const [aiInterpretation, setAiInterpretation] = useState('');
  const [isInterpreting, setIsInterpreting] = useState(false);
  const interpretationRef = useRef<HTMLDivElement>(null);
  
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
        const initResponse = await fetch('/api/hexagrams/init', { method: 'POST' });
        const initData = await initResponse.json();
        
        if (initData.success) {
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

  // 抛三枚铜钱
  const throwThreeCoins = (): CoinThrow => {
    const coins: boolean[] = [
      Math.random() < 0.5,
      Math.random() < 0.5,
      Math.random() < 0.5,
    ];
    
    const headsCount = coins.filter(c => c).length;
    
    let lineType: LineType;
    let lineValue: number;
    
    switch (headsCount) {
      case 3:
        lineType = 'old-yang';
        lineValue = 9;
        break;
      case 2:
        lineType = 'young-yang';
        lineValue = 7;
        break;
      case 1:
        lineType = 'young-yin';
        lineValue = 8;
        break;
      default:
        lineType = 'old-yin';
        lineValue = 6;
    }
    
    return { coins, lineType, lineValue };
  };

  // 根据二进制找到对应的卦
  const findHexagramByBinary = (binary: string): HexagramData => {
    const found = hexagrams.find(h => h.binary === binary);
    return found || hexagrams[0];
  };

  // 流式AI解读
  const streamInterpretation = async (divinationResult: DivinationResult) => {
    setIsInterpreting(true);
    setAiInterpretation('');

    try {
      const res = await fetch('/api/divination/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'iching',
          question: question || '请为我解读这卦的含义',
          hexagram: divinationResult.originalHexagram,
          changingLines: divinationResult.changingLines,
          changedHexagram: divinationResult.changedHexagram ? {
            name: divinationResult.changedHexagram.name,
            number: divinationResult.changedHexagram.number,
            judgement: divinationResult.changedHexagram.judgement,
            judgementMeaning: divinationResult.changedHexagram.judgementMeaning
          } : null
        })
      });

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullText += parsed.content;
                setAiInterpretation(fullText);
                setTimeout(() => {
                  interpretationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }, 50);
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error('Interpretation error:', error);
      setAiInterpretation('AI解读生成失败，请稍后重试');
    } finally {
      setIsInterpreting(false);
    }
  };

  // 正宗铜钱占卜法
  const divine = async () => {
    if (hexagrams.length === 0) return;
    
    setIsDivining(true);
    setResult(null);
    setCurrentThrow(0);
    setExpandedLines(new Set());
    setShowChangedHexagram(false);
    setAiInterpretation('');
    
    const coinThrows: CoinThrow[] = [];
    
    // 抛6次铜钱，从下往上（初爻到上爻）
    for (let i = 0; i < 6; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const throwResult = throwThreeCoins();
      coinThrows.push(throwResult);
      setCurrentThrow(i + 1);
    }
    
    // 构建本卦二进制
    const originalBinary = coinThrows
      .map(t => (t.lineType === 'old-yang' || t.lineType === 'young-yang') ? '1' : '0')
      .reverse()
      .join('');
    
    // 找出动爻位置
    const changingLines: number[] = coinThrows
      .map((t, i) => (t.lineType === 'old-yang' || t.lineType === 'old-yin') ? i + 1 : -1)
      .filter(i => i > 0);
    
    // 构建变卦二进制
    const changedBinary = coinThrows
      .map((t, i) => {
        if (t.lineType === 'old-yang') return '0';
        if (t.lineType === 'old-yin') return '1';
        return (t.lineType === 'young-yang') ? '1' : '0';
      })
      .reverse()
      .join('');
    
    // 找到本卦和变卦
    const originalHexagram = findHexagramByBinary(originalBinary);
    const changedHexagram = changingLines.length > 0 
      ? findHexagramByBinary(changedBinary) 
      : null;
    
    const divinationResult: DivinationResult = {
      originalHexagram,
      changedHexagram,
      coinThrows,
      changingLines,
      originalBinary,
      changedBinary,
    };

    setTimeout(() => {
      setResult(divinationResult);
      setIsDivining(false);
      // 开始AI解读
      streamInterpretation(divinationResult);
    }, 500);
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

  // 获取爻的显示符号
  const getLineSymbol = (lineType: LineType): string => {
    switch (lineType) {
      case 'old-yang': return '○';
      case 'young-yang': return '—';
      case 'old-yin': return '×';
      case 'young-yin': return '- -';
    }
  };

  // 获取爻的颜色类
  const getLineColorClass = (lineType: LineType): string => {
    switch (lineType) {
      case 'old-yang': return 'text-red-400';
      case 'old-yin': return 'text-blue-400';
      default: return 'text-amber-100';
    }
  };

  // 重置占卜
  const reset = () => {
    setQuestion('');
    setResult(null);
    setCurrentThrow(0);
    setExpandedLines(new Set());
    setShowChangedHexagram(false);
    setAiInterpretation('');
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
              <CardContent className="flex flex-col items-center justify-center py-8">
                {/* 问题输入 */}
                <div className="w-full max-w-lg mb-6">
                  <label className="block text-sm text-amber-200 mb-2 text-center">您想问什么事？（可选）</label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="例如：我的事业运势如何？这段感情会有结果吗？"
                    className="w-full h-24 bg-white/10 border border-amber-300/30 rounded-lg p-4 text-amber-100 placeholder:text-amber-200/40 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    disabled={isDivining}
                  />
                </div>

                {/* 占卜说明 */}
                <div className="bg-amber-950/40 rounded-lg p-4 mb-6 max-w-lg text-center">
                  <p className="text-amber-200/80 text-sm leading-relaxed">
                    每次抛三枚铜钱，共抛六次，从下往上排成六爻。
                    三正为老阳（变爻），两正一反为少阳，一正两反为少阴，三反为老阴（变爻）。
                  </p>
                </div>

                {/* 铜钱动画区域 */}
                <div className="mb-6">
                  <div className="text-center mb-2 text-amber-200">
                    {isDivining ? `第 ${currentThrow} 次抛币（共6次）` : '准备开始'}
                  </div>
                  <div className="flex justify-center gap-4">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                          isDivining
                            ? 'bg-amber-400 border-amber-600 text-amber-900 shadow-lg shadow-amber-500/50 animate-bounce'
                            : 'bg-amber-900/50 border-amber-600/30 text-amber-400/30'
                        }`}
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        {isDivining ? (Math.random() > 0.5 ? '正' : '反') : '币'}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 已抛出的爻 */}
                {isDivining && currentThrow > 0 && (
                  <div className="mb-6 flex gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-10 h-10 rounded border-2 flex items-center justify-center text-sm font-bold transition-all ${
                          i < currentThrow
                            ? 'bg-amber-500/30 border-amber-400 text-amber-100'
                            : 'bg-amber-900/30 border-amber-600/30 text-amber-400/30'
                        }`}
                      >
                        {i < currentThrow ? (i + 1) : ''}
                      </div>
                    ))}
                  </div>
                )}

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
              {/* 抛币过程展示 */}
              <Card className="bg-white/10 backdrop-blur-md border-amber-300/30">
                <CardHeader>
                  <CardTitle className="text-xl text-amber-100">占卜过程</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 gap-2">
                    {result.coinThrows.map((t, i) => (
                      <div key={i} className="text-center">
                        <div className="text-xs text-amber-200/60 mb-1">
                          {['初', '二', '三', '四', '五', '上'][i]}爻
                        </div>
                        <div className="flex justify-center gap-1 mb-1">
                          {t.coins.map((c, ci) => (
                            <Circle
                              key={ci}
                              className={`w-3 h-3 ${c ? 'fill-amber-400 text-amber-400' : 'fill-amber-900 text-amber-700'}`}
                            />
                          ))}
                        </div>
                        <div className={`text-sm font-bold ${getLineColorClass(t.lineType)}`}>
                          {getLineSymbol(t.lineType)}
                        </div>
                        <div className="text-xs text-amber-200/60">{t.lineValue}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <span className="text-red-400">○ 老阳（变爻，阳变阴）</span>
                    <span className="text-blue-400">× 老阴（变爻，阴变阳）</span>
                    <span className="text-amber-100">— 少阳</span>
                    <span className="text-amber-100">- - 少阴</span>
                  </div>
                </CardContent>
              </Card>

              {/* 本卦显示 */}
              <Card className="bg-white/10 backdrop-blur-md border-amber-300/30">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl text-amber-100 flex items-center justify-center">
                    <span className="text-6xl mr-4">{result.originalHexagram.symbol}</span>
                    <span>{result.originalHexagram.name}卦</span>
                    <span className="ml-4 text-lg text-amber-200/60">（本卦）</span>
                  </CardTitle>
                  <CardDescription className="text-amber-200/80 text-lg">
                    第{result.originalHexagram.number}卦 · {result.originalHexagram.upperTrigram}上{result.originalHexagram.lowerTrigram}下
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 上下卦 */}
                  <div className="flex justify-center gap-8">
                    <div className="text-center">
                      <div className="text-5xl mb-2">{getTrigramSymbol(result.originalHexagram.upperTrigram)}</div>
                      <div className="text-amber-200">{result.originalHexagram.upperTrigram}（上卦）</div>
                    </div>
                    <div className="text-center">
                      <div className="text-5xl mb-2">{getTrigramSymbol(result.originalHexagram.lowerTrigram)}</div>
                      <div className="text-amber-200">{result.originalHexagram.lowerTrigram}（下卦）</div>
                    </div>
                  </div>

                  {/* 卦辞 */}
                  <div className="bg-amber-950/60 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-amber-100 mb-2">卦辞</h3>
                    <p className="text-amber-100 text-lg leading-relaxed mb-2">{result.originalHexagram.judgement}</p>
                    <p className="text-amber-200/80 text-sm leading-relaxed border-t border-amber-600/30 pt-3 mt-3">
                      {result.originalHexagram.judgementMeaning}
                    </p>
                  </div>

                  {/* 象辞 */}
                  <div className="bg-amber-950/60 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-amber-100 mb-2">象辞</h3>
                    <p className="text-amber-100 text-lg leading-relaxed mb-2">{result.originalHexagram.image}</p>
                    <p className="text-amber-200/80 text-sm leading-relaxed border-t border-amber-600/30 pt-3 mt-3">
                      {result.originalHexagram.imageMeaning}
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
                      {result.originalHexagram.lines.map((line, index) => (
                        <div
                          key={index}
                          className={`rounded-lg overflow-hidden transition-all ${
                            result.changingLines.includes(index + 1)
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
                                {result.changingLines.includes(index + 1) && (
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
                                  {line.meaning}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 变卦显示（如果有动爻） */}
              {result.changedHexagram && (
                <>
                  <div className="text-center py-4">
                    <div className="inline-flex items-center gap-4 text-4xl text-amber-300">
                      <span>{result.originalHexagram.symbol}</span>
                      <span className="text-2xl">→</span>
                      <span>{result.changedHexagram.symbol}</span>
                    </div>
                    <p className="text-amber-200/60 mt-2">动爻变化，本卦变为之卦</p>
                  </div>

                  <Card className={`bg-white/10 backdrop-blur-md border-amber-300/30 ${showChangedHexagram ? '' : 'opacity-50'}`}>
                    <CardHeader className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowChangedHexagram(!showChangedHexagram)}
                          className="text-amber-200 hover:text-amber-100"
                        >
                          {showChangedHexagram ? '收起变卦' : '展开变卦详情'}
                        </Button>
                      </div>
                      <CardTitle className="text-3xl text-amber-100 flex items-center justify-center">
                        <span className="text-6xl mr-4">{result.changedHexagram.symbol}</span>
                        <span>{result.changedHexagram.name}卦</span>
                        <span className="ml-4 text-lg text-amber-200/60">（变卦/之卦）</span>
                      </CardTitle>
                      <CardDescription className="text-amber-200/80 text-lg">
                        第{result.changedHexagram.number}卦 · {result.changedHexagram.upperTrigram}上{result.changedHexagram.lowerTrigram}下
                      </CardDescription>
                    </CardHeader>
                    {showChangedHexagram && (
                      <CardContent className="space-y-6">
                        <div className="bg-amber-950/60 rounded-lg p-6">
                          <h3 className="text-lg font-bold text-amber-100 mb-2">卦辞</h3>
                          <p className="text-amber-100 text-lg leading-relaxed mb-2">{result.changedHexagram.judgement}</p>
                          <p className="text-amber-200/80 text-sm leading-relaxed border-t border-amber-600/30 pt-3 mt-3">
                            {result.changedHexagram.judgementMeaning}
                          </p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </>
              )}

              {/* AI大师解读 */}
              <Card className="bg-gradient-to-r from-amber-900/60 to-orange-900/60 border-amber-400/30">
                <CardHeader>
                  <CardTitle className="text-xl text-amber-100 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    大师解读
                    {isInterpreting && <span className="ml-2 text-sm text-amber-300 animate-pulse">生成中...</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isInterpreting && !aiInterpretation ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="relative mb-4">
                        <Sparkles className="w-12 h-12 text-amber-400 animate-pulse" />
                      </div>
                      <p className="text-amber-200 animate-pulse">大师正在为您解读卦象...</p>
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-amber max-w-none">
                      <div
                        className="text-amber-100 leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: aiInterpretation
                            .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-amber-200 mt-6 mb-3">$1</h2>')
                            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-amber-200">$1</strong>')
                        }}
                      />
                    </div>
                  )}
                  <div ref={interpretationRef} />
                </CardContent>
              </Card>

              {/* 重新占卜按钮 */}
              <div className="text-center">
                <Button
                  onClick={reset}
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
