import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  BookOpen, ChevronRight, ChevronLeft, 
  List, Home, Hash, Bookmark
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ContentItem {
  id: number;
  chapter_id: number;
  content_type: string;
  content: string;
  source: string | null;
  content_order: number | null;
}

interface Chapter {
  id: number;
  book_id: number;
  parent_id: number | null;
  title: string;
  slug: string | null;
  chapter_order: number;
  level: number;
  is_leaf: boolean;
}

interface Book {
  id: number;
  title: string;
  author: string | null;
}

// 服务端获取数据
async function getChapterData(bookId: number, chapterId: number) {
  try {
    const baseUrl = process.env.DEPLOY_RUN_PORT 
      ? `http://localhost:${process.env.DEPLOY_RUN_PORT}` 
      : 'http://localhost:5000';
    const res = await fetch(`${baseUrl}/api/books/${bookId}/chapters/${chapterId}`, { cache: 'no-store' });
    return await res.json();
  } catch (error) {
    console.error('获取章节内容失败:', error);
    return { book: null, chapter: null, contents: [], navigation: null };
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; chapterId: string }> }): Promise<Metadata> {
  const { id, chapterId } = await params;
  const bookId = parseInt(id);
  const chId = parseInt(chapterId);
  
  if (isNaN(bookId) || isNaN(chId)) {
    return { title: '章节不存在' };
  }
  
  const { book, chapter } = await getChapterData(bookId, chId);
  
  if (!book || !chapter) {
    return { title: '章节不存在' };
  }
  
  return {
    title: `${chapter.title} - ${book.title} | 古籍阅读`,
    description: `阅读${book.title} - ${chapter.title}`,
  };
}

// 内容类型配置
const CONTENT_TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  'original': { label: '原文', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  'note': { label: '注', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  'commentary': { label: '疏', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  'translation': { label: '译文', color: 'text-green-700', bgColor: 'bg-green-100' },
};

// 渲染内容
function renderContent(contents: ContentItem[]) {
  const grouped: Record<string, ContentItem[]> = {
    original: [],
    note: [],
    commentary: [],
    translation: [],
  };
  
  contents.forEach((c) => {
    if (grouped[c.content_type]) {
      grouped[c.content_type].push(c);
    }
  });
  
  return (
    <div className="space-y-6">
      {/* 原文 */}
      {grouped.original.map((item, idx) => (
        <div key={item.id || idx} className="space-y-2">
          <Badge className={`${CONTENT_TYPE_CONFIG.original.bgColor} ${CONTENT_TYPE_CONFIG.original.color} border-0`}>
            {item.source || '原文'}
          </Badge>
          <div className="text-xl leading-loose text-amber-900 font-serif">
            {item.content.split('\n').map((line, i) => (
              <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
        </div>
      ))}
      
      {/* 译文 */}
      {grouped.translation.length > 0 && (
        <div className="border-t border-amber-200 pt-6">
          {grouped.translation.map((item, idx) => (
            <div key={item.id || idx} className="space-y-2">
              <Badge className={`${CONTENT_TYPE_CONFIG.translation.bgColor} ${CONTENT_TYPE_CONFIG.translation.color} border-0`}>
                {item.source || '译文'}
              </Badge>
              <div className="text-lg leading-loose text-amber-800/80">
                {item.content.split('\n').map((line, i) => (
                  <p key={i} className="mb-2">{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 注释 */}
      {grouped.note.length > 0 && (
        <div className="border-t border-amber-200 pt-6">
          <h3 className="text-lg font-medium text-amber-800 mb-4 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-blue-600" />
            注释
          </h3>
          {grouped.note.map((item, idx) => (
            <div key={item.id || idx} className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
              {item.source && (
                <p className="text-sm text-blue-600 mb-2">{item.source}</p>
              )}
              <div className="text-amber-800/80 leading-relaxed">
                {item.content.split('\n').map((line, i) => (
                  <p key={i} className="mb-1">{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 疏解 */}
      {grouped.commentary.length > 0 && (
        <div className="border-t border-amber-200 pt-6">
          <h3 className="text-lg font-medium text-amber-800 mb-4 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-purple-600" />
            疏解
          </h3>
          {grouped.commentary.map((item, idx) => (
            <div key={item.id || idx} className="mb-4 p-4 rounded-lg bg-purple-50 border border-purple-200">
              {item.source && (
                <p className="text-sm text-purple-600 mb-2">{item.source}</p>
              )}
              <div className="text-amber-800/80 leading-relaxed">
                {item.content.split('\n').map((line, i) => (
                  <p key={i} className="mb-1">{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function ChapterReadPage({ params }: { params: Promise<{ id: string; chapterId: string }> }) {
  const { id, chapterId } = await params;
  const bookId = parseInt(id);
  const chId = parseInt(chapterId);
  
  if (isNaN(bookId) || isNaN(chId)) {
    notFound();
  }
  
  const { book, chapter, contents, navigation } = await getChapterData(bookId, chId);
  
  if (!book || !chapter) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Link href="/books">
              <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-900 hover:bg-amber-100">
                <Home className="w-4 h-4" />
              </Button>
            </Link>
            <ChevronRight className="w-4 h-4 text-amber-400" />
            <Link href={`/books/${bookId}`}>
              <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-900 hover:bg-amber-100">
                {book.title}
              </Button>
            </Link>
          </div>
          
          <Link href={`/books/${bookId}`}>
            <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-900 hover:bg-amber-100">
              <List className="w-4 h-4 mr-2" />
              目录
            </Button>
          </Link>
        </div>

        {/* 章节标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
            {chapter.title}
          </h1>
          {navigation && (
            <p className="text-amber-700/60 text-sm">
              第 {navigation.current} / {navigation.total} 章
            </p>
          )}
        </div>

        {/* 内容区域 */}
        <Card className="bg-white/90 border-amber-200 shadow-sm mb-8">
          <CardContent className="pt-8">
            {!contents || contents.length === 0 ? (
              <div className="text-center py-12 text-amber-700/50">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>暂无内容</p>
                <p className="text-sm mt-2">请稍后再来</p>
              </div>
            ) : (
              renderContent(contents)
            )}
          </CardContent>
        </Card>

        {/* 底部导航 */}
        {navigation && (
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {navigation.prev ? (
              <Link href={`/books/${bookId}/${navigation.prev.id}`}>
                <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-900">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  {navigation.prev.title}
                </Button>
              </Link>
            ) : (
              <div />
            )}
            
            {navigation.next ? (
              <Link href={`/books/${bookId}/${navigation.next.id}`}>
                <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-900">
                  {navigation.next.title}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <div />
            )}
          </div>
        )}

        {/* 版权说明 */}
        <div className="text-center mt-12 text-amber-700/50 text-sm">
          <p>内容来源于公开领域古籍文献</p>
          <p className="mt-1">仅供学习研究使用</p>
        </div>
      </div>
    </div>
  );
}
