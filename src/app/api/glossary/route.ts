import { NextResponse } from 'next/server';
import { getPgClient } from '@/storage/database/pg-client';
import { withCache } from '@/lib/cache';
import { verifyAuth } from '@/lib/api-auth';

const CACHE_KEY = 'glossary_data';
const CACHE_TTL = 30 * 60 * 1000; // 30分钟缓存

// 获取科普词条数据
async function fetchGlossaryData(): Promise<any[]> {
  const client = getPgClient();
  
  const { data, error } = await client
    .from('glossary')
    .select('*')
    .order('term', { ascending: true });
  
  if (error) {
    throw error;
  }
  
  console.log(`[Glossary] Fetched ${data?.length || 0} terms from database`);
  
  // 转换字段名
  return (data || []).map((item: any) => ({
    id: item.id,
    term: item.term,
    category: item.category,
    shortDesc: item.short_desc,
    fullDesc: item.full_desc,
    origin: item.origin,
    examples: item.examples,
    relatedTerms: item.related_terms,
    references: item.refs || [],  // 数据库字段名为 refs
  }));
}

/**
 * 获取科普词条列表
 * GET /api/glossary
 * 
 * Query params:
 * - category: 分类筛选 (iching, bazi, qimen, general)
 * - term: 搜索单个词条
 * - nocache: 跳过缓存（可选）
 * 
 * 需要 API Key 鉴权
 */
export async function GET(request: Request) {
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
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const term = searchParams.get('term');
    const nocache = searchParams.get('nocache');
    
    // 如果搜索单个词条，直接查询
    if (term) {
      const client = getPgClient();
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
        references: data.refs || [],  // 数据库字段名为 refs
      });
    }
    
    // 获取全部数据（带缓存，除非指定 nocache）
    const allData = nocache 
      ? await fetchGlossaryData()
      : await withCache(CACHE_KEY, fetchGlossaryData, CACHE_TTL);
    
    // 按分类筛选
    const data = category 
      ? allData.filter((item: any) => item.category === category)
      : allData;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('获取科普词条失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
