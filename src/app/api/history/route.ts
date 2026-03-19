import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取用户所有历史记录
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });
    }

    const client = getSupabaseClient();
    const userId = user.id;

    // 获取解梦记录
    const { data: dreamData, error: dreamError } = await client
      .from('dream_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (dreamError) {
      console.error('获取解梦记录失败:', dreamError);
    }

    // 获取匹配记录
    const { data: matchData, error: matchError } = await client
      .from('match_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (matchError) {
      console.error('获取匹配记录失败:', matchError);
    }

    // 格式化解梦记录
    const formattedDreamRecords = (dreamData || []).map((record: { id: number; dream_content: string; interpretation: string; created_at: string }) => ({
      id: record.id,
      type: 'dream' as const,
      title: record.dream_content.slice(0, 50) + (record.dream_content.length > 50 ? '...' : ''),
      content: record.dream_content,
      interpretation: record.interpretation,
      createdAt: record.created_at,
    }));

    // 格式化匹配记录
    const formattedMatchRecords = (matchData || []).map((record: { id: number; name1: string; name2: string; score: number; level: string; shengxiao_match: { score: number; relation: string; description: string }; bazi_match: { score: number }; ai_interpretation: string | null; created_at: string }) => ({
      id: record.id,
      type: 'match' as const,
      title: `${record.name1} & ${record.name2}`,
      score: record.score,
      level: record.level,
      shengxiaoMatch: record.shengxiao_match,
      baziMatch: record.bazi_match,
      aiInterpretation: record.ai_interpretation,
      createdAt: record.created_at,
    }));

    // 合并并按时间排序
    const allRecords = [...formattedDreamRecords, ...formattedMatchRecords]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      data: allRecords,
    });
  } catch (error) {
    console.error('获取历史记录失败:', error);
    return NextResponse.json({ success: false, error: '获取历史记录失败' }, { status: 500 });
  }
}
