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
      
      // 转换字段名为驼峰格式（只保留驼峰命名字段）
      const hexagram = {
        id: data.id,
        number: data.number,
        name: data.name,
        symbol: data.symbol,
        upperTrigram: data.upper_trigram,
        lowerTrigram: data.lower_trigram,
        binary: data.binary,
        judgement: data.judgement,
        judgementMeaning: data.judgement_meaning,
        image: data.image,
        imageMeaning: data.image_meaning,
        lines: data.lines,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
      
      return NextResponse.json({ hexagram });
    }
    
    // 获取所有卦象
    const { data, error } = await client
      .from('hexagrams')
      .select('number, name, symbol, upper_trigram, lower_trigram')
      .order('number', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // 转换字段名为驼峰格式
    const hexagrams = (data || []).map(item => ({
      number: item.number,
      name: item.name,
      symbol: item.symbol,
      upperTrigram: item.upper_trigram,
      lowerTrigram: item.lower_trigram,
    }));
    
    return NextResponse.json({ hexagrams });
  } catch (error) {
    console.error('获取卦象失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
