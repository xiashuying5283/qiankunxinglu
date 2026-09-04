import { NextRequest, NextResponse } from 'next/server';
import { getPgClient } from '@/storage/database/pg-client';
import { verifyAuth } from '@/lib/api-auth';

// GET /api/books - 获取书籍列表
// 需要 API Key 鉴权
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  // API Key 鉴权
  const authResult = await verifyAuth(request);
  
  if (!authResult.success) {
    return NextResponse.json(
      { 
        error: authResult.error,
        code: 'UNAUTHORIZED'
      },
      { status: authResult.statusCode || 401 }
    );
  }
  
  try {
    const client = getPgClient();
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
