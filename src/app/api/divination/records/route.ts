import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 保存占卜记录
 * POST /api/divination/records
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    
    const { sessionId, type, question, result, aiInterpretation } = body;

    if (!type || !result) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数'
      }, { status: 400 });
    }

    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('divination_records')
      .insert({
        user_id: user?.id || null,
        session_id: sessionId || `session_${Date.now()}`,
        type,
        question: question || null,
        result,
        ai_interpretation: aiInterpretation || null,
      })
      .select()
      .single();

    if (error) {
      console.error('保存占卜记录失败:', error);
      return NextResponse.json({
        success: false,
        error: '保存失败'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('保存占卜记录失败:', error);
    return NextResponse.json({
      success: false,
      error: '保存失败'
    }, { status: 500 });
  }
}

/**
 * 获取占卜记录
 * GET /api/divination/records?type=iching&limit=10
 * GET /api/divination/records?userId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const client = getSupabaseClient();
    
    let query = client
      .from('divination_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('获取占卜记录失败:', error);
      return NextResponse.json({
        success: false,
        error: '获取失败'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('获取占卜记录失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取失败'
    }, { status: 500 });
  }
}

/**
 * 删除占卜记录
 * DELETE /api/divination/records?id=xxx
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: '缺少记录ID'
      }, { status: 400 });
    }

    const client = getSupabaseClient();
    
    // 只能删除自己的记录
    const { error } = await client
      .from('divination_records')
      .delete()
      .eq('id', parseInt(id, 10))
      .eq('user_id', user.id);

    if (error) {
      console.error('删除占卜记录失败:', error);
      return NextResponse.json({
        success: false,
        error: '删除失败'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除占卜记录失败:', error);
    return NextResponse.json({
      success: false,
      error: '删除失败'
    }, { status: 500 });
  }
}
