'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Moon, RotateCcw } from 'lucide-react';
import { allTarotCards, type TarotCard } from '@/lib/divination-data';

type SpreadType = 'single' | 'three' | 'celtic';

interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
}

export default function TarotPage() {
  const [selectedSpread, setSelectedSpread] = useState<SpreadType | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());

  const spreads = [
    { id: 'single', name: '单张牌占卜', description: '简单直接，适合日常指引' },
    { id: 'three', name: '三张牌占卜', description: '过去、现在、未来的时间线' },
    { id: 'celtic', name: '凯尔特十字', description: '深度全面的占卜方式' },
  ];

  const drawCards = async (count: number) => {
    setIsDrawing(true);
    setDrawnCards([]);
    setRevealedCards(new Set());

    // 随机抽取指定数量的牌
    const shuffled = [...allTarotCards].sort(() => Math.random() - 0.5);
    const selected: DrawnCard[] = shuffled.slice(0, count).map(card => ({
      card,
      isReversed: Math.random() > 0.5,
    }));

    // 逐张揭示动画
    for (let i = 0; i < selected.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setDrawnCards(prev => [...prev, selected[i]]);
      setRevealedCards(prev => new Set(prev).add(i));
    }

    setIsDrawing(false);
  };

  const getCardMeaning = (drawnCard: DrawnCard, position?: number) => {
    const { card, isReversed } = drawnCard;
    const positionLabels = ['过去', '现在', '未来'];
    
    return {
      title: card.name,
      orientation: isReversed ? '逆位' : '正位',
      meaning: isReversed ? card.reversed : card.upright,
      position: position !== undefined ? positionLabels[position] : undefined,
      description: card.description,
    };
  };

  const reset = () => {
    setSelectedSpread(null);
    setDrawnCards([]);
    setRevealedCards(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-purple-200 hover:text-purple-100 hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </Link>

        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Moon className="w-10 h-10 text-purple-300 mr-3" />
            <h1 className="text-4xl font-bold text-purple-100">塔罗占卜</h1>
            <Moon className="w-10 h-10 text-purple-300 ml-3" />
          </div>
          <p className="text-purple-200/80">神秘的塔罗牌将为您揭示命运的奥秘</p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* 选择牌型 */}
          {!selectedSpread && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {spreads.map(spread => (
                <Card
                  key={spread.id}
                  className="bg-white/10 backdrop-blur-md border-purple-300/30 hover:bg-white/20 transition-all cursor-pointer hover:scale-105"
                  onClick={() => {
                    setSelectedSpread(spread.id as SpreadType);
                    const cardCount = spread.id === 'single' ? 1 : spread.id === 'three' ? 3 : 10;
                    drawCards(cardCount);
                  }}
                >
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl text-purple-100">{spread.name}</CardTitle>
                    <CardDescription className="text-purple-200/60">
                      {spread.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}

          {/* 抽牌中 */}
          {selectedSpread && isDrawing && (
            <Card className="bg-white/10 backdrop-blur-md border-purple-300/30">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <RefreshCw className="w-16 h-16 text-purple-300 animate-spin mb-4" />
                <p className="text-xl text-purple-200">正在为您抽取塔罗牌...</p>
              </CardContent>
            </Card>
          )}

          {/* 显示结果 */}
          {selectedSpread && !isDrawing && drawnCards.length > 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drawnCards.map((drawnCard, index) => {
                  const meaning = getCardMeaning(drawnCard, selectedSpread === 'three' ? index : undefined);
                  return (
                    <Card
                      key={index}
                      className="bg-white/10 backdrop-blur-md border-purple-300/30"
                    >
                      <CardHeader>
                        {/* 塔罗牌图片 */}
                        {drawnCard.card.image && (
                          <div className={`relative w-full aspect-[2/3] mb-4 rounded-lg overflow-hidden ${drawnCard.isReversed ? 'rotate-180' : ''}`}>
                            <Image
                              src={drawnCard.card.image}
                              alt={drawnCard.card.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-2">
                          <CardTitle className="text-2xl text-purple-100">
                            {meaning.title}
                          </CardTitle>
                          {drawnCard.isReversed && (
                            <RotateCcw className="w-5 h-5 text-purple-300" />
                          )}
                        </div>
                        <CardDescription className="text-purple-200/80">
                          {meaning.position && (
                            <span className="font-bold text-purple-300 mr-2">
                              {meaning.position}:
                            </span>
                          )}
                          <span className={drawnCard.isReversed ? 'text-red-300' : 'text-green-300'}>
                            {meaning.orientation}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="bg-purple-900/40 rounded-lg p-3">
                            <p className="text-purple-200 text-sm font-medium mb-1">关键词</p>
                            <div className="flex flex-wrap gap-2">
                              {drawnCard.card.keywords.map((keyword, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-purple-600/30 rounded text-xs text-purple-200"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="bg-purple-900/40 rounded-lg p-3">
                            <p className="text-purple-200 text-sm font-medium mb-1">含义</p>
                            <p className="text-purple-100">{meaning.meaning}</p>
                          </div>
                          <div className="bg-purple-900/40 rounded-lg p-3">
                            <p className="text-purple-200 text-sm font-medium mb-1">牌意解读</p>
                            <p className="text-purple-100 text-sm">{meaning.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* 综合解读 */}
              <Card className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-purple-400/30">
                <CardHeader>
                  <CardTitle className="text-xl text-purple-100">综合解读</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-100 leading-relaxed">
                    {selectedSpread === 'single' && (
                      <>
                        这张{drawnCards[0].card.name}牌{' '}
                        {drawnCards[0].isReversed ? '逆位' : '正位'}出现，提示您
                        {drawnCards[0].card.upright}。
                        {drawnCards[0].card.description}
                      </>
                    )}
                    {selectedSpread === 'three' && (
                      <>
                        从时间线来看，您的过去受到{drawnCards[0].card.name}的影响，表现为
                        {drawnCards[0].card.upright}；
                        现在的状态呈现{drawnCards[1].card.name}的特质，意味着
                        {drawnCards[1].card.upright}；
                        未来可能朝向{drawnCards[2].card.name}发展，
                        {drawnCards[2].card.upright}。
                      </>
                    )}
                    {selectedSpread === 'celtic' && (
                      <>
                        凯尔特十字揭示了您当前处境的多维度信息。
                        中心牌{drawnCards[0].card.name}代表核心问题，
                        而周围的牌则从不同角度揭示了影响因素和可能的发展方向。
                        综合来看，这是一个需要{drawnCards[0].card.upright}的时期。
                      </>
                    )}
                  </p>
                </CardContent>
              </Card>

              {/* 重新占卜 */}
              <div className="text-center">
                <Button
                  onClick={reset}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-12 py-6 text-lg"
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
