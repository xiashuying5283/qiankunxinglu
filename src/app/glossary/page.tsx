'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, BookOpen, Search, Loader2, ChevronRight,
  Sparkles, Atom, Compass, Plus, PenLine
} from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface GlossaryData {
  id: number;
  term: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  origin?: string;
  examples?: string[];
  relatedTerms?: string[];
  references?: Array<{
    title: string;
    author?: string;
    publisher?: string;
    year?: string;
  }>;
}

const CATEGORY_INFO = {
  iching: {
    name: '周易',
    icon: Sparkles,
    color: 'amber',
    description: '周易六十四卦、爻辞、象传等术语解释',
  },
  bazi: {
    name: '八字',
    icon: Atom,
    color: 'purple',
    description: '四柱八字、天干地支、十神等术语解释',
  },
  general: {
    name: '通用',
    icon: Compass,
    color: 'gray',
    description: '传统文化通用术语解释',
  },
};

export default function GlossaryPage() {
  const [allTerms, setAllTerms] = useState<GlossaryData[]>([]);
  const [filteredTerms, setFilteredTerms] = useState<GlossaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<GlossaryData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchTerms();
  }, []);

  useEffect(() => {
    filterTerms();
  }, [searchTerm, selectedCategory, allTerms]);

  const fetchTerms = async () => {
    try {
      const response = await fetch('/api/glossary');
      const data = await response.json();
      setAllTerms(data || []);
      setFilteredTerms(data || []);
    } catch (error) {
      console.error('获取词条失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTerms = () => {
    let result = allTerms;

    if (selectedCategory) {
      result = result.filter(t => t.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.term.toLowerCase().includes(term) ||
        t.shortDesc.toLowerCase().includes(term) ||
        t.fullDesc.toLowerCase().includes(term)
      );
    }

    setFilteredTerms(result);
  };

  const getCategoryInfo = (category: string) => {
    return CATEGORY_INFO[category as keyof typeof CATEGORY_INFO] || CATEGORY_INFO.general;
  };

  const handleTermClick = (term: GlossaryData) => {
    setSelectedTerm(term);
    setDialogOpen(true);
  };

  const categories = Object.entries(CATEGORY_INFO).map(([key, info]) => ({
    key,
    ...info,
    count: allTerms.filter(t => t.category === key).length,
  }));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-amber-500/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/50 group-hover:border-amber-400 transition-colors" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-500 group-hover:bg-amber-400 transition-colors" />
            </div>
            <span className="text-xl font-bold text-amber-100 group-hover:text-amber-50 transition-colors">
              乾坤星路
            </span>
          </Link>
          <UserMenu />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-12 h-12 text-amber-500 mr-3" />
            <h1 className="text-4xl font-bold text-amber-100">术语词典</h1>
          </div>
          <p className="text-gray-400 mb-4">系统学习周易、八字等传统文化术语</p>
          
          {/* 贡献词条入口 */}
          <Link href="/glossary/contribute">
            <Button className="bg-amber-500 hover:bg-amber-600 text-black">
              <Plus className="w-4 h-4 mr-2" />
              贡献词条
            </Button>
          </Link>
        </div>

        {/* 搜索栏 */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索术语..."
              className="pl-12 h-12 bg-[#1a1a1a] border-amber-500/20 text-white placeholder:text-gray-500 focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* 分类标签 */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            className={selectedCategory === null 
              ? 'bg-amber-500 hover:bg-amber-600 text-black' 
              : 'bg-transparent border-amber-500/30 text-gray-300 hover:bg-amber-500/10 hover:text-amber-200'
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
                variant={selectedCategory === cat.key ? 'default' : 'outline'}
                className={selectedCategory === cat.key 
                  ? `bg-amber-500 hover:bg-amber-600 text-black` 
                  : 'bg-transparent border-amber-500/30 text-gray-300 hover:bg-amber-500/10 hover:text-amber-200'
                }
                onClick={() => setSelectedCategory(cat.key)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {cat.name} ({cat.count})
              </Button>
            );
          })}
        </div>

        {/* 词条列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          </div>
        ) : filteredTerms.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>暂无词条数据</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {filteredTerms.map((term) => {
              const catInfo = getCategoryInfo(term.category);
              return (
                <Card 
                  key={term.id}
                  className="bg-[#1a1a1a]/50 border-amber-500/20 hover:border-amber-500/40 cursor-pointer hover:scale-[1.02] transition-all"
                  onClick={() => handleTermClick(term)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-amber-100">
                        {term.term}
                      </CardTitle>
                      <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs">
                        {catInfo.name}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm line-clamp-2">{term.shortDesc}</p>
                    <div className="flex items-center mt-3 text-gray-500 text-xs">
                      点击查看详情
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* 词条详情弹窗 */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#1a1a1a] border-amber-500/20 text-white">
            {selectedTerm && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 text-2xl text-amber-100">
                    <BookOpen className="w-6 h-6 text-amber-500" />
                    {selectedTerm.term}
                    <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {getCategoryInfo(selectedTerm.category).name}
                    </Badge>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* 简短解释 */}
                  <div className="text-xl font-medium text-amber-100">
                    {selectedTerm.shortDesc}
                  </div>

                  {/* 完整解释 */}
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedTerm.fullDesc}
                  </div>

                  {/* 出处 */}
                  {selectedTerm.origin && (
                    <div className="bg-[#0a0a0a] rounded-lg p-4">
                      <div className="text-sm font-medium text-amber-200 mb-2">出处</div>
                      <div className="italic text-gray-400">{selectedTerm.origin}</div>
                    </div>
                  )}

                  {/* 示例 */}
                  {selectedTerm.examples && selectedTerm.examples.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-amber-200 mb-3">示例</div>
                      <ul className="space-y-2">
                        {selectedTerm.examples.map((example, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            <span className="text-gray-400">{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 相关词条 */}
                  {selectedTerm.relatedTerms && selectedTerm.relatedTerms.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-amber-200 mb-3">相关词条</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedTerm.relatedTerms.map((related) => {
                          const relatedTerm = allTerms.find(t => t.term === related);
                          return (
                            <Badge 
                              key={related}
                              variant="outline"
                              className="cursor-pointer hover:bg-amber-500/10 border-amber-500/30 text-gray-300"
                              onClick={() => {
                                if (relatedTerm) {
                                  setSelectedTerm(relatedTerm);
                                }
                              }}
                            >
                              {related}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 参考文献 */}
                  {selectedTerm.references && selectedTerm.references.length > 0 && (
                    <div className="bg-[#0a0a0a] rounded-lg p-4">
                      <div className="text-sm font-medium text-amber-200 mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        参考文献
                      </div>
                      <ol className="list-decimal list-inside space-y-2">
                        {selectedTerm.references.map((ref, index) => (
                          <li key={index} className="text-sm text-gray-400">
                            <span className="font-medium text-amber-100">{ref.title}</span>
                            {ref.author && <span className="ml-1">— {ref.author}</span>}
                            {ref.publisher && (
                              <span className="text-xs ml-1 opacity-70">
                                ({ref.publisher}{ref.year ? `, ${ref.year}` : ''})
                              </span>
                            )}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* 学习入口 */}
                  <div className="pt-4 border-t border-amber-500/20 flex items-center justify-between">
                    <Link
                      href={`/learn?term=${encodeURIComponent(selectedTerm.term)}`}
                      className="text-sm text-amber-400 hover:underline flex items-center gap-1"
                    >
                      深入学习此概念
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/glossary/contribute?term=${encodeURIComponent(selectedTerm.term)}&type=edit`}
                      className="text-sm text-gray-500 hover:text-amber-400 flex items-center gap-1"
                    >
                      <PenLine className="w-4 h-4" />
                      完善此词条
                    </Link>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
