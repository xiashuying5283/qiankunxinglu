import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 更新用户信息
 * PUT /api/user/update
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: '未登录' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { name, avatar } = body;

    // 验证输入
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return NextResponse.json({ 
          success: false, 
          error: '昵称格式错误' 
        }, { status: 400 });
      }
      if (name.length > 50) {
        return NextResponse.json({ 
          success: false, 
          error: '昵称不能超过50个字符' 
        }, { status: 400 });
      }
      if (name.length < 1) {
        return NextResponse.json({ 
          success: false, 
          error: '昵称不能为空' 
        }, { status: 400 });
      }
    }

    if (avatar !== undefined) {
      if (typeof avatar !== 'string') {
        return NextResponse.json({ 
          success: false, 
          error: '头像格式错误' 
        }, { status: 400 });
      }
      // 验证 URL 格式
      if (avatar && !avatar.startsWith('http') && !avatar.startsWith('data:image')) {
        return NextResponse.json({ 
          success: false, 
          error: '头像URL格式错误' 
        }, { status: 400 });
      }
    }

    // 构建更新数据
    const updateData: Record<string, string | undefined> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) {
      updateData.name = name;
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar || null;
    }

    // 更新数据库
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select('id, email, name, avatar, is_guest, session_id, provider')
      .single();

    if (error) {
      console.error('Update user error:', error);
      return NextResponse.json({ 
        success: false, 
        error: '更新失败，请稍后重试' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        avatar: data.avatar,
        isGuest: data.is_guest,
        sessionId: data.session_id,
        provider: data.provider,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ 
      success: false, 
      error: '更新失败，请稍后重试' 
    }, { status: 500 });
  }
}
