import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateAuthorizationUrl, generateOAuthState, isOAuthConfigured } from '@/lib/oauth';

/**
 * 发起 GitHub OAuth 登录
 * GET /api/auth/oauth/github
 * 
 * 支持参数:
 * - force: 如果为 true，强制重新选择账号（先登出当前用户）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    // 检查 GitHub OAuth 是否已配置
    if (!isOAuthConfigured('github')) {
      return NextResponse.json(
        { error: 'GitHub 登录未配置，请联系管理员' },
        { status: 500 }
      );
    }

    // 生成 state 参数
    const state = generateOAuthState();

    // 生成授权 URL
    const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000';
    const redirectUri = `${baseUrl}/api/auth/oauth/github/callback`;
    
    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID || '');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'user:email');
    authUrl.searchParams.set('state', state);

    // 创建响应
    const response = NextResponse.redirect(authUrl.toString());
    
    // 如果强制重新登录，先清除当前的登录状态
    if (force) {
      response.cookies.delete('auth_token');
    }
    
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10分钟有效
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return NextResponse.redirect(new URL('/?error=oauth_failed', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
  }
}
