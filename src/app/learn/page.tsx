'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Compass, BookOpen, Scroll, ChevronDown, ChevronUp, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';

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

export default function LearnPage() {
  const [selectedHexagram, setSelectedHexagram] = useState<HexagramData | null>(null);
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

  // 选择卦象时重置展开状态
  const handleSelectHexagram = (hexagram: HexagramData) => {
    setSelectedHexagram(hexagram);
    setExpandedLines(new Set());
  };

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-md border-green-300/30">
          <CardContent className="py-12 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-green-300 animate-spin mb-4" />
            <p className="text-green-100">正在加载卦象数据...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-md border-green-300/30 max-w-md">
          <CardHeader>
            <CardTitle className="text-green-100">加载失败</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-green-200 mb-4">{error}</p>
            <Button onClick={loadData} className="bg-green-500 hover:bg-green-600 text-white">
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900">
      <div className="container mx-auto px-4 py-8">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-green-200 hover:text-green-100 hover:bg-white/10">
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
            <Compass className="w-10 h-10 text-green-300 mr-3" />
            <h1 className="text-4xl font-bold text-green-100">周易学习</h1>
            <Compass className="w-10 h-10 text-green-300 ml-3" />
          </div>
          <p className="text-green-200/80">探索周易智慧，领悟古代先贤的哲学思想</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="basics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/10 border border-green-300/30">
              <TabsTrigger value="basics" className="data-[state=active]:bg-green-600/30 text-green-100">
                <BookOpen className="w-4 h-4 mr-2" />
                基础知识
              </TabsTrigger>
              <TabsTrigger value="trigrams" className="data-[state=active]:bg-green-600/30 text-green-100">
                <Scroll className="w-4 h-4 mr-2" />
                八卦详解
              </TabsTrigger>
              <TabsTrigger value="hexagrams" className="data-[state=active]:bg-green-600/30 text-green-100">
                <Scroll className="w-4 h-4 mr-2" />
                六十四卦
              </TabsTrigger>
            </TabsList>

            {/* 基础知识 */}
            <TabsContent value="basics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/10 backdrop-blur-md border-green-300/30">
                  <CardHeader>
                    <CardTitle className="text-xl text-green-100">周易简介</CardTitle>
                  </CardHeader>
                  <CardContent className="text-green-200 leading-relaxed">
                    <p className="mb-4">
                      《周易》是中国古代最重要的经典之一，被誉为"群经之首，大道之源"。
                      它以阴阳二元论为基础，通过八卦和六十四卦的符号系统，
                      阐述宇宙万物的变化规律。
                    </p>
                    <p>
                      《周易》由《易经》和《易传》两部分组成。
                      《易经》包括六十四卦的卦形、卦名、卦辞和爻辞；
                      《易传》则是对《易经》的解释和阐发。
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-green-300/30">
                  <CardHeader>
                    <CardTitle className="text-xl text-green-100">阴阳学说</CardTitle>
                  </CardHeader>
                  <CardContent className="text-green-200 leading-relaxed">
                    <p className="mb-4">
                      阴阳是中国古代哲学的核心概念，代表宇宙中两种对立统一的力量。
                      阳代表刚强、主动、光明、向上；阴代表柔顺、被动、黑暗、向下。
                    </p>
                    <p>
                      在周易中，阳用"—"表示，称为阳爻；
                      阴用"--"表示，称为阴爻。
                      万物都可以用阴阳的变化来解释。
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-green-300/30">
                  <CardHeader>
                    <CardTitle className="text-xl text-green-100">八卦概念</CardTitle>
                  </CardHeader>
                  <CardContent className="text-green-200 leading-relaxed">
                    <p className="mb-4">
                      八卦是由三个爻组成的符号，代表八种基本的自然现象和属性。
                      它们分别是：乾（天）、坤（地）、震（雷）、巽（风）、
                      坎（水）、离（火）、艮（山）、兑（泽）。
                    </p>
                    <p>
                      每个卦都有其特定的含义和象征，可以代表方位、季节、
                      家庭关系、身体部位等多个层面。
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-green-300/30">
                  <CardHeader>
                    <CardTitle className="text-xl text-green-100">六十四卦</CardTitle>
                  </CardHeader>
                  <CardContent className="text-green-200 leading-relaxed">
                    <p className="mb-4">
                      六十四卦是由两个八卦重叠而成，共有六爻。
                      每一卦都代表一种特定的情境和变化过程，
                      包含卦辞（整体含义）和爻辞（各爻含义）。
                    </p>
                    <p>
                      六十四卦涵盖了宇宙人生的各种变化，
                      从自然现象到社会关系，从个人修养到国家治理，
                      无所不包。
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-green-300/30 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-xl text-green-100">五行生克</CardTitle>
                  </CardHeader>
                  <CardContent className="text-green-200 leading-relaxed">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-green-100 mb-2">五行相生</h4>
                        <p className="mb-2">木生火 · 火生土 · 土生金 · 金生水 · 水生木</p>
                        <p className="text-sm text-green-200/60">
                          相生关系代表促进、滋养、支持的作用
                        </p>
                      </div>
                      <div>
                        <h4 className="font-bold text-green-100 mb-2">五行相克</h4>
                        <p className="mb-2">木克土 · 土克水 · 水克火 · 火克金 · 金克木</p>
                        <p className="text-sm text-green-200/60">
                          相克关系代表制约、克制、平衡的作用
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 八卦详解 */}
            <TabsContent value="trigrams">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {trigrams.map((trigram, index) => (
                  <Card key={index} className="bg-white/10 backdrop-blur-md border-green-300/30">
                    <CardHeader className="text-center">
                      <div className="text-6xl mb-2">{trigram.symbol}</div>
                      <CardTitle className="text-2xl text-green-100">{trigram.name}卦</CardTitle>
                      <CardDescription className="text-green-200/60">
                        代表{trigram.nature}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="bg-green-950/60 rounded-lg p-3">
                          <p className="text-sm text-green-200/80">
                            <strong className="text-green-100">自然属性：</strong>
                            {trigram.nature}
                          </p>
                        </div>
                        <div className="bg-green-950/60 rounded-lg p-3">
                          <p className="text-sm text-green-200/80">
                            <strong className="text-green-100">德行特质：</strong>
                            {trigram.attribute}
                          </p>
                        </div>
                        <div className="bg-green-950/60 rounded-lg p-3">
                          <p className="text-sm text-green-200/80">
                            <strong className="text-green-100">卦象含义：</strong>
                            {getTrigramMeaning(trigram.name)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* 六十四卦 */}
            <TabsContent value="hexagrams">
              {selectedHexagram ? (
                <div className="space-y-6">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedHexagram(null);
                      setExpandedLines(new Set());
                    }}
                    className="text-green-200 hover:text-green-100 hover:bg-white/10"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回列表
                  </Button>

                  <Card className="bg-white/10 backdrop-blur-md border-green-300/30">
                    <CardHeader className="text-center">
                      <div className="text-8xl mb-4">{selectedHexagram.symbol}</div>
                      <CardTitle className="text-4xl text-green-100">
                        第{selectedHexagram.number}卦 · {selectedHexagram.name}卦
                      </CardTitle>
                      <CardDescription className="text-lg text-green-200/60">
                        {selectedHexagram.upperTrigram}上{selectedHexagram.lowerTrigram}下
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* 占卜此卦按钮 */}
                      <div className="text-center">
                        <Link href="/iching">
                          <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8">
                            <Sparkles className="w-4 h-4 mr-2" />
                            占卜此卦
                          </Button>
                        </Link>
                      </div>
                      
                      {/* 卦辞 */}
                      <div className="bg-green-950/60 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-green-100 mb-3">卦辞</h3>
                        <p className="text-green-100 text-lg leading-relaxed mb-3">
                          {selectedHexagram.judgement}
                        </p>
                        <div className="border-t border-green-600/30 pt-3">
                          <p className="text-green-200/80 text-sm leading-relaxed">
                            💡 <strong>白话解释：</strong>{selectedHexagram.judgementMeaning}
                          </p>
                        </div>
                      </div>

                      {/* 象辞 */}
                      <div className="bg-green-950/60 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-green-100 mb-3">象辞</h3>
                        <p className="text-green-100 text-lg leading-relaxed mb-3">
                          {selectedHexagram.image}
                        </p>
                        <div className="border-t border-green-600/30 pt-3">
                          <p className="text-green-200/80 text-sm leading-relaxed">
                            💡 <strong>白话解释：</strong>{selectedHexagram.imageMeaning}
                          </p>
                        </div>
                      </div>

                      {/* 爻辞 */}
                      <div className="bg-green-950/60 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-green-100">爻辞（点击查看白话注解）</h3>
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
                            className="text-green-200 hover:text-green-100"
                          >
                            {expandedLines.size === 6 ? '收起全部' : '展开全部'}
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {selectedHexagram.lines.map((line, index) => (
                            <div
                              key={index}
                              className="rounded-lg overflow-hidden transition-all bg-green-900/30 hover:bg-green-800/30"
                            >
                              <div
                                className="p-4 cursor-pointer flex items-start justify-between gap-4"
                                onClick={() => toggleLine(index)}
                              >
                                <div className="flex-1">
                                  <p className="text-green-100 font-medium">{line.text}</p>
                                </div>
                                <div className="flex items-center gap-2 text-green-300">
                                  <BookOpen className="w-4 h-4" />
                                  {expandedLines.has(index) ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                              {expandedLines.has(index) && (
                                <div className="px-4 pb-4 pt-0 border-t border-green-600/20">
                                  <div className="bg-green-900/40 rounded-lg p-4 mt-2">
                                    <p className="text-green-200/90 leading-relaxed">
                                      📖 <strong>白话注解：</strong>{line.meaning}
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
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  {hexagrams.map((hexagram) => (
                    <Card
                      key={hexagram.number}
                      className="bg-white/10 backdrop-blur-md border-green-300/30 hover:bg-white/20 cursor-pointer transition-all hover:scale-105"
                      onClick={() => handleSelectHexagram(hexagram)}
                    >
                      <CardContent className="py-6 text-center">
                        <div className="text-4xl mb-2">{hexagram.symbol}</div>
                        <div className="text-lg font-medium text-green-100">{hexagram.name}</div>
                        <div className="text-sm text-green-200/60">第{hexagram.number}卦</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* 实践入口区域 */}
          <div className="mt-12 max-w-4xl mx-auto">
            <Card className="bg-green-800/50 backdrop-blur-md border-green-400/50">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Sparkles className="w-6 h-6 text-yellow-400 mr-2" />
                  <CardTitle className="text-2xl text-white">学以致用，实践出真知</CardTitle>
                  <Sparkles className="w-6 h-6 text-yellow-400 ml-2" />
                </div>
                <CardDescription className="text-green-100">
                  理论结合实践，用周易智慧指导人生
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 周易占卜入口 */}
                  <Link href="/iching" className="block">
                    <div className="bg-green-700/40 hover:bg-green-600/50 rounded-lg p-6 transition-all hover:scale-105 cursor-pointer border border-green-400/40 hover:border-green-300/60">
                      <div className="text-center">
                        <div className="text-4xl mb-3">☯️</div>
                        <h3 className="text-lg font-bold text-white mb-2">周易占卜</h3>
                        <p className="text-sm text-green-100 mb-3">
                          传统揲蓍法起卦，AI 智能解卦
                        </p>
                        <div className="flex items-center justify-center text-green-200">
                          <span className="text-sm font-medium">开始占卜</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* 塔罗占卜入口 */}
                  <Link href="/tarot" className="block">
                    <div className="bg-green-700/40 hover:bg-green-600/50 rounded-lg p-6 transition-all hover:scale-105 cursor-pointer border border-green-400/40 hover:border-green-300/60">
                      <div className="text-center">
                        <div className="text-4xl mb-3">🎴</div>
                        <h3 className="text-lg font-bold text-white mb-2">塔罗占卜</h3>
                        <p className="text-sm text-green-100 mb-3">
                          西方神秘智慧，探索内心世界
                        </p>
                        <div className="flex items-center justify-center text-green-200">
                          <span className="text-sm font-medium">开始占卜</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* 每日运势入口 */}
                  <Link href="/daily-fortune" className="block">
                    <div className="bg-green-700/40 hover:bg-green-600/50 rounded-lg p-6 transition-all hover:scale-105 cursor-pointer border border-green-400/40 hover:border-green-300/60">
                      <div className="text-center">
                        <div className="text-4xl mb-3">🌟</div>
                        <h3 className="text-lg font-bold text-white mb-2">每日运势</h3>
                        <p className="text-sm text-green-100 mb-3">
                          今日宜忌，开运指南
                        </p>
                        <div className="flex items-center justify-center text-green-200">
                          <span className="text-sm font-medium">查看运势</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// 获取八卦含义
function getTrigramMeaning(name: string): string {
  const meanings: Record<string, string> = {
    '乾': '刚健进取，象征天、父、君、龙等阳性事物',
    '坤': '柔顺包容，象征地、母、臣、牛等阴性事物',
    '震': '动而奋发，象征雷、长男、龙等动态事物',
    '巽': '入而无孔不入，象征风、长女、木等渗透事物',
    '坎': '险而陷落，象征水、中男、豕等险陷事物',
    '离': '明而依附，象征火、中女、雉等光明事物',
    '艮': '止而静止，象征山、少男、狗等静止事物',
    '兑': '悦而喜悦，象征泽、少女、羊等喜悦事物',
  };
  return meanings[name] || '';
}
