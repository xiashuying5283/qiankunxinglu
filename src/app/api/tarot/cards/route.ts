import { NextResponse } from 'next/server';
import { allTarotCards } from '@/lib/divination-data';
import { withCache } from '@/lib/cache';

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
 */
export async function GET() {
  try {
    const cards = await withCache(CACHE_KEY, () => Promise.resolve(formatTarotCards()), CACHE_TTL);
    return NextResponse.json({ cards });
  } catch (error) {
    console.error('获取塔罗牌数据失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
