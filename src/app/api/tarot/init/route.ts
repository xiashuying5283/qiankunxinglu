import { NextResponse } from 'next/server';
import { allTarotCards } from '@/lib/divination-data';
import { clearCache } from '@/lib/cache';

// 缓存键（与 cards/route.ts 保持一致）
const CACHE_KEY = 'tarot_cards_data';

/**
 * 初始化塔罗牌数据
 * 由于塔罗牌数据是静态的，直接从代码中读取，无需初始化数据库
 * POST /api/tarot/init
 */
export async function POST() {
  try {
    // 清除缓存
    clearCache(CACHE_KEY);
    
    return NextResponse.json({ 
      success: true,
      message: '塔罗牌数据已就绪',
      cardsCount: allTarotCards.length
    });
  } catch (error) {
    console.error('初始化塔罗牌数据失败:', error);
    return NextResponse.json({ error: '初始化失败' }, { status: 500 });
  }
}
