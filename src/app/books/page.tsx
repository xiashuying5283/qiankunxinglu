import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ChevronRight, Sparkles, BookMarked, Scroll, Library } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: '古籍阅读 - 传统智慧经典',
  description: '阅读周易、论语、道德经等传统文化经典，传承千年智慧',
};

// 分类图标和颜色
const CATEGORY_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  '经': { icon: BookMarked, color: 'from-amber-500 to-orange-500', label: '经部' },
  '史': { icon: Scroll, color: 'from-blue-500 to-cyan-500', label: '史部' },
  '子': { icon: Sparkles, color: 'from-purple-500 to-pink-500', label: '子部' },
  '集': { icon: Library, color: 'from-green-500 to-emerald-500', label: '集部' },
};

interface Book {
  id: number;
  title: string;
  author: string | null;
  dynasty: string | null;
  category: string | null;
  description: string | null;
  total_chapters: number | null;
}

// 服务端获取书籍列表
async function getBooks(): Promise<Book[]> {
  try {
    const baseUrl = process.env.DEPLOY_RUN_PORT 
      ? `http://localhost:${process.env.DEPLOY_RUN_PORT}` 
      : 'http://localhost:5000';
    const res = await fetch(`${baseUrl}/api/books`, { cache: 'no-store' });
    const data = await res.json();
    return data.books || [];
  } catch (error) {
    console.error('获取书籍列表失败:', error);
    return [];
  }
}

export default async function BooksPage() {
  const allBooks = await getBooks();
  
  // 按分类分组
  const booksByCategory: Record<string, Book[]> = {};
  allBooks.forEach((book) => {
    const category = book.category || '其他';
    if (!booksByCategory[category]) {
      booksByCategory[category] = [];
    }
    booksByCategory[category].push(book);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-10 h-10 text-amber-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">古籍阅读</h1>
          </div>
          <p className="text-white/60">研习经典，传承智慧</p>
        </div>

        {/* 书籍列表 */}
        <div className="max-w-5xl mx-auto">
          {Object.keys(booksByCategory).length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/50">暂无书籍</p>
              <p className="text-white/30 text-sm mt-2">请先初始化数据库</p>
              <Link href="/api/books/init" className="inline-block mt-4">
                <button className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                  初始化数据
                </button>
              </Link>
            </div>
          ) : (
            Object.entries(booksByCategory).map(([category, categoryBooks]) => {
              const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['子'];
              const IconComponent = config.icon;
              
              return (
                <div key={category} className="mb-10">
                  <h2 className="text-xl font-medium text-white/80 mb-6 flex items-center gap-2">
                    <IconComponent className="w-5 h-5" style={{ color: config.color.includes('amber') ? '#f59e0b' : config.color.includes('blue') ? '#3b82f6' : config.color.includes('purple') ? '#a855f7' : '#22c55e' }} />
                    {config.label}
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {categoryBooks.map((book) => (
                      <Link key={book.id} href={`/books/${book.id}`}>
                        <Card className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-amber-500/50 transition-all cursor-pointer group h-full">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className={`text-2xl bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
                                  {book.title}
                                </CardTitle>
                                {book.author && (
                                  <p className="text-white/50 text-sm mt-1">
                                    {book.dynasty ? `〔${book.dynasty}〕` : ''}{book.author}
                                  </p>
                                )}
                              </div>
                              {book.total_chapters && book.total_chapters > 0 && (
                                <Badge className={`bg-gradient-to-r ${config.color} text-white`}>
                                  {book.total_chapters} 章
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            {book.description && (
                              <p className="text-white/70 leading-relaxed line-clamp-2">{book.description}</p>
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
        <div className="text-center mt-12 text-white/40 text-sm">
          <p>内容来源于公开领域古籍文献</p>
          <p className="mt-1">仅供学习研究使用</p>
        </div>
      </div>
    </div>
  );
}
