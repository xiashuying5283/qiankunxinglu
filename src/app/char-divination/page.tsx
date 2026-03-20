'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Sparkles, PenTool, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { SiteHeader } from '@/components/SiteHeader';
import { 
  charStrokes, 
  charDecompositions, 
  type CharDecomposition 
} from '@/lib/char-divination-data';

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

interface DivinationResult {
  char: string;
  strokes: number;
  decomposition: CharDecomposition | null;
  hexagram: HexagramData;
  changedHexagram: HexagramData | null;
  upperTrigram: TrigramData;
  lowerTrigram: TrigramData;
  changingLine: number;
  upperStrokes: number;
  lowerStrokes: number;
  timeStrokes: number;
}

export default function CharDivinationPage() {
  const [inputChar, setInputChar] = useState('');
  const [result, setResult] = useState<DivinationResult | null>(null);
  const [expandedLines, setExpandedLines] = useState<Set<number>>(new Set());
  const [showChangedHexagram, setShowChangedHexagram] = useState(false);
  
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

  // 计算笔画数
  const calculateStrokes = (char: string): number => {
    if (charStrokes[char]) {
      return charStrokes[char];
    }
    const code = char.charCodeAt(0);
    if (code >= 0x4E00 && code <= 0x9FFF) {
      return Math.floor((code - 0x4E00) % 20) + 1;
    }
    return 5;
  };

  // 根据数字获取八卦
  const getTrigramByNumber = (num: number): TrigramData => {
    const remainder = num % 8;
    return trigrams[remainder === 0 ? 7 : remainder - 1];
  };

  // 根据上下卦找到对应的六十四卦
  const findHexagram = (upperName: string, lowerName: string): HexagramData => {
    const found = hexagrams.find(
      h => h.upperTrigram === upperName && h.lowerTrigram === lowerName
    );
    return found || hexagrams[0];
  };

  // 测字起卦
  const divine = () => {
    if (!inputChar.trim() || hexagrams.length === 0 || trigrams.length === 0) return;

    const char = inputChar.trim().charAt(0);
    const strokes = calculateStrokes(char);
    
    const now = new Date();
    const hour = now.getHours();
    const timeNum = Math.floor(hour / 2) + 1;
    
    const upperStrokes = strokes % 8 || 8;
    const lowerStrokes = (strokes + timeNum) % 8 || 8;
    const changingLine = ((strokes + timeNum) % 6) || 6;
    
    const upperTrigram = getTrigramByNumber(upperStrokes);
    const lowerTrigram = getTrigramByNumber(lowerStrokes);
    const hexagram = findHexagram(upperTrigram.name, lowerTrigram.name);
    
    const binary = hexagram.binary.split('').reverse();
    const changedBinary = binary.map((b, i) => {
      if (i + 1 === changingLine) {
        return b === '1' ? '0' : '1';
      }
      return b;
    }).reverse().join('');
    
    const changedHexagram = hexagrams.find(h => h.binary === changedBinary) || null;
    
    const decomposition = charDecompositions[char] || null;
    
    setResult({
      char,
      strokes,
      decomposition,
      hexagram,
      changedHexagram,
      upperTrigram,
      lowerTrigram,
      changingLine,
      upperStrokes,
      lowerStrokes,
      timeStrokes: timeNum,
    });
    setExpandedLines(new Set());
    setShowChangedHexagram(false);
    
    saveDivinationRecord({
      char,
      strokes,
      decomposition,
      hexagram,
      changedHexagram,
      upperTrigram,
      lowerTrigram,
      changingLine,
      upperStrokes,
      lowerStrokes,
      timeStrokes: timeNum,
    });
  };

  // 保存占卜记录
  const saveDivinationRecord = async (divinationResult: DivinationResult) => {
    try {
      await fetch('/api/divination/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'char',
          question: null,
          result: {
            char: divinationResult.char,
            strokes: divinationResult.strokes,
            hexagramName: divinationResult.hexagram.name,
            hexagramNumber: divinationResult.hexagram.number,
            changingLine: divinationResult.changingLine,
            changedHexagramName: divinationResult.changedHexagram?.name,
          },
          aiInterpretation: divinationResult.hexagram.judgement,
        }),
      });
    } catch (error) {
      console.error('保存占卜记录失败:', error);
    }
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

  // 加载中状态
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

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="bg-[#1a1a1a]/50 border-amber-500/20 max-w-md">
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
            <PenTool className="w-10 h-10 text-amber-500 mr-3" />
            <h1 className="text-4xl font-bold text-foreground">测字算卦</h1>
            <PenTool className="w-10 h-10 text-amber-500 ml-3" />
          </div>
          <p className="text-muted-foreground">一字一世界，一笔一乾坤，通过文字探索命运的奥秘</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {!result && (
            <Card className="bg-card/50 border-amber-500/20 mb-6">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-foreground">请输入您想测算的汉字</CardTitle>
                <CardDescription className="text-muted-foreground">
                  输入一个汉字，我们将根据其笔画数起卦推演
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-background rounded-lg p-4 mb-4 text-center border border-amber-500/20">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    上卦取笔画数除以八的余数，下卦取笔画数加时辰除以八的余数，
                    动爻取笔画数加时辰除以六的余数。
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <Input
                    type="text"
                    maxLength={1}
                    value={inputChar}
                    onChange={(e) => setInputChar(e.target.value)}
                    placeholder="请输入一个汉字"
                    className="bg-background border-amber-500/20 text-foreground placeholder:text-muted-foreground text-center text-2xl h-14"
                  />
                  <Button
                    onClick={divine}
                    disabled={!inputChar.trim()}
                    className="bg-amber-500 hover:bg-amber-600 text-black px-8"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    开始测字
                  </Button>
                </div>

                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2 text-center">常用测字：</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['福', '禄', '寿', '喜', '财', '爱', '缘', '命', '运', '吉', '安', '成', '婚', '业', '问'].map((char) => (
                      <Button
                        key={char}
                        variant="outline"
                        size="sm"
                        onClick={() => setInputChar(char)}
                        className="bg-background border-amber-500/20 text-foreground hover:bg-amber-500/10 hover:text-foreground"
                      >
                        {char}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <div className="space-y-6">
              {/* 字和笔画信息 */}
              <Card className="bg-card/50 border-amber-500/20">
                <CardContent className="py-8">
                  <div className="text-center">
                    <div className="text-9xl font-bold text-foreground mb-4" style={{ fontFamily: 'serif' }}>
                      {result.char}
                    </div>
                    <div className="text-xl text-muted-foreground mb-2">
                      笔画数：<span className="text-foreground font-bold text-2xl">{result.strokes}</span> 画
                    </div>
                    <div className="flex justify-center gap-6 text-sm text-muted-foreground">
                      <span>上卦数：{result.upperStrokes}</span>
                      <span>下卦数：{result.lowerStrokes}</span>
                      <span>时辰：第{result.timeStrokes}辰</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 字形拆解 */}
              {result.decomposition && (() => {
                const decomp = result.decomposition;
                return (
                <Card className="bg-card/50 border-amber-500/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-foreground">字形拆解</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center gap-4 mb-4">
                      {decomp.parts.map((part, i) => (
                        <div key={i} className="text-center">
                          <div className="text-4xl text-foreground" style={{ fontFamily: 'serif' }}>{part}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {decomp.meanings[i]?.slice(0, 10)}...
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-background rounded-lg p-4 border border-amber-500/20">
                      <p className="text-muted-foreground leading-relaxed">{decomp.overall}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background rounded-lg p-3 text-center border border-amber-500/20">
                        <div className="text-sm text-muted-foreground">五行属性</div>
                        <div className="text-xl font-bold text-foreground">{decomp.fiveElement}</div>
                      </div>
                      <div className="bg-background rounded-lg p-3 text-center border border-amber-500/20">
                        <div className="text-sm text-muted-foreground">阴阳属性</div>
                        <div className="text-xl font-bold text-foreground">{decomp.yinYang}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })()}

              {/* 卦象显示 */}
              <Card className="bg-card/50 border-amber-500/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-foreground">所成卦象</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    第{result.hexagram.number}卦 · {result.hexagram.name}卦 · {result.upperTrigram.name}上{result.lowerTrigram.name}下
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-8xl mb-2">{result.hexagram.symbol}</div>
                  </div>

                  <div className="flex justify-center items-center gap-8 mb-6">
                    <div className="text-center">
                      <div className="text-5xl mb-2">{result.upperTrigram.symbol}</div>
                      <div className="text-lg text-foreground">{result.upperTrigram.name}</div>
                      <div className="text-sm text-muted-foreground">上卦·{result.upperTrigram.nature}</div>
                    </div>
                    <div className="text-2xl text-amber-500">+</div>
                    <div className="text-center">
                      <div className="text-5xl mb-2">{result.lowerTrigram.symbol}</div>
                      <div className="text-lg text-foreground">{result.lowerTrigram.name}</div>
                      <div className="text-sm text-muted-foreground">下卦·{result.lowerTrigram.nature}</div>
                    </div>
                    <div className="text-2xl text-amber-500">=</div>
                    <div className="text-center">
                      <div className="text-5xl mb-2">{result.hexagram.symbol}</div>
                      <div className="text-lg text-foreground">{result.hexagram.name}</div>
                      <div className="text-sm text-muted-foreground">本卦</div>
                    </div>
                  </div>

                  <div className="bg-background rounded-lg p-6 mb-4 border border-amber-500/20">
                    <h3 className="text-lg font-bold text-amber-500 mb-2">卦辞</h3>
                    <p className="text-foreground text-lg leading-relaxed mb-2">{result.hexagram.judgement}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed border-t border-amber-500/20 pt-3 mt-3">
                      💡 {result.hexagram.judgementMeaning}
                    </p>
                  </div>

                  <div className="bg-background rounded-lg p-6 mb-4 border border-amber-500/20">
                    <h3 className="text-lg font-bold text-amber-500 mb-2">象辞</h3>
                    <p className="text-foreground text-lg leading-relaxed mb-2">{result.hexagram.image}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed border-t border-amber-500/20 pt-3 mt-3">
                      💡 {result.hexagram.imageMeaning}
                    </p>
                  </div>

                  <div className="bg-background rounded-lg p-6 border border-amber-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-amber-500">爻辞（点击查看注解）</h3>
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

              {/* 变卦显示 */}
              {result.changedHexagram && (
                <>
                  <div className="text-center py-4">
                    <div className="inline-flex items-center gap-4 text-4xl text-amber-500">
                      <span>{result.hexagram.symbol}</span>
                      <span className="text-2xl">→</span>
                      <span>{result.changedHexagram.symbol}</span>
                    </div>
                    <p className="text-muted-foreground mt-2">动爻变化，本卦变为之卦</p>
                  </div>

                  <Card className="bg-card/50 border-amber-500/20">
                    <CardHeader className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowChangedHexagram(!showChangedHexagram)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {showChangedHexagram ? '收起变卦' : '展开变卦详情'}
                        </Button>
                      </div>
                      <CardTitle className="text-2xl text-foreground">
                        {result.changedHexagram.name}卦（变卦/之卦）
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        第{result.changedHexagram.number}卦 · {result.changedHexagram.upperTrigram}上{result.changedHexagram.lowerTrigram}下
                      </CardDescription>
                    </CardHeader>
                    {showChangedHexagram && (
                      <CardContent className="space-y-4">
                        <div className="bg-background rounded-lg p-6 border border-amber-500/20">
                          <h3 className="text-lg font-bold text-amber-500 mb-2">卦辞</h3>
                          <p className="text-foreground text-lg leading-relaxed mb-2">{result.changedHexagram.judgement}</p>
                          <p className="text-muted-foreground text-sm leading-relaxed border-t border-amber-500/20 pt-3 mt-3">
                            💡 {result.changedHexagram.judgementMeaning}
                          </p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </>
              )}

              {/* 综合解读 */}
              <Card className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">测字综合解读</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground leading-relaxed space-y-4">
                  <p>
                    您所测之字「<strong className="text-foreground">{result.char}</strong>」，
                    笔画数为<strong className="text-amber-500">{result.strokes}</strong>画。
                  </p>
                  <p>
                    以笔画起卦，得上卦<strong className="text-foreground">{result.upperTrigram.name}</strong>
                    （{result.upperTrigram.nature}）、下卦<strong className="text-foreground">{result.lowerTrigram.name}</strong>
                    （{result.lowerTrigram.nature}），组成<strong className="text-foreground">{result.hexagram.name}卦</strong>
                    （第{result.hexagram.number}卦）。
                  </p>
                  <p>
                    第<strong className="text-amber-500">{result.changingLine}</strong>爻为动爻，
                    动爻爻辞：{result.hexagram.lines[result.changingLine - 1].meaning}
                  </p>
                  
                  {result.decomposition && (
                    <>
                      <div className="bg-background rounded-lg p-4 border border-amber-500/20">
                        <p className="font-medium text-foreground mb-2">📐 字形分析</p>
                        <p className="text-muted-foreground">{result.decomposition.overall}</p>
                      </div>
                      <p>
                        此字五行属<strong className="text-amber-500">{result.decomposition.fiveElement}</strong>，
                        阴阳属<strong className="text-amber-500">{result.decomposition.yinYang}</strong>。
                      </p>
                    </>
                  )}
                  
                  {result.changedHexagram && (
                    <p>
                      本卦{result.hexagram.name}变为之卦{result.changedHexagram.name}，
                      象征事物从「{result.hexagram.judgementMeaning.slice(0, 15)}...」
                      转向「{result.changedHexagram.judgementMeaning.slice(0, 15)}...」。
                    </p>
                  )}
                  
                  <div className="mt-4 p-4 bg-background rounded-lg border border-amber-500/20">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">温馨提示：</strong>
                      测字算卦仅供参考，人生道路需要自己把握。愿此字带给您启示与力量。
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 重新测字 */}
              <div className="text-center">
                <Button
                  onClick={() => {
                    setInputChar('');
                    setResult(null);
                    setExpandedLines(new Set());
                    setShowChangedHexagram(false);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-black px-12 py-6 text-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
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
