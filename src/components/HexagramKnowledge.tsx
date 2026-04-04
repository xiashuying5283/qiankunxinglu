'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  BookOpen, 
  ChevronDown, 
  History, 
  Lightbulb, 
  Target, 
  ExternalLink,
  Loader2,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { GlossaryTerm } from './GlossaryTerm';

interface HexagramKnowledgeProps {
  hexagramNumber: number;
  hexagramName: string;
}

interface HexagramDetail {
  hexagramNumber: number;
  originalText?: string;
  commentary?: string;
  philosophy?: string;
  history?: string;
  application?: string;
  lineDetails?: Array<{
    line: number;
    text: string;
    meaning: string;
    philosophy?: string;
  }>;
  relatedClassic?: Array<{
    name: string;
    quote: string;
  }>;
  practiceCases?: Array<{
    title: string;
    description: string;
  }>;
  needsContent?: boolean;
}

// 卦象详情缓存
const detailCache = new Map<number, HexagramDetail>();

export function HexagramKnowledge({ hexagramNumber, hexagramName }: HexagramKnowledgeProps) {
  const [detail, setDetail] = useState<HexagramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['philosophy']));

  useEffect(() => {
    fetchDetail();
  }, [hexagramNumber]);

  const fetchDetail = async () => {
    // 检查缓存
    if (detailCache.has(hexagramNumber)) {
      setDetail(detailCache.get(hexagramNumber)!);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/hexagram-details?number=${hexagramNumber}`);
      const data = await response.json();
      setDetail(data);
      detailCache.set(hexagramNumber, data);
    } catch (error) {
      console.error('获取卦象详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const getLineName = (line: number): string => {
    const names = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
    return names[line - 1] || `${line}爻`;
  };

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-amber-300/30">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </CardContent>
      </Card>
    );
  }

  // 如果数据库暂无内容，显示基础科普
  if (!detail || detail.needsContent) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-amber-300/30">
        <CardHeader>
          <CardTitle className="text-lg text-amber-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {hexagramName}卦科普
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-100">
          <p className="mb-4">
            第{hexagramNumber}卦，属{' '}
            <GlossaryTerm term="六十四卦">六十四卦</GlossaryTerm>
            {' '}之一。
          </p>
          <p className="text-sm text-amber-200">
            详细科普内容正在完善中，敬请期待...
          </p>
          <div className="mt-4 pt-4 border-t border-amber-300/20">
            <Link href={`/learn/hexagram/${hexagramNumber}`}>
              <Button variant="outline" size="sm" className="border-amber-400/50 text-amber-100 hover:bg-amber-500/20">
                <GraduationCap className="w-4 h-4 mr-2" />
                前往学习中心
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 哲学思想 */}
      {detail.philosophy && (
        <Collapsible 
          open={expandedSections.has('philosophy')}
          onOpenChange={() => toggleSection('philosophy')}
        >
          <Card className="bg-white/10 backdrop-blur-md border-amber-300/30">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors">
                <CardTitle className="text-lg text-amber-100 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    哲学思想
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.has('philosophy') ? 'rotate-180' : ''}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="text-amber-200/90 leading-relaxed whitespace-pre-wrap">
                  {detail.philosophy}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* 历史典故 */}
      {detail.history && (
        <Collapsible
          open={expandedSections.has('history')}
          onOpenChange={() => toggleSection('history')}
        >
          <Card className="bg-white/10 backdrop-blur-md border-amber-300/30">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors">
                <CardTitle className="text-lg text-amber-100 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    历史典故
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.has('history') ? 'rotate-180' : ''}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="text-amber-200/90 leading-relaxed whitespace-pre-wrap">
                  {detail.history}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* 现代应用 */}
      {detail.application && (
        <Collapsible
          open={expandedSections.has('application')}
          onOpenChange={() => toggleSection('application')}
        >
          <Card className="bg-white/10 backdrop-blur-md border-amber-300/30">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors">
                <CardTitle className="text-lg text-amber-100 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    现代应用
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.has('application') ? 'rotate-180' : ''}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="text-amber-200/90 leading-relaxed whitespace-pre-wrap">
                  {detail.application}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* 爻辞详解 */}
      {detail.lineDetails && detail.lineDetails.length > 0 && (
        <Collapsible
          open={expandedSections.has('lines')}
          onOpenChange={() => toggleSection('lines')}
        >
          <Card className="bg-white/10 backdrop-blur-md border-amber-300/30">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors">
                <CardTitle className="text-lg text-amber-100 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    爻辞详解
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.has('lines') ? 'rotate-180' : ''}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-4">
                {detail.lineDetails.map((lineDetail, index) => (
                  <div key={index} className="border-b border-amber-300/20 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="border-amber-400/50 text-amber-200">
                        {getLineName(lineDetail.line)}
                      </Badge>
                      <span className="text-amber-100 font-medium">{lineDetail.text}</span>
                    </div>
                    <p className="text-amber-200/80 text-sm leading-relaxed">
                      {lineDetail.meaning}
                    </p>
                    {lineDetail.philosophy && (
                      <p className="text-amber-200/60 text-sm mt-2 italic">
                        💡 {lineDetail.philosophy}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* 相关经典 */}
      {detail.relatedClassic && detail.relatedClassic.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-amber-300/30">
          <CardHeader>
            <CardTitle className="text-lg text-amber-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              相关经典
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.relatedClassic.map((classic, index) => (
              <div key={index} className="bg-amber-950/40 rounded-lg p-3">
                <div className="text-sm text-amber-400 mb-1">{classic.name}</div>
                <div className="text-amber-200/90 text-sm italic">"{classic.quote}"</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 学习入口 */}
      <Card className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 border-amber-400/30">
        <CardContent className="py-4 flex items-center justify-between">
          <div>
            <div className="text-amber-100 font-medium">想深入了解{hexagramName}卦？</div>
            <div className="text-amber-200 text-sm">前往学习中心获取更多内容</div>
          </div>
          <Link href={`/learn/hexagram/${hexagramNumber}`}>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
              前往学习
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
