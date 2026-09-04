import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPgClient } from '@/storage/database/pg-client';

// 获取用户所有历史记录
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });
    }

    const client = getPgClient();
    const userId = user.id;

    // 获取占卜记录（周易、塔罗、观音灵签、测字、梅花易数）
    const { data: divinationData, error: divinationError } = await client
      .from('divination_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (divinationError) {
      console.error('获取占卜记录失败:', divinationError);
    }

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

    // 格式化占卜记录
    const formattedDivinationRecords = (divinationData || []).map((record: { id: number; type: string; question: string | null; result: Record<string, unknown>; ai_interpretation: string | null; created_at: string }) => {
      const typeInfo = getDivinationTypeInfo(record.type);
      return {
        id: record.id,
        type: record.type as 'iching' | 'tarot' | 'fortune_stick' | 'char' | 'plum_blossom',
        category: 'divination' as const,
        title: getDivinationTitle(record.type, record.result, record.question),
        question: record.question,
        result: record.result,
        aiInterpretation: record.ai_interpretation,
        createdAt: record.created_at,
      };
    });

    // 格式化解梦记录
    const formattedDreamRecords = (dreamData || []).map((record: { id: number; dream_content: string; interpretation: string; created_at: string }) => ({
      id: record.id,
      type: 'dream' as const,
      category: 'dream' as const,
      title: record.dream_content.slice(0, 50) + (record.dream_content.length > 50 ? '...' : ''),
      content: record.dream_content,
      interpretation: record.interpretation,
      createdAt: record.created_at,
    }));

    // 格式化匹配记录
    const formattedMatchRecords = (matchData || []).map((record: { id: number; name1: string; name2: string; score: number; level: string; shengxiao_match: { score: number; relation: string; description: string }; bazi_match: { score: number }; ai_interpretation: string | null; created_at: string }) => ({
      id: record.id,
      type: 'match' as const,
      category: 'match' as const,
      title: `${record.name1} & ${record.name2}`,
      score: record.score,
      level: record.level,
      shengxiaoMatch: record.shengxiao_match,
      baziMatch: record.bazi_match,
      aiInterpretation: record.ai_interpretation,
      createdAt: record.created_at,
    }));

    // 合并并按时间排序
    const allRecords = [...formattedDivinationRecords, ...formattedDreamRecords, ...formattedMatchRecords]
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

// 获取占卜类型的标题
function getDivinationTitle(type: string, result: Record<string, unknown>, question: string | null): string {
  switch (type) {
    case 'iching':
      return `周易占卜 - ${result.originalHexagramName || '卦象'}`;
    case 'tarot':
      return `塔罗占卜 - ${result.spreadType || '牌阵'}`;
    case 'fortune_stick':
      return `观音灵签 - 第${result.number || '?'}签`;
    case 'char':
      return `测字算卦 - "${result.char || '?'}"`;
    case 'plum_blossom':
      return `梅花易数 - ${result.hexagramName || '卦象'}`;
    default:
      return question || '占卜记录';
  }
}

// 获取占卜类型信息
function getDivinationTypeInfo(type: string): { icon: string; label: string; color: string } {
  switch (type) {
    case 'iching':
      return { icon: '📖', label: '周易占卜', color: 'text-amber-400' };
    case 'tarot':
      return { icon: '🌙', label: '塔罗占卜', color: 'text-purple-400' };
    case 'fortune_stick':
      return { icon: '📜', label: '观音灵签', color: 'text-yellow-400' };
    case 'char':
      return { icon: '✏️', label: '测字算卦', color: 'text-cyan-400' };
    case 'plum_blossom':
      return { icon: '🌸', label: '梅花易数', color: 'text-pink-400' };
    default:
      return { icon: '🔮', label: '占卜', color: 'text-indigo-400' };
  }
}
