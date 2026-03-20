import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// POST /api/books/import - 导入周易正义数据
export async function POST(request: NextRequest) {
  const client = getSupabaseClient();
  const logs: string[] = [];
  
  try {
    const body = await request.json();
    const { book, chapters, contents } = body.data || body;
    
    if (!book || !chapters) {
      return NextResponse.json({ success: false, error: '无效的导入数据' });
    }
    
    logs.push(`开始导入: ${book.title}`);
    
    // 1. 创建或更新书籍
    let bookId: number;
    const { data: existingBook } = await client
      .from('books')
      .select('id')
      .eq('title', book.title)
      .single();
    
    if (existingBook) {
      bookId = existingBook.id;
      await client
        .from('books')
        .update({
          ...book,
          total_chapters: chapters.length,
        })
        .eq('id', bookId);
      logs.push(`更新书籍: ${bookId}`);
    } else {
      const { data: newBook, error } = await client
        .from('books')
        .insert({
          ...book,
          total_chapters: chapters.length,
        })
        .select()
        .single();
      
      if (error) {
        return NextResponse.json({ success: false, logs, error: error.message });
      }
      bookId = newBook.id;
      logs.push(`创建书籍: ${bookId}`);
    }
    
    // 2. 删除旧章节和内容
    const { data: oldChapters } = await client
      .from('chapters')
      .select('id')
      .eq('book_id', bookId);
    
    if (oldChapters && oldChapters.length > 0) {
      const oldChapterIds = oldChapters.map(c => c.id);
      await client.from('book_contents').delete().in('chapter_id', oldChapterIds);
      await client.from('chapters').delete().eq('book_id', bookId);
      logs.push(`删除旧数据: ${oldChapters.length} 章节`);
    }
    
    // 3. 批量导入章节
    const chapterMap: Record<string, number> = {};
    let chapterSuccess = 0;
    
    for (const ch of chapters) {
      const { data: newChapter, error } = await client
        .from('chapters')
        .insert({
          book_id: bookId,
          title: ch.title,
          slug: ch.slug,
          chapter_order: ch.chapter_order,
          level: ch.level || 1,
          is_leaf: ch.is_leaf !== false,
        })
        .select()
        .single();
      
      if (newChapter && !error) {
        chapterMap[ch.slug] = newChapter.id;
        chapterSuccess++;
      }
    }
    logs.push(`导入章节: ${chapterSuccess}/${chapters.length}`);
    
    // 4. 批量导入内容
    let contentSuccess = 0;
    const allContents: any[] = [];
    
    for (const chContent of contents || []) {
      const chapterId = chapterMap[chContent.chapter_slug];
      if (!chapterId) continue;
      
      for (const item of chContent.items || []) {
        allContents.push({
          chapter_id: chapterId,
          content_type: item.content_type,
          content: item.content,
          note: item.note,
          commentary: item.commentary,
          source: item.source,
          content_order: item.content_order,
        });
      }
    }
    
    // 分批插入（每批 100 条）
    const batchSize = 100;
    for (let i = 0; i < allContents.length; i += batchSize) {
      const batch = allContents.slice(i, i + batchSize);
      const { error } = await client.from('book_contents').insert(batch);
      if (!error) {
        contentSuccess += batch.length;
      }
    }
    logs.push(`导入内容: ${contentSuccess}/${allContents.length}`);
    
    return NextResponse.json({
      success: true,
      logs,
      stats: {
        bookId,
        chapters: chapterSuccess,
        contents: contentSuccess,
      }
    });
    
  } catch (error) {
    logs.push(`异常: ${error}`);
    return NextResponse.json({ success: false, logs, error: String(error) }, { status: 500 });
  }
}
