import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取匹配记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: '缺少会话ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('match_records')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Query error:', error);
      return NextResponse.json(
        { error: '查询记录失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Get records error:', error);
    return NextResponse.json(
      { error: '获取记录失败' },
      { status: 500 }
    );
  }
}

// 保存匹配记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      name1, birth1, hour1, bazi1,
      name2, birth2, hour2, bazi2,
      score, level,
      shengxiaoMatch,
      baziMatch,
      aiInterpretation,
      advice
    } = body;

    if (!sessionId || !name1 || !name2 || score === undefined) {
      return NextResponse.json(
        { error: '参数不完整' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('match_records')
      .insert({
        session_id: sessionId,
        name1,
        birth1,
        hour1,
        bazi1: {
          year: bazi1.year,
          month: bazi1.month,
          day: bazi1.day,
          hour: bazi1.hour,
          shengxiao: bazi1.shengxiao,
          wuxing: bazi1.wuxing
        },
        name2,
        birth2,
        hour2,
        bazi2: {
          year: bazi2.year,
          month: bazi2.month,
          day: bazi2.day,
          hour: bazi2.hour,
          shengxiao: bazi2.shengxiao,
          wuxing: bazi2.wuxing
        },
        score,
        level,
        shengxiao_match: shengxiaoMatch,
        bazi_match: baziMatch,
        ai_interpretation: aiInterpretation,
        advice
      })
      .select();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json(
        { error: '保存记录失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data?.[0]
    });
  } catch (error) {
    console.error('Save record error:', error);
    return NextResponse.json(
      { error: '保存记录失败' },
      { status: 500 }
    );
  }
}

// 删除匹配记录
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const sessionId = searchParams.get('sessionId');

    if (!id || !sessionId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();
    const { error } = await client
      .from('match_records')
      .delete()
      .eq('id', parseInt(id))
      .eq('session_id', sessionId);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { error: '删除记录失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('Delete record error:', error);
    return NextResponse.json(
      { error: '删除记录失败' },
      { status: 500 }
    );
  }
}
