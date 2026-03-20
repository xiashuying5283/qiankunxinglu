'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Sparkles, ChevronDown, ChevronUp, BookOpen, Loader2, Circle, User, GraduationCap, ExternalLink } from 'lucide-react';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { UserMenu } from '@/components/auth/UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { Disclaimer } from '@/components/Disclaimer';
import { GlossaryTerm } from '@/components/GlossaryTerm';
import { HexagramKnowledge } from '@/components/HexagramKnowledge';
import { 
  QuestionCategorySelector, 
  QuestionCategory, 
  getQuestionPlaceholder,
  getQuestionHint
} from '@/components/QuestionCategorySelector';
import { useHexagramData } from '@/lib/hexagram-preload';

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

type LineType = 'old-yang' | 'young-yang' | 'old-yin' | 'young-yin';

interface CoinThrow {
  coins: boolean[];
  lineType: LineType;
  lineValue: number;
}

interface DivinationResult {
  originalHexagram: HexagramData;
  changedHexagram: HexagramData | null;
  coinThrows: CoinThrow[];
  changingLines: number[];
  originalBinary: string;
  changedBinary: string;
}

export default function IChingPage() {
  const { isLoggedIn } = useAuth();
  const [question, setQuestion] = useState('');
  const [questionCategory, setQuestionCategory] = useState<QuestionCategory | null>(null);
  const [isDivining, setIsDivining] = useState(false);
  const [result, setResult] = useState<DivinationResult | null>(null);
  const [currentThrow, setCurrentThrow] = useState<number>(0);
  const [expandedLines, setExpandedLines] = useState<Set<number>>(new Set());
  const [showChangedHexagram, setShowChangedHexagram] = useState(false);
  
  const [aiInterpretation, setAiInterpretation] = useState('');
  const [isInterpreting, setIsInterpreting] = useState(false);
  const interpretationRef = useRef<HTMLDivElement>(null);
  
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [pendingDivinationResult, setPendingDivinationResult] = useState<DivinationResult | null>(null);
  
  const { hexagrams, trigrams, isLoading, error, refresh } = useHexagramData();

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

  const findHexagramByBinary = (binary: string): HexagramData => {
    const found = hexagrams.find(h => h.binary === binary);
    return found || hexagrams[0];
  };

  const saveDivinationRecord = async (divinationResult: DivinationResult, interpretation: string) => {
    try {
      await fetch('/api/divination/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'iching',
          question: question || null,
          result: {
            originalHexagramName: divinationResult.originalHexagram.name,
            originalHexagramNumber: divinationResult.originalHexagram.number,
            originalHexagramSymbol: divinationResult.originalHexagram.symbol,
            changedHexagramName: divinationResult.changedHexagram?.name || null,
            changedHexagramNumber: divinationResult.changedHexagram?.number || null,
            changingLines: divinationResult.changingLines,
            coinThrows: divinationResult.coinThrows,
          },
          aiInterpretation: interpretation,
        }),
      });
    } catch (error) {
      console.error('保存占卜记录失败:', error);
    }
  };

  const streamInterpretation = async (divinationResult: DivinationResult) => {
    setIsInterpreting(true);
    setAiInterpretation('');

    const categoryLabels: Record<QuestionCategory, string> = {
      career: '事业发展',
      love: '感情姻缘',
      study: '学业考试',
      wealth: '财运走向',
      other: '其他困惑'
    };
    const categoryText = questionCategory ? `【${categoryLabels[questionCategory]}】` : '';
    const fullQuestion = question 
      ? `${categoryText}${question}` 
      : questionCategory 
        ? `${categoryText}请为我解读这卦的含义` 
        : '请为我解读这卦的含义';

    try {
      const res = await fetch('/api/divination/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'iching',
          question: fullQuestion,
          questionCategory: questionCategory,
          hexagram: divinationResult.originalHexagram,
          changingLines: divinationResult.changingLines,
          changedHexagram: divinationResult.changedHexagram ? {
            name: divinationResult.changedHexagram.name,
            number: divinationResult.changedHexagram.number,
            judgement: divinationResult.changedHexagram.judgement,
            judgementMeaning: divinationResult.changedHexagram.judgementMeaning,
            lines: divinationResult.changedHexagram.lines
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
      
      await saveDivinationRecord(divinationResult, fullText);
    } catch (error) {
      console.error('Interpretation error:', error);
      setAiInterpretation('AI解读生成失败，请稍后重试');
    } finally {
      setIsInterpreting(false);
    }
  };

  const divine = async () => {
    if (hexagrams.length === 0) return;
    
    setIsDivining(true);
    setResult(null);
    setCurrentThrow(0);
    setExpandedLines(new Set());
    setShowChangedHexagram(false);
    setAiInterpretation('');
    
    const coinThrows: CoinThrow[] = [];
    
    for (let i = 0; i < 6; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const throwResult = throwThreeCoins();
      coinThrows.push(throwResult);
      setCurrentThrow(i + 1);
    }
    
    const originalBinary = coinThrows
      .map(t => (t.lineType === 'old-yang' || t.lineType === 'young-yang') ? '1' : '0')
      .reverse()
      .join('');
    
    const changingLines: number[] = coinThrows
      .map((t, i) => (t.lineType === 'old-yang' || t.lineType === 'old-yin') ? i + 1 : -1)
      .filter(i => i > 0);
    
    const changedBinary = coinThrows
      .map((t, i) => {
        if (t.lineType === 'old-yang') return '0';
        if (t.lineType === 'old-yin') return '1';
        return (t.lineType === 'young-yang') ? '1' : '0';
      })
      .reverse()
      .join('');
    
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
      
      if (!isLoggedIn) {
        setPendingDivinationResult(divinationResult);
        setShowLoginDialog(true);
      } else {
        streamInterpretation(divinationResult);
      }
    }, 500);
  };

  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
    if (pendingDivinationResult) {
      streamInterpretation(pendingDivinationResult);
      setPendingDivinationResult(null);
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

  const getTrigramSymbol = (trigramName: string) => {
    const trigram = trigrams.find(t => t.name === trigramName);
    return trigram?.symbol || '';
  };

  const getLineSymbol = (lineType: LineType): string => {
    switch (lineType) {
      case 'old-yang': return '○';
      case 'young-yang': return '—';
      case 'old-yin': return '×';
      case 'young-yin': return '- -';
    }
  };

  const getLineColorClass = (lineType: LineType): string => {
    switch (lineType) {
      case 'old-yang': return 'text-red-400';
      case 'old-yin': return 'text-blue-400';
      default: return 'text-foreground';
    }
  };

  const reset = () => {
    setQuestion('');
    setQuestionCategory(null);
    setResult(null);
    setCurrentThrow(0);
    setExpandedLines(new Set());
    setShowChangedHexagram(false);
    setAiInterpretation('');
    setPendingDivinationResult(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Card className="bg-card/50 border-amber-500/20 max-w-md">
          <CardHeader>
            <CardTitle className="text-foreground">加载失败</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refresh} className="bg-amber-500 hover:bg-amber-600 text-black">
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-amber-500/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/50 group-hover:border-amber-400 transition-colors" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-500 group-hover:bg-amber-400 transition-colors" />
            </div>
            <span className="text-xl font-bold text-foreground group-hover:text-amber-50 transition-colors">
              乾坤星路
            </span>
          </Link>
          <UserMenu />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-10 h-10 text-amber-500 mr-3" />
            <h1 className="text-4xl font-bold text-foreground">周易占卜</h1>
            <Sparkles className="w-10 h-10 text-amber-500 ml-3" />
          </div>
          <p className="text-muted-foreground">诚心祈愿，掷币问卦，探知天机</p>
        </div>

        {/* 占卜区域 */}
        <div className="max-w-4xl mx-auto">
          {!result ? (
            <Card className="bg-card/50 border-amber-500/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-foreground">投掷铜钱</CardTitle>
                <CardDescription className="text-muted-foreground">
                  心中默念您想问的问题，点击下方按钮开始占卜
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                {/* 问题类型选择 */}
                <QuestionCategorySelector
                  value={questionCategory}
                  onChange={setQuestionCategory}
                  theme="amber"
                />

                {/* 问题输入 */}
                <div className="w-full max-w-lg mb-4">
                  <label className="block text-sm text-muted-foreground mb-2 text-center">
                    具体问题（可选，{getQuestionHint(questionCategory)}）
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={getQuestionPlaceholder(questionCategory)}
                    className="w-full h-24 bg-[#0a0a0a] border border-amber-500/20 rounded-lg p-4 text-gray-200 placeholder:text-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    disabled={isDivining}
                  />
                </div>

                {/* 占卜说明 */}
                <div className="bg-[#0a0a0a] rounded-lg p-4 mb-6 max-w-lg text-center border border-amber-500/10">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    每次抛三枚铜钱，共抛六次，从下往上排成六爻。
                    三正为老阳（变爻），两正一反为少阳，一正两反为少阴，三反为老阴（变爻）。
                  </p>
                </div>

                {/* 铜钱动画区域 */}
                <div className="mb-6">
                  <div className="text-center mb-2 text-muted-foreground">
                    {isDivining ? `第 ${currentThrow} 次抛币（共6次）` : '准备开始'}
                  </div>
                  <div className="flex justify-center gap-4">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                          isDivining
                            ? 'bg-amber-500 border-amber-600 text-black shadow-lg shadow-amber-500/30 animate-bounce'
                            : 'bg-[#1a1a1a] border-amber-500/20 text-gray-600'
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
                            ? 'bg-amber-500/20 border-amber-500/50 text-foreground'
                            : 'bg-[#1a1a1a] border-amber-500/10 text-gray-600'
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
                  className="bg-amber-500 hover:bg-amber-600 text-black px-12 py-6 text-lg"
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
              {/* 本卦显示 */}
              <Card className="bg-card/50 border-amber-500/20">
                <CardHeader className="text-center pb-2">
                  <div className="flex items-center justify-center gap-8">
                    {/* 本卦 */}
                    <div className="text-center">
                      <div className="text-5xl mb-2">{result.originalHexagram.symbol}</div>
                      <CardTitle className="text-2xl text-foreground">{result.originalHexagram.name}卦</CardTitle>
                      <CardDescription className="text-muted-foreground text-sm">
                        <GlossaryTerm term="本卦">本卦</GlossaryTerm> · 第{result.originalHexagram.number}卦
                      </CardDescription>
                    </div>
                    
                    {/* 变卦 */}
                    {result.changedHexagram && (
                      <>
                        <div className="text-3xl text-amber-500">→</div>
                        <div className="text-center">
                          <div className="text-5xl mb-2">{result.changedHexagram.symbol}</div>
                          <CardTitle className="text-2xl text-foreground">{result.changedHexagram.name}卦</CardTitle>
                          <CardDescription className="text-muted-foreground text-sm">
                            <GlossaryTerm term="变卦">变卦</GlossaryTerm> · 第{result.changedHexagram.number}卦
                          </CardDescription>
                        </div>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* 动爻信息 */}
                  {result.changingLines.length > 0 ? (
                    <div className="text-center mb-4">
                      <span className="text-muted-foreground">
                        <GlossaryTerm term="动爻">动爻</GlossaryTerm>：
                      </span>
                      <span className="text-foreground font-bold">
                        {result.changingLines.map(l => ['初', '二', '三', '四', '五', '上'][l-1] + '爻').join('、')}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center mb-4 text-muted-foreground">无动爻，以<GlossaryTerm term="卦辞">卦辞</GlossaryTerm>为主</div>
                  )}
                  
                  {/* 卦辞 */}
                  <div className="bg-[#0a0a0a] rounded-lg p-4 text-center border border-amber-500/10">
                    <div className="text-xs text-amber-400 mb-2">卦辞</div>
                    <p className="text-foreground text-lg">{result.originalHexagram.judgement}</p>
                    <p className="text-muted-foreground text-sm mt-2">{result.originalHexagram.judgementMeaning}</p>
                  </div>
                </CardContent>
              </Card>

              {/* AI大师解读 */}
              <Card className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-amber-500" />
                    大师解读
                    {isInterpreting && <span className="ml-2 text-sm text-amber-400 animate-pulse">生成中...</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isInterpreting && !aiInterpretation ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="relative mb-4">
                        <Sparkles className="w-12 h-12 text-amber-500 animate-pulse" />
                      </div>
                      <p className="text-muted-foreground animate-pulse">大师正在为您解读卦象...</p>
                    </div>
                  ) : (
                    <div className="h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-600/50 scrollbar-track-transparent">
                      <div className="prose prose-invert prose-amber max-w-none">
                        <div
                          className="text-gray-200 leading-relaxed whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: aiInterpretation
                              .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-foreground mt-6 mb-3">$1</h2>')
                              .replace(/\*\*(.+?)\*\*/g, '<strong class="text-amber-200">$1</strong>')
                          }}
                        />
                      </div>
                      <div ref={interpretationRef} />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 卦象科普卡片 */}
              <HexagramKnowledge 
                hexagramNumber={result.originalHexagram.number} 
                hexagramName={result.originalHexagram.name} 
              />

              {/* 进阶学习入口 */}
              <Card className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-500/20">
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-indigo-100 font-medium flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        想深入学习周易？
                      </div>
                      <div className="text-muted-foreground text-sm mt-1">
                        前往学习中心，系统学习卦象知识与断卦技巧
                      </div>
                    </div>
                    <Link href="/learn">
                      <Button className="bg-indigo-500 hover:bg-indigo-600 text-white">
                        开始学习
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* 免责声明 */}
              <Disclaimer variant="full" />

              {/* 重新占卜按钮 */}
              <div className="text-center">
                <Button
                  onClick={reset}
                  className="bg-amber-500 hover:bg-amber-600 text-black px-12 py-6 text-lg"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  重新占卜
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 登录弹窗 */}
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        title="登录后查看大师解读"
        description="登录后可以获得AI大师解读，并保存您的占卜记录"
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
