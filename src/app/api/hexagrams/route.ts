import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取所有卦象
export async function GET() {
  try {
    const client = getSupabaseClient();

    // 从数据库查询
    const { data: hexagrams, error: hexError } = await client
      .from('hexagrams')
      .select('*')
      .order('number', { ascending: true });

    const { data: trigrams, error: triError } = await client
      .from('trigrams')
      .select('*')
      .order('number', { ascending: true });

    if (hexError || triError) {
      // 如果数据库查询失败，返回提示需要初始化
      return NextResponse.json({ 
        error: '数据库暂无数据，请先初始化',
        needsInit: true,
        initEndpoint: '/api/hexagrams/init'
      }, { status: 404 });
    }

    if (!hexagrams || hexagrams.length === 0) {
      return NextResponse.json({ 
        error: '数据库暂无数据，请先初始化',
        needsInit: true,
        initEndpoint: '/api/hexagrams/init'
      }, { status: 404 });
    }

    // 转换字段名（数据库 snake_case -> 前端 camelCase）
    const formattedHexagrams = hexagrams.map(h => ({
      number: h.number,
      name: h.name,
      symbol: h.symbol,
      upperTrigram: h.upper_trigram,
      lowerTrigram: h.lower_trigram,
      binary: h.binary,
      judgement: h.judgement,
      judgementMeaning: h.judgement_meaning,
      image: h.image,
      imageMeaning: h.image_meaning,
      lines: h.lines,
    }));

    const formattedTrigrams = trigrams?.map(t => ({
      name: t.name,
      symbol: t.symbol,
      nature: t.nature,
      attribute: t.attribute,
    })) || [];

    return NextResponse.json({ 
      hexagrams: formattedHexagrams,
      trigrams: formattedTrigrams 
    });
  } catch (error) {
    console.error('查询卦象数据失败:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
