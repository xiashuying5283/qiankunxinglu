import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { withCache } from '@/lib/cache';

const CACHE_KEY = 'glossary_data';
const CACHE_TTL = 30 * 60 * 1000; // 30分钟缓存

// 获取科普词条数据
async function fetchGlossaryData() {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from('glossary')
    .select('*')
    .order('term', { ascending: true });
  
  if (error) {
    throw error;
  }
  
  // 转换字段名
  return (data || []).map(item => ({
    id: item.id,
    term: item.term,
    category: item.category,
    shortDesc: item.short_desc,
    fullDesc: item.full_desc,
    origin: item.origin,
    examples: item.examples,
    relatedTerms: item.related_terms,
  }));
}

/**
 * 获取科普词条列表
 * GET /api/glossary
 * 
 * Query params:
 * - category: 分类筛选 (iching, bazi, general)
 * - term: 搜索单个词条
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const term = searchParams.get('term');
    
    // 如果搜索单个词条，直接查询
    if (term) {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('glossary')
        .select('*')
        .eq('term', term)
        .single();
      
      if (error || !data) {
        return NextResponse.json({ error: '词条不存在' }, { status: 404 });
      }
      
      // 转换字段名
      return NextResponse.json({
        id: data.id,
        term: data.term,
        category: data.category,
        shortDesc: data.short_desc,
        fullDesc: data.full_desc,
        origin: data.origin,
        examples: data.examples,
        relatedTerms: data.related_terms,
      });
    }
    
    // 获取全部数据（带缓存）
    const allData = await withCache(CACHE_KEY, fetchGlossaryData, CACHE_TTL);
    
    // 按分类筛选
    const data = category 
      ? allData.filter(item => item.category === category)
      : allData;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('获取科普词条失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
