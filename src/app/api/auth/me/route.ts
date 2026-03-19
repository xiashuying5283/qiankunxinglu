import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取当前登录用户信息
 * GET /api/auth/me
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ user: null });
    }

    // 从数据库获取完整的用户信息（包括头像和提供商）
    const client = getSupabaseClient();
    const { data: fullUser } = await client
      .from('users')
      .select('id, email, name, avatar, is_guest, session_id, provider')
      .eq('id', user.id)
      .single();

    if (fullUser) {
      return NextResponse.json({
        user: {
          id: fullUser.id,
          email: fullUser.email,
          name: fullUser.name,
          avatar: fullUser.avatar,
          isGuest: fullUser.is_guest,
          sessionId: fullUser.session_id,
          provider: fullUser.provider,
        },
      });
    }

    // 如果数据库查询失败，返回 JWT 中的信息
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isGuest: user.isGuest,
        sessionId: user.sessionId,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json({ user: null });
  }
}
