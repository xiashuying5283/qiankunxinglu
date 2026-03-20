import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/books - 获取书籍列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    
    let query = client
      .from('books')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data: books, error } = await query;
    
    if (error) {
      // 表可能不存在，返回空数组
      return NextResponse.json({
        success: true,
        books: [],
      });
    }
    
    return NextResponse.json({
      success: true,
      books: books || [],
    });
  } catch (error) {
    console.error('获取书籍列表失败:', error);
    return NextResponse.json({
      success: true,
      books: [],
    });
  }
}
