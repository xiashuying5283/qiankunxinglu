import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ChevronRight, ChevronLeft, Sparkles, BookMarked, Scroll, Library } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/auth/UserMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getBooks } from '@/lib/books-service';

// 动态渲染，每次请求都查数据库
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '古籍阅读',
  description: '阅读周易、论语、道德经等传统文化经典，传承千年智慧',
};

// 分类图标和颜色
const CATEGORY_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  '经': { icon: BookMarked, color: 'amber', label: '经部' },
  '史': { icon: Scroll, color: 'blue', label: '史部' },
  '子': { icon: Sparkles, color: 'purple', label: '子部' },
  '集': { icon: Library, color: 'emerald', label: '集部' },
};

export default async function BooksPage() {
  const allBooks = await getBooks();
  
  // 按分类分组
  const booksByCategory: Record<string, typeof allBooks> = {};
  allBooks.forEach((book) => {
    const category = book.category || '其他';
    if (!booksByCategory[category]) {
      booksByCategory[category] = [];
    }
    booksByCategory[category].push(book);
  });

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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-10 h-10 text-amber-500 mr-3" />
            <h1 className="text-4xl font-bold text-amber-100">古籍阅读</h1>
          </div>
          <p className="text-gray-400">研习经典，传承智慧</p>
        </div>

        {/* 书籍列表 */}
        <div className="max-w-5xl mx-auto">
          {Object.keys(booksByCategory).length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">暂无书籍</p>
              <p className="text-gray-600 text-sm mt-2">请稍后再来</p>
            </div>
          ) : (
            Object.entries(booksByCategory).map(([category, categoryBooks]) => {
              const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['子'];
              const IconComponent = config.icon;
              
              return (
                <div key={category} className="mb-10">
                  <h2 className="text-xl font-medium text-amber-200 mb-6 flex items-center gap-2">
                    <IconComponent className="w-5 h-5 text-amber-500" />
                    {config.label}
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {categoryBooks.map((book) => (
                      <Link key={book.id} href={`/books/${book.id}`}>
                        <Card className="bg-[#1a1a1a]/50 border-amber-500/20 hover:border-amber-500/40 hover:bg-[#1a1a1a] transition-all cursor-pointer group h-full">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-2xl text-amber-100 group-hover:text-amber-50 transition-colors">
                                  {book.title}
                                </CardTitle>
                                {book.author && (
                                  <p className="text-gray-500 text-sm mt-1">
                                    {book.dynasty ? `〔${book.dynasty}〕` : ''}{book.author}
                                  </p>
                                )}
                              </div>
                              {book.total_chapters && book.total_chapters > 0 && (
                                <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  {book.total_chapters} 章
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            {book.description && (
                              <p className="text-gray-400 leading-relaxed line-clamp-2">{book.description}</p>
                            )}
                            <div className="flex items-center mt-4 text-amber-400 text-sm">
                              开始阅读
                              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 版权说明 */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>内容来源于公开领域古籍文献</p>
          <p className="mt-1">仅供学习研究使用</p>
        </div>
      </div>
    </div>
  );
}
