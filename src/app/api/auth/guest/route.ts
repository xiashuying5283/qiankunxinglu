import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { generateToken, setAuthCookie, generateSessionId } from '@/lib/auth';

/**
 * 游客登录 API
 * POST /api/auth/guest
 * 
 * 游客登录逻辑：
 * 1. 如果已有游客 session_id，则复用该游客账户
 * 2. 否则创建新的游客账户
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId } = body;

    const client = getSupabaseClient();
    let user;

    // 如果提供了 sessionId，尝试查找已有的游客账户
    if (sessionId) {
      const { data: existingGuest } = await client
        .from('users')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_guest', true)
        .single();

      if (existingGuest) {
        user = existingGuest;
      }
    }

    // 如果没有找到已有游客账户，创建新的
    if (!user) {
      const newSessionId = sessionId || generateSessionId();
      
      const { data: newGuest, error } = await client
        .from('users')
        .insert({
          name: `游客_${newSessionId.substring(6, 12)}`,
          is_guest: true,
          session_id: newSessionId,
        })
        .select()
        .single();

      if (error || !newGuest) {
        console.error('Create guest user error:', error);
        return NextResponse.json(
          { error: '游客登录失败，请稍后重试' },
          { status: 500 }
        );
      }

      user = newGuest;
    }

    // 生成 Token
    const token = await generateToken({
      id: user.id,
      name: user.name,
      isGuest: true,
      sessionId: user.session_id,
    });

    // 设置 Cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        isGuest: true,
        sessionId: user.session_id,
      },
    });
  } catch (error) {
    console.error('Guest login error:', error);
    return NextResponse.json(
      { error: '游客登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
