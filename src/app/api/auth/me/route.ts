import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

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
