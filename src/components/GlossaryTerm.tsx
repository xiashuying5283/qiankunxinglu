'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface GlossaryTermProps {
  term: string;
  children: React.ReactNode;
  category?: 'iching' | 'bazi' | 'general';
}

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

// 科普词条缓存
const glossaryCache = new Map<string, GlossaryData>();

export function GlossaryTerm({ term, children, category }: GlossaryTermProps) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<GlossaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (open && term) {
      fetchTerm();
    }
  }, [open, term]);

  const fetchTerm = async () => {
    // 检查缓存
    if (glossaryCache.has(term)) {
      setData(glossaryCache.get(term)!);
      return;
    }

    setLoading(true);
    setNotFound(false);
    
    try {
      const response = await fetch(`/api/glossary?term=${encodeURIComponent(term)}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
        glossaryCache.set(term, result);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('获取词条失败:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      iching: '周易',
      bazi: '八字',
      general: '通用',
    };
    return labels[cat] || cat;
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      iching: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      bazi: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      general: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    };
    return colors[cat] || colors.general;
  };

  return (
    <>
      <span
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="inline-flex items-center cursor-pointer text-primary underline decoration-dotted underline-offset-2 hover:decoration-solid"
        title={`点击查看"${term}"的解释`}
      >
        {children}
        <BookOpen className="w-3 h-3 ml-0.5 opacity-50" />
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {term}
              {data && (
                <Badge className={getCategoryColor(data.category)}>
                  {getCategoryLabel(data.category)}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {notFound && (
            <div className="text-center py-8 text-muted-foreground">
              <p>暂无该词条的解释</p>
              <p className="text-sm mt-2">我们正在持续完善词条库</p>
            </div>
          )}

          {data && (
            <div className="space-y-4">
              {/* 简短解释 */}
              <div className="text-lg font-medium">{data.shortDesc}</div>

              {/* 完整解释 */}
              <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {data.fullDesc}
              </div>

              {/* 出处 */}
              {data.origin && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-sm font-medium text-muted-foreground mb-1">出处</div>
                  <div className="text-sm italic">{data.origin}</div>
                </div>
              )}

              {/* 示例 */}
              {data.examples && data.examples.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">示例</div>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    {data.examples.map((example, index) => (
                      <li key={index}>{example}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 相关词条 */}
              {data.relatedTerms && data.relatedTerms.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">相关词条</div>
                  <div className="flex flex-wrap gap-2">
                    {data.relatedTerms.map((related) => (
                      <GlossaryTerm key={related} term={related}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                          {related}
                        </Badge>
                      </GlossaryTerm>
                    ))}
                  </div>
                </div>
              )}

              {/* 学习入口 */}
              <div className="pt-4 border-t">
                <Link
                  href={`/learn?term=${encodeURIComponent(term)}`}
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  深入学习此概念
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// 批量获取词条的 Hook
export function useGlossaryTerms(terms: string[]) {
  const [data, setData] = useState<Record<string, GlossaryData>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (terms.length === 0) return;

    const uncachedTerms = terms.filter(t => !glossaryCache.has(t));
    if (uncachedTerms.length === 0) {
      // 全部从缓存获取
      const cached: Record<string, GlossaryData> = {};
      terms.forEach(t => {
        const cachedData = glossaryCache.get(t);
        if (cachedData) cached[t] = cachedData;
      });
      setData(cached);
      return;
    }

    const fetchTerms = async () => {
      setLoading(true);
      try {
        // 批量请求
        const promises = uncachedTerms.map(term =>
          fetch(`/api/glossary?term=${encodeURIComponent(term)}`).then(r => r.json())
        );
        const results = await Promise.all(promises);
        
        const newData: Record<string, GlossaryData> = { ...data };
        results.forEach((result, index) => {
          if (result && !result.error) {
            newData[uncachedTerms[index]] = result;
            glossaryCache.set(uncachedTerms[index], result);
          }
        });
        setData(newData);
      } catch (error) {
        console.error('批量获取词条失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, [terms.join(',')]);

  return { data, loading };
}
