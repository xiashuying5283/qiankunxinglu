import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取梦境记录
 * GET /api/dream/records?sessionId=xxx - 获取指定会话的记录
 * GET /api/dream/records?limit=10 - 获取最近的记录
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const client = getSupabaseClient();

    if (sessionId) {
      // 获取指定会话的记录
      const { data, error } = await client
        .from('dream_records')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return NextResponse.json({
          success: false,
          message: '查询失败',
          error: error.message
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        sessionId,
        count: data?.length || 0,
        data
      });
    }

    // 获取最近的记录（公开，不区分会话）
    const { data, error } = await client
      .from('dream_records')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({
        success: false,
        message: '查询失败',
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data
    });
  } catch (error) {
    console.error('获取梦境记录失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取失败',
      error: String(error)
    }, { status: 500 });
  }
}

/**
 * 删除梦境记录
 * DELETE /api/dream/records?id=xxx - 删除指定记录
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        message: '缺少记录ID'
      }, { status: 400 });
    }

    const client = getSupabaseClient();
    const { error } = await client
      .from('dream_records')
      .delete()
      .eq('id', parseInt(id, 10));

    if (error) {
      return NextResponse.json({
        success: false,
        message: '删除失败',
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除梦境记录失败:', error);
    return NextResponse.json({
      success: false,
      message: '删除失败',
      error: String(error)
    }, { status: 500 });
  }
}
