import { NextRequest, NextResponse } from 'next/server';
import { getApiKeyUsageStats, getUserApiKeys } from '@/lib/api-auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取 API Key 使用统计
 * GET /api/api-keys/[id]/stats?days=7
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: keyId } = await params;
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }
    
    // 验证这个 key 属于当前用户
    const userKeys = await getUserApiKeys(userId);
    const keyExists = userKeys.some(k => k.id === keyId);
    
    if (!keyExists) {
      return NextResponse.json({ error: 'API Key 不存在' }, { status: 404 });
    }
    
    // 获取天数参数
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '7', 10);
    
    const stats = await getApiKeyUsageStats(keyId, days);
    
    // 计算总调用次数
    const totalCalls = stats.reduce((sum, s) => sum + s.count, 0);
    
    return NextResponse.json({
      stats,
      total_calls: totalCalls,
      period_days: days
    });
  } catch (error) {
    console.error('Get API key stats error:', error);
    return NextResponse.json({ error: '获取统计失败' }, { status: 500 });
  }
}

/**
 * 从请求中获取用户 ID
 * 复用 api-auth 的鉴权逻辑
 */
async function getUserId(request: NextRequest): Promise<string | null> {
  const { getSessionUserId } = await import('@/lib/api-auth');
  return getSessionUserId(request);
}
