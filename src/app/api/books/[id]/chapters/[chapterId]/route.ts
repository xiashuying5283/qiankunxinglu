import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/books/[id]/chapters/[chapterId] - 获取章节内容
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { id, chapterId } = await params;
    const bookId = parseInt(id);
    const chId = parseInt(chapterId);
    
    if (isNaN(bookId) || isNaN(chId)) {
      return NextResponse.json(
        { success: false, error: '无效的ID' },
        { status: 400 }
      );
    }
    
    const client = getSupabaseClient();
    
    // 获取章节信息
    const { data: chapter, error: chapterError } = await client
      .from('chapters')
      .select('*')
      .eq('id', chId)
      .eq('book_id', bookId)
      .single();
    
    if (chapterError || !chapter) {
      return NextResponse.json(
        { success: false, error: '章节不存在' },
        { status: 404 }
      );
    }
    
    // 获取章节内容
    const { data: contents, error: contentsError } = await client
      .from('book_contents')
      .select('*')
      .eq('chapter_id', chId)
      .order('content_order', { ascending: true });
    
    // 获取书籍信息
    const { data: book } = await client
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();
    
    // 获取同一本书的所有章节（用于导航）
    const { data: allChapters } = await client
      .from('chapters')
      .select('*')
      .eq('book_id', bookId)
      .order('chapter_order', { ascending: true });
    
    // 找到当前章节的索引
    const chaptersList = allChapters || [];
    const currentIndex = chaptersList.findIndex((c: any) => c.id === chId);
    const prevChapter = currentIndex > 0 ? chaptersList[currentIndex - 1] : null;
    const nextChapter = currentIndex >= 0 && currentIndex < chaptersList.length - 1 ? chaptersList[currentIndex + 1] : null;
    
    // 按内容类型分组
    const contentsList = contents || [];
    const groupedContents = {
      original: contentsList.filter((c: any) => c.content_type === 'original'),
      note: contentsList.filter((c: any) => c.content_type === 'note'),
      commentary: contentsList.filter((c: any) => c.content_type === 'commentary'),
      translation: contentsList.filter((c: any) => c.content_type === 'translation'),
    };
    
    return NextResponse.json({
      success: true,
      chapter,
      contents: contentsList,
      groupedContents,
      book: book || null,
      navigation: {
        prev: prevChapter,
        next: nextChapter,
        current: currentIndex + 1,
        total: chaptersList.length,
      },
    });
  } catch (error) {
    console.error('获取章节内容失败:', error);
    return NextResponse.json(
      { success: false, error: '获取章节内容失败' },
      { status: 500 }
    );
  }
}
