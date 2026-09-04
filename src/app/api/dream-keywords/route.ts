import { NextRequest, NextResponse } from 'next/server';
import { getPgClient } from '@/storage/database/pg-client';
import { dreamKeywordsData, categories, DreamKeywordData } from '@/lib/dream-keywords-data';
import { withCache, clearCache } from '@/lib/cache';

// 缓存键
const CACHE_KEY = 'dream_keywords_data';
// 缓存时间：15分钟
const CACHE_TTL = 15 * 60 * 1000;

// 获取所有关键词数据（带缓存）
async function getAllKeywords(): Promise<DreamKeywordData[]> {
  return withCache(CACHE_KEY, async () => {
    const client = getPgClient();
    const { data, error } = await client
      .from('dream_keywords')
      .select('*')
      .order('category')
      .order('keyword');
    
    if (error) throw error;
    return data || [];
  }, CACHE_TTL);
}

/**
 * 初始化梦境关键词数据
 * POST /api/dream-keywords
 */
export async function POST() {
  try {
    const client = getPgClient();

    // 检查是否已有数据
    const { data: existing } = await client
      .from('dream_keywords')
      .select('id')
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: false,
        message: '关键词数据已存在，无需重复初始化'
      }, { status: 400 });
    }

    // 准备插入数据
    const keywordsData = dreamKeywordsData.map(k => ({
      keyword: k.keyword,
      category: k.category,
      meaning: k.meaning,
      advice: k.advice,
    }));

    // 分批插入
    const batchSize = 20;
    let insertedCount = 0;
    for (let i = 0; i < keywordsData.length; i += batchSize) {
      const batch = keywordsData.slice(i, i + batchSize);
      const { error } = await client.from('dream_keywords').insert(batch);
      if (error) {
        console.error(`插入关键词数据失败 (batch ${i}):`, error);
        return NextResponse.json({
          success: false,
          message: '插入失败',
          error: error.message
        }, { status: 500 });
      }
      insertedCount += batch.length;
    }

    // 清除缓存
    clearCache(CACHE_KEY);

    return NextResponse.json({
      success: true,
      message: '关键词数据初始化成功',
      count: insertedCount
    });
  } catch (error) {
    console.error('初始化关键词数据失败:', error);
    return NextResponse.json({
      success: false,
      message: '初始化失败',
      error: String(error)
    }, { status: 500 });
  }
}

/**
 * 获取关键词数据
 * GET /api/dream-keywords - 获取所有关键词
 * GET /api/dream-keywords?search=关键词 - 搜索关键词
 * GET /api/dream-keywords?category=分类 - 按分类获取
 * GET /api/dream-keywords?init=1 - 检查初始化状态
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('search');
    const categoryQuery = searchParams.get('category');
    const initCheck = searchParams.get('init');

    const client = getPgClient();

    // 检查初始化状态
    if (initCheck === '1') {
      const { data, error } = await client
        .from('dream_keywords')
        .select('id')
        .limit(1);

      if (error) {
        return NextResponse.json({
          success: false,
          initialized: false,
          count: 0
        });
      }

      const { count } = await client
        .from('dream_keywords')
        .select('*', { count: 'exact', head: true });

      return NextResponse.json({
        success: true,
        initialized: (data?.length || 0) > 0,
        count: count || 0
      });
    }

    // 按分类获取
    if (categoryQuery) {
      const allKeywords = await getAllKeywords();
      const filtered = allKeywords.filter((k: DreamKeywordData) => k.category === categoryQuery);

      return NextResponse.json({
        success: true,
        category: categoryQuery,
        data: filtered
      });
    }

    // 搜索关键词
    if (searchQuery) {
      const allKeywords = await getAllKeywords();
      const filtered = allKeywords.filter((k: DreamKeywordData) => 
        k.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.meaning.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 20);

      return NextResponse.json({
        success: true,
        query: searchQuery,
        data: filtered
      });
    }

    // 获取所有关键词
    const data = await getAllKeywords();

    // 按分类整理
    const groupedData: Record<string, DreamKeywordData[]> = {};
    categories.forEach(cat => {
      groupedData[cat] = [];
    });
    
    data.forEach((item: DreamKeywordData) => {
      if (groupedData[item.category]) {
        groupedData[item.category].push({
          keyword: item.keyword,
          category: item.category,
          meaning: item.meaning,
          advice: item.advice
        });
      }
    });

    return NextResponse.json({
      success: true,
      count: data.length,
      categories,
      data: groupedData
    });
  } catch (error) {
    console.error('获取关键词数据失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取失败',
      needsInit: true,
      error: String(error)
    }, { status: 500 });
  }
}
