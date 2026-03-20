import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/books/export - 导出周易正义数据为 JSON
export async function GET() {
  const client = getSupabaseClient();
  
  try {
    // 1. 获取书籍信息
    const { data: book, error: bookError } = await client
      .from('books')
      .select('*')
      .eq('title', '周易正义')
      .single();
    
    if (bookError || !book) {
      return NextResponse.json({ success: false, error: '书籍不存在' });
    }
    
    // 2. 获取所有章节
    const { data: chapters, error: chaptersError } = await client
      .from('chapters')
      .select('*')
      .eq('book_id', book.id)
      .order('chapter_order', { ascending: true });
    
    if (chaptersError) {
      return NextResponse.json({ success: false, error: '获取章节失败' });
    }
    
    // 3. 获取所有内容（使用 range 分页获取所有数据）
    const chapterIds = (chapters || []).map(c => c.id);
    const allContents: any[] = [];
    const batchSize = 500;
    let offset = 0;
    
    while (true) {
      const { data: batchContents } = await client
        .from('book_contents')
        .select('*')
        .in('chapter_id', chapterIds)
        .order('content_order', { ascending: true })
        .range(offset, offset + batchSize - 1);
      
      if (batchContents && batchContents.length > 0) {
        allContents.push(...batchContents);
        offset += batchSize;
        
        // 如果返回的数据少于批次大小，说明已经获取完毕
        if (batchContents.length < batchSize) {
          break;
        }
      } else {
        break;
      }
    }
    
    // 4. 组装导出数据
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      book: {
        title: book.title,
        title_pinyin: book.title_pinyin,
        author: book.author,
        dynasty: book.dynasty,
        category: book.category,
        description: book.description,
        status: book.status,
        sort_order: book.sort_order,
      },
      chapters: (chapters || []).map(c => ({
        title: c.title,
        slug: c.slug,
        chapter_order: c.chapter_order,
        level: c.level,
        is_leaf: c.is_leaf,
      })),
      contents: (chapters || []).map(chapter => {
        const chapterContents = allContents.filter(c => c.chapter_id === chapter.id);
        return {
          chapter_slug: chapter.slug,
          items: chapterContents.map(c => ({
            content_type: c.content_type,
            content: c.content,
            note: c.note,
            commentary: c.commentary,
            source: c.source,
            content_order: c.content_order,
          })),
        };
      }),
    };
    
    return NextResponse.json({
      success: true,
      data: exportData,
      stats: {
        chapters: chapters?.length || 0,
        contents: allContents.length,
      }
    });
    
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
