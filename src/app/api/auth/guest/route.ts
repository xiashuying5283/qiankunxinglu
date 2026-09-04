import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/storage/database/pg-client';
import { generateToken, setAuthCookie, generateSessionId } from '@/lib/auth';

type GuestUser = {
  id: string;
  name: string | null;
  is_guest: boolean;
  session_id: string;
};

/**
 * 游客登录 API
 * POST /api/auth/guest
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId } = body;
    let user: GuestUser | null = null;

    // 如果提供了 sessionId，尝试查找已有的游客账户
    if (sessionId) {
      const existingGuest = await query<GuestUser>(
        'SELECT * FROM users WHERE session_id = $1 AND is_guest = true LIMIT 1',
        [sessionId],
      );

      user = existingGuest.rows[0] ?? null;
    }

    // 如果没有找到已有游客账户，创建新的
    if (!user) {
      const newSessionId = sessionId || generateSessionId();
      const newName = `游客_${newSessionId.substring(6, 12)}`;
      const newGuest = await query<GuestUser>(
        `INSERT INTO users (name, is_guest, session_id)
         VALUES ($1, true, $2)
         ON CONFLICT (session_id) DO UPDATE
         SET is_guest = true,
             name = COALESCE(users.name, EXCLUDED.name),
             updated_at = NOW()
         RETURNING *`,
        [newName, newSessionId],
      );

      user = newGuest.rows[0] ?? null;

      if (!user) {
        console.error('Create guest user returned no rows');
        return NextResponse.json(
          { error: '游客登录失败，请稍后重试' },
          { status: 500 }
        );
      }
    }

    // 生成 Token
    const token = await generateToken({
      id: user.id,
      name: user.name ?? undefined,
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
