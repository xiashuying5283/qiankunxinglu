'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Moon, BookOpen, PenTool, Star, Compass } from 'lucide-react';

export default function Home() {
  const features = [
    {
      title: '周易占卜',
      description: '运用传统周易六十四卦智慧，为您解答人生疑惑',
      icon: <BookOpen className="w-8 h-8" />,
      href: '/iching',
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: '塔罗占卜',
      description: '神秘塔罗牌为您指引方向，探索命运的奥秘',
      icon: <Moon className="w-8 h-8" />,
      href: '/tarot',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      title: '测字算卦',
      description: '一字一世界，通过文字笔画解读命运玄机',
      icon: <PenTool className="w-8 h-8" />,
      href: '/char-divination',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      title: '梅花易数',
      description: '以数明理，以象言事，梅花易数揭示天机',
      icon: <Star className="w-8 h-8" />,
      href: '/plum-blossom',
      color: 'from-pink-500 to-rose-500',
    },
    {
      title: '周易学习',
      description: '深入了解周易基础知识和六十四卦智慧',
      icon: <Compass className="w-8 h-8" />,
      href: '/learn',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 星空背景效果 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="stars"></div>
      </div>

      {/* 主内容 */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* 标题区域 */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-12 h-12 text-amber-400 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
              易经占卜
            </h1>
            <Sparkles className="w-12 h-12 text-amber-400 ml-3" />
          </div>
          <p className="text-xl text-purple-200 mb-4">探索古老智慧，指引人生方向</p>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            融合周易六十四卦、塔罗牌、测字、梅花易数等传统占卜智慧，为您提供全面的命理咨询服务
          </p>
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Link href={feature.href} key={index}>
              <Card className="group h-full bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
                <CardHeader>
                  <div className={`inline-flex w-fit p-3 rounded-lg bg-gradient-to-br ${feature.color} mb-4`}>
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-amber-300 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 text-white`}
                  >
                    开始占卜
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* 底部装饰 */}
        <div className="mt-16 text-center text-gray-400 text-sm">
          <p>基于传统易学智慧 · 仅供娱乐参考</p>
        </div>
      </div>

      <style jsx>{`
        .stars {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(2px 2px at 20px 30px, white, transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 90px 40px, white, transparent),
            radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 230px 80px, white, transparent),
            radial-gradient(2px 2px at 300px 150px, rgba(255,255,255,0.7), transparent);
          background-size: 350px 200px;
          animation: twinkle 5s ease-in-out infinite;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
