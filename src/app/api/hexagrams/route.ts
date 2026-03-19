import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { withCache, clearCache } from '@/lib/cache';

// 缓存键
const CACHE_KEY = 'hexagrams_data';
// 缓存时间：10分钟（卦象数据基本不变）
const CACHE_TTL = 10 * 60 * 1000;

// 获取卦象数据的内部函数
async function fetchHexagramsData() {
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
    throw new Error('数据库查询失败');
  }

  if (!hexagrams || hexagrams.length === 0) {
    throw new Error('数据库暂无数据');
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

  return {
    hexagrams: formattedHexagrams,
    trigrams: formattedTrigrams
  };
}

/**
 * 获取所有卦象数据
 * GET /api/hexagrams
 */
export async function GET() {
  try {
    const data = await withCache(CACHE_KEY, fetchHexagramsData, CACHE_TTL);
    return NextResponse.json(data);
  } catch (error) {
    console.error('查询卦象数据失败:', error);
    return NextResponse.json({ 
      error: '数据库暂无数据，请先初始化',
      needsInit: true,
      initEndpoint: '/api/hexagrams/init'
    }, { status: 404 });
  }
}

/**
 * 清除卦象数据缓存（供初始化接口调用）
 */
export function clearHexagramsCache() {
  clearCache(CACHE_KEY);
}
