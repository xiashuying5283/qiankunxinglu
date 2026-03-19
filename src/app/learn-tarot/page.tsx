'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Moon, BookOpen, Sparkles } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import { majorArcana, minorArcana, wandsCards, cupsCards, swordsCards, pentaclesCards, suitNames, allTarotCards } from '@/lib/divination-data';

export default function LearnTarotPage() {
  const [selectedCard, setSelectedCard] = useState<typeof allTarotCards[0] | null>(null);
  const [selectedSuit, setSelectedSuit] = useState<'wands' | 'cups' | 'swords' | 'pentacles' | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-900">
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
          <UserMenu />
        </div>

        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Moon className="w-10 h-10 text-purple-300 mr-3" />
            <h1 className="text-4xl font-bold text-purple-100">塔罗知识</h1>
            <Moon className="w-10 h-10 text-purple-300 ml-3" />
          </div>
          <p className="text-purple-200/80">探索神秘塔罗牌的智慧与奥秘</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="basics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/10 border border-purple-300/30">
              <TabsTrigger value="basics" className="data-[state=active]:bg-purple-600/30 text-purple-100">
                <BookOpen className="w-4 h-4 mr-2" />
                基础知识
              </TabsTrigger>
              <TabsTrigger value="major" className="data-[state=active]:bg-purple-600/30 text-purple-100">
                <Sparkles className="w-4 h-4 mr-2" />
                大阿卡纳
              </TabsTrigger>
              <TabsTrigger value="minor" className="data-[state=active]:bg-purple-600/30 text-purple-100">
                <Moon className="w-4 h-4 mr-2" />
                小阿卡纳
              </TabsTrigger>
              <TabsTrigger value="spread" className="data-[state=active]:bg-purple-600/30 text-purple-100">
                <Moon className="w-4 h-4 mr-2" />
                牌阵指南
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-purple-600/30 text-purple-100">
                <Sparkles className="w-4 h-4 mr-2" />
                全部78张
              </TabsTrigger>
            </TabsList>

            {/* 基础知识 */}
            <TabsContent value="basics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/10 backdrop-blur-md border-purple-300/30">
                  <CardHeader>
                    <CardTitle className="text-xl text-purple-100">塔罗牌简介</CardTitle>
                  </CardHeader>
                  <CardContent className="text-purple-200 leading-relaxed">
                    <p className="mb-4">
                      塔罗牌是一套古老的占卜工具，起源于15世纪的欧洲。
                      标准的塔罗牌共有78张，分为大阿卡纳（22张）和小阿卡纳（56张）两部分。
                    </p>
                    <p>
                      塔罗牌通过图像和符号传达深层的信息，帮助人们探索内心世界，
                      获得生活的指引和启示。
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-purple-300/30">
                  <CardHeader>
                    <CardTitle className="text-xl text-purple-100">大阿卡纳</CardTitle>
                  </CardHeader>
                  <CardContent className="text-purple-200 leading-relaxed">
                    <p className="mb-4">
                      大阿卡纳共22张牌，编号从0到21，代表人生旅程中的重大主题和精神层面的启示。
                    </p>
                    <p>
                      从愚者（0）开始，到世界（21）结束，象征着灵魂的旅程和成长的各个阶段。
                      每张牌都蕴含着深刻的人生哲理。
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-purple-300/30">
                  <CardHeader>
                    <CardTitle className="text-xl text-purple-100">小阿卡纳</CardTitle>
                  </CardHeader>
                  <CardContent className="text-purple-200 leading-relaxed">
                    <p className="mb-4">
                      小阿卡纳共56张牌，分为四个花色：权杖、圣杯、宝剑、星币，
                      每个花色14张牌（1-10加上4张宫廷牌）。
                    </p>
                    <div className="space-y-2 text-sm">
                      <p><strong className="text-purple-100">权杖：</strong>代表火元素，象征行动、热情、创意</p>
                      <p><strong className="text-purple-100">圣杯：</strong>代表水元素，象征情感、直觉、关系</p>
                      <p><strong className="text-purple-100">宝剑：</strong>代表风元素，象征思维、沟通、挑战</p>
                      <p><strong className="text-purple-100">星币：</strong>代表土元素，象征物质、财富、实际</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-purple-300/30">
                  <CardHeader>
                    <CardTitle className="text-xl text-purple-100">正位与逆位</CardTitle>
                  </CardHeader>
                  <CardContent className="text-purple-200 leading-relaxed">
                    <p className="mb-4">
                      塔罗牌在占卜时有两种状态：正位和逆位。
                    </p>
                    <div className="space-y-2">
                      <p>
                        <strong className="text-purple-100">正位：</strong>
                        牌面朝上，代表牌的基本含义和积极面向。
                      </p>
                      <p>
                        <strong className="text-purple-100">逆位：</strong>
                        牌面倒置，代表相反或被阻碍的含义，也可能表示内在或延迟的能量。
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-purple-300/30 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-xl text-purple-100">四大元素</CardTitle>
                  </CardHeader>
                  <CardContent className="text-purple-200 leading-relaxed">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                          <span className="text-2xl">🔥</span>
                        </div>
                        <h4 className="font-bold text-purple-100 mb-2">火元素</h4>
                        <p className="text-sm">权杖牌组</p>
                        <p className="text-xs text-purple-200/60 mt-1">热情、行动、创造力</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <span className="text-2xl">💧</span>
                        </div>
                        <h4 className="font-bold text-purple-100 mb-2">水元素</h4>
                        <p className="text-sm">圣杯牌组</p>
                        <p className="text-xs text-purple-200/60 mt-1">情感、直觉、潜意识</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                          <span className="text-2xl">⚔️</span>
                        </div>
                        <h4 className="font-bold text-purple-100 mb-2">风元素</h4>
                        <p className="text-sm">宝剑牌组</p>
                        <p className="text-xs text-purple-200/60 mt-1">思维、沟通、冲突</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                          <span className="text-2xl">🌍</span>
                        </div>
                        <h4 className="font-bold text-purple-100 mb-2">土元素</h4>
                        <p className="text-sm">星币牌组</p>
                        <p className="text-xs text-purple-200/60 mt-1">物质、财富、现实</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 大阿卡纳详解 */}
            <TabsContent value="major">
              {selectedCard ? (
                <div className="space-y-6">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedCard(null)}
                    className="text-purple-200 hover:text-purple-100 hover:bg-white/10"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回列表
                  </Button>

                  <Card className="bg-white/10 backdrop-blur-md border-purple-300/30">
                    <CardHeader className="text-center">
                      <div className="w-48 h-72 mx-auto mb-4 rounded-lg overflow-hidden relative bg-gradient-to-br from-purple-600 to-indigo-600">
                        {selectedCard.image ? (
                          <Image
                            src={selectedCard.image}
                            alt={selectedCard.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-6xl mb-2">{selectedCard.id}</div>
                              <div className="text-xl font-bold">{selectedCard.name}</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-3xl text-purple-100">
                        {selectedCard.id}. {selectedCard.name}
                      </CardTitle>
                      <CardDescription className="text-purple-200/60">
                        第{selectedCard.id}号牌 · 大阿卡纳
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-purple-900/40 rounded-lg p-6">
                          <h3 className="text-lg font-bold text-purple-100 mb-3">正位含义</h3>
                          <p className="text-purple-200">{selectedCard.upright}</p>
                        </div>
                        <div className="bg-purple-900/40 rounded-lg p-6">
                          <h3 className="text-lg font-bold text-purple-100 mb-3">逆位含义</h3>
                          <p className="text-purple-200">{selectedCard.reversed}</p>
                        </div>
                      </div>

                      <div className="bg-purple-900/40 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-purple-100 mb-3">关键词</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedCard.keywords.map((keyword, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-purple-600/30 rounded-full text-purple-200"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-purple-900/40 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-purple-100 mb-3">牌意解读</h3>
                        <p className="text-purple-200 leading-relaxed">{selectedCard.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {majorArcana.map((card) => (
                    <Card
                      key={card.id}
                      className="bg-white/10 backdrop-blur-md border-purple-300/30 hover:bg-white/20 cursor-pointer transition-all hover:scale-105"
                      onClick={() => setSelectedCard(card)}
                    >
                      <CardContent className="py-6 text-center">
                        <div className="w-full aspect-[3/4] mb-2 rounded overflow-hidden relative bg-gradient-to-br from-purple-600 to-indigo-600">
                          {card.image ? (
                            <Image
                              src={card.image}
                              alt={card.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-3xl font-bold">{card.id}</div>
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-medium text-purple-100">{card.name}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* 牌阵指南 */}
            <TabsContent value="spread">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/10 backdrop-blur-md border-purple-300/30">
                  <CardHeader>
                    <CardTitle className="text-xl text-purple-100">单张牌占卜</CardTitle>
                    <CardDescription className="text-purple-200/60">最简单的牌阵</CardDescription>
                  </CardHeader>
                  <CardContent className="text-purple-200 leading-relaxed">
                    <div className="mb-4 flex justify-center">
                      <div className="w-24 h-36 rounded-lg bg-purple-600/30 border-2 border-dashed border-purple-400/50 flex items-center justify-center">
                        <span className="text-purple-300 text-sm">单张牌</span>
                      </div>
                    </div>
                    <p className="mb-3">
                      适合日常指引或简单问题。一张牌就能给你明确的答案。
                    </p>
                    <p className="text-sm text-purple-200/60">
                      适用场景：今日运势、简单决策、每日冥想
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-purple-300/30">
                  <CardHeader>
                    <CardTitle className="text-xl text-purple-100">三张牌占卜</CardTitle>
                    <CardDescription className="text-purple-200/60">时间线牌阵</CardDescription>
                  </CardHeader>
                  <CardContent className="text-purple-200 leading-relaxed">
                    <div className="mb-4 flex justify-center gap-3">
                      <div className="w-20 h-32 rounded-lg bg-purple-600/30 border-2 border-dashed border-purple-400/50 flex items-center justify-center">
                        <span className="text-purple-300 text-xs">过去</span>
                      </div>
                      <div className="w-20 h-32 rounded-lg bg-purple-600/30 border-2 border-dashed border-purple-400/50 flex items-center justify-center">
                        <span className="text-purple-300 text-xs">现在</span>
                      </div>
                      <div className="w-20 h-32 rounded-lg bg-purple-600/30 border-2 border-dashed border-purple-400/50 flex items-center justify-center">
                        <span className="text-purple-300 text-xs">未来</span>
                      </div>
                    </div>
                    <p className="mb-3">
                      最常用的牌阵之一，展示事物的时间发展脉络。
                    </p>
                    <p className="text-sm text-purple-200/60">
                      适用场景：事情发展、关系演变、决策分析
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-purple-300/30">
                  <CardHeader>
                    <CardTitle className="text-xl text-purple-100">凯尔特十字</CardTitle>
                    <CardDescription className="text-purple-200/60">经典全能牌阵</CardDescription>
                  </CardHeader>
                  <CardContent className="text-purple-200 leading-relaxed">
                    <div className="mb-4 flex justify-center">
                      <div className="grid grid-cols-4 gap-2">
                        <div></div>
                        <div className="w-12 h-16 rounded bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-xs text-purple-300">5</div>
                        <div className="w-12 h-16 rounded bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-xs text-purple-300">4</div>
                        <div className="w-12 h-16 rounded bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-xs text-purple-300">3</div>
                        <div className="w-12 h-16 rounded bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-xs text-purple-300">6</div>
                        <div className="w-12 h-16 rounded bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-xs text-purple-300">1+2</div>
                        <div className="w-12 h-16 rounded bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-xs text-purple-300">10</div>
                        <div className="w-12 h-16 rounded bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-xs text-purple-300">9</div>
                        <div className="w-12 h-16 rounded bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-xs text-purple-300">7</div>
                        <div></div>
                        <div></div>
                        <div className="w-12 h-16 rounded bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-xs text-purple-300">8</div>
                      </div>
                    </div>
                    <p className="mb-3">
                      共10张牌，全方位分析问题的现状、挑战、过去影响和未来趋势。
                    </p>
                    <p className="text-sm text-purple-200/60">
                      适用场景：复杂问题、深度分析、人生方向
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-purple-300/30">
                  <CardHeader>
                    <CardTitle className="text-xl text-purple-100">二选一牌阵</CardTitle>
                    <CardDescription className="text-purple-200/60">决策辅助牌阵</CardDescription>
                  </CardHeader>
                  <CardContent className="text-purple-200 leading-relaxed">
                    <div className="mb-4 flex justify-center gap-3">
                      <div className="space-y-2">
                        <div className="w-16 h-24 rounded bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-xs text-purple-300">选择A</div>
                        <div className="w-16 h-24 rounded bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-xs text-purple-300">结果</div>
                      </div>
                      <div className="w-16 h-24 rounded bg-purple-600/30 border-2 border-purple-400/50 flex items-center justify-center text-xs text-purple-300">现状</div>
                      <div className="space-y-2">
                        <div className="w-16 h-24 rounded bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-xs text-purple-300">选择B</div>
                        <div className="w-16 h-24 rounded bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-xs text-purple-300">结果</div>
                      </div>
                    </div>
                    <p className="mb-3">
                      帮助你在两个选项中做出选择，展示每个选择的结果。
                    </p>
                    <p className="text-sm text-purple-200/60">
                      适用场景：工作选择、感情抉择、方向决策
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-purple-300/30 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-xl text-purple-100">占卜注意事项</CardTitle>
                  </CardHeader>
                  <CardContent className="text-purple-200 leading-relaxed">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="text-purple-300">✨</span>
                          <p>占卜前请保持内心平静，专注于你想问的问题。</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-300">✨</span>
                          <p>同一问题不要重复占卜，建议间隔至少一个月。</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-300">✨</span>
                          <p>塔罗牌是指引而非命运的决定，最终选择权在你。</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="text-purple-300">✨</span>
                          <p>问题要具体明确，避免是非题，以开放式问题为佳。</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-300">✨</span>
                          <p>尊重塔罗牌的智慧，用开放的心态接受指引。</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-300">✨</span>
                          <p>占卜结果仅供参考，理性对待，相信自己的判断。</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 小阿卡纳 */}
            <TabsContent value="minor">
              <div className="space-y-6">
                {/* 牌组选择 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card 
                    className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-400/30 cursor-pointer hover:scale-105 transition-all"
                    onClick={() => setSelectedSuit('wands')}
                  >
                    <CardContent className="py-6 text-center">
                      <div className="text-4xl mb-2">🔥</div>
                      <div className="text-lg font-bold text-orange-100">权杖牌组</div>
                      <div className="text-sm text-orange-200/60">火元素 · 14张</div>
                    </CardContent>
                  </Card>
                  <Card 
                    className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/30 cursor-pointer hover:scale-105 transition-all"
                    onClick={() => setSelectedSuit('cups')}
                  >
                    <CardContent className="py-6 text-center">
                      <div className="text-4xl mb-2">💧</div>
                      <div className="text-lg font-bold text-blue-100">圣杯牌组</div>
                      <div className="text-sm text-blue-200/60">水元素 · 14张</div>
                    </CardContent>
                  </Card>
                  <Card 
                    className="bg-gradient-to-br from-gray-400/20 to-gray-600/20 border-gray-400/30 cursor-pointer hover:scale-105 transition-all"
                    onClick={() => setSelectedSuit('swords')}
                  >
                    <CardContent className="py-6 text-center">
                      <div className="text-4xl mb-2">⚔️</div>
                      <div className="text-lg font-bold text-gray-100">宝剑牌组</div>
                      <div className="text-sm text-gray-200/60">风元素 · 14张</div>
                    </CardContent>
                  </Card>
                  <Card 
                    className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/30 cursor-pointer hover:scale-105 transition-all"
                    onClick={() => setSelectedSuit('pentacles')}
                  >
                    <CardContent className="py-6 text-center">
                      <div className="text-4xl mb-2">🌍</div>
                      <div className="text-lg font-bold text-green-100">星币牌组</div>
                      <div className="text-sm text-green-200/60">土元素 · 14张</div>
                    </CardContent>
                  </Card>
                </div>

                {/* 显示选中的牌组 */}
                {selectedSuit && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-purple-100">
                        {suitNames[selectedSuit].symbol} {suitNames[selectedSuit].name}牌组
                      </h3>
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedSuit(null)}
                        className="text-purple-200 hover:text-purple-100"
                      >
                        返回牌组选择
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                      {(selectedSuit === 'wands' ? wandsCards : 
                        selectedSuit === 'cups' ? cupsCards : 
                        selectedSuit === 'swords' ? swordsCards : pentaclesCards
                      ).map((card) => (
                        <Card
                          key={card.id}
                          className="bg-white/10 backdrop-blur-md border-purple-300/30 hover:bg-white/20 cursor-pointer transition-all hover:scale-105"
                          onClick={() => setSelectedCard(card)}
                        >
                          <CardContent className="py-4 text-center">
                            <div className="w-full aspect-[3/4] mb-2 rounded overflow-hidden relative bg-gradient-to-br from-purple-600 to-indigo-600">
                              {card.image ? (
                                <Image
                                  src={card.image}
                                  alt={card.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="text-2xl font-bold">{card.name}</div>
                                </div>
                              )}
                            </div>
                            <div className="text-xs font-medium text-purple-100 truncate">{card.name}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 全部78张牌 */}
            <TabsContent value="all">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-purple-100 mb-2">完整塔罗牌组 · 78张</h3>
                  <p className="text-purple-200/60">点击任意牌查看详细解读</p>
                </div>
                
                {/* 大阿卡纳 */}
                <div>
                  <h4 className="text-lg font-bold text-purple-200 mb-4">大阿卡纳 (22张)</h4>
                  <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-11 gap-2">
                    {majorArcana.map((card) => (
                      <Card
                        key={card.id}
                        className="bg-white/10 backdrop-blur-md border-purple-300/30 hover:bg-white/20 cursor-pointer transition-all hover:scale-105"
                        onClick={() => setSelectedCard(card)}
                      >
                        <CardContent className="py-2 text-center">
                          <div className="w-full aspect-[3/4] mb-1 rounded overflow-hidden relative bg-gradient-to-br from-purple-600 to-indigo-600">
                            {card.image ? (
                              <Image
                                src={card.image}
                                alt={card.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-xs">{card.id}</div>
                            )}
                          </div>
                          <div className="text-xs text-purple-100 truncate">{card.name}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* 小阿卡纳 */}
                <div>
                  <h4 className="text-lg font-bold text-purple-200 mb-4">小阿卡纳 (56张)</h4>
                  <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-14 gap-2">
                    {minorArcana.map((card) => (
                      <Card
                        key={card.id}
                        className="bg-white/10 backdrop-blur-md border-purple-300/30 hover:bg-white/20 cursor-pointer transition-all hover:scale-105"
                        onClick={() => setSelectedCard(card)}
                      >
                        <CardContent className="py-2 text-center">
                          <div className="w-full aspect-[3/4] mb-1 rounded overflow-hidden relative bg-gradient-to-br from-purple-600 to-indigo-600">
                            {card.image ? (
                              <Image
                                src={card.image}
                                alt={card.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-xs">{card.name}</div>
                            )}
                          </div>
                          <div className="text-xs text-purple-100 truncate">{card.name}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
