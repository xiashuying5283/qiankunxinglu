import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

/**
 * 登出 API
 * POST /api/auth/logout
 */
export async function POST() {
  try {
    // 清除认证 Cookie
    await clearAuthCookie();

    return NextResponse.json({
      success: true,
      message: '已成功登出',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: '登出失败，请稍后重试' },
      { status: 500 }
    );
  }
}
