'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, Moon, BookOpen, PenTool, Star, Compass, Heart, 
  Wand2, Sun, Calendar, Zap, ArrowRight,
  Users, Shield, Key
} from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import { OAuthHandler } from '@/components/auth/OAuthHandler';
import { Disclaimer } from '@/components/Disclaimer';

export default function Home() {
  // 高频核心功能 - 首屏C位
  const coreFeatures = [
    {
      title: '每日运势',
      subtitle: '今日运势速查',
      description: '掌握每日幸运指引，了解事业、感情、财运走向',
      icon: <Sun className="w-7 h-7" />,
      href: '/daily-fortune',
      color: 'from-sky-500 to-blue-500',
      badge: '推荐',
    },
    {
      title: '周易占卜',
      subtitle: '周易起卦',
      description: '解当下困惑，探知天机指引',
      icon: <BookOpen className="w-7 h-7" />,
      href: '/iching',
      color: 'from-amber-500 to-orange-500',
      badge: '经典',
    },
    {
      title: '塔罗占卜',
      subtitle: '塔罗抽牌',
      description: '探前路方向，揭示命运的奥秘',
      icon: <Moon className="w-7 h-7" />,
      href: '/tarot',
      color: 'from-purple-500 to-indigo-500',
      badge: '热门',
    },
    {
      title: '周公解梦',
      subtitle: '梦境解读',
      description: '解读梦中玄机，揭示潜意识密码',
      icon: <Moon className="w-7 h-7" />,
      href: '/dream',
      color: 'from-indigo-500 to-violet-500',
      badge: null,
    },
  ];

  // 其他占卜功能
  const otherFeatures = [
    {
      title: '奇门遁甲',
      description: '帝王之学，预测之巅',
      icon: <Compass className="w-6 h-6" />,
      href: '/qimen',
      color: 'from-amber-500 to-yellow-500',
    },
    {
      title: '测字算卦',
      description: '一字断事，解心中疑虑',
      icon: <PenTool className="w-6 h-6" />,
      href: '/char-divination',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      title: '梅花易数',
      description: '以数明理，揭示天机',
      icon: <Star className="w-6 h-6" />,
      href: '/plum-blossom',
      color: 'from-pink-500 to-rose-500',
    },
    {
      title: '观音灵签',
      description: '虔诚抽签，指点迷津',
      icon: <Wand2 className="w-6 h-6" />,
      href: '/fortune-stick',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      title: '生辰八字',
      description: '推算命盘与五行',
      icon: <Calendar className="w-6 h-6" />,
      href: '/bazi',
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: '姻缘匹配',
      description: '测算你们的缘分指数',
      icon: <Heart className="w-6 h-6" />,
      href: '/match',
      color: 'from-rose-500 to-red-500',
    },
  ];

  // 学习板块
  const learningFeatures = [
    {
      title: '科普词典',
      description: '周易八字术语详解，系统学习传统文化',
      icon: <BookOpen className="w-6 h-6" />,
      href: '/glossary',
      color: 'from-blue-500 to-cyan-500',
      badge: '新',
    },
    {
      title: '古籍阅读',
      description: '周易正义等经典典籍，原文注疏对照',
      icon: <BookOpen className="w-6 h-6" />,
      href: '/books',
      color: 'from-amber-500 to-yellow-500',
      badge: '新',
    },
    {
      title: '周易学习',
      description: '六十四卦详解，新手入门教程',
      icon: <Compass className="w-6 h-6" />,
      href: '/learn',
      color: 'from-green-500 to-emerald-500',
      badge: '新',
    },
    {
      title: '塔罗学习',
      description: '78张牌详解，牌阵使用指南',
      icon: <Moon className="w-6 h-6" />,
      href: '/learn-tarot',
      color: 'from-violet-500 to-purple-500',
      badge: '新',
    },
    {
      title: 'API 凭证',
      description: '管理 API 凭证，用于外部调用',
      icon: <Key className="w-6 h-6" />,
      href: '/api-credentials',
      color: 'from-slate-500 to-gray-500',
      badge: '开发者',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* OAuth 登录成功处理 */}
      <Suspense fallback={null}>
        <OAuthHandler />
      </Suspense>

      {/* 星空背景效果 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="stars"></div>
      </div>

      {/* 主内容 */}
      <div className="relative z-10">
        {/* 顶部导航栏 */}
        <div className="container mx-auto px-4 py-4 flex items-center justify-end">
          <UserMenu />
        </div>
        
        {/* Hero 区域 */}
        <div className="container mx-auto px-4 pt-8 pb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="占卜问卦" 
              className="w-14 h-14 mr-3 rounded-full shadow-lg shadow-purple-500/30"
            />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
              占卜问卦
            </h1>
          </div>
          <p className="text-lg md:text-xl text-purple-200 mb-3">探索古老智慧，指引人生方向</p>
          <p className="text-sm text-gray-400 max-w-xl mx-auto mb-6">
            融合周易六十四卦、塔罗牌、测字、梅花易数等传统智慧
          </p>
          
          {/* 新手引导 - 快速入口 */}
          <Link href="/daily-fortune">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-sky-500/20 to-blue-500/20 
              border border-sky-400/30 rounded-full px-6 py-3 cursor-pointer
              hover:from-sky-500/30 hover:to-blue-500/30 transition-all group">
              <Zap className="w-5 h-5 text-sky-300" />
              <span className="text-sky-100">新手首选：30秒速测今日运势</span>
              <ArrowRight className="w-4 h-4 text-sky-300 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* 高频核心功能 - 大卡片 */}
        <div className="container mx-auto px-4 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {coreFeatures.map((feature, index) => (
              <Link href={feature.href} key={index}>
                <Card className="group h-full bg-white/10 backdrop-blur-md border-white/20 
                  hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl 
                  cursor-pointer overflow-hidden">
                  {feature.badge && (
                    <div className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full
                      ${feature.badge === '推荐' ? 'bg-sky-500/80 text-white' : 
                        feature.badge === '热门' ? 'bg-rose-500/80 text-white' : 
                        'bg-amber-500/80 text-white'}`}>
                      {feature.badge}
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className={`inline-flex w-fit p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-3`}>
                      <div className="text-white">{feature.icon}</div>
                    </div>
                    <CardTitle className="text-lg text-white group-hover:text-amber-300 transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-purple-200 text-sm">
                      {feature.subtitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-400 text-xs mb-3">{feature.description}</p>
                    <Button 
                      size="sm"
                      className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 text-white`}
                    >
                      立即体验
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* 其他占卜功能 */}
        <div className="container mx-auto px-4 mb-12 max-w-6xl">
          <h2 className="text-lg font-medium text-gray-300 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-amber-400" />
            更多占卜
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {otherFeatures.map((feature, index) => (
              <Link href={feature.href} key={index}>
                <Card className="group bg-white/5 backdrop-blur-md border-white/10 
                  hover:bg-white/15 transition-all cursor-pointer">
                  <CardContent className="py-4 px-4">
                    <div className={`inline-flex w-fit p-2 rounded-lg bg-gradient-to-br ${feature.color} mb-2`}>
                      <div className="text-white w-5 h-5">{feature.icon}</div>
                    </div>
                    <h3 className="text-sm font-medium text-white group-hover:text-amber-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* 学习板块 */}
        <div className="container mx-auto px-4 mb-12 max-w-6xl">
          <h2 className="text-lg font-medium text-gray-300 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-emerald-400" />
            知识学习
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {learningFeatures.map((feature, index) => (
              <Link href={feature.href} key={index} className="block">
                <Card className="group h-full bg-white/5 backdrop-blur-md border-white/10 
                  hover:bg-white/15 transition-all cursor-pointer relative">
                  {feature.badge && (
                    <div className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-blue-500/80 text-white">
                      {feature.badge}
                    </div>
                  )}
                  <CardContent className="py-4 px-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`flex-shrink-0 p-2 rounded-lg bg-gradient-to-br ${feature.color}`}>
                        <div className="text-white w-5 h-5">{feature.icon}</div>
                      </div>
                      <h3 className="font-medium text-white group-hover:text-emerald-300 transition-colors">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 ml-11">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* 信任背书 */}
        <div className="container mx-auto px-4 mb-8">
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>隐私保护</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>基于传统典籍整理</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>民俗文化科普</span>
            </div>
          </div>
        </div>

        {/* 免责声明 - 页脚 */}
        <Disclaimer variant="footer" />
      </div>
    </div>
  );
}
