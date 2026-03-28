'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, BookOpen, Search, Loader2, ChevronRight,
  Sparkles, Atom, Compass, Plus
} from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';

interface GlossaryData {
  id: number;
  term: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  origin?: string;
  examples?: string[];
  relatedTerms?: string[];
}

interface GroupedTerms {
  [key: string]: GlossaryData[];
}

const CATEGORY_INFO = {
  iching: {
    name: '周易',
    icon: Sparkles,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
  },
  bazi: {
    name: '八字',
    icon: Atom,
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
  },
  general: {
    name: '通用',
    icon: Compass,
    color: 'from-gray-400 to-slate-400',
    bgColor: 'bg-gray-500/10',
    textColor: 'text-gray-300',
    borderColor: 'border-gray-500/30',
  },
};

// 拼音首字母分组
function getInitial(term: string): string {
  // 简单处理：取第一个字符
  const firstChar = term.charAt(0);
  
  // 如果是英文字母
  if (/[a-zA-Z]/.test(firstChar)) {
    return firstChar.toUpperCase();
  }
  
  // 中文按拼音首字母分组（简化版）
  // 这里使用 Unicode 范围粗略分组
  const code = firstChar.charCodeAt(0);
  
  // 常见姓氏和术语的拼音首字母映射
  const pinyinMap: Record<string, string> = {
    '八': 'B', '白': 'B', '比': 'B', '变': 'B', '本': 'B',
    '财': 'C', '辰': 'C', '丑': 'C', '初': 'C', '成': 'C', '冲': 'C', '纯': 'C',
    '大': 'D', '地': 'D', '定': 'D', '动': 'D', '兑': 'D',
    '二': 'E',
    '风': 'F', '伏': 'F',
    '卦': 'G', '官': 'G', '宫': 'G', '艮': 'G', '更': 'G',
    '合': 'H', '火': 'H', '化': 'H', '会': 'H', '亥': 'H',
    '甲': 'J', '金': 'J', '九': 'J', '吉': 'J', '极': 'J', '己': 'J', '景': 'J',
    '坎': 'K', '空': 'K', '坤': 'K',
    '离': 'L', '六': 'L', '龙': 'L',
    '木': 'M', '门': 'M', '命': 'M', '末': 'M',
    '年': 'N',
    '皮': 'P',
    '乾': 'Q', '气': 'Q', '七': 'Q', '奇': 'Q', '穷': 'Q',
    '人': 'R', '日': 'R', '壬': 'R', '刃': 'R',
    '三': 'S', '四': 'S', '十': 'S', '水': 'S', '生': 'S', '神': 'S', '时': 'S', '申': 'S', '巳': 'S', '死': 'S', '伤': 'S', '食': 'S',
    '天': 'T', '土': 'T', '同': 'T', '通': 'T',
    '五': 'W', '旺': 'W', '未': 'W', '戊': 'W', '武': 'W',
    '戌': 'X', '巽': 'X', '凶': 'X', '刑': 'X', '象': 'X', '心': 'X',
    '阳': 'Y', '阴': 'Y', '月': 'Y', '寅': 'Y', '乙': 'Y', '印': 'Y', '应': 'Y', '酉': 'Y',
    '震': 'Z', '支': 'Z', '子': 'Z', '中': 'Z', '周': 'Z', '值': 'Z', '朱': 'Z', '专': 'Z',
  };
  
  if (pinyinMap[firstChar]) {
    return pinyinMap[firstChar];
  }
  
  // 默认按 Unicode 分组
  if (code >= 0x4E00 && code <= 0x4FFF) return 'A-E';
  if (code >= 0x5000 && code <= 0x5FFF) return 'F-J';
  if (code >= 0x6000 && code <= 0x6FFF) return 'K-O';
  if (code >= 0x7000 && code <= 0x7FFF) return 'P-T';
  if (code >= 0x8000 && code <= 0x9FFF) return 'U-Z';
  
  return '#';
}

export default function GlossaryPage() {
  const [allTerms, setAllTerms] = useState<GlossaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'category' | 'alpha'>('alpha');

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const response = await fetch('/api/glossary');
      const data = await response.json();
      setAllTerms(data || []);
    } catch (error) {
      console.error('获取词条失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (category: string) => {
    return CATEGORY_INFO[category as keyof typeof CATEGORY_INFO] || CATEGORY_INFO.general;
  };

  // 过滤词条
  const filteredTerms = allTerms.filter(t => {
    if (selectedCategory && t.category !== selectedCategory) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        t.term.toLowerCase().includes(term) ||
        t.shortDesc.toLowerCase().includes(term) ||
        t.fullDesc.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // 按首字母分组
  const groupedByAlpha: GroupedTerms = {};
  filteredTerms.forEach(term => {
    const initial = getInitial(term.term);
    if (!groupedByAlpha[initial]) {
      groupedByAlpha[initial] = [];
    }
    groupedByAlpha[initial].push(term);
  });

  // 按分类分组
  const groupedByCategory: GroupedTerms = {};
  filteredTerms.forEach(term => {
    const cat = term.category;
    if (!groupedByCategory[cat]) {
      groupedByCategory[cat] = [];
    }
    groupedByCategory[cat].push(term);
  });

  // 排序字母
  const sortedKeys = Object.keys(groupedByAlpha).sort((a, b) => {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a.localeCompare(b);
  });

  const categories = Object.entries(CATEGORY_INFO).map(([key, info]) => ({
    key,
    ...info,
    count: allTerms.filter(t => t.category === key).length,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
          <UserMenu />
        </div>

        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-12 h-12 text-purple-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">术语词典</h1>
          </div>
          <p className="text-white/60 mb-4">系统学习周易、八字等传统文化术语</p>
          
          {/* 贡献词条入口 */}
          <Link href="/glossary/contribute">
            <Button className="bg-gradient-to-r from-purple-500 to-amber-500 hover:from-purple-600 hover:to-amber-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              贡献词条
            </Button>
          </Link>
        </div>

        {/* 搜索栏 */}
        <div className="max-w-xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索术语..."
              className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
        </div>

        {/* 视图切换和分类筛选 */}
        <div className="flex justify-center items-center gap-4 mb-6 flex-wrap">
          {/* 视图切换 */}
          <div className="flex bg-white/10 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'alpha' ? 'default' : 'ghost'}
              className={viewMode === 'alpha' 
                ? 'bg-purple-500 text-white' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
              }
              onClick={() => setViewMode('alpha')}
            >
              按字母
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'category' ? 'default' : 'ghost'}
              className={viewMode === 'category' 
                ? 'bg-purple-500 text-white' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
              }
              onClick={() => setViewMode('category')}
            >
              按分类
            </Button>
          </div>
          
          {/* 分类筛选 */}
          <div className="flex gap-2 flex-wrap justify-center">
            <Button
              size="sm"
              variant={selectedCategory === null ? 'default' : 'outline'}
              className={selectedCategory === null 
                ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
              }
              onClick={() => setSelectedCategory(null)}
            >
              全部 ({allTerms.length})
            </Button>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.key}
                  size="sm"
                  variant={selectedCategory === cat.key ? 'default' : 'outline'}
                  className={selectedCategory === cat.key 
                    ? `bg-gradient-to-r ${cat.color} hover:opacity-90 text-white` 
                    : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                  }
                  onClick={() => setSelectedCategory(cat.key)}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {cat.name} ({cat.count})
                </Button>
              );
            })}
          </div>
        </div>

        {/* 词条列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
          </div>
        ) : filteredTerms.length === 0 ? (
          <div className="text-center py-20 text-white/60">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>暂无匹配的词条</p>
          </div>
        ) : viewMode === 'alpha' ? (
          // 按字母分组显示
          <div className="max-w-4xl mx-auto space-y-6">
            {sortedKeys.map((letter) => (
              <div key={letter} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                {/* 字母标题 */}
                <div className="bg-white/10 px-4 py-2 flex items-center">
                  <span className="text-xl font-bold text-purple-400 w-8">{letter}</span>
                  <span className="text-sm text-white/50 ml-2">
                    {groupedByAlpha[letter].length} 个词条
                  </span>
                </div>
                
                {/* 词条列表 */}
                <div className="divide-y divide-white/10">
                  {groupedByAlpha[letter].map((term) => {
                    const catInfo = getCategoryInfo(term.category);
                    return (
                      <Link
                        key={term.id}
                        href={`/glossary/${encodeURIComponent(term.term)}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <span className="text-lg font-medium text-white whitespace-nowrap">
                            {term.term}
                          </span>
                          <Badge className={`${catInfo.bgColor} ${catInfo.textColor} text-xs`}>
                            {catInfo.name}
                          </Badge>
                          <span className="text-white/50 truncate text-sm">
                            {term.shortDesc}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0 ml-2" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 按分类分组显示
          <div className="max-w-4xl mx-auto space-y-6">
            {Object.entries(groupedByCategory).map(([cat, terms]) => {
              const catInfo = getCategoryInfo(cat);
              const Icon = catInfo.icon;
              return (
                <div key={cat} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                  {/* 分类标题 */}
                  <div className={`${catInfo.bgColor} px-4 py-3 flex items-center`}>
                    <Icon className={`w-5 h-5 ${catInfo.textColor} mr-2`} />
                    <span className={`text-lg font-bold ${catInfo.textColor}`}>
                      {catInfo.name}
                    </span>
                    <span className="text-sm text-white/50 ml-2">
                      {terms.length} 个词条
                    </span>
                  </div>
                  
                  {/* 词条列表 */}
                  <div className="divide-y divide-white/10">
                    {terms.sort((a, b) => a.term.localeCompare(b.term)).map((term) => (
                      <Link
                        key={term.id}
                        href={`/glossary/${encodeURIComponent(term.term)}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <span className="text-lg font-medium text-white whitespace-nowrap">
                            {term.term}
                          </span>
                          <span className="text-white/50 truncate text-sm">
                            {term.shortDesc}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0 ml-2" />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
