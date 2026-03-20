'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sparkles, Star, Clock, ChevronDown, ChevronUp, BookOpen, Loader2 } from 'lucide-react';
import { SiteHeader } from '@/components/SiteHeader';

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

type Method = 'time' | 'number' | 'random';

export default function PlumBlossomPage() {
  const [method, setMethod] = useState<Method>('time');
  const [numberInput, setNumberInput] = useState({ num1: '', num2: '', num3: '' });
  const [result, setResult] = useState<{
    upperTrigram: TrigramData;
    lowerTrigram: TrigramData;
    hexagram: HexagramData;
    changingLine: number;
    method: string;
    numbers?: { upper: number; lower: number; change: number };
  } | null>(null);
  const [expandedLines, setExpandedLines] = useState<Set<number>>(new Set());
  
  const inputAreaRef = useRef<HTMLDivElement>(null);
  
  const [hexagrams, setHexagrams] = useState<HexagramData[]>([]);
  const [trigrams, setTrigrams] = useState<TrigramData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleMethodSelect = (newMethod: Method) => {
    setMethod(newMethod);
    setTimeout(() => {
      inputAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const getTrigramByNumber = (num: number): TrigramData => {
    const remainder = num % 8;
    return trigrams[remainder === 0 ? 7 : remainder - 1];
  };

  const findHexagram = (upperName: string, lowerName: string): HexagramData => {
    const found = hexagrams.find(
      h => h.upperTrigram === upperName && h.lowerTrigram === lowerName
    );
    return found || hexagrams[0];
  };

  const divineByTime = () => {
    if (hexagrams.length === 0 || trigrams.length === 0) return;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = Math.floor(now.getHours() / 2) + 1;

    const upperNum = (year + month + day) % 8;
    const lowerNum = (year + month + day + hour) % 8;
    const changingLine = ((year + month + day + hour) % 6) || 6;

    const upperTrigram = getTrigramByNumber(upperNum === 0 ? 8 : upperNum);
    const lowerTrigram = getTrigramByNumber(lowerNum === 0 ? 8 : lowerNum);
    const hexagram = findHexagram(upperTrigram.name, lowerTrigram.name);

    setResult({
      upperTrigram,
      lowerTrigram,
      hexagram,
      changingLine,
      method: `时间起卦：${year}年${month}月${day}日${hour}时`,
      numbers: {
        upper: upperNum === 0 ? 8 : upperNum,
        lower: lowerNum === 0 ? 8 : lowerNum,
        change: changingLine,
      },
    });
    setExpandedLines(new Set());
    
    saveDivinationRecord({
      upperTrigram,
      lowerTrigram,
      hexagram,
      changingLine,
      method: `时间起卦：${year}年${month}月${day}日${hour}时`,
      numbers: {
        upper: upperNum === 0 ? 8 : upperNum,
        lower: lowerNum === 0 ? 8 : lowerNum,
        change: changingLine,
      },
    });
  };

  const divineByNumber = () => {
    if (hexagrams.length === 0 || trigrams.length === 0) return;
    
    const num1 = parseInt(numberInput.num1) || 0;
    const num2 = parseInt(numberInput.num2) || 0;
    const num3 = parseInt(numberInput.num3) || 0;

    if (num1 <= 0 || num2 <= 0 || num3 <= 0) {
      alert('请输入三个有效的数字');
      return;
    }

    const upperNum = num1 % 8;
    const lowerNum = num2 % 8;
    const changingLine = (num3 % 6) || 6;

    const upperTrigram = getTrigramByNumber(upperNum === 0 ? 8 : upperNum);
    const lowerTrigram = getTrigramByNumber(lowerNum === 0 ? 8 : lowerNum);
    const hexagram = findHexagram(upperTrigram.name, lowerTrigram.name);

    setResult({
      upperTrigram,
      lowerTrigram,
      hexagram,
      changingLine,
      method: `数字起卦：${num1}、${num2}、${num3}`,
      numbers: {
        upper: upperNum === 0 ? 8 : upperNum,
        lower: lowerNum === 0 ? 8 : lowerNum,
        change: changingLine,
      },
    });
    setExpandedLines(new Set());
    
    saveDivinationRecord({
      upperTrigram,
      lowerTrigram,
      hexagram,
      changingLine,
      method: `数字起卦：${num1}、${num2}、${num3}`,
      numbers: {
        upper: upperNum === 0 ? 8 : upperNum,
        lower: lowerNum === 0 ? 8 : lowerNum,
        change: changingLine,
      },
    });
  };

  const divineRandom = () => {
    if (hexagrams.length === 0 || trigrams.length === 0) return;
    
    const upperNum = Math.floor(Math.random() * 8) + 1;
    const lowerNum = Math.floor(Math.random() * 8) + 1;
    const changingLine = Math.floor(Math.random() * 6) + 1;

    const upperTrigram = getTrigramByNumber(upperNum);
    const lowerTrigram = getTrigramByNumber(lowerNum);
    const hexagram = findHexagram(upperTrigram.name, lowerTrigram.name);

    setResult({
      upperTrigram,
      lowerTrigram,
      hexagram,
      changingLine,
      method: '随机起卦',
      numbers: {
        upper: upperNum,
        lower: lowerNum,
        change: changingLine,
      },
    });
    setExpandedLines(new Set());
    
    saveDivinationRecord({
      upperTrigram,
      lowerTrigram,
      hexagram,
      changingLine,
      method: '随机起卦',
      numbers: {
        upper: upperNum,
        lower: lowerNum,
        change: changingLine,
      },
    });
  };

  const saveDivinationRecord = async (divinationResult: {
    upperTrigram: TrigramData;
    lowerTrigram: TrigramData;
    hexagram: HexagramData;
    changingLine: number;
    method: string;
    numbers?: { upper: number; lower: number; change: number };
  }) => {
    try {
      await fetch('/api/divination/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'plum_blossom',
          question: null,
          result: {
            hexagramName: divinationResult.hexagram.name,
            hexagramNumber: divinationResult.hexagram.number,
            changingLine: divinationResult.changingLine,
            method: divinationResult.method,
            numbers: divinationResult.numbers,
          },
          aiInterpretation: divinationResult.hexagram.judgement,
        }),
      });
    } catch (error) {
      console.error('保存占卜记录失败:', error);
    }
  };

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

  const methods = [
    { id: 'time', name: '时间起卦', icon: Clock, description: '根据当前时间推算卦象' },
    { id: 'number', name: '数字起卦', icon: Star, description: '根据三个数字推算卦象' },
    { id: 'random', name: '随机起卦', icon: Sparkles, description: '随机生成卦象' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="bg-card/50 border-amber-500/20">
          <CardContent className="py-12 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
            <p className="text-muted-foreground">正在加载卦象数据...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="bg-card/50 border-amber-500/20 max-w-md">
          <CardHeader>
            <CardTitle className="text-foreground">加载失败</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadData} className="bg-amber-500 hover:bg-amber-600 text-black">
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div className="container mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Star className="w-10 h-10 text-amber-500 mr-3" />
            <h1 className="text-4xl font-bold text-foreground">梅花易数</h1>
            <Star className="w-10 h-10 text-amber-500 ml-3" />
          </div>
          <p className="text-muted-foreground">以数明理，以象言事，探索数字与命运的关联</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* 选择方法 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {methods.map((m) => (
              <Card
                key={m.id}
                className={`cursor-pointer transition-all ${
                  method === m.id
                    ? 'bg-card border-amber-500/50'
                    : 'bg-card/50 border-amber-500/20 hover:border-amber-500/30'
                }`}
                onClick={() => handleMethodSelect(m.id as Method)}
              >
                <CardContent className="py-6 text-center">
                  <m.icon className={`w-8 h-8 mx-auto mb-2 ${method === m.id ? 'text-amber-500' : 'text-muted-foreground'}`} />
                  <div className="text-lg font-medium text-foreground">{m.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">{m.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 输入区域 */}
          {!result && (
            <div ref={inputAreaRef}>
              <Card className="bg-card/50 border-amber-500/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-foreground">
                  {method === 'time' && '时间起卦'}
                  {method === 'number' && '数字起卦'}
                  {method === 'random' && '随机起卦'}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {method === 'time' && '使用当前日期时间为您推算卦象'}
                  {method === 'number' && '输入三个数字：第一个取上卦，第二个取下卦，第三个取动爻'}
                  {method === 'random' && '随机生成一组数字为您推算卦象'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {method === 'time' && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-6">
                      将使用当前的年、月、日、时为您起卦
                    </p>
                    <Button
                      onClick={divineByTime}
                      className="bg-amber-500 hover:bg-amber-600 text-black px-12 py-6 text-lg"
                    >
                      <Clock className="w-5 h-5 mr-2" />
                      开始起卦
                    </Button>
                  </div>
                )}

                {method === 'number' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block text-center">第一个数字（上卦）</label>
                        <Input
                          type="number"
                          value={numberInput.num1}
                          onChange={(e) => setNumberInput({ ...numberInput, num1: e.target.value })}
                          placeholder="上卦"
                          className="bg-background border-amber-500/20 text-foreground placeholder:text-muted-foreground text-center text-xl h-14"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block text-center">第二个数字（下卦）</label>
                        <Input
                          type="number"
                          value={numberInput.num2}
                          onChange={(e) => setNumberInput({ ...numberInput, num2: e.target.value })}
                          placeholder="下卦"
                          className="bg-background border-amber-500/20 text-foreground placeholder:text-muted-foreground text-center text-xl h-14"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block text-center">第三个数字（动爻）</label>
                        <Input
                          type="number"
                          value={numberInput.num3}
                          onChange={(e) => setNumberInput({ ...numberInput, num3: e.target.value })}
                          placeholder="动爻"
                          className="bg-background border-amber-500/20 text-foreground placeholder:text-muted-foreground text-center text-xl h-14"
                        />
                      </div>
                    </div>
                    <div className="text-center pt-4">
                      <Button
                        onClick={divineByNumber}
                        disabled={!numberInput.num1 || !numberInput.num2 || !numberInput.num3}
                        className="bg-amber-500 hover:bg-amber-600 text-black px-12 py-6 text-lg"
                      >
                        <Star className="w-5 h-5 mr-2" />
                        开始起卦
                      </Button>
                    </div>
                  </div>
                )}

                {method === 'random' && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-6">
                      随机生成数字为您起卦
                    </p>
                    <Button
                      onClick={divineRandom}
                      className="bg-amber-500 hover:bg-amber-600 text-black px-12 py-6 text-lg"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      随机起卦
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          )}

          {/* 结果显示 */}
          {result && (
            <div className="space-y-6">
              {/* 数字信息 */}
              {result.numbers && (
                <Card className="bg-card/50 border-amber-500/20">
                  <CardContent className="py-6">
                    <div className="text-center">
                      <div className="text-lg text-muted-foreground mb-2">{result.method}</div>
                      <div className="flex justify-center gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">{result.numbers.upper}</div>
                          <div className="text-xs text-muted-foreground">上卦数</div>
                        </div>
                        <div className="text-2xl text-amber-500">+</div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">{result.numbers.lower}</div>
                          <div className="text-xs text-muted-foreground">下卦数</div>
                        </div>
                        <div className="text-2xl text-amber-500">+</div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">{result.numbers.change}</div>
                          <div className="text-xs text-muted-foreground">动爻数</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 卦象显示 */}
              <Card className="bg-card/50 border-amber-500/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-foreground">所成卦象</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-8xl mb-4">{result.hexagram.symbol}</div>
                    <div className="text-3xl font-bold text-foreground mb-2">
                      第{result.hexagram.number}卦 · {result.hexagram.name}卦
                    </div>
                    <div className="text-muted-foreground">
                      {result.upperTrigram.name}上{result.lowerTrigram.name}下
                    </div>
                  </div>

                  <div className="flex justify-center items-center gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-4xl mb-1">{result.upperTrigram.symbol}</div>
                      <div className="text-sm text-foreground">{result.upperTrigram.name}</div>
                      <div className="text-xs text-muted-foreground">上卦·{result.upperTrigram.nature}</div>
                    </div>
                    <div className="text-2xl text-amber-500">+</div>
                    <div className="text-center">
                      <div className="text-4xl mb-1">{result.lowerTrigram.symbol}</div>
                      <div className="text-sm text-foreground">{result.lowerTrigram.name}</div>
                      <div className="text-xs text-muted-foreground">下卦·{result.lowerTrigram.nature}</div>
                    </div>
                    <div className="text-2xl text-amber-500">=</div>
                    <div className="text-center">
                      <div className="text-4xl mb-1">{result.hexagram.symbol}</div>
                      <div className="text-sm text-foreground">{result.hexagram.name}</div>
                      <div className="text-xs text-muted-foreground">本卦</div>
                    </div>
                  </div>

                  <div className="bg-background rounded-lg p-6 mb-4 border border-amber-500/20">
                    <h4 className="text-lg font-bold text-amber-500 mb-2">卦辞</h4>
                    <p className="text-foreground text-lg leading-relaxed mb-2">{result.hexagram.judgement}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed border-t border-amber-500/20 pt-3 mt-3">
                      💡 {result.hexagram.judgementMeaning}
                    </p>
                  </div>

                  <div className="bg-background rounded-lg p-6 mb-4 border border-amber-500/20">
                    <h4 className="text-lg font-bold text-amber-500 mb-2">象辞</h4>
                    <p className="text-foreground text-lg leading-relaxed mb-2">{result.hexagram.image}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed border-t border-amber-500/20 pt-3 mt-3">
                      💡 {result.hexagram.imageMeaning}
                    </p>
                  </div>

                  <div className="bg-background rounded-lg p-6 border border-amber-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-amber-500">爻辞（点击查看注解）</h4>
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
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {expandedLines.size === 6 ? '收起全部' : '展开全部'}
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {result.hexagram.lines.map((line, index) => (
                        <div
                          key={index}
                          className={`rounded-lg overflow-hidden transition-all ${
                            result.changingLine === index + 1
                              ? 'bg-amber-500/10 border border-amber-500/30'
                              : 'bg-card'
                          }`}
                        >
                          <div
                            className="p-4 cursor-pointer flex items-start justify-between gap-4 hover:bg-amber-500/5 transition-colors"
                            onClick={() => toggleLine(index)}
                          >
                            <div className="flex-1">
                              <p className="text-foreground font-medium">
                                {line.text}
                                {result.changingLine === index + 1 && (
                                  <span className="ml-2 text-amber-500 font-bold text-sm bg-amber-500/20 px-2 py-1 rounded">
                                    动爻
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-amber-500">
                              <BookOpen className="w-4 h-4" />
                              {expandedLines.has(index) ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                          {expandedLines.has(index) && (
                            <div className="px-4 pb-4 pt-0 border-t border-amber-500/20">
                              <div className="bg-background rounded-lg p-4 mt-2">
                                <p className="text-muted-foreground leading-relaxed">
                                  📖 {line.meaning}
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

              {/* 解读 */}
              <Card className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">梅花易数解读</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground leading-relaxed">
                  <p className="mb-4">
                    此卦为<strong className="text-foreground">{result.hexagram.name}卦</strong>
                    （第{result.hexagram.number}卦），由{result.upperTrigram.name}卦（{result.upperTrigram.nature}）在上、
                    {result.lowerTrigram.name}卦（{result.lowerTrigram.nature}）在下组成。
                  </p>
                  <p className="mb-4">
                    上卦{result.upperTrigram.name}代表{result.upperTrigram.attribute}，
                    下卦{result.lowerTrigram.name}代表{result.lowerTrigram.attribute}。
                  </p>
                  <p className="mb-4">
                    第{result.changingLine}爻为动爻，象征事物发展的关键转折点。
                  </p>
                  <div className="bg-background rounded-lg p-4 mb-4 border border-amber-500/20">
                    <p className="text-foreground font-medium mb-2">⚡ 动爻提示</p>
                    <p className="text-muted-foreground">{result.hexagram.lines[result.changingLine - 1].meaning}</p>
                  </div>
                  <div className="mt-4 p-4 bg-background rounded-lg border border-amber-500/20">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">温馨提示：</strong>
                      梅花易数以数明理，仅供参考。人生道路需要自己把握，愿此卦带给您启示。
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 重新起卦 */}
              <div className="text-center">
                <Button
                  onClick={() => {
                    setResult(null);
                    setExpandedLines(new Set());
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-black px-12 py-6 text-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  重新起卦
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
