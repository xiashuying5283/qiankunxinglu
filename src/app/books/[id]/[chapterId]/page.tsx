import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  BookOpen, ChevronRight, ChevronLeft, 
  Home
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/auth/UserMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getChapterContent, type ContentItem } from '@/lib/books-service';

// 禁用静态生成，强制动态渲染
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string; chapterId: string }> }): Promise<Metadata> {
  const { id, chapterId } = await params;
  const bookId = parseInt(id);
  const chId = parseInt(chapterId);
  
  if (isNaN(bookId) || isNaN(chId)) {
    return { title: '章节不存在' };
  }
  
  const { book, chapter } = await getChapterContent(bookId, chId);
  
  if (!book || !chapter) {
    return { title: '章节不存在' };
  }
  
  return {
    title: `${chapter.title} - ${book.title} | 古籍阅读`,
    description: `阅读${book.title} - ${chapter.title}`,
  };
}

// 内容类型配置 - 使用主题变量
const CONTENT_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  'original': { label: '经文', className: 'bg-[var(--theme-gold-bg)] text-[var(--theme-gold)]' },
  'note': { label: '注', className: 'bg-blue-500/10 text-blue-500' },
  'commentary': { label: '疏', className: 'bg-purple-500/10 text-purple-500' },
  'translation': { label: '译文', className: 'bg-green-500/10 text-green-600' },
};

// 渲染内容 - 配套展示经文+注+疏
function renderContent(contents: ContentItem[]) {
  return (
    <div className="space-y-8">
      {contents.map((item, idx) => (
        <div key={item.id || idx} className="border-b border-[var(--theme-border)] pb-6 last:border-b-0">
          {/* 经文 */}
          {item.content && (
            <div className="mb-4">
              <Badge className={`${CONTENT_TYPE_CONFIG.original.className} border-0 mb-2`}>
                经文
              </Badge>
              <div className="text-xl leading-loose text-[var(--theme-text)] font-serif">
                {item.content.split('\n').map((line, i) => (
                  <p key={i} className="mb-2">{line}</p>
                ))}
              </div>
            </div>
          )}
          
          {/* 注（配套） */}
          {item.note && (
            <div className="mb-4 pl-4 border-l-2 border-blue-500/30">
              <Badge className={`${CONTENT_TYPE_CONFIG.note.className} border-0 mb-2`}>
                注
              </Badge>
              <div className="text-[var(--theme-text-secondary)] leading-relaxed">
                {item.note.split('\n').map((line, i) => (
                  <p key={i} className="mb-1">{line}</p>
                ))}
              </div>
            </div>
          )}
          
          {/* 疏（配套） */}
          {item.commentary && (
            <div className="pl-4 border-l-2 border-purple-500/30">
              <Badge className={`${CONTENT_TYPE_CONFIG.commentary.className} border-0 mb-2`}>
                疏
              </Badge>
              <div className="text-[var(--theme-text-secondary)] leading-relaxed text-sm">
                {item.commentary.split('\n').map((line, i) => (
                  <p key={i} className="mb-1">{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
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
  
  const { book, chapter, contents, groupedContents, navigation } = await getChapterContent(bookId, chId);
  
  if (!book || !chapter) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] transition-colors">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--theme-gold-border)]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/books/${bookId}`} className="flex items-center gap-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-gold)] transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">返回目录</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/books">
              <Button variant="ghost" size="sm" className="text-[var(--theme-text-muted)] hover:text-[var(--theme-gold)] hover:bg-[var(--theme-gold-bg)]">
                <Home className="w-4 h-4 mr-2" />
                书架
              </Button>
            </Link>
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 面包屑导航 */}
        <div className="flex items-center gap-2 text-sm text-[var(--theme-text-muted)] mb-6">
          <Link href="/books" className="hover:text-[var(--theme-gold)] transition-colors">全部书籍</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/books/${bookId}`} className="hover:text-[var(--theme-gold)] transition-colors">{book.title}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[var(--theme-text)]">{chapter.title}</span>
        </div>

        {/* 章节标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--theme-gold)] mb-2">
            {chapter.title}
          </h1>
          {navigation && (
            <p className="text-[var(--theme-text-muted)] text-sm">
              第 {navigation.current} / {navigation.total} 章
            </p>
          )}
        </div>

        {/* 内容区域 */}
        <Card className="bg-[var(--theme-card)] border-[var(--theme-gold-border)] shadow-sm mb-8">
          <CardContent className="pt-8">
            {contents.length === 0 ? (
              <div className="text-center py-12 text-[var(--theme-text-muted)]">
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
                <Button variant="outline" className="border-[var(--theme-gold-border)] text-[var(--theme-gold)] hover:bg-[var(--theme-gold-bg)] hover:text-[var(--theme-gold)]">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  {navigation.prev.title}
                </Button>
              </Link>
            ) : (
              <div />
            )}
            
            {navigation.next ? (
              <Link href={`/books/${bookId}/${navigation.next.id}`}>
                <Button variant="outline" className="border-[var(--theme-gold-border)] text-[var(--theme-gold)] hover:bg-[var(--theme-gold-bg)] hover:text-[var(--theme-gold)]">
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
        <div className="text-center mt-12 text-[var(--theme-text-muted)] text-sm">
          <p>内容来源于公开领域古籍文献</p>
          <p className="mt-1">仅供学习研究使用</p>
        </div>
      </div>
    </div>
  );
}
