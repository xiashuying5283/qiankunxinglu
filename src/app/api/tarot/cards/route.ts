import { NextResponse } from 'next/server';
import { allTarotCards } from '@/lib/divination-data';
import { withCache } from '@/lib/cache';
import { verifyAuth } from '@/lib/api-auth';

// 缓存键
const CACHE_KEY = 'tarot_cards_data';
// 缓存时间：30分钟（塔罗牌数据不变）
const CACHE_TTL = 30 * 60 * 1000;

// 格式化塔罗牌数据
function formatTarotCards() {
  return allTarotCards.map(card => ({
    id: card.id,
    name: card.name,
    arcana: card.arcana,
    suit: card.suit,
    number: card.number,
    image: card.image,
    upright: card.upright,
    reversed: card.reversed,
    keywords: card.keywords,
    description: card.description,
  }));
}

/**
 * 获取所有塔罗牌数据
 * GET /api/tarot/cards
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
    const cards = await withCache(CACHE_KEY, () => Promise.resolve(formatTarotCards()), CACHE_TTL);
    return NextResponse.json({ cards });
  } catch (error) {
    console.error('获取塔罗牌数据失败:', error);
    await authResult.logUsage?.(500, Date.now() - startTime, error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
