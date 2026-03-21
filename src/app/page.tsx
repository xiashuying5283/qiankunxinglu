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
  BookMarked, FileText, Layers, Zap, Compass, Scroll,
  GraduationCap, Library, Search
} from 'lucide-react';

export default function Home() {
  // 占卜工具
  const divinationTools = [
    { title: '周易起卦', desc: '古法演卦', icon: <BookOpen className="w-5 h-5" />, href: '/iching' },
    { title: '塔罗占卜', desc: '牌阵解读', icon: <Moon className="w-5 h-5" />, href: '/tarot' },
    { title: '观音灵签', desc: '求签问卦', icon: <Wand2 className="w-5 h-5" />, href: '/fortune-stick' },
    { title: '测字算卦', desc: '一字断事', icon: <PenTool className="w-5 h-5" />, href: '/char-divination' },
    { title: '周公解梦', desc: '梦境解析', icon: <Sparkles className="w-5 h-5" />, href: '/dream' },
    { title: '生辰八字', desc: '命盘推算', icon: <Calendar className="w-5 h-5" />, href: '/bazi' },
  ];

  // 学习资源
  const learningResources = [
    { title: '古籍阅读', desc: '经典注疏', icon: <BookMarked className="w-5 h-5" />, href: '/books', highlight: true },
    { title: '六十四卦', desc: '卦象详解', icon: <Layers className="w-5 h-5" />, href: '/learn' },
    { title: '塔罗牌意', desc: '78张解读', icon: <Moon className="w-5 h-5" />, href: '/learn-tarot' },
    { title: '术语词典', desc: '快速查询', icon: <Search className="w-5 h-5" />, href: '/glossary' },
    { title: '八字入门', desc: '命理基础', icon: <GraduationCap className="w-5 h-5" />, href: '/learn' },
    { title: '梅花易数', desc: '以数明理', icon: <Star className="w-5 h-5" />, href: '/plum-blossom' },
  ];

  // 更多工具
  const moreTools = [
    { title: '奇门遁甲', icon: <Compass className="w-4 h-4" />, href: '/qimen' },
    { title: '姻缘匹配', icon: <Heart className="w-4 h-4" />, href: '/match' },
    { title: '每日运势', icon: <Zap className="w-4 h-4" />, href: '/daily-fortune' },
  ];

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] transition-colors">
      {/* OAuth 登录成功处理 */}
      <Suspense fallback={null}>
        <OAuthHandler />
      </Suspense>

      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* 左侧金色光晕 */}
        <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-gradient-radial from-amber-500/10 via-transparent to-transparent rounded-full blur-3xl" />
        {/* 右侧青墨光晕 */}
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-radial from-emerald-500/8 via-transparent to-transparent rounded-full blur-3xl" />
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

            {/* 用户菜单 */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </header>

        {/* 双英雄区 - 核心改造 */}
        <section className="container mx-auto px-4 pt-12 pb-16">
          {/* 标题区 */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              <span className="text-[var(--theme-text)]">探索东方智慧</span>
              <span className="text-[var(--theme-gold)]"> · </span>
              <span className="text-gold-gradient">洞察命运奥秘</span>
            </h1>
            <p className="text-[var(--theme-text-secondary)] max-w-lg mx-auto">
              占卜问卦，求一指引；学习研习，探其原理
            </p>
          </div>

          {/* 双入口区域 */}
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              
              {/* 左侧：占卜问卦 */}
              <div className="group">
                <div className="relative overflow-hidden rounded-2xl border-2 border-[var(--theme-gold-border)] bg-gradient-to-br from-amber-950/30 via-[var(--theme-card)] to-[var(--theme-card)] p-6 md:p-8 h-full transition-all hover:border-[var(--theme-gold)]/60 hover:shadow-xl hover:shadow-amber-500/5">
                  {/* 装饰 - 星空点 */}
                  <div className="absolute top-4 right-4 flex gap-1">
                    <div className="w-1 h-1 bg-[var(--theme-gold)]/60 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-[var(--theme-gold)]/40 rounded-full"></div>
                    <div className="w-1 h-1 bg-[var(--theme-gold)]/30 rounded-full"></div>
                  </div>

                  {/* 区块标题 */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--theme-gold-bg)] border border-[var(--theme-gold-border)]">
                      <span className="text-2xl">🔮</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[var(--theme-gold)]">占卜问卦</h2>
                      <p className="text-sm text-[var(--theme-text-muted)]">迷茫时，求一指引</p>
                    </div>
                  </div>

                  {/* 工具网格 */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {divinationTools.map((tool, index) => (
                      <Link href={tool.href} key={index}>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--theme-bg-secondary)]/50 border border-[var(--theme-gold-border)]/30 hover:border-[var(--theme-gold)]/50 hover:bg-[var(--theme-gold-bg)]/30 transition-all group/item">
                          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[var(--theme-gold-bg)] flex items-center justify-center text-[var(--theme-gold)]">
                            {tool.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[var(--theme-text)] group-hover/item:text-[var(--theme-gold)] transition-colors truncate">
                              {tool.title}
                            </div>
                            <div className="text-xs text-[var(--theme-text-muted)] truncate">{tool.desc}</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* 底部入口 */}
                  <Link href="/iching" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[var(--theme-gold)] text-black font-medium hover:opacity-90 transition-opacity">
                    <Sparkles className="w-4 h-4" />
                    <span>开始占卜</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* 右侧：学习研习 */}
              <div className="group">
                <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 via-[var(--theme-card)] to-[var(--theme-card)] p-6 md:p-8 h-full transition-all hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5">
                  {/* 装饰 - 书卷纹 */}
                  <div className="absolute top-4 right-4 text-emerald-500/20">
                    <Library className="w-8 h-8" />
                  </div>

                  {/* 区块标题 */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-2xl">📖</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-emerald-400">学习研习</h2>
                      <p className="text-sm text-[var(--theme-text-muted)]">求知时，探其原理</p>
                    </div>
                  </div>

                  {/* 资源网格 */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {learningResources.map((item, index) => (
                      <Link href={item.href} key={index}>
                        <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all group/item ${
                          item.highlight 
                            ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/15'
                            : 'bg-[var(--theme-bg-secondary)]/50 border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-500/5'
                        }`}>
                          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            {item.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[var(--theme-text)] group-hover/item:text-emerald-400 transition-colors truncate">
                              {item.title}
                            </div>
                            <div className="text-xs text-[var(--theme-text-muted)] truncate">{item.desc}</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* 底部入口 */}
                  <Link href="/books" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500/80 text-white font-medium hover:bg-emerald-500 transition-colors">
                    <BookOpen className="w-4 h-4" />
                    <span>开始学习</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 快捷入口 - 每日运势等 */}
        <section className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {moreTools.map((tool, index) => (
                <Link href={tool.href} key={index}>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--theme-card)] border border-[var(--theme-border)] hover:border-[var(--theme-gold)]/40 hover:bg-[var(--theme-gold-bg)]/30 transition-all">
                    <div className="text-[var(--theme-gold)]">{tool.icon}</div>
                    <span className="text-sm text-[var(--theme-text)]">{tool.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 特色说明 */}
        <section className="container mx-auto px-4 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--theme-gold-bg)] border border-[var(--theme-gold-border)] mb-4">
                  <Scroll className="w-6 h-6 text-[var(--theme-gold)]" />
                </div>
                <h3 className="font-medium text-[var(--theme-text)] mb-2">经典传承</h3>
                <p className="text-sm text-[var(--theme-text-muted)] leading-relaxed">
                  周易正义、子平真诠等古籍注疏，原文对照
                </p>
              </div>
              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--theme-gold-bg)] border border-[var(--theme-gold-border)] mb-4">
                  <Sparkles className="w-6 h-6 text-[var(--theme-gold)]" />
                </div>
                <h3 className="font-medium text-[var(--theme-text)] mb-2">专业演算</h3>
                <p className="text-sm text-[var(--theme-text-muted)] leading-relaxed">
                  精确老黄历、节气计算，还原古法演卦
                </p>
              </div>
              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--theme-gold-bg)] border border-[var(--theme-gold-border)] mb-4">
                  <GraduationCap className="w-6 h-6 text-[var(--theme-gold)]" />
                </div>
                <h3 className="font-medium text-[var(--theme-text)] mb-2">系统学习</h3>
                <p className="text-sm text-[var(--theme-text-muted)] leading-relaxed">
                  从卦象到术语，循序渐进学习传统智慧
                </p>
              </div>
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

                {/* 占卜工具 */}
                <div>
                  <h4 className="text-[var(--theme-gold)] font-medium mb-4">占卜工具</h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/iching" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-gold)] transition-colors">周易起卦</Link></li>
                    <li><Link href="/tarot" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-gold)] transition-colors">塔罗占卜</Link></li>
                    <li><Link href="/fortune-stick" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-gold)] transition-colors">观音灵签</Link></li>
                    <li><Link href="/char-divination" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-gold)] transition-colors">测字算卦</Link></li>
                  </ul>
                </div>

                {/* 学习中心 */}
                <div>
                  <h4 className="text-emerald-400 font-medium mb-4">学习中心</h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/books" className="text-[var(--theme-text-secondary)] hover:text-emerald-400 transition-colors">古籍阅读</Link></li>
                    <li><Link href="/learn" className="text-[var(--theme-text-secondary)] hover:text-emerald-400 transition-colors">六十四卦详解</Link></li>
                    <li><Link href="/learn-tarot" className="text-[var(--theme-text-secondary)] hover:text-emerald-400 transition-colors">塔罗牌意</Link></li>
                    <li><Link href="/glossary" className="text-[var(--theme-text-secondary)] hover:text-emerald-400 transition-colors">术语词典</Link></li>
                  </ul>
                </div>

                {/* 关于 */}
                <div>
                  <h4 className="text-[var(--theme-text-secondary)] font-medium mb-4">关于</h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/privacy" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-gold)] transition-colors">服务条款</Link></li>
                    <li><Link href="/privacy" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-gold)] transition-colors">隐私协议</Link></li>
                    <li><Link href="/history" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-gold)] transition-colors">历史记录</Link></li>
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
