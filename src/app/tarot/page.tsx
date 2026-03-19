'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Sparkles, Star, Loader2, RotateCcw } from 'lucide-react';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { UserMenu } from '@/components/auth/UserMenu';
import { useAuth } from '@/contexts/AuthContext';

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
    '现状',        // 1. 中心十字 - 现在的状况
    '阻碍',        // 2. 横跨牌 - 阻碍或挑战
    '根基',        // 3. 下方 - 潜意识、根基
    '过去',        // 4. 左侧 - 过去的影响
    '目标',        // 5. 上方 - 目标、理想
    '未来',        // 6. 右侧 - 近期未来
    '自我',        // 7. 权杖第1张 - 你的态度
    '环境',        // 8. 权杖第2张 - 外部环境
    '恐惧',        // 9. 权杖第3张 - 希望与恐惧
    '结果'         // 10. 权杖第4张 - 最终结果
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
      
      // 保存占卜记录
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
    
    // 随机抽牌
    const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, numCards);
    
    // 随机正逆位（50%概率）
    const drawn: DrawnCard[] = selected.map(card => ({
      card,
      isReversed: Math.random() < 0.5
    }));
    
    // 动画显示抽牌
    for (let i = 0; i < drawn.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setDrawnCards(prev => [...prev, drawn[i]]);
      setCurrentCardIndex(i + 1);
    }
    
    setShowCards(new Array(numCards).fill(false));
    setIsDrawing(false);
    
    // 延迟后自动翻牌
    setTimeout(() => {
      const allTrue = new Array(numCards).fill(true);
      setShowCards(allTrue);
      setAllRevealed(true);
      
      // 检查登录状态
      if (!isLoggedIn) {
        // 未登录，保存结果并显示登录弹窗
        setPendingCards(drawn);
        setShowLoginDialog(true);
      } else {
        // 已登录，开始AI解读
        streamInterpretation(drawn);
      }
    }, numCards * 500 + 1000);
  };

  // 登录成功后的回调
  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
    // 如果有待处理的卡牌，开始AI解读
    if (pendingCards) {
      streamInterpretation(pendingCards);
      setPendingCards(null);
    }
  };

  // 翻转单张牌
  const flipCard = (index: number) => {
    if (showCards[index]) return;
    setShowCards(prev => {
      const newState = [...prev];
      newState[index] = true;
      
      // 检查是否全部翻开
      if (newState.every(Boolean) && !allRevealed) {
        setAllRevealed(true);
        // 检查登录状态
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

  // 全部翻牌
  const revealAll = () => {
    setShowCards(new Array(drawnCards.length).fill(true));
    setAllRevealed(true);
    
    // 检查登录状态
    if (!isLoggedIn) {
      setPendingCards(drawnCards);
      setShowLoginDialog(true);
    } else {
      setTimeout(() => {
        streamInterpretation(drawnCards);
      }, 500);
    }
  };

  // 重置
  const reset = () => {
    setQuestion('');
    setDrawnCards([]);
    setShowCards([]);
    setAllRevealed(false);
    setAiInterpretation('');
    setPendingCards(null);
  };

  // 获取牌组符号
  const getSuitSymbol = (suit?: string) => {
    switch (suit) {
      case 'wands': return '🔥';
      case 'cups': return '💧';
      case 'swords': return '⚔️';
      case 'pentacles': return '💰';
      default: return '⭐';
    }
  };

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-md border-purple-300/30">
          <CardContent className="py-12 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-purple-300 animate-spin mb-4" />
            <p className="text-purple-100">正在加载塔罗牌数据...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-md border-purple-300/30 max-w-md">
          <CardHeader>
            <CardTitle className="text-purple-100">加载失败</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-purple-200 mb-4">{error}</p>
            <Button onClick={loadCards} className="bg-purple-500 hover:bg-purple-600 text-white">
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-purple-200 hover:text-purple-100 hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
          
          {/* 用户菜单 */}
          <div className="flex items-center gap-2">
            <UserMenu />
          </div>
        </div>

        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Star className="w-10 h-10 text-purple-300 mr-3" />
            <h1 className="text-4xl font-bold text-purple-100">塔罗占卜</h1>
            <Star className="w-10 h-10 text-purple-300 ml-3" />
          </div>
          <p className="text-purple-200/80">凝神静心，选择牌阵，探索命运的指引</p>
        </div>

        {/* 占卜区域 */}
        <div className="max-w-5xl mx-auto">
          {drawnCards.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-md border-purple-300/30">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-purple-100">选择牌阵</CardTitle>
                <CardDescription className="text-purple-200/60">
                  心中默念您想问的问题，选择合适的牌阵后开始抽牌
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                {/* 问题输入 */}
                <div className="w-full max-w-lg mb-6">
                  <label className="block text-sm text-purple-200 mb-2 text-center">您想问什么事？（可选）</label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="例如：我的感情发展如何？这次机会我应该把握吗？"
                    className="w-full h-24 bg-white/10 border border-purple-300/30 rounded-lg p-4 text-purple-100 placeholder:text-purple-200/40 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                    disabled={isDrawing}
                  />
                </div>

                {/* 牌阵选择 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
                  {(['single', 'three', 'celtic'] as SpreadType[]).map((type) => (
                    <Card
                      key={type}
                      className={`cursor-pointer transition-all ${
                        spreadType === type
                          ? 'bg-purple-500/30 border-purple-400 ring-2 ring-purple-400'
                          : 'bg-white/5 border-purple-300/20 hover:bg-white/10'
                      }`}
                      onClick={() => setSpreadType(type)}
                    >
                      <CardContent className="py-6 text-center">
                        <h3 className="text-lg font-bold text-purple-100 mb-2">{spreadNames[type]}</h3>
                        <p className="text-purple-200/60 text-sm">
                          {type === 'single' && '简单直接，适合快速决策'}
                          {type === 'three' && '过去现在未来，全方位分析'}
                          {type === 'celtic' && '深度探索，全面解读'}
                        </p>
                        <p className="text-purple-400 text-xs mt-2">
                          {type === 'single' && '1张牌'}
                          {type === 'three' && '3张牌'}
                          {type === 'celtic' && '10张牌'}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 牌阵说明 */}
                <div className="bg-purple-950/40 rounded-lg p-4 mb-6 max-w-lg text-center">
                  <p className="text-purple-200/80 text-sm leading-relaxed">
                    {spreadType === 'single' && '单张牌简单直接，适合日常小问题或快速决策'}
                    {spreadType === 'three' && '三张牌分别代表过去的影响、现在的状态和未来的趋势'}
                    {spreadType === 'celtic' && '凯尔特十字是最经典的塔罗牌阵，提供全面深入的解读'}
                  </p>
                </div>

                <Button
                  onClick={drawCards}
                  disabled={isDrawing}
                  className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-12 py-6 text-lg"
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
              <Card className="bg-white/10 backdrop-blur-md border-purple-300/30">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-purple-100">
                    {spreadNames[spreadType]}
                  </CardTitle>
                  {question && (
                    <CardDescription className="text-purple-200/80">
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
                          <span className="text-xs text-purple-300 bg-purple-900/50 px-2 py-1 rounded">
                            {spreadPositions[spreadType][index]}
                          </span>
                        </div>
                        
                        {/* 卡牌 */}
                        <div
                          className={`relative w-32 h-48 md:w-40 md:h-60 mx-auto transition-all duration-500 ${
                            showCards[index] ? '' : 'hover:shadow-lg hover:shadow-purple-500/30'
                          }`}
                          style={{
                            perspective: '1000px'
                          }}
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
                              className="absolute inset-0 rounded-xl overflow-hidden border-2 border-purple-400 shadow-lg shadow-purple-500/30"
                              style={{ backfaceVisibility: 'hidden' }}
                            >
                              <div className={`w-full h-full bg-gradient-to-br ${
                                drawn.card.arcana === 'major'
                                  ? 'from-indigo-600 to-purple-700'
                                  : drawn.card.suit === 'wands' ? 'from-orange-600 to-red-700' :
                                  drawn.card.suit === 'cups' ? 'from-blue-600 to-cyan-700' :
                                  drawn.card.suit === 'swords' ? 'from-gray-600 to-slate-700' :
                                  'from-emerald-600 to-green-700'
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
                              className="absolute inset-0 rounded-xl overflow-hidden border-2 border-purple-500 bg-gradient-to-br from-purple-800 to-indigo-900 flex items-center justify-center"
                              style={{
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)'
                              }}
                            >
                              <div className="text-purple-300">
                                <Star className="w-16 h-16" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* 正逆位标记 */}
                        {showCards[index] && (
                          <div className={`text-center mt-2 text-sm font-medium ${
                            drawn.isReversed ? 'text-purple-300' : 'text-purple-200'
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
                        className="border-purple-400 text-purple-200 hover:bg-purple-500/20"
                      >
                        全部翻开
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 已翻开的牌详情 */}
              {allRevealed && (
                <Card className="bg-white/10 backdrop-blur-md border-purple-300/30">
                  <CardHeader>
                    <CardTitle className="text-xl text-purple-100">牌面解读</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {drawnCards.map((drawn, index) => (
                      <div
                        key={index}
                        className={`bg-purple-950/40 rounded-lg p-4 ${
                          drawn.isReversed ? 'border-l-4 border-purple-400' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">
                            {getSuitSymbol(drawn.card.suit)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-purple-100">{drawn.card.name}</h3>
                              <span className={`text-xs px-2 py-1 rounded ${
                                drawn.isReversed
                                  ? 'bg-purple-500/30 text-purple-200'
                                  : 'bg-purple-400/30 text-purple-100'
                              }`}>
                                {drawn.isReversed ? '逆位' : '正位'}
                              </span>
                              <span className="text-xs text-purple-300 bg-purple-900/50 px-2 py-1 rounded">
                                {spreadPositions[spreadType][index]}
                              </span>
                            </div>
                            <p className="text-purple-200/80 text-sm mb-2">
                              {drawn.isReversed ? drawn.card.reversed : drawn.card.upright}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {drawn.card.keywords.map((keyword, k) => (
                                <span
                                  key={k}
                                  className="text-xs bg-purple-700/30 text-purple-200 px-2 py-0.5 rounded"
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

              {/* AI大师解读 - 固定高度 */}
              {allRevealed && (
                <Card className="bg-gradient-to-r from-purple-900/60 to-violet-900/60 border-purple-400/30">
                  <CardHeader>
                    <CardTitle className="text-xl text-purple-100 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      大师解读
                      {isInterpreting && <span className="ml-2 text-sm text-purple-300 animate-pulse">生成中...</span>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isInterpreting && !aiInterpretation ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="relative mb-4">
                          <Sparkles className="w-12 h-12 text-purple-400 animate-pulse" />
                        </div>
                        <p className="text-purple-200 animate-pulse">大师正在为您解读牌面...</p>
                      </div>
                    ) : (
                      <div className="h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-600/50 scrollbar-track-transparent">
                        <div className="prose prose-invert prose-purple max-w-none">
                          <div
                            className="text-purple-100 leading-relaxed whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{
                              __html: aiInterpretation
                                .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-purple-200 mt-6 mb-3">$1</h2>')
                                .replace(/\*\*(.+?)\*\*/g, '<strong class="text-purple-200">$1</strong>')
                            }}
                          />
                        </div>
                        <div ref={interpretationRef} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 重新占卜按钮 */}
              {allRevealed && (
                <div className="text-center">
                  <Button
                    onClick={reset}
                    className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-12 py-6 text-lg"
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
