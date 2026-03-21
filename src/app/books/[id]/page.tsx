import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookOpen, ChevronRight, ChevronLeft, List, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/auth/UserMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
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
            <div className="flex items-center py-2 px-3 hover:bg-[var(--theme-gold-bg)] rounded-lg transition-colors group cursor-pointer">
              <span className="w-6 h-6 flex items-center justify-center text-xs text-[var(--theme-gold)] bg-[var(--theme-gold-bg)] rounded-full mr-3 font-medium">
                {currentIndex}
              </span>
              <span className="text-[var(--theme-text)] group-hover:text-[var(--theme-gold)] transition-colors">
                {chapter.title}
              </span>
            </div>
          </Link>
        ) : (
          // 非叶子节点：标题
          <div>
            <div className="flex items-center py-3 px-3">
              <List className="w-4 h-4 text-[var(--theme-gold)] mr-2" />
              <span className="text-[var(--theme-text)] font-medium">{chapter.title}</span>
              <Badge variant="outline" className="ml-2 text-[var(--theme-gold)] border-[var(--theme-gold-border)]">
                {chapter.children?.length || 0}
              </Badge>
            </div>
            {chapter.children && chapter.children.length > 0 && (
              <div className="border-l border-[var(--theme-gold-border)] ml-5">
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
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] transition-colors">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--theme-gold-border)]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/books" className="flex items-center gap-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-gold)] transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">返回书架</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 书籍信息 */}
        <Card className="bg-[var(--theme-card)] border-[var(--theme-gold-border)] mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl text-[var(--theme-gold)]">
                  {book.title}
                </CardTitle>
                {book.author && (
                  <p className="text-[var(--theme-text-muted)] text-sm mt-2">
                    {book.dynasty ? `〔${book.dynasty}〕` : ''}{book.author}
                  </p>
                )}
              </div>
              {book.total_chapters && book.total_chapters > 0 && (
                <Badge className="bg-[var(--theme-gold-bg)] text-[var(--theme-gold)] border border-[var(--theme-gold-border)]">
                  共 {book.total_chapters} 章
                </Badge>
              )}
            </div>
          </CardHeader>
          {book.description && (
            <CardContent>
              <p className="text-[var(--theme-text-secondary)] leading-relaxed">{book.description}</p>
              
              {firstChapter && (
                <Link href={`/books/${bookId}/${firstChapter.id}`} className="inline-block mt-6">
                  <Button className="bg-[var(--theme-gold-bg)] text-[var(--theme-gold)] border border-[var(--theme-gold-border)] hover:bg-[var(--theme-gold)] hover:text-[var(--theme-bg)]">
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
        <Card className="bg-[var(--theme-card)] border-[var(--theme-gold-border)]">
          <CardHeader>
            <CardTitle className="text-xl text-[var(--theme-gold)] flex items-center gap-2">
              <List className="w-5 h-5 text-[var(--theme-gold)]" />
              目录
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chapters.length === 0 ? (
              <div className="text-center py-8 text-[var(--theme-text-muted)]">
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
        <div className="text-center mt-12 text-[var(--theme-text-muted)] text-sm">
          <p>内容来源于公开领域古籍文献</p>
          <p className="mt-1">仅供学习研究使用</p>
        </div>
      </div>
    </div>
  );
}
