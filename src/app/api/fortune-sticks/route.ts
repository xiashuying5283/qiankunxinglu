import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { withCache, clearCache } from '@/lib/cache';

// 缓存键
const CACHE_KEY = 'fortune_sticks_data';
// 缓存时间：10分钟
const CACHE_TTL = 10 * 60 * 1000;

// 获取所有灵签数据（带缓存）
async function getAllSticks() {
  return withCache(CACHE_KEY, async () => {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('fortune_sticks')
      .select('*')
      .order('number');
    
    if (error) throw error;
    return data || [];
  }, CACHE_TTL);
}

/**
 * 获取观音灵签
 * GET /api/fortune-sticks - 获取所有灵签
 * GET /api/fortune-sticks?number=X - 获取指定签
 * GET /api/fortune-sticks?random=true - 随机抽取一签
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const numberParam = searchParams.get('number');
    const randomParam = searchParams.get('random');

    // 获取指定签号
    if (numberParam) {
      const number = parseInt(numberParam, 10);
      if (isNaN(number) || number < 1 || number > 100) {
        return NextResponse.json(
          { success: false, message: '签号必须在1-100之间' },
          { status: 400 }
        );
      }

      const allSticks = await getAllSticks();
      const stick = allSticks.find(s => s.number === number);

      if (!stick) {
        return NextResponse.json(
          { success: false, message: '未找到该签' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: stick
      });
    }

    // 随机抽取一签
    if (randomParam === 'true') {
      const allSticks = await getAllSticks();
      
      if (allSticks.length === 0) {
        return NextResponse.json(
          { success: false, message: '暂无灵签数据，请先初始化', needsInit: true },
          { status: 404 }
        );
      }

      // 随机选择一个
      const randomIndex = Math.floor(Math.random() * allSticks.length);
      const stick = allSticks[randomIndex];

      return NextResponse.json({
        success: true,
        data: stick
      });
    }

    // 获取所有灵签
    const data = await getAllSticks();

    return NextResponse.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('获取灵签失败:', error);
    return NextResponse.json(
      { success: false, message: '获取失败，请稍后重试', needsInit: true },
      { status: 500 }
    );
  }
}

// 导出清除缓存函数供其他模块使用
export function clearFortuneSticksCache() {
  clearCache(CACHE_KEY);
}
