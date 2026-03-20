import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取卦象详情
 * GET /api/hexagram-details
 * 
 * Query params:
 * - number: 卦序号 (1-64)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const number = searchParams.get('number');
    
    if (!number) {
      return NextResponse.json({ error: '请提供卦序号' }, { status: 400 });
    }
    
    const hexagramNumber = parseInt(number, 10);
    if (isNaN(hexagramNumber) || hexagramNumber < 1 || hexagramNumber > 64) {
      return NextResponse.json({ error: '卦序号无效' }, { status: 400 });
    }
    
    // 获取详情
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('hexagram_details')
      .select('*')
      .eq('hexagram_number', hexagramNumber)
      .single();
    
    if (error || !data) {
      // 如果不存在，返回基础结构
      return NextResponse.json({
        hexagramNumber,
        originalText: null,
        commentary: null,
        philosophy: null,
        history: null,
        application: null,
        lineDetails: null,
        relatedClassic: null,
        practiceCases: null,
        needsContent: true, // 标记需要补充内容
      });
    }
    
    // 转换字段名
    return NextResponse.json({
      id: data.id,
      hexagramNumber: data.hexagram_number,
      originalText: data.original_text,
      commentary: data.commentary,
      philosophy: data.philosophy,
      history: data.history,
      application: data.application,
      lineDetails: data.line_details,
      relatedClassic: data.related_classic,
      practiceCases: data.practice_cases,
    });
  } catch (error) {
    console.error('获取卦象详情失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
