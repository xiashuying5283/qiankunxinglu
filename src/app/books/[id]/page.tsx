import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookOpen, ChevronRight, ChevronLeft, List, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getBookWithChapters, type Chapter } from '@/lib/books-service';

// 禁用静态生成，强制动态渲染
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const bookId = parseInt(id);
  
  if (isNaN(bookId)) {
    return { title: '书籍不存在' };
  }
  
  const { book } = await getBookWithChapters(bookId);
  
  if (!book) {
    return { title: '书籍不存在' };
  }
  
  return {
    title: `${book.title} - 古籍阅读`,
    description: book.description || `阅读${book.title}${book.author ? `，作者：${book.author}` : ''}`,
  };
}

// 渲染章节树
function renderChapterTree(
  chapters: Chapter[], 
  bookId: number,
  level: number = 0,
  startIndex: number = 1
): React.ReactNode {
  return chapters.map((chapter, index) => {
    const currentIndex = startIndex + index;
    return (
      <div key={chapter.id} className={`${level > 0 ? 'ml-4' : ''}`}>
        {chapter.is_leaf ? (
          // 叶子节点：可点击阅读
          <Link href={`/books/${bookId}/${chapter.id}`}>
            <div className="flex items-center py-2 px-3 hover:bg-amber-100 rounded-lg transition-colors group cursor-pointer">
              <span className="w-6 h-6 flex items-center justify-center text-xs text-amber-500 bg-amber-100 rounded-full mr-3 font-medium">
                {currentIndex}
              </span>
              <span className="text-amber-800 group-hover:text-amber-600 transition-colors">
                {chapter.title}
              </span>
            </div>
          </Link>
        ) : (
          // 非叶子节点：标题
          <div>
            <div className="flex items-center py-3 px-3">
              <List className="w-4 h-4 text-amber-600 mr-2" />
              <span className="text-amber-700 font-medium">{chapter.title}</span>
              <Badge variant="outline" className="ml-2 text-amber-600 border-amber-300">
                {chapter.children?.length || 0}
              </Badge>
            </div>
            {chapter.children && chapter.children.length > 0 && (
              <div className="border-l border-amber-200 ml-5">
                {renderChapterTree(chapter.children, bookId, level + 1, 1)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  });
}

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bookId = parseInt(id);
  
  if (isNaN(bookId)) {
    notFound();
  }
  
  const { book, chapters, allChapters } = await getBookWithChapters(bookId);
  
  if (!book) {
    notFound();
  }
  
  // 找到第一个可读章节
  const firstChapter = allChapters.find((c: Chapter) => c.is_leaf);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <div className="mb-8">
          <Link href="/books">
            <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-900">
              <ChevronLeft className="w-4 h-4 mr-2" />
              返回书架
            </Button>
          </Link>
        </div>

        {/* 书籍信息 */}
        <Card className="bg-white/80 border-amber-200 mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {book.title}
                </CardTitle>
                {book.author && (
                  <p className="text-amber-700/60 text-sm mt-2">
                    {book.dynasty ? `〔${book.dynasty}〕` : ''}{book.author}
                  </p>
                )}
              </div>
              {book.total_chapters && book.total_chapters > 0 && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  共 {book.total_chapters} 章
                </Badge>
              )}
            </div>
          </CardHeader>
          {book.description && (
            <CardContent>
              <p className="text-amber-900/70 leading-relaxed">{book.description}</p>
              
              {firstChapter && (
                <Link href={`/books/${bookId}/${firstChapter.id}`} className="inline-block mt-6">
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                    <BookOpen className="w-4 h-4 mr-2" />
                    开始阅读
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              )}
            </CardContent>
          )}
        </Card>

        {/* 章节目录 */}
        <Card className="bg-white/80 border-amber-200">
          <CardHeader>
            <CardTitle className="text-xl text-amber-800 flex items-center gap-2">
              <List className="w-5 h-5 text-amber-600" />
              目录
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chapters.length === 0 ? (
              <div className="text-center py-8 text-amber-700/50">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无章节内容</p>
              </div>
            ) : (
              <div className="space-y-1">
                {renderChapterTree(chapters, bookId)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 版权说明 */}
        <div className="text-center mt-12 text-amber-700/50 text-sm">
          <p>内容来源于公开领域古籍文献</p>
          <p className="mt-1">仅供学习研究使用</p>
        </div>
      </div>
    </div>
  );
}
