import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取用户签到记录
 * GET /api/game/sign-in/records?year=2024&month=3
 */
export async function GET(request: NextRequest) {
  const authResult = await verifyAuth(request);
  
  if (!authResult.success || !authResult.userId) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }
  
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
  const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
  
  // 计算月份的开始和结束日期
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  
  const supabase = getSupabaseClient();
  
  // 获取指定月份的签到记录
  const { data, error } = await supabase
    .from('sign_in_records')
    .select('*')
    .eq('user_id', authResult.userId)
    .gte('sign_in_date', startDate)
    .lte('sign_in_date', endDate)
    .order('sign_in_date', { ascending: true });
  
  if (error) {
    console.error('获取签到记录失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
  
  // 转换为日期映射
  const records: Record<string, {
    continuousDays: number;
    guaCoinsEarned: number;
    bonusAwarded: boolean;
  }> = {};
  
  (data || []).forEach((record: any) => {
    records[record.sign_in_date] = {
      continuousDays: record.continuous_days,
      guaCoinsEarned: record.gua_coins_earned,
      bonusAwarded: record.bonus_awarded || false,
    };
  });
  
  // 获取统计信息
  const { data: statsData } = await supabase
    .from('sign_in_records')
    .select('sign_in_date, continuous_days')
    .eq('user_id', authResult.userId)
    .order('sign_in_date', { ascending: false })
    .limit(1);
  
  const latestRecord = statsData?.[0];
  
  // 计算当前连续签到天数
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  let currentStreak = 0;
  if (latestRecord) {
    if (latestRecord.sign_in_date === today || latestRecord.sign_in_date === yesterday) {
      currentStreak = latestRecord.continuous_days;
    }
  }
  
  // 获取总签到天数
  const { data: levelData } = await supabase
    .from('user_levels')
    .select('sign_in_days')
    .eq('user_id', authResult.userId)
    .single();
  
  return NextResponse.json({
    success: true,
    data: {
      records,
      stats: {
        totalDays: levelData?.sign_in_days || 0,
        currentStreak,
        year,
        month,
      },
    },
  });
}
