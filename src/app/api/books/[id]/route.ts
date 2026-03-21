import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { decodeId } from '@/lib/id-obfuscation';

// GET /api/books/[id] - 获取书籍详情和章节目录
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // 支持混淆ID和数字ID（兼容）
    const bookId = decodeId(id) || parseInt(id);
    
    if (!bookId || isNaN(bookId)) {
      return NextResponse.json(
        { success: false, error: '无效的书籍ID' },
        { status: 400 }
      );
    }
    
    const client = getSupabaseClient();
    
    // 获取书籍信息
    const { data: book, error: bookError } = await client
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();
    
    if (bookError || !book) {
      return NextResponse.json(
        { success: false, error: '书籍不存在' },
        { status: 404 }
      );
    }
    
    // 获取所有章节
    const { data: allChapters, error: chaptersError } = await client
      .from('chapters')
      .select('*')
      .eq('book_id', bookId)
      .order('level', { ascending: true })
      .order('chapter_order', { ascending: true });
    
    if (chaptersError || !allChapters) {
      return NextResponse.json({
        success: true,
        book,
        chapters: [],
        allChapters: [],
      });
    }
    
    // 构建树形结构
    const chapterMap = new Map();
    const rootChapters: any[] = [];
    
    // 先创建所有节点
    allChapters.forEach((chapter: any) => {
      chapterMap.set(chapter.id, {
        ...chapter,
        children: [],
      });
    });
    
    // 建立父子关系
    allChapters.forEach((chapter: any) => {
      const node = chapterMap.get(chapter.id);
      if (chapter.parent_id === null) {
        rootChapters.push(node);
      } else {
        const parent = chapterMap.get(chapter.parent_id);
        if (parent) {
          parent.children.push(node);
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      book,
      chapters: rootChapters,
      allChapters,
    });
  } catch (error) {
    console.error('获取书籍详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取书籍详情失败' },
      { status: 500 }
    );
  }
}
