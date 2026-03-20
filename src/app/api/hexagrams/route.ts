import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取卦象数据
 * GET /api/hexagrams
 * 
 * Query params:
 * - number: 卦序号 (1-64)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const number = searchParams.get('number');
    
    const client = getSupabaseClient();
    
    if (number) {
      // 获取单个卦象
      const { data, error } = await client
        .from('hexagrams')
        .select('*')
        .eq('number', parseInt(number))
        .single();
      
      if (error || !data) {
        return NextResponse.json({ error: '卦象不存在' }, { status: 404 });
      }
      
      return NextResponse.json({ hexagram: data });
    }
    
    // 获取所有卦象
    const { data, error } = await client
      .from('hexagrams')
      .select('number, name, symbol, upperTrigram, lowerTrigram')
      .order('number', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ hexagrams: data || [] });
  } catch (error) {
    console.error('获取卦象失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
