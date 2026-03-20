import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/books/sync - 同步书籍数据到生产环境
export async function GET() {
  const client = getSupabaseClient();
  const logs: string[] = [];
  
  try {
    // 1. 检查周易正义是否存在
    const { data: book, error: bookError } = await client
      .from('books')
      .select('*')
      .eq('title', '周易正义')
      .single();
    
    if (bookError || !book) {
      logs.push('周易正义不存在，需要创建');
      
      // 创建书籍
      const { data: newBook, error: createError } = await client
        .from('books')
        .insert({
          title: '周易正义',
          title_pinyin: 'zhou yi zheng yi',
          author: '孔颖达',
          dynasty: '唐代',
          category: '经',
          description: '《周易正义》是唐代孔颖达奉诏编纂的《五经正义》之一，综合了魏晋南北朝时期易学研究的成果，是研究周易的重要文献。全书分为上下两经，共六十四卦，每卦包含卦辞、爻辞及注疏。',
          status: 'active',
          sort_order: 1,
        })
        .select()
        .single();
      
      if (createError) {
        logs.push(`创建书籍失败: ${createError.message}`);
        return NextResponse.json({ success: false, logs, error: createError.message });
      }
      
      logs.push(`书籍创建成功，ID: ${newBook?.id}`);
    } else {
      logs.push(`书籍已存在，ID: ${book.id}`);
    }
    
    // 2. 获取书籍ID
    const { data: existingBook } = await client
      .from('books')
      .select('id')
      .eq('title', '周易正义')
      .single();
    
    const bookId = existingBook?.id;
    
    if (!bookId) {
      return NextResponse.json({ success: false, logs, error: '无法获取书籍ID' });
    }
    
    // 3. 检查章节数量
    const { count: chapterCount } = await client
      .from('chapters')
      .select('*', { count: 'exact', head: true })
      .eq('book_id', bookId);
    
    logs.push(`当前章节数: ${chapterCount || 0}`);
    
    // 4. 检查内容数量
    const { data: chapters } = await client
      .from('chapters')
      .select('id')
      .eq('book_id', bookId);
    
    let contentCount = 0;
    if (chapters && chapters.length > 0) {
      const chapterIds = chapters.map(c => c.id);
      const { count } = await client
        .from('book_contents')
        .select('*', { count: 'exact', head: true })
        .in('chapter_id', chapterIds);
      contentCount = count || 0;
    }
    
    logs.push(`当前内容数: ${contentCount}`);
    
    // 5. 更新书籍的章节数
    await client
      .from('books')
      .update({ total_chapters: chapterCount || 0 })
      .eq('id', bookId);
    
    logs.push(`已更新章节数: ${chapterCount || 0}`);
    
    // 6. 如果没有章节数据，提示需要爬取
    if (!chapterCount || chapterCount < 90) {
      logs.push('⚠️ 章节数据不完整，请调用 /api/crawl/zhouyi 进行爬取');
    }
    
    return NextResponse.json({
      success: true,
      logs,
      stats: {
        bookId,
        chapterCount: chapterCount || 0,
        contentCount,
      }
    });
    
  } catch (error) {
    logs.push(`异常: ${error}`);
    return NextResponse.json({ success: false, logs, error: String(error) }, { status: 500 });
  }
}
