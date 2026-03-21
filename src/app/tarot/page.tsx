'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Sparkles, Star, Loader2, RotateCcw } from 'lucide-react';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { UserMenu } from '@/components/auth/UserMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { Disclaimer } from '@/components/Disclaimer';
import { QuestionCategorySelector, QuestionCategory } from '@/components/QuestionCategorySelector';

// 类型定义
interface TarotCard {
  id: number;
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  number: number;
  image: string;
  upright: string;
  reversed: string;
  keywords: string[];
  description: string;
  meaning: {
    upright: string;
    reversed: string;
  };
  symbolism: string;
}

interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
}

// 牌阵类型
type SpreadType = 'single' | 'three' | 'celtic';

// 牌位说明
const spreadPositions: Record<SpreadType, string[]> = {
  single: ['当前状态'],
  three: ['过去', '现在', '未来'],
  celtic: [
    '现状', '阻碍', '根基', '过去', '目标', '未来',
    '自我', '环境', '恐惧', '结果'
  ]
};

// 牌阵名称
const spreadNames: Record<SpreadType, string> = {
  single: '单张牌占卜',
  three: '三张牌占卜',
  celtic: '凯尔特十字占卜'
};

export default function TarotPage() {
  const { isLoggedIn } = useAuth();
  const [question, setQuestion] = useState('');
  const [questionCategory, setQuestionCategory] = useState<QuestionCategory | null>(null);
  const [spreadType, setSpreadType] = useState<SpreadType>('three');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showCards, setShowCards] = useState<boolean[]>([]);
  const [allRevealed, setAllRevealed] = useState(false);
  
  // AI解读状态
  const [aiInterpretation, setAiInterpretation] = useState('');
  const [isInterpreting, setIsInterpreting] = useState(false);
  const interpretationRef = useRef<HTMLDivElement>(null);
  
  // 登录弹窗状态
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [pendingCards, setPendingCards] = useState<DrawnCard[] | null>(null);
  
  // 数据状态
  const [tarotCards, setTarotCards] = useState<TarotCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载塔罗牌数据
  const loadCards = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tarot/cards');
      const data = await response.json();
      
      if (data.needsInit) {
        const initResponse = await fetch('/api/tarot/init', { method: 'POST' });
        const initData = await initResponse.json();
        
        if (initData.success) {
          const retryResponse = await fetch('/api/tarot/cards');
          const retryData = await retryResponse.json();
          setTarotCards(retryData.cards || []);
        } else {
          setError('数据初始化失败');
        }
      } else if (data.cards) {
        setTarotCards(data.cards);
      } else {
        setError(data.error || '加载数据失败');
      }
    } catch (err) {
      setError('加载数据失败，请刷新页面重试');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  // 保存占卜记录
  const saveDivinationRecord = async (cards: DrawnCard[], interpretation: string) => {
    try {
      await fetch('/api/divination/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tarot',
          question: question || null,
          result: {
            spreadType,
            spreadName: spreadNames[spreadType],
            cards: cards.map((dc, index) => ({
              name: dc.card.name,
              isReversed: dc.isReversed,
              position: spreadPositions[spreadType][index]
            }))
          },
          aiInterpretation: interpretation,
        }),
      });
    } catch (error) {
      console.error('保存占卜记录失败:', error);
    }
  };

  // 流式AI解读
  const streamInterpretation = async (cards: DrawnCard[]) => {
    setIsInterpreting(true);
    setAiInterpretation('');

    try {
      const res = await fetch('/api/divination/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tarot',
          question: question || '请为我解读这次塔罗占卜',
          questionCategory,
          spreadType,
          cards: cards.map((dc, index) => ({
            name: dc.card.name,
            isReversed: dc.isReversed,
            upright: dc.card.upright,
            reversed: dc.card.reversed,
            keywords: dc.card.keywords,
            description: dc.card.description,
            position: spreadPositions[spreadType][index]
          }))
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
      
      await saveDivinationRecord(cards, fullText);
    } catch (error) {
      console.error('Interpretation error:', error);
      setAiInterpretation('AI解读生成失败，请稍后重试');
    } finally {
      setIsInterpreting(false);
    }
  };

  // 抽牌
  const drawCards = async () => {
    if (tarotCards.length === 0) return;
    
    setIsDrawing(true);
    setDrawnCards([]);
    setCurrentCardIndex(0);
    setShowCards([]);
    setAllRevealed(false);
    setAiInterpretation('');
    setPendingCards(null);
    
    const numCards = spreadType === 'single' ? 1 : spreadType === 'three' ? 3 : 10;
    const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, numCards);
    const drawn: DrawnCard[] = selected.map(card => ({
      card,
      isReversed: Math.random() < 0.5
    }));
    
    for (let i = 0; i < drawn.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setDrawnCards(prev => [...prev, drawn[i]]);
      setCurrentCardIndex(i + 1);
    }
    
    setShowCards(new Array(numCards).fill(false));
    setIsDrawing(false);
    
    setTimeout(() => {
      const allTrue = new Array(numCards).fill(true);
      setShowCards(allTrue);
      setAllRevealed(true);
      
      if (!isLoggedIn) {
        setPendingCards(drawn);
        setShowLoginDialog(true);
      } else {
        streamInterpretation(drawn);
      }
    }, numCards * 500 + 1000);
  };

  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
    if (pendingCards) {
      streamInterpretation(pendingCards);
      setPendingCards(null);
    }
  };

  const flipCard = (index: number) => {
    if (showCards[index]) return;
    setShowCards(prev => {
      const newState = [...prev];
      newState[index] = true;
      
      if (newState.every(Boolean) && !allRevealed) {
        setAllRevealed(true);
        if (!isLoggedIn) {
          setPendingCards(drawnCards);
          setShowLoginDialog(true);
        } else {
          setTimeout(() => {
            streamInterpretation(drawnCards);
          }, 500);
        }
      }
      return newState;
    });
  };

  const revealAll = () => {
    setShowCards(new Array(drawnCards.length).fill(true));
    setAllRevealed(true);
    
    if (!isLoggedIn) {
      setPendingCards(drawnCards);
      setShowLoginDialog(true);
    } else {
      setTimeout(() => {
        streamInterpretation(drawnCards);
      }, 500);
    }
  };

  const reset = () => {
    setQuestion('');
    setQuestionCategory(null);
    setDrawnCards([]);
    setShowCards([]);
    setAllRevealed(false);
    setAiInterpretation('');
    setPendingCards(null);
  };

  const getSuitSymbol = (suit?: string) => {
    switch (suit) {
      case 'wands': return '🔥';
      case 'cups': return '💧';
      case 'swords': return '⚔️';
      case 'pentacles': return '💰';
      default: return '⭐';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--theme-bg)] flex items-center justify-center">
        <Card className="bg-[var(--theme-card)] border-[var(--theme-purple-border)]">
          <CardContent className="py-12 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-[var(--theme-purple)] animate-spin mb-4" />
            <p className="text-[var(--theme-text-secondary)]">正在加载塔罗牌数据...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--theme-bg)] flex items-center justify-center">
        <Card className="bg-[var(--theme-card)] border-[var(--theme-purple-border)] max-w-md">
          <CardHeader>
            <CardTitle className="text-[var(--theme-purple-text)]">加载失败</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-[var(--theme-text-secondary)] mb-4">{error}</p>
            <Button onClick={loadCards} className="bg-[var(--theme-purple)] hover:opacity-90 text-white">
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] transition-colors">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--theme-purple-border)]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-[var(--theme-purple)]/50 group-hover:border-[var(--theme-purple)] transition-colors" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--theme-purple)] group-hover:opacity-80 transition-opacity" />
            </div>
            <span className="text-xl font-bold text-[var(--theme-purple-text)] group-hover:opacity-80 transition-opacity">
              乾坤星路
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Star className="w-10 h-10 text-[var(--theme-purple)] mr-3" />
            <h1 className="text-4xl font-bold text-[var(--theme-purple-text)]">塔罗占卜</h1>
            <Star className="w-10 h-10 text-[var(--theme-purple)] ml-3" />
          </div>
          <p className="text-[var(--theme-text-secondary)]">凝神静心，选择牌阵，探索命运的指引</p>
        </div>

        {/* 占卜区域 */}
        <div className="max-w-5xl mx-auto">
          {drawnCards.length === 0 ? (
            <Card className="bg-[var(--theme-card)] border-[var(--theme-purple-border)]">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-[var(--theme-purple-text)]">选择牌阵</CardTitle>
                <CardDescription className="text-[var(--theme-text-secondary)]">
                  心中默念您想问的问题，选择合适的牌阵后开始抽牌
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                {/* 问题输入 */}
                <div className="w-full max-w-lg mb-6">
                  <label className="block text-sm text-[var(--theme-text-secondary)] mb-2 text-center">您想问什么事？（可选）</label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="例如：我的感情发展如何？这次机会我应该把握吗？"
                    className="w-full h-24 bg-[var(--theme-bg-secondary)] border border-[var(--theme-purple-border)] rounded-lg p-4 text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--theme-purple)]/50"
                    disabled={isDrawing}
                  />
                </div>

                {/* 问题类型选择 */}
                <div className="w-full max-w-lg mb-6">
                  <QuestionCategorySelector
                    value={questionCategory}
                    onChange={setQuestionCategory}
                    theme="purple"
                  />
                </div>

                {/* 牌阵选择 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
                  {(['single', 'three', 'celtic'] as SpreadType[]).map((type) => (
                    <Card
                      key={type}
                      className={`cursor-pointer transition-all ${
                        spreadType === type
                          ? 'bg-[var(--theme-purple-bg)] border-[var(--theme-purple)] ring-2 ring-[var(--theme-purple)]/30'
                          : 'bg-[var(--theme-bg-secondary)] border-[var(--theme-purple-border)] hover:border-[var(--theme-purple)]/50'
                      }`}
                      onClick={() => setSpreadType(type)}
                    >
                      <CardContent className="py-6 text-center">
                        <h3 className="text-lg font-bold text-[var(--theme-purple-text)] mb-2">{spreadNames[type]}</h3>
                        <p className="text-[var(--theme-text-secondary)] text-sm">
                          {type === 'single' && '简单直接，适合快速决策'}
                          {type === 'three' && '过去现在未来，全方位分析'}
                          {type === 'celtic' && '深度探索，全面解读'}
                        </p>
                        <p className="text-[var(--theme-purple)] text-xs mt-2">
                          {type === 'single' && '1张牌'}
                          {type === 'three' && '3张牌'}
                          {type === 'celtic' && '10张牌'}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button
                  onClick={drawCards}
                  disabled={isDrawing}
                  className="bg-[var(--theme-purple)] hover:opacity-90 text-white px-12 py-6 text-lg"
                >
                  {isDrawing ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      抽牌中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      开始抽牌
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* 牌阵显示 */}
              <Card className="bg-[var(--theme-card)] border-[var(--theme-purple-border)]">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-[var(--theme-purple-text)]">
                    {spreadNames[spreadType]}
                  </CardTitle>
                  {question && (
                    <CardDescription className="text-[var(--theme-text-secondary)]">
                      您的问题：{question}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {/* 卡牌布局 */}
                  <div className={`grid gap-4 mb-6 ${
                    spreadType === 'single' ? 'grid-cols-1 justify-items-center' :
                    spreadType === 'three' ? 'grid-cols-3' :
                    'grid-cols-2 md:grid-cols-5'
                  }`}>
                    {drawnCards.map((drawn, index) => (
                      <div
                        key={index}
                        className={`relative cursor-pointer transition-all duration-500 ${
                          showCards[index] ? '' : 'hover:scale-105'
                        }`}
                        onClick={() => flipCard(index)}
                      >
                        {/* 牌位说明 */}
                        <div className="text-center mb-2">
                          <span className="text-xs text-[var(--theme-purple)] bg-[var(--theme-purple-bg)] border border-[var(--theme-purple-border)] px-2 py-1 rounded">
                            {spreadPositions[spreadType][index]}
                          </span>
                        </div>
                        
                        {/* 卡牌 */}
                        <div
                          className={`relative w-32 h-48 md:w-40 md:h-60 mx-auto transition-all duration-500 ${
                            showCards[index] ? '' : 'hover:shadow-lg hover:shadow-purple-500/30'
                          }`}
                          style={{ perspective: '1000px' }}
                        >
                          <div
                            className={`relative w-full h-full transition-transform duration-700 ${
                              showCards[index] ? 'rotate-y-0' : 'rotate-y-180'
                            }`}
                            style={{
                              transformStyle: 'preserve-3d',
                              transform: showCards[index] ? 'rotateY(0deg)' : 'rotateY(180deg)'
                            }}
                          >
                            {/* 正面 */}
                            <div
                              className="absolute inset-0 rounded-xl overflow-hidden border-2 border-[var(--theme-purple-border)] shadow-lg shadow-purple-500/20"
                              style={{ backfaceVisibility: 'hidden' }}
                            >
                              <div className={`w-full h-full bg-gradient-to-br ${
                                drawn.card.arcana === 'major'
                                  ? 'from-[var(--theme-purple)]/50 to-purple-700/50'
                                  : drawn.card.suit === 'wands' ? 'from-orange-600/50 to-red-700/50' :
                                  drawn.card.suit === 'cups' ? 'from-blue-600/50 to-cyan-700/50' :
                                  drawn.card.suit === 'swords' ? 'from-gray-600/50 to-slate-700/50' :
                                  'from-emerald-600/50 to-green-700/50'
                              } flex flex-col items-center justify-center p-3 text-white`}>
                                <span className="text-3xl mb-2">
                                  {getSuitSymbol(drawn.card.suit)}
                                </span>
                                <span className="text-sm font-bold text-center">
                                  {drawn.card.name}
                                </span>
                                {drawn.isReversed && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <RotateCcw className="w-12 h-12 text-white/20" />
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* 背面 */}
                            <div
                              className="absolute inset-0 rounded-xl overflow-hidden border-2 border-[var(--theme-purple-border)] bg-gradient-to-br from-[var(--theme-card)] to-[var(--theme-bg)] flex items-center justify-center"
                              style={{
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)'
                              }}
                            >
                              <div className="text-[var(--theme-purple)]">
                                <Star className="w-16 h-16" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* 正逆位标记 */}
                        {showCards[index] && (
                          <div className={`text-center mt-2 text-sm font-medium ${
                            drawn.isReversed ? 'text-[var(--theme-purple)]' : 'text-[var(--theme-text-secondary)]'
                          }`}>
                            {drawn.isReversed ? '逆位' : '正位'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 全部翻牌按钮 */}
                  {!allRevealed && drawnCards.length > 1 && (
                    <div className="text-center">
                      <Button
                        onClick={revealAll}
                        variant="outline"
                        className="border-[var(--theme-purple-border)] text-[var(--theme-purple)] hover:bg-[var(--theme-purple-bg)]"
                      >
                        全部翻开
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 已翻开的牌详情 */}
              {allRevealed && (
                <Card className="bg-[var(--theme-card)] border-[var(--theme-purple-border)]">
                  <CardHeader>
                    <CardTitle className="text-xl text-[var(--theme-purple-text)]">牌面解读</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {drawnCards.map((drawn, index) => (
                      <div
                        key={index}
                        className={`bg-[var(--theme-bg-secondary)] rounded-lg p-4 ${
                          drawn.isReversed ? 'border-l-4 border-[var(--theme-purple)]' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">
                            {getSuitSymbol(drawn.card.suit)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="text-lg font-bold text-[var(--theme-text)]">{drawn.card.name}</h3>
                              <span className={`text-xs px-2 py-1 rounded ${
                                drawn.isReversed
                                  ? 'bg-[var(--theme-purple-bg)] text-[var(--theme-purple)] border border-[var(--theme-purple-border)]'
                                  : 'bg-[var(--theme-gold-bg)] text-[var(--theme-gold)] border border-[var(--theme-gold-border)]'
                              }`}>
                                {drawn.isReversed ? '逆位' : '正位'}
                              </span>
                              <span className="text-xs text-[var(--theme-purple)] bg-[var(--theme-purple-bg)] border border-[var(--theme-purple-border)] px-2 py-1 rounded">
                                {spreadPositions[spreadType][index]}
                              </span>
                            </div>
                            <p className="text-[var(--theme-text-secondary)] text-sm mb-2">
                              {drawn.isReversed ? drawn.card.reversed : drawn.card.upright}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {drawn.card.keywords.map((keyword, k) => (
                                <span
                                  key={k}
                                  className="text-xs bg-[var(--theme-purple-bg)] text-[var(--theme-purple)] px-2 py-0.5 rounded border border-[var(--theme-purple-border)]"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* AI大师解读 */}
              {allRevealed && (
                <Card className="bg-gradient-to-r from-[var(--theme-purple-bg)] to-purple-900/30 border-[var(--theme-purple-border)]">
                  <CardHeader>
                    <CardTitle className="text-xl text-[var(--theme-text)] flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-[var(--theme-purple)]" />
                      大师解读
                      {isInterpreting && <span className="ml-2 text-sm text-[var(--theme-purple)] animate-pulse">生成中...</span>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isInterpreting && !aiInterpretation ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="relative mb-4">
                          <Sparkles className="w-12 h-12 text-[var(--theme-purple)] animate-pulse" />
                        </div>
                        <p className="text-[var(--theme-text-secondary)] animate-pulse">大师正在为您解读牌面...</p>
                      </div>
                    ) : (
                      <div className="h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-600/50 scrollbar-track-transparent">
                        <div className="prose prose-invert prose-purple max-w-none">
                          <div
                            className="text-[var(--theme-text)] leading-relaxed whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{
                              __html: aiInterpretation
                                .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-[var(--theme-text)] mt-6 mb-3">$1</h2>')
                                .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[var(--theme-purple)]">$1</strong>')
                            }}
                          />
                        </div>
                        <div ref={interpretationRef} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 免责声明 */}
              {allRevealed && <Disclaimer variant="full" />}

              {/* 重新占卜按钮 */}
              {allRevealed && (
                <div className="text-center">
                  <Button
                    onClick={reset}
                    className="bg-[var(--theme-purple)] hover:opacity-90 text-white px-12 py-6 text-lg"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    重新占卜
                  </Button>
                </div>
              )}
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

      {/* 添加翻转动画CSS */}
      <style jsx global>{`
        .rotate-y-0 {
          transform: rotateY(0deg);
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
