import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/books/diagnose - 诊断数据库表状态
export async function GET() {
  const client = getSupabaseClient();
  const results: Record<string, unknown> = {};
  
  try {
    // 检查 books 表
    const { data: books, error: booksErr } = await client
      .from('books')
      .select('id, title')
      .limit(5);
    
    results.books = {
      count: books?.length || 0,
      data: books,
      error: booksErr?.message,
    };
    
    // 检查 chapters 表
    const { data: chapters, error: chaptersErr } = await client
      .from('chapters')
      .select('id, title')
      .limit(5);
    
    results.chapters = {
      count: chapters?.length || 0,
      data: chapters,
      error: chaptersErr?.message,
    };
    
    // 检查 book_contents 表
    const { data: contents, error: contentsErr } = await client
      .from('book_contents')
      .select('id, content_type')
      .limit(5);
    
    results.book_contents = {
      count: contents?.length || 0,
      data: contents,
      error: contentsErr?.message,
    };
    
    // 获取环境信息
    results.environment = {
      nodeEnv: process.env.NODE_ENV,
      cozeEnv: process.env.COZE_PROJECT_ENV,
      hasSupabaseUrl: !!process.env.COZE_SUPABASE_URL,
      supabaseUrlPrefix: process.env.COZE_SUPABASE_URL?.substring(0, 30) + '...',
    };
    
    return NextResponse.json({ success: true, results });
  } catch (e) {
    return NextResponse.json({ 
      success: false, 
      error: String(e),
      results 
    }, { status: 500 });
  }
}
