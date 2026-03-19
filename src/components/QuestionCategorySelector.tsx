'use client';

import { Briefcase, Heart, GraduationCap, Coins, HelpCircle, Sparkles } from 'lucide-react';

// 问题类型
export type QuestionCategory = 'career' | 'love' | 'study' | 'wealth' | 'other';

export interface QuestionCategoryOption {
  value: QuestionCategory;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// 问题类型选项
export const questionCategories: QuestionCategoryOption[] = [
  {
    value: 'career',
    label: '事业发展',
    description: '职场、工作、事业方向',
    icon: <Briefcase className="w-5 h-5" />,
    color: 'from-amber-500 to-orange-500',
  },
  {
    value: 'love',
    label: '感情姻缘',
    description: '恋爱、婚姻、感情走向',
    icon: <Heart className="w-5 h-5" />,
    color: 'from-rose-500 to-pink-500',
  },
  {
    value: 'study',
    label: '学业考试',
    description: '考试、升学、学业发展',
    icon: <GraduationCap className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    value: 'wealth',
    label: '财运走向',
    description: '财运、投资、经济状况',
    icon: <Coins className="w-5 h-5" />,
    color: 'from-yellow-500 to-amber-500',
  },
  {
    value: 'other',
    label: '其他困惑',
    description: '其他想问的事情',
    icon: <HelpCircle className="w-5 h-5" />,
    color: 'from-purple-500 to-violet-500',
  },
];

interface QuestionCategorySelectorProps {
  value: QuestionCategory | null;
  onChange: (category: QuestionCategory) => void;
  theme?: 'amber' | 'purple' | 'rose';
}

/**
 * 问题类型选择组件
 */
export function QuestionCategorySelector({ 
  value, 
  onChange,
  theme = 'amber'
}: QuestionCategorySelectorProps) {
  const themeColors = {
    amber: 'border-amber-400 bg-amber-500/20',
    purple: 'border-purple-400 bg-purple-500/20',
    rose: 'border-rose-400 bg-rose-500/20',
  };

  return (
    <div className="w-full max-w-lg mx-auto mb-6">
      <label className="block text-sm text-center mb-3">
        <Sparkles className="w-4 h-4 inline-block mr-1" />
        <span className="opacity-80">你想问什么？</span>
      </label>
      <div className="grid grid-cols-5 gap-2">
        {questionCategories.map((category) => (
          <button
            key={category.value}
            type="button"
            onClick={() => onChange(category.value)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
              value === category.value
                ? `${themeColors[theme]} border-2`
                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color} mb-1`}>
              <div className="text-white">{category.icon}</div>
            </div>
            <span className="text-xs font-medium">{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// 获取问题类型对应的提示文字
export function getQuestionPlaceholder(category: QuestionCategory | null): string {
  switch (category) {
    case 'career':
      return '例如：这份工作适合我吗？我应该跳槽吗？事业发展前景如何？';
    case 'love':
      return '例如：这段感情会有结果吗？我的正缘何时出现？他/她喜欢我吗？';
    case 'study':
      return '例如：这次考试能通过吗？升学运势如何？应该选择什么专业？';
    case 'wealth':
      return '例如：近期财运如何？这笔投资值得做吗？什么时候能好转？';
    case 'other':
      return '例如：这件事应该如何决定？未来的发展趋势如何？';
    default:
      return '例如：我的事业运势如何？这段感情会有结果吗？';
  }
}

// 获取问题类型的完整提示
export function getQuestionHint(category: QuestionCategory | null): string {
  switch (category) {
    case 'career':
      return '事业运势解读：关注工作发展、职场关系、事业方向';
    case 'love':
      return '感情姻缘解读：关注感情走向、婚姻运势、恋爱关系';
    case 'study':
      return '学业考试解读：关注考试运、学业发展、升学机会';
    case 'wealth':
      return '财运走向解读：关注财运起伏、投资理财、经济状况';
    case 'other':
      return '综合运势解读：根据您的问题进行全面分析';
    default:
      return '请先选择您想问的问题类型';
  }
}
