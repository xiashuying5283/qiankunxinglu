import { NextResponse } from 'next/server';
import { getPgClient } from '@/storage/database/pg-client';

/**
 * 获取断卦练习题
 * GET /api/practice
 * 
 * Query params:
 * - category: 分类 (basic, intermediate, advanced)
 * - limit: 数量限制 (默认10)
 * - random: 是否随机获取
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const random = searchParams.get('random') === 'true';
    
    const client = getPgClient();
    
    let query = client
      .from('practice_questions')
      .select('id, title, category, question, context, options, difficulty, tags');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (random) {
      // 随机获取
      const { data: allData, error: countError } = await query;
      
      if (countError) {
        throw countError;
      }
      
      const shuffled = allData?.sort(() => Math.random() - 0.5) || [];
      return NextResponse.json(shuffled.slice(0, limit));
    }
    
    query = query.limit(limit);
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('获取练习题失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
