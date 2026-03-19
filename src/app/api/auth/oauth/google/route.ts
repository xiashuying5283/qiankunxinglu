import { NextResponse } from 'next/server';
import { generateAuthorizationUrl, generateOAuthState, isOAuthConfigured } from '@/lib/oauth';

/**
 * 发起 Google OAuth 登录
 * GET /api/auth/oauth/google
 */
export async function GET() {
  try {
    // 检查 Google OAuth 是否已配置
    if (!isOAuthConfigured('google')) {
      return NextResponse.json(
        { error: 'Google 登录未配置，请联系管理员' },
        { status: 500 }
      );
    }

    // 生成 state 参数
    const state = generateOAuthState();

    // 生成授权 URL
    const authUrl = generateAuthorizationUrl('google', state);

    // 创建响应并设置 state cookie
    const response = NextResponse.redirect(authUrl);
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10分钟有效
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL('/?error=oauth_failed', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
  }
}
