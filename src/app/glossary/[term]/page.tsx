import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { ArrowLeft, BookOpen, ChevronRight, PenLine, ExternalLink } from 'lucide-react';

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
    url?: string;
  }>;
}

const CATEGORY_INFO = {
  iching: {
    name: '周易',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-400',
  },
  bazi: {
    name: '八字',
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-400',
  },
  general: {
    name: '通用',
    color: 'from-gray-400 to-slate-400',
    bgColor: 'bg-gray-500/10',
    textColor: 'text-gray-300',
  },
};

async function getTermData(term: string): Promise<GlossaryData | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('glossary')
    .select('*')
    .eq('term', term)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return {
    id: data.id,
    term: data.term,
    category: data.category,
    shortDesc: data.short_desc,
    fullDesc: data.full_desc,
    origin: data.origin,
    examples: data.examples,
    relatedTerms: data.related_terms,
    references: data.refs,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ term: string }> }): Promise<Metadata> {
  const { term } = await params;
  const decodedTerm = decodeURIComponent(term);
  const data = await getTermData(decodedTerm);
  
  if (!data) {
    return {
      title: '词条未找到 - 术语词典',
    };
  }
  
  return {
    title: `${data.term} - 术语词典`,
    description: data.shortDesc,
  };
}

export default async function TermDetailPage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  const decodedTerm = decodeURIComponent(term);
  const data = await getTermData(decodedTerm);
  
  if (!data) {
    notFound();
  }
  
  const categoryInfo = CATEGORY_INFO[data.category as keyof typeof CATEGORY_INFO] || CATEGORY_INFO.general;
  
  // 获取相关词条的数据
  let relatedTermsData: GlossaryData[] = [];
  if (data.relatedTerms && data.relatedTerms.length > 0) {
    const supabase = getSupabaseClient();
    const { data: related } = await supabase
      .from('glossary')
      .select('id, term, category, short_desc')
      .in('term', data.relatedTerms);
    
    if (related) {
      relatedTermsData = related.map(r => ({
        id: r.id,
        term: r.term,
        category: r.category,
        shortDesc: r.short_desc,
        fullDesc: '',
      }));
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link href="/glossary">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回词典
            </Button>
          </Link>
        </div>
        
        {/* 词条标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-white">{data.term}</h1>
            <Badge className={`bg-gradient-to-r ${categoryInfo.color} text-white text-sm px-3 py-1`}>
              {categoryInfo.name}
            </Badge>
          </div>
          
          {/* 简短解释 - 作为副标题 */}
          <p className="text-xl text-white/80 leading-relaxed">
            {data.shortDesc}
          </p>
        </div>
        
        {/* 主要内容区 */}
        <div className="space-y-8">
          {/* 详细解释 */}
          <Card className="bg-white/5 border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              详解
            </h2>
            <div className="text-white/80 leading-relaxed whitespace-pre-wrap text-base">
              {data.fullDesc}
            </div>
          </Card>
          
          {/* 出处 */}
          {data.origin && (
            <Card className="bg-white/5 border-white/10 p-6">
              <h2 className="text-sm font-medium text-white/60 mb-3">出处</h2>
              <blockquote className="border-l-2 border-purple-500/50 pl-4 italic text-white/70">
                {data.origin}
              </blockquote>
            </Card>
          )}
          
          {/* 示例 */}
          {data.examples && data.examples.length > 0 && (
            <Card className="bg-white/5 border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">示例</h2>
              <ul className="space-y-3">
                {data.examples.map((example, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-purple-400 mt-1">•</span>
                    <span className="text-white/80">{example}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          
          {/* 相关词条 */}
          {data.relatedTerms && data.relatedTerms.length > 0 && (
            <Card className="bg-white/5 border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">相关词条</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {relatedTermsData.length > 0 ? (
                  relatedTermsData.map((related) => {
                    const relCatInfo = CATEGORY_INFO[related.category as keyof typeof CATEGORY_INFO] || CATEGORY_INFO.general;
                    return (
                      <Link
                        key={related.id}
                        href={`/glossary/${encodeURIComponent(related.term)}`}
                        className={`flex items-center justify-between p-3 rounded-lg ${relCatInfo.bgColor} border border-white/10 hover:border-white/30 transition-colors`}
                      >
                        <div>
                          <div className={`font-medium ${relCatInfo.textColor}`}>{related.term}</div>
                          <div className="text-sm text-white/50 line-clamp-1">{related.shortDesc}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/40" />
                      </Link>
                    );
                  })
                ) : (
                  data.relatedTerms.map((related) => (
                    <Link
                      key={related}
                      href={`/glossary/${encodeURIComponent(related)}`}
                      className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition-colors"
                    >
                      <span className="text-white/80">{related}</span>
                      <ChevronRight className="w-4 h-4 text-white/40" />
                    </Link>
                  ))
                )}
              </div>
            </Card>
          )}
          
          {/* 参考文献 */}
          {data.references && data.references.length > 0 && (
            <Card className="bg-white/5 border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                参考文献
              </h2>
              <ol className="list-decimal list-inside space-y-3">
                {data.references.map((ref, index) => (
                  <li key={index} className="text-white/80">
                    <span className="font-medium text-white">{ref.title}</span>
                    {ref.author && <span className="ml-1 text-white/60">— {ref.author}</span>}
                    {ref.publisher && (
                      <span className="text-sm text-white/50 ml-1">
                        ({ref.publisher}{ref.year ? `, ${ref.year}` : ''})
                      </span>
                    )}
                    {ref.url && (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-purple-400 hover:text-purple-300 inline-flex items-center"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </li>
                ))}
              </ol>
            </Card>
          )}
          
          {/* 操作按钮 */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <Link href="/glossary">
              <Button variant="outline" className="border-white/30 text-white/80 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回词典
              </Button>
            </Link>
            
            <Link href={`/glossary/contribute?term=${encodeURIComponent(data.term)}&type=edit`}>
              <Button className="bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30">
                <PenLine className="w-4 h-4 mr-2" />
                完善此词条
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
