import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyApiKey } from '@/lib/api-auth';

/**
 * 将数据库 snake_case 字段转换为 camelCase
 */
function toCamelCase(hexagram: Record<string, unknown>) {
  return {
    number: hexagram.number,
    name: hexagram.name,
    symbol: hexagram.symbol,
    upperTrigram: hexagram.upper_trigram,
    lowerTrigram: hexagram.lower_trigram,
    binary: hexagram.binary,
    judgement: hexagram.judgement,
    judgementMeaning: hexagram.judgement_meaning,
    image: hexagram.image,
    imageMeaning: hexagram.image_meaning,
    lines: hexagram.lines,
  };
}

/**
 * 获取卦象数据
 * GET /api/hexagrams
 * 
 * Query params:
 * - number: 卦序号 (1-64)
 * 
 * 需要 API Key 鉴权
 */
export async function GET(request: Request) {
  const startTime = Date.now();
  
  // API Key 鉴权
  const authResult = await verifyApiKey(request);
  
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
      
      return NextResponse.json({ hexagram: toCamelCase(data) });
    }
    
    // 获取所有卦象（包含完整数据）
    const { data, error } = await client
      .from('hexagrams')
      .select('*')
      .order('number', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    const hexagrams = (data || []).map(toCamelCase);
    
    // 返回八卦数据（硬编码，因为数据库中可能没有）
    const trigrams = [
      { name: '乾', symbol: '☰', nature: '天', attribute: '刚健' },
      { name: '坤', symbol: '☷', nature: '地', attribute: '柔顺' },
      { name: '震', symbol: '☳', nature: '雷', attribute: '动' },
      { name: '巽', symbol: '☴', nature: '风', attribute: '入' },
      { name: '坎', symbol: '☵', nature: '水', attribute: '险' },
      { name: '离', symbol: '☲', nature: '火', attribute: '丽' },
      { name: '艮', symbol: '☶', nature: '山', attribute: '止' },
      { name: '兑', symbol: '☱', nature: '泽', attribute: '悦' },
    ];
    
    return NextResponse.json({ hexagrams, trigrams });
  } catch (error) {
    console.error('获取卦象失败:', error);
    await authResult.logUsage(500, Date.now() - startTime, error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
