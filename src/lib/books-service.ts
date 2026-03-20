import { getSupabaseClient } from '@/storage/database/supabase-client';

export interface Book {
  id: number;
  title: string;
  title_pinyin: string | null;
  author: string | null;
  dynasty: string | null;
  category: string | null;
  description: string | null;
  cover_url: string | null;
  total_chapters: number | null;
  status: string | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: number;
  book_id: number;
  parent_id: number | null;
  title: string;
  slug: string | null;
  chapter_order: number;
  level: number;
  is_leaf: boolean;
  word_count: number | null;
  created_at: string;
  updated_at: string;
  children?: Chapter[];
}

export interface ContentItem {
  id: number;
  chapter_id: number;
  content_type: string;
  content: string;
  source: string | null;
  content_order: number | null;
  note: string | null;        // 注（配套）
  commentary: string | null;  // 疏（配套）
  created_at: string;
  updated_at: string;
}

// 获取书籍列表
export async function getBooks(category?: string): Promise<Book[]> {
  try {
    const client = getSupabaseClient();
    
    let query = client
      .from('books')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// 获取书籍详情和章节
export async function getBookWithChapters(bookId: number): Promise<{
  book: Book | null;
  chapters: Chapter[];
  allChapters: Chapter[];
}> {
  try {
    const client = getSupabaseClient();
    
    // 并行查询书籍和章节
    const [bookResult, chaptersResult] = await Promise.all([
      client.from('books').select('*').eq('id', bookId).single(),
      client
        .from('chapters')
        .select('*')
        .eq('book_id', bookId)
        .order('level', { ascending: true })
        .order('chapter_order', { ascending: true }),
    ]);
    
    if (bookResult.error || !bookResult.data) {
      return { book: null, chapters: [], allChapters: [] };
    }
    
    const allChapters = chaptersResult.data || [];
    
    // 构建树形结构
    const chapterMap = new Map<number, Chapter>();
    const rootChapters: Chapter[] = [];
    
    allChapters.forEach((chapter) => {
      chapterMap.set(chapter.id, { ...chapter, children: [] });
    });
    
    allChapters.forEach((chapter) => {
      const node = chapterMap.get(chapter.id)!;
      if (chapter.parent_id === null) {
        rootChapters.push(node);
      } else {
        const parent = chapterMap.get(chapter.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        }
      }
    });
    
    return {
      book: bookResult.data,
      chapters: rootChapters,
      allChapters,
    };
  } catch {
    return { book: null, chapters: [], allChapters: [] };
  }
}

// 获取章节内容
export async function getChapterContent(bookId: number, chapterId: number): Promise<{
  book: Book | null;
  chapter: Chapter | null;
  contents: ContentItem[];
  groupedContents: Record<string, ContentItem[]>;
  navigation: {
    prev: Chapter | null;
    next: Chapter | null;
    current: number;
    total: number;
  } | null;
}> {
  try {
    const client = getSupabaseClient();
    
    // 并行查询所有数据
    const [chapterResult, contentsResult, bookResult, allChaptersResult] = await Promise.all([
      client
        .from('chapters')
        .select('*')
        .eq('id', chapterId)
        .eq('book_id', bookId)
        .single(),
      client
        .from('book_contents')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('content_order', { ascending: true }),
      client.from('books').select('*').eq('id', bookId).single(),
      client
        .from('chapters')
        .select('*')
        .eq('book_id', bookId)
        .order('chapter_order', { ascending: true }),
    ]);
    
    if (chapterResult.error || !chapterResult.data) {
      return {
        book: null,
        chapter: null,
        contents: [],
        groupedContents: { original: [], note: [], commentary: [], translation: [] },
        navigation: null,
      };
    }
    
    const contents = contentsResult.data || [];
    const allChapters = allChaptersResult.data || [];
    const currentIndex = allChapters.findIndex((c) => c.id === chapterId);
    
    // 按内容类型分组
    const groupedContents = {
      original: contents.filter((c) => c.content_type === 'original'),
      note: contents.filter((c) => c.content_type === 'note'),
      commentary: contents.filter((c) => c.content_type === 'commentary'),
      translation: contents.filter((c) => c.content_type === 'translation'),
    };
    
    return {
      book: bookResult.data || null,
      chapter: chapterResult.data,
      contents,
      groupedContents,
      navigation: {
        prev: currentIndex > 0 ? allChapters[currentIndex - 1] : null,
        next: currentIndex >= 0 && currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null,
        current: currentIndex + 1,
        total: allChapters.length,
      },
    };
  } catch {
    return {
      book: null,
      chapter: null,
      contents: [],
      groupedContents: { original: [], note: [], commentary: [], translation: [] },
      navigation: null,
    };
  }
}
