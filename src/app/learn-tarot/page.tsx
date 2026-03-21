'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Moon, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { majorArcana, minorArcana, wandsCards, cupsCards, swordsCards, pentaclesCards, suitNames, allTarotCards } from '@/lib/divination-data';

export default function LearnTarotPage() {
  const [selectedCard, setSelectedCard] = useState<typeof allTarotCards[0] | null>(null);
  const [selectedSuit, setSelectedSuit] = useState<'wands' | 'cups' | 'swords' | 'pentacles' | null>(null);

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
            <Moon className="w-10 h-10 text-[var(--theme-purple)] mr-3" />
            <h1 className="text-4xl font-bold text-[var(--theme-purple-text)]">塔罗知识</h1>
            <Moon className="w-10 h-10 text-[var(--theme-purple)] ml-3" />
          </div>
          <p className="text-[var(--theme-text-secondary)]">探索神秘塔罗牌的智慧与奥秘</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="basics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-[var(--theme-card)] border border-[var(--theme-purple-border)]">
              <TabsTrigger value="basics" className="data-[state=active]:bg-[var(--theme-purple-bg)] data-[state=active]:text-[var(--theme-purple)] text-[var(--theme-text-secondary)]">
                <BookOpen className="w-4 h-4 mr-2" />
                基础知识
              </TabsTrigger>
              <TabsTrigger value="major" className="data-[state=active]:bg-[var(--theme-purple-bg)] data-[state=active]:text-[var(--theme-purple)] text-[var(--theme-text-secondary)]">
                <Sparkles className="w-4 h-4 mr-2" />
                大阿卡纳
              </TabsTrigger>
              <TabsTrigger value="spread" className="data-[state=active]:bg-[var(--theme-purple-bg)] data-[state=active]:text-[var(--theme-purple)] text-[var(--theme-text-secondary)]">
                <Moon className="w-4 h-4 mr-2" />
                牌阵指南
              </TabsTrigger>
            </TabsList>

            {/* 基础知识 */}
            <TabsContent value="basics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-[var(--theme-card)] border-[var(--theme-purple-border)]">
                  <CardHeader>
                    <CardTitle className="text-xl text-[var(--theme-purple-text)]">塔罗牌简介</CardTitle>
                  </CardHeader>
                  <CardContent className="text-[var(--theme-text-secondary)] leading-relaxed">
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

                <Card className="bg-[var(--theme-card)] border-[var(--theme-purple-border)]">
                  <CardHeader>
                    <CardTitle className="text-xl text-[var(--theme-purple-text)]">大阿卡纳</CardTitle>
                  </CardHeader>
                  <CardContent className="text-[var(--theme-text-secondary)] leading-relaxed">
                    <p className="mb-4">
                      大阿卡纳共22张牌，编号从0到21，代表人生旅程中的重大主题和精神层面的启示。
                    </p>
                    <p>
                      从愚者（0）开始，到世界（21）结束，象征着灵魂的旅程和成长的各个阶段。
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[var(--theme-card)] border-[var(--theme-purple-border)]">
                  <CardHeader>
                    <CardTitle className="text-xl text-[var(--theme-purple-text)]">小阿卡纳</CardTitle>
                  </CardHeader>
                  <CardContent className="text-[var(--theme-text-secondary)] leading-relaxed">
                    <p className="mb-4">
                      小阿卡纳共56张牌，分为四个花色：权杖、圣杯、宝剑、星币。
                    </p>
                    <div className="space-y-2 text-sm">
                      <p><strong className="text-[var(--theme-purple)]">权杖：</strong>火元素，象征行动、热情</p>
                      <p><strong className="text-[var(--theme-purple)]">圣杯：</strong>水元素，象征情感、直觉</p>
                      <p><strong className="text-[var(--theme-purple)]">宝剑：</strong>风元素，象征思维、沟通</p>
                      <p><strong className="text-[var(--theme-purple)]">星币：</strong>土元素，象征物质、财富</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[var(--theme-card)] border-[var(--theme-purple-border)]">
                  <CardHeader>
                    <CardTitle className="text-xl text-[var(--theme-purple-text)]">正位与逆位</CardTitle>
                  </CardHeader>
                  <CardContent className="text-[var(--theme-text-secondary)] leading-relaxed">
                    <p className="mb-4">
                      塔罗牌在占卜时有两种状态：
                    </p>
                    <div className="space-y-2">
                      <p><strong className="text-[var(--theme-purple)]">正位：</strong>牌的基本含义和积极面向</p>
                      <p><strong className="text-[var(--theme-purple)]">逆位：</strong>相反或被阻碍的含义</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[var(--theme-card)] border-[var(--theme-purple-border)] md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-xl text-[var(--theme-purple-text)]">四大元素</CardTitle>
                  </CardHeader>
                  <CardContent className="text-[var(--theme-text-secondary)] leading-relaxed">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-500/30 to-red-500/30 border border-orange-500/30 flex items-center justify-center">
                          <span className="text-2xl">🔥</span>
                        </div>
                        <h4 className="font-bold text-[var(--theme-purple)] mb-1">火元素</h4>
                        <p className="text-sm text-[var(--theme-text-muted)]">权杖牌组 · 热情行动</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-500/30 flex items-center justify-center">
                          <span className="text-2xl">💧</span>
                        </div>
                        <h4 className="font-bold text-[var(--theme-purple)] mb-1">水元素</h4>
                        <p className="text-sm text-[var(--theme-text-muted)]">圣杯牌组 · 情感直觉</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-gray-400/30 to-gray-600/30 border border-gray-500/30 flex items-center justify-center">
                          <span className="text-2xl">⚔️</span>
                        </div>
                        <h4 className="font-bold text-[var(--theme-purple)] mb-1">风元素</h4>
                        <p className="text-sm text-[var(--theme-text-muted)]">宝剑牌组 · 思维沟通</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500/30 flex items-center justify-center">
                          <span className="text-2xl">🌍</span>
                        </div>
                        <h4 className="font-bold text-[var(--theme-purple)] mb-1">土元素</h4>
                        <p className="text-sm text-[var(--theme-text-muted)]">星币牌组 · 物质财富</p>
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
                    className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-purple)] hover:bg-[var(--theme-purple-bg)]"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回列表
                  </Button>

                  <Card className="bg-[var(--theme-card)] border-[var(--theme-purple-border)]">
                    <CardHeader className="text-center">
                      <div className="w-48 h-72 mx-auto mb-4 rounded-lg overflow-hidden relative bg-gradient-to-br from-[var(--theme-purple)]/30 to-purple-600/30 border border-[var(--theme-purple-border)]">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-6xl mb-2">{selectedCard.id}</div>
                            <div className="text-xl font-bold text-[var(--theme-purple)]">{selectedCard.name}</div>
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-3xl text-[var(--theme-purple-text)]">
                        {selectedCard.id}. {selectedCard.name}
                      </CardTitle>
                      <CardDescription className="text-[var(--theme-text-muted)]">
                        第{selectedCard.id}号牌 · 大阿卡纳
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <Link href="/tarot">
                          <Button className="bg-[var(--theme-purple)] hover:opacity-90 text-white px-8">
                            <Sparkles className="w-4 h-4 mr-2" />
                            开始塔罗占卜
                          </Button>
                        </Link>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[var(--theme-bg-secondary)] rounded-lg p-6 border border-[var(--theme-purple-border)]">
                          <h3 className="text-lg font-bold text-[var(--theme-purple-text)] mb-3">正位含义</h3>
                          <p className="text-[var(--theme-text-secondary)]">{selectedCard.upright}</p>
                        </div>
                        <div className="bg-[var(--theme-bg-secondary)] rounded-lg p-6 border border-[var(--theme-purple-border)]">
                          <h3 className="text-lg font-bold text-[var(--theme-purple-text)] mb-3">逆位含义</h3>
                          <p className="text-[var(--theme-text-secondary)]">{selectedCard.reversed}</p>
                        </div>
                      </div>

                      <div className="bg-[var(--theme-bg-secondary)] rounded-lg p-6 border border-[var(--theme-purple-border)]">
                        <h3 className="text-lg font-bold text-[var(--theme-purple-text)] mb-3">关键词</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedCard.keywords.map((keyword, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-[var(--theme-purple-bg)] border border-[var(--theme-purple-border)] rounded-full text-[var(--theme-purple)]"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-[var(--theme-bg-secondary)] rounded-lg p-6 border border-[var(--theme-purple-border)]">
                        <h3 className="text-lg font-bold text-[var(--theme-purple-text)] mb-3">牌意解读</h3>
                        <p className="text-[var(--theme-text-secondary)] leading-relaxed">{selectedCard.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {majorArcana.map((card) => (
                    <Card
                      key={card.id}
                      className="bg-[var(--theme-card)] border-[var(--theme-purple-border)] hover:border-[var(--theme-purple)] hover:bg-[var(--theme-card-hover)] cursor-pointer transition-all hover:scale-105"
                      onClick={() => setSelectedCard(card)}
                    >
                      <CardContent className="py-6 text-center">
                        <div className="w-full aspect-[3/4] mb-2 rounded overflow-hidden relative bg-gradient-to-br from-[var(--theme-purple)]/30 to-purple-600/30 border border-[var(--theme-purple-border)]">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-3xl font-bold text-[var(--theme-purple)]">{card.id}</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-[var(--theme-purple-text)]">{card.name}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* 牌阵指南 */}
            <TabsContent value="spread">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-[var(--theme-card)] border-[var(--theme-purple-border)]">
                  <CardHeader>
                    <CardTitle className="text-xl text-[var(--theme-purple-text)]">单张牌占卜</CardTitle>
                    <CardDescription className="text-[var(--theme-text-muted)]">最简单的牌阵</CardDescription>
                  </CardHeader>
                  <CardContent className="text-[var(--theme-text-secondary)] leading-relaxed">
                    <div className="mb-4 flex justify-center">
                      <div className="w-24 h-36 rounded-lg bg-[var(--theme-purple-bg)] border-2 border-dashed border-[var(--theme-purple-border)] flex items-center justify-center">
                        <span className="text-[var(--theme-purple)] text-sm">单张牌</span>
                      </div>
                    </div>
                    <p className="mb-3">
                      适合日常指引或简单问题。一张牌就能给你明确的答案。
                    </p>
                    <p className="text-sm text-[var(--theme-text-muted)]">
                      适用：今日运势、简单决策、每日冥想
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[var(--theme-card)] border-[var(--theme-purple-border)]">
                  <CardHeader>
                    <CardTitle className="text-xl text-[var(--theme-purple-text)]">三张牌占卜</CardTitle>
                    <CardDescription className="text-[var(--theme-text-muted)]">时间线牌阵</CardDescription>
                  </CardHeader>
                  <CardContent className="text-[var(--theme-text-secondary)] leading-relaxed">
                    <div className="mb-4 flex justify-center gap-3">
                      <div className="w-20 h-32 rounded-lg bg-[var(--theme-purple-bg)] border-2 border-dashed border-[var(--theme-purple-border)] flex items-center justify-center">
                        <span className="text-[var(--theme-purple)] text-xs">过去</span>
                      </div>
                      <div className="w-20 h-32 rounded-lg bg-[var(--theme-purple-bg)] border-2 border-dashed border-[var(--theme-purple-border)] flex items-center justify-center">
                        <span className="text-[var(--theme-purple)] text-xs">现在</span>
                      </div>
                      <div className="w-20 h-32 rounded-lg bg-[var(--theme-purple-bg)] border-2 border-dashed border-[var(--theme-purple-border)] flex items-center justify-center">
                        <span className="text-[var(--theme-purple)] text-xs">未来</span>
                      </div>
                    </div>
                    <p className="mb-3">
                      最常用的牌阵，展示事物的时间发展脉络。
                    </p>
                    <p className="text-sm text-[var(--theme-text-muted)]">
                      适用：事情发展、关系演变、决策分析
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[var(--theme-card)] border-[var(--theme-purple-border)] md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-xl text-[var(--theme-purple-text)]">占卜注意事项</CardTitle>
                  </CardHeader>
                  <CardContent className="text-[var(--theme-text-secondary)] leading-relaxed">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="text-[var(--theme-purple)]">✨</span>
                          <p>占卜前保持内心平静，专注于问题。</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[var(--theme-purple)]">✨</span>
                          <p>同一问题不要重复占卜，建议间隔一个月。</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[var(--theme-purple)]">✨</span>
                          <p>塔罗牌是指引而非命运，选择权在你。</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="text-[var(--theme-purple)]">✨</span>
                          <p>问题要具体明确，以开放式问题为佳。</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[var(--theme-purple)]">✨</span>
                          <p>尊重塔罗牌的智慧，用开放心态接受指引。</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[var(--theme-purple)]">✨</span>
                          <p>占卜结果仅供参考，理性对待。</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* 实践入口 */}
          <div className="mt-12 text-center">
            <Link href="/tarot">
              <Button className="bg-[var(--theme-purple)] hover:opacity-90 text-white px-8 py-6 text-lg">
                <Sparkles className="w-5 h-5 mr-2" />
                开始塔罗占卜
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
