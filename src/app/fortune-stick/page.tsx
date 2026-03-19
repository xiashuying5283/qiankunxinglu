'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Scroll, ChevronDown, ChevronUp, BookOpen, Sparkles } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';

interface FortuneInterpretation {
  wealth: string;
  marriage: string;
  career: string;
  travel: string;
  health: string;
  lawsuit: string;
  study: string;
  lost: string;
}

interface FortuneStick {
  number: number;
  title: string;
  poem: string;
  meaning: string;
  level: string;
  story: string | null;
  interpretation: FortuneInterpretation;
}

export default function FortuneStickPage() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<FortuneStick | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    story: false,
    interpretation: false
  });
  const [shakeOffset, setShakeOffset] = useState(0);
  const [stickNumber, setStickNumber] = useState<number | null>(null);

  // 检查数据库是否已初始化
  useEffect(() => {
    const checkInit = async () => {
      try {
        const res = await fetch('/api/fortune-sticks/init');
        const data = await res.json();
        if (data.success && !data.initialized) {
          // 自动初始化
          await fetch('/api/fortune-sticks/init', { method: 'POST' });
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('检查初始化状态失败:', error);
        setIsInitialized(true); // 即使失败也允许继续
      }
    };
    checkInit();
  }, []);

  // 抽签动画
  const drawStick = async () => {
    setIsDrawing(true);
    setShowResult(false);
    setStickNumber(null);
    setExpandedSections({ story: false, interpretation: false });

    // 签筒摇晃动画
    let count = 0;
    const shakeInterval = setInterval(() => {
      setShakeOffset(Math.sin(count * 0.5) * 10);
      count++;
    }, 50);

    // 等待2秒动画
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    clearInterval(shakeInterval);
    setShakeOffset(0);

    try {
      // 从API随机获取一签
      const res = await fetch('/api/fortune-sticks?random=true');
      const data = await res.json();
      
      if (data.success && data.data) {
        // 显示签号
        setStickNumber(data.data.number);
        
        // 再等1秒显示结果
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setResult(data.data);
        setIsDrawing(false);
        setTimeout(() => setShowResult(true), 100);
      }
    } catch (error) {
      console.error('抽签失败:', error);
      setIsDrawing(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case '上上签': return 'text-red-400';
      case '上吉签': return 'text-orange-400';
      case '中吉签': return 'text-yellow-400';
      case '中平签': return 'text-green-400';
      case '下下签': return 'text-gray-400';
      default: return 'text-amber-400';
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case '上上签': return 'from-red-600 to-orange-600';
      case '上吉签': return 'from-orange-500 to-amber-500';
      case '中吉签': return 'from-yellow-500 to-green-500';
      case '中平签': return 'from-green-500 to-teal-500';
      case '下下签': return 'from-gray-500 to-slate-500';
      default: return 'from-amber-600 to-orange-600';
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-yellow-900">
      <div className="container mx-auto px-4 py-8">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-amber-200 hover:text-amber-100 hover:bg-white/10">
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
            <Scroll className="w-10 h-10 text-amber-300 mr-3" />
            <h1 className="text-4xl font-bold text-amber-100">观音灵签</h1>
            <Scroll className="w-10 h-10 text-amber-300 ml-3" />
          </div>
          <p className="text-amber-200/80">诚心祈愿，抽签问卦，观音菩萨指点迷津</p>
          <p className="text-amber-300/60 text-sm mt-2">共一百签，涵盖人生各事</p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* 抽签区域 */}
          {!result ? (
            <Card className="bg-white/10 backdrop-blur-md border-amber-300/30">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-amber-100">诚心祈愿</CardTitle>
                <CardDescription className="text-amber-200/60">
                  心中默念您想问的问题，点击下方按钮抽签
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12">
                {/* 签筒 */}
                <div 
                  className="relative mb-8 transition-transform duration-100"
                  style={{ transform: `translateX(${shakeOffset}px) rotate(${shakeOffset}deg)` }}
                >
                  <div className="w-32 h-52 bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-full border-4 border-amber-500 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
                    {/* 签筒纹理 */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-0 left-0 right-0 h-8 bg-amber-400/50"></div>
                      <div className="absolute bottom-8 left-0 right-0 h-8 bg-amber-900/50"></div>
                    </div>
                    
                    {/* 签条 */}
                    <div className="flex gap-1 mt-8">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-1.5 h-24 bg-gradient-to-t from-amber-200 to-amber-100 rounded-t transition-transform duration-300"
                          style={{ 
                            transform: isDrawing ? `translateY(-${Math.random() * 20 + 10}px)` : 'none',
                            transitionDelay: `${i * 100}ms`
                          }}
                        ></div>
                      ))}
                    </div>
                    
                    <div className="text-amber-200 text-sm mt-4 font-bold">签筒</div>
                  </div>
                  
                  {isDrawing && (
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                      <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
                    </div>
                  )}
                </div>

                {/* 抽签过程中的签号显示 */}
                {stickNumber && (
                  <div className="mb-6 text-center animate-bounce">
                    <div className="text-amber-300 text-lg">抽中第</div>
                    <div className="text-5xl font-bold text-amber-100">{stickNumber}</div>
                    <div className="text-amber-300 text-lg">签</div>
                  </div>
                )}

                <Button
                  onClick={drawStick}
                  disabled={isDrawing || !isInitialized}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-12 py-6 text-lg shadow-lg"
                >
                  {isDrawing ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      抽签中...
                    </>
                  ) : !isInitialized ? (
                    '正在准备...'
                  ) : (
                    '开始抽签'
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={`space-y-6 transition-all duration-500 ${showResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {/* 签文显示 */}
              <Card className="bg-white/10 backdrop-blur-md border-amber-300/30 overflow-hidden">
                {/* 签头 */}
                <div className={`bg-gradient-to-r ${getLevelBg(result.level)} py-6 text-center relative`}>
                  {/* 装饰 */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-2 left-4 text-6xl">❋</div>
                    <div className="absolute bottom-2 right-4 text-6xl">❋</div>
                  </div>
                  
                  <div className="text-amber-100/90 text-lg">观音灵签</div>
                  <div className="text-amber-200 text-4xl font-bold my-2">第 {result.number} 签</div>
                  <div className={`text-2xl font-bold ${getLevelColor(result.level)}`}>
                    {result.level}
                  </div>
                </div>

                <CardContent className="pt-6 space-y-6">
                  {/* 签题 */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-amber-100 flex items-center justify-center gap-2">
                      <BookOpen className="w-5 h-5 text-amber-400" />
                      {result.title}
                    </h3>
                  </div>

                  {/* 签诗 */}
                  <div className="bg-gradient-to-br from-amber-950/80 to-orange-950/60 rounded-xl p-6 text-center border border-amber-400/20 shadow-inner">
                    <h4 className="text-sm font-bold text-amber-400 mb-4 tracking-wider">签 诗</h4>
                    <p className="text-xl text-amber-100 leading-loose whitespace-pre-line font-medium">
                      {result.poem}
                    </p>
                  </div>

                  {/* 解签总论 */}
                  <div className="bg-amber-950/40 rounded-xl p-6 border border-amber-400/10">
                    <h4 className="text-sm font-bold text-amber-400 mb-3 tracking-wider">解 签</h4>
                    <p className="text-amber-100 leading-relaxed">{result.meaning}</p>
                  </div>

                  {/* 古人典故（可展开） */}
                  {result.story && (
                    <div className="bg-amber-950/30 rounded-xl overflow-hidden border border-amber-400/10">
                      <button
                        onClick={() => toggleSection('story')}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-amber-400/5 transition-colors"
                      >
                        <h4 className="text-sm font-bold text-amber-400 tracking-wider flex items-center gap-2">
                          <Scroll className="w-4 h-4" />
                          古人典故
                        </h4>
                        {expandedSections.story ? (
                          <ChevronUp className="w-4 h-4 text-amber-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-amber-400" />
                        )}
                      </button>
                      {expandedSections.story && (
                        <div className="px-4 pb-4">
                          <p className="text-amber-100/90 leading-relaxed text-sm">{result.story}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 分类解签（可展开） */}
                  <div className="bg-amber-950/30 rounded-xl overflow-hidden border border-amber-400/10">
                    <button
                      onClick={() => toggleSection('interpretation')}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-amber-400/5 transition-colors"
                    >
                      <h4 className="text-sm font-bold text-amber-400 tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        分类解签
                      </h4>
                      {expandedSections.interpretation ? (
                        <ChevronUp className="w-4 h-4 text-amber-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-amber-400" />
                      )}
                    </button>
                    {expandedSections.interpretation && (
                      <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                        {Object.entries(result.interpretation).map(([key, value]) => {
                          const labels: Record<string, string> = {
                            wealth: '求财',
                            marriage: '婚姻',
                            career: '事业',
                            travel: '出行',
                            health: '健康',
                            lawsuit: '官司',
                            study: '学业',
                            lost: '失物'
                          };
                          return (
                            <div key={key} className="bg-amber-900/30 rounded-lg p-3">
                              <div className="text-amber-400 text-xs font-bold mb-1">{labels[key]}</div>
                              <div className="text-amber-100/90 text-sm">{value}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 签等级说明 */}
                  <div className="bg-gradient-to-r from-amber-900/60 to-orange-900/60 rounded-xl p-5 text-center border border-amber-400/30">
                    <p className="text-amber-100">
                      此签为<strong className={`text-lg ${getLevelColor(result.level)}`}>{result.level}</strong>
                      {result.level.includes('上上') && '，大吉大利，万事如意。'}
                      {result.level.includes('上吉') && '，运势上佳，宜积极进取。'}
                      {result.level.includes('中吉') && '，运势平稳，需努力经营。'}
                      {result.level.includes('中平') && '，安分守己，静待时机。'}
                      {result.level.includes('下下') && '，宜守不宜进，谨慎行事。'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 重新抽签 */}
              <div className="text-center">
                <Button
                  onClick={() => setResult(null)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-12 py-6 text-lg shadow-lg"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  重新抽签
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
