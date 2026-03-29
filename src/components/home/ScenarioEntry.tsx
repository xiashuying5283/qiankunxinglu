'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Heart, Briefcase, Coins, HelpCircle, 
  ChevronRight, Sparkles, Users, MessageSquareHeart
} from 'lucide-react';

// 场景化问题配置
const scenarios = [
  {
    category: '感情困惑',
    icon: <Heart className="w-5 h-5" />,
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-500/10 border-rose-500/30',
    questions: [
      { text: '正缘什么时候来？', href: '/tarot?question=love_timing&type=love', tool: '塔罗' },
      { text: '和前任能复合吗？', href: '/iching?question=reconcile&type=love', tool: '周易' },
      { text: '这段感情该继续吗？', href: '/iching?question=relationship_continue&type=love', tool: '周易' },
      { text: '他/她对我什么想法？', href: '/tarot?question=feelings&type=love', tool: '塔罗' },
    ],
  },
  {
    category: '事业迷茫',
    icon: <Briefcase className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    questions: [
      { text: '该不该跳槽？', href: '/iching?question=job_change&type=career', tool: '周易' },
      { text: '这个offer能接吗？', href: '/iching?question=offer&type=career', tool: '周易' },
      { text: '项目能成功吗？', href: '/iching?question=project&type=career', tool: '周易' },
      { text: '今年能升职加薪吗？', href: '/iching?question=promotion&type=career', tool: '周易' },
    ],
  },
  {
    category: '财运困惑',
    icon: <Coins className="w-5 h-5" />,
    color: 'from-amber-500 to-yellow-500',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    questions: [
      { text: '今年财运如何？', href: '/iching?question=wealth_year&type=wealth', tool: '周易' },
      { text: '这笔投资能做吗？', href: '/iching?question=investment&type=wealth', tool: '周易' },
      { text: '副业能赚钱吗？', href: '/iching?question=side_business&type=wealth', tool: '周易' },
    ],
  },
  {
    category: '其他疑问',
    icon: <HelpCircle className="w-5 h-5" />,
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-500/10 border-purple-500/30',
    questions: [
      { text: '考试能上岸吗？', href: '/iching?question=exam&type=other', tool: '周易' },
      { text: '出行顺利吗？', href: '/iching?question=travel&type=other', tool: '周易' },
      { text: '其他问题...', href: '/iching', tool: '周易' },
    ],
  },
];

export function ScenarioEntry() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 标题 */}
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          有困惑？选一个直接测
          <Sparkles className="w-5 h-5 text-amber-400" />
        </h2>
        <p className="text-gray-400 text-sm">常见问题，一键直达</p>
      </div>

      {/* 场景分类 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((scenario) => (
          <div
            key={scenario.category}
            className={`rounded-xl border transition-all duration-300 ${
              expandedCategory === scenario.category
                ? scenario.bgColor + ' shadow-lg'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            {/* 分类头部 */}
            <button
              onClick={() => setExpandedCategory(
                expandedCategory === scenario.category ? null : scenario.category
              )}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${scenario.color}`}>
                  <div className="text-white">{scenario.icon}</div>
                </div>
                <div>
                  <h3 className="font-medium text-white">{scenario.category}</h3>
                  <p className="text-xs text-gray-500">{scenario.questions.length} 个常见问题</p>
                </div>
              </div>
              <ChevronRight 
                className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                  expandedCategory === scenario.category ? 'rotate-90' : ''
                }`} 
              />
            </button>

            {/* 问题列表 */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                expandedCategory === scenario.category 
                  ? 'max-h-60 opacity-100' 
                  : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-4 space-y-2">
                {scenario.questions.map((q, idx) => (
                  <Link
                    key={idx}
                    href={q.href}
                    className="flex items-center justify-between p-3 rounded-lg 
                      bg-white/5 hover:bg-white/10 transition-all group"
                  >
                    <span className="text-gray-300 group-hover:text-white transition-colors">
                      {q.text}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white
                      ${q.tool === '塔罗' ? 'bg-purple-500/70' : 'bg-amber-500/70'}`}>
                      {q.tool}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 快捷入口 */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/iching"
          className="flex items-center gap-2 px-4 py-2 rounded-full 
            bg-amber-500/20 border border-amber-500/30 text-amber-300
            hover:bg-amber-500/30 transition-all text-sm"
        >
          <span>周易起卦</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
        <Link
          href="/tarot"
          className="flex items-center gap-2 px-4 py-2 rounded-full 
            bg-purple-500/20 border border-purple-500/30 text-purple-300
            hover:bg-purple-500/30 transition-all text-sm"
        >
          <span>塔罗占卜</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
        <Link
          href="/dream"
          className="flex items-center gap-2 px-4 py-2 rounded-full 
            bg-indigo-500/20 border border-indigo-500/30 text-indigo-300
            hover:bg-indigo-500/30 transition-all text-sm"
        >
          <MessageSquareHeart className="w-4 h-4" />
          <span>周公解梦</span>
        </Link>
      </div>
    </div>
  );
}
