'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/auth/UserMenu';
import { ChevronRight, Moon, BookOpen, Layers, Wand2, ArrowLeft } from 'lucide-react';

export default function TarotRealmPage() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // 塔罗功能入口
  const tarotFeatures = [
    {
      id: 'divination',
      title: '塔罗占卜',
      description: '凯尔特十字牌阵，探寻命运指引',
      icon: <Wand2 className="w-6 h-6" />,
      href: '/tarot',
      color: 'purple',
      gradient: 'from-purple-500/20 to-indigo-500/20',
    },
    {
      id: 'learning',
      title: '塔罗牌意',
      description: '78张牌完整解读，正逆位详解',
      icon: <BookOpen className="w-6 h-6" />,
      href: '/learn-tarot',
      color: 'purple',
      gradient: 'from-purple-500/20 to-pink-500/20',
    },
  ];

  // 牌组分类
  const deckCategories = [
    { name: '大阿卡纳', count: 22, desc: '人生重大主题', href: '/learn-tarot?arcana=major' },
    { name: '权杖牌组', count: 14, desc: '行动与热情', href: '/learn-tarot?arcana=wands' },
    { name: '圣杯牌组', count: 14, desc: '情感与直觉', href: '/learn-tarot?arcana=cups' },
    { name: '宝剑牌组', count: 14, desc: '思想与沟通', href: '/learn-tarot?arcana=swords' },
    { name: '星币牌组', count: 14, desc: '物质与现实', href: '/learn-tarot?arcana=pentacles' },
  ];

  const handleFeatureClick = (href: string) => {
    router.push(href);
  };

  return (
    <div className="min-h-screen bg-[var(--theme-bg)]">
      {/* 导航栏 */}
      <header className="sticky top-0 z-50 border-b border-purple-500/20 bg-[var(--theme-bg)]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-purple)] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">返回首页</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[var(--theme-purple)]">
              <Moon className="w-5 h-5" />
              <span className="font-medium">塔罗秘境</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Hero 区域 */}
      <section className="container mx-auto px-4 pt-16 pb-12 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Moon className="w-8 h-8 text-[var(--theme-purple)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-[var(--theme-purple)]">塔罗秘境</span>
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--theme-purple)]/50" />
            <p className="text-lg text-[var(--theme-text-secondary)]">西方神秘学的智慧之门</p>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--theme-purple)]/50" />
          </div>
          <p className="text-[var(--theme-text-secondary)] max-w-lg mx-auto leading-relaxed">
            从22张大阿卡纳到56张小阿卡纳，探索塔罗牌背后的象征体系。<br />
            通过牌阵解读，洞察过去、现在与未来的能量流动。
          </p>
        </div>
      </section>

      {/* 功能入口 */}
      <section className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {tarotFeatures.map((feature) => (
              <div
                key={feature.id}
                onClick={() => handleFeatureClick(feature.href)}
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group cursor-pointer"
              >
                <Card className={`h-full bg-gradient-to-br ${feature.gradient} border-purple-500/30 hover:border-[var(--theme-purple)]/60 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10`}>
                  <CardContent className="py-8 px-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[var(--theme-purple-bg)] border border-purple-500/30 flex items-center justify-center group-hover:border-[var(--theme-purple)]/50 transition-colors">
                        <div className="text-[var(--theme-purple)]">{feature.icon}</div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-[var(--theme-purple)] mb-2 group-hover:text-[var(--theme-purple)]">
                          {feature.title}
                        </h3>
                        <p className="text-[var(--theme-text-secondary)] text-sm mb-4">
                          {feature.description}
                        </p>
                        <div className="flex items-center text-[var(--theme-purple)] text-sm font-medium">
                          <span>立即体验</span>
                          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 牌组分类 */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[var(--theme-text)] mb-2">探索牌组</h2>
            <p className="text-[var(--theme-text-secondary)] text-sm">78张牌的完整解读体系</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {deckCategories.map((category, index) => (
              <Link href={category.href} key={index} className="group">
                <Card className="bg-[var(--theme-card)] border-purple-500/20 hover:border-[var(--theme-purple)]/40 transition-all cursor-pointer text-center">
                  <CardContent className="py-5 px-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--theme-purple-bg)] mb-3 group-hover:bg-[var(--theme-purple)]/20 transition-colors">
                      <Layers className="w-5 h-5 text-[var(--theme-purple)]" />
                    </div>
                    <h3 className="font-medium text-[var(--theme-text)] mb-1 group-hover:text-[var(--theme-purple)] transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-[var(--theme-text-muted)] mb-1">{category.count}张</p>
                    <p className="text-xs text-[var(--theme-text-muted)]">{category.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="border-t border-purple-500/20 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-[var(--theme-text-muted)]">
            本网站内容仅供民俗文化科普与娱乐参考，不作为任何决策依据
          </p>
        </div>
      </footer>
    </div>
  );
}
