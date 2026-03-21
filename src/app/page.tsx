'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { UserMenu } from '@/components/auth/UserMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { OAuthHandler } from '@/components/auth/OAuthHandler';
import { Disclaimer } from '@/components/Disclaimer';
import { 
  BookOpen, Moon, PenTool, Star, Wand2, 
  Calendar, Heart, Sparkles, ArrowRight, ChevronRight,
  BookMarked, FileText, Layers, Zap, Compass
} from 'lucide-react';

export default function Home() {
  // 学习资源
  const learningResources = [
    {
      title: '古籍阅读',
      description: '周易正义等经典注疏，原文对照',
      icon: <BookMarked className="w-5 h-5" />,
      href: '/books',
      highlight: true,
    },
    {
      title: '六十四卦详解',
      description: '卦辞、爻辞、象传图解',
      icon: <Layers className="w-5 h-5" />,
      href: '/learn',
      highlight: false,
    },
    {
      title: '科普词典',
      description: '术语百科快速查询',
      icon: <FileText className="w-5 h-5" />,
      href: '/glossary',
      highlight: false,
    },
    {
      title: '梅花易数',
      description: '以数明理，万物皆卦',
      icon: <Star className="w-5 h-5" />,
      href: '/plum-blossom',
      highlight: false,
    },
  ];

  // 占卜工具
  const tools = [
    { title: '周易起卦', description: '古法演卦', icon: <BookOpen className="w-5 h-5" />, href: '/iching' },
    { title: '奇门遁甲', description: '帝王之学', icon: <Compass className="w-5 h-5" />, href: '/qimen' },
    { title: '测字', description: '一字断事', icon: <PenTool className="w-5 h-5" />, href: '/char-divination' },
    { title: '观音灵签', description: '求签问卦', icon: <Wand2 className="w-5 h-5" />, href: '/fortune-stick' },
    { title: '生辰八字', description: '命盘推算', icon: <Calendar className="w-5 h-5" />, href: '/bazi' },
    { title: '姻缘匹配', description: '缘分测算', icon: <Heart className="w-5 h-5" />, href: '/match' },
    { title: '周公解梦', description: '梦境解析', icon: <Sparkles className="w-5 h-5" />, href: '/dream' },
    { title: '每日运势', description: '今日宜忌', icon: <Zap className="w-5 h-5" />, href: '/daily-fortune' },
  ];

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] transition-colors">
      {/* OAuth 登录成功处理 */}
      <Suspense fallback={null}>
        <OAuthHandler />
      </Suspense>

      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* 顶部光晕 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-amber-900/20 via-transparent to-transparent rounded-full blur-3xl dark:from-amber-900/20" />
      </div>

      {/* 主内容 */}
      <div className="relative z-10">
        {/* 顶部导航栏 */}
        <header className="sticky top-0 z-50 bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--theme-border)]">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-2 border-[var(--theme-gold)]/50 group-hover:border-[var(--theme-gold)] transition-colors" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--theme-gold)] group-hover:opacity-80 transition-opacity" />
              </div>
              <span className="text-xl font-bold text-[var(--theme-gold)] group-hover:opacity-80 transition-opacity">
                乾坤星路
              </span>
            </Link>

            {/* 导航链接 */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-[var(--theme-gold)] hover:opacity-80 transition-opacity">
                首页
              </Link>
              <Link href="/learn" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-gold)] transition-colors">
                易经学院
              </Link>
              <Link href="/learn-tarot" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-gold)] transition-colors">
                塔罗秘境
              </Link>
              <Link href="/daily-fortune" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-gold)] transition-colors">
                每日一占
              </Link>
            </nav>

            {/* 用户菜单 */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link 
                href="/iching" 
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--theme-gold-bg)] border border-[var(--theme-gold-border)] text-[var(--theme-gold)] hover:bg-[var(--theme-gold-bg)]/80 transition-all text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>开启探索</span>
              </Link>
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Hero 区域 */}
        <section className="container mx-auto px-4 pt-16 pb-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gold-gradient">东方智慧</span>
              <span className="text-[var(--theme-text)]"> · </span>
              <span className="text-gold-gradient">探寻命运法则</span>
            </h1>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--theme-gold)]/50" />
              <p className="text-lg text-[var(--theme-text-secondary)]">探索宇宙万物的演变逻辑</p>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--theme-gold)]/50" />
            </div>
            <p className="text-[var(--theme-text-secondary)] max-w-xl mx-auto mb-10 leading-relaxed">
              从周易六十四卦到塔罗七十八牌，系统化学习传统智慧。<br />
              不止于占卜预测，更在于洞察规律、顺势而为。
            </p>

            {/* 双入口 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/learn" className="group w-full sm:w-auto">
                <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-br from-[var(--theme-gold-bg)] to-amber-600/10 border border-[var(--theme-gold-border)] hover:border-[var(--theme-gold)]/50 transition-all">
                  <div className="text-3xl">☰</div>
                  <div className="text-left">
                    <div className="text-[var(--theme-gold)] font-medium">易经入门</div>
                    <div className="text-[var(--theme-text-muted)] text-sm">零基础学习</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[var(--theme-gold)] ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              <Link href="/tarot-realm" className="group w-full sm:w-auto">
                <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-br from-[var(--theme-purple-bg)] to-purple-600/10 border border-[var(--theme-purple-border)] hover:border-[var(--theme-purple)]/50 transition-all">
                  <div className="text-3xl">✧</div>
                  <div className="text-left">
                    <div className="text-[var(--theme-purple-text)] font-medium">塔罗秘境</div>
                    <div className="text-[var(--theme-text-muted)] text-sm">西方神秘学</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[var(--theme-purple)] ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>

          {/* 卦象装饰 */}
          <div className="mt-16 flex items-center justify-center">
            <div className="relative">
              <div className="text-6xl text-[var(--theme-gold)]/20 font-serif">谦</div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-[var(--theme-gold)]/40 tracking-widest">
                地山谦
              </div>
            </div>
          </div>
        </section>

        {/* 学习资源 */}
        <section className="container mx-auto px-4 pb-16">
          <div className="max-w-6xl mx-auto text-center mb-8">
            <h2 className="text-2xl font-bold text-[var(--theme-text)] mb-2">学习资源</h2>
            <p className="text-[var(--theme-text-secondary)] text-sm">系统研习周易智慧，从古籍到术语，循序渐进</p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {learningResources.map((item, index) => (
              <Link href={item.href} key={index} className="group">
                <Card className={`h-full transition-all cursor-pointer ${
                  item.highlight 
                    ? 'bg-[var(--theme-card)] border-2 border-[var(--theme-gold)]/60 hover:border-[var(--theme-gold)] shadow-lg shadow-[var(--theme-gold)]/10' 
                    : 'bg-[var(--theme-card)] border-[var(--theme-border)] hover:border-[var(--theme-gold)]/40'
                }`}>
                  <CardContent className="py-5 px-4">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${
                      item.highlight ? 'bg-[var(--theme-gold-bg)]' : 'bg-[var(--theme-gold-bg)] group-hover:bg-[var(--theme-gold-bg)]'
                    } transition-colors`}>
                      <div className="text-[var(--theme-gold)]">{item.icon}</div>
                    </div>
                    <h3 className={`font-medium mb-1 transition-colors ${
                      item.highlight ? 'text-[var(--theme-gold)]' : 'text-[var(--theme-text)] group-hover:text-[var(--theme-gold)]'
                    }`}>
                      {item.title}
                    </h3>
                    <p className="text-[var(--theme-text-muted)] text-xs">{item.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* 数字化起卦系统 */}
        <section className="container mx-auto px-4 pb-20">
          <div className="max-w-6xl mx-auto text-center mb-10">
            <h2 className="text-2xl font-bold text-[var(--theme-text)] mb-2">数字化起卦系统</h2>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--theme-gold)]/50" />
              <p className="text-[var(--theme-text-secondary)] text-sm">
                结合传统演卦方法，提供多种起卦工具
              </p>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--theme-gold)]/50" />
            </div>
            <p className="text-[var(--theme-text-secondary)] text-sm max-w-xl mx-auto">
              不止给出结论，更引导你研读爻辞，领悟背后哲学。
            </p>
          </div>

          {/* 工具卡片 */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {tools.map((tool, index) => (
                <Link href={tool.href} key={index}>
                  <Card className="group bg-[var(--theme-card)] border-[var(--theme-border)] hover:border-[var(--theme-gold)]/40 hover:bg-[var(--theme-card-hover)] transition-all cursor-pointer h-full">
                    <CardContent className="py-4 px-3 text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--theme-gold-bg)] mb-2 group-hover:bg-[var(--theme-gold-bg)] transition-colors">
                        <div className="text-[var(--theme-gold)]">{tool.icon}</div>
                      </div>
                      <h3 className="text-[var(--theme-text)] text-sm font-medium mb-0.5 group-hover:text-[var(--theme-gold)] transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-[var(--theme-text-muted)] text-xs">{tool.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link href="/iching">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--theme-gold)] text-black font-medium hover:opacity-90 transition-opacity">
                  <span>立即体验排盘</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* 页脚 */}
        <footer className="border-t border-[var(--theme-border)] bg-[var(--theme-bg)]">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-4 gap-8 mb-8">
                {/* Logo区 */}
                <div className="md:col-span-1">
                  <Link href="/" className="flex items-center gap-2 mb-4">
                    <div className="relative w-8 h-8">
                      <div className="absolute inset-0 rounded-full border-2 border-[var(--theme-gold)]/50" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--theme-gold)]" />
                    </div>
                    <span className="text-lg font-bold text-[var(--theme-gold)]">乾坤星路</span>
                  </Link>
                  <p className="text-[var(--theme-text-secondary)] text-sm leading-relaxed">
                    融合传统智慧与现代科技，打造专业的术数学习平台。
                  </p>
                  <p className="text-[var(--theme-gold)]/60 text-xs mt-2">
                    民俗文化科普 · 仅供学习参考
                  </p>
                </div>

                {/* 学习中心 */}
                <div>
                  <h4 className="text-[var(--theme-gold)] font-medium mb-4">学习中心</h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/learn" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-gold)] transition-colors">易经入门</Link></li>
                    <li><Link href="/books" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-gold)] transition-colors">六十四卦详解</Link></li>
                    <li><Link href="/glossary" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-gold)] transition-colors">古籍阅读</Link></li>
                    <li><Link href="/learn-tarot" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-gold)] transition-colors">塔罗牌意</Link></li>
                  </ul>
                </div>

                {/* 在线工具 */}
                <div>
                  <h4 className="text-[var(--theme-gold)] font-medium mb-4">在线工具</h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/iching" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-gold)] transition-colors">周易起卦</Link></li>
                    <li><Link href="/tarot" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-gold)] transition-colors">塔罗占卜</Link></li>
                    <li><Link href="/daily-fortune" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-gold)] transition-colors">每日运势</Link></li>
                    <li><Link href="/bazi" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-gold)] transition-colors">生辰八字</Link></li>
                  </ul>
                </div>

                {/* 关于 */}
                <div>
                  <h4 className="text-[var(--theme-gold)] font-medium mb-4">关于</h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/privacy" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-gold)] transition-colors">服务条款</Link></li>
                    <li><Link href="/privacy" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-gold)] transition-colors">隐私协议</Link></li>
                  </ul>
                </div>
              </div>

              {/* 版权 */}
              <div className="border-t border-[var(--theme-border)] pt-6 text-center">
                <p className="text-[var(--theme-text-muted)] text-sm">
                  © 2024 乾坤星路 · 传承东方智慧
                </p>
              </div>
            </div>
          </div>

          {/* 免责声明 */}
          <Disclaimer variant="footer" />
        </footer>
      </div>
    </div>
  );
}
