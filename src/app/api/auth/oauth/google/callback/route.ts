import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAccessToken, getOAuthUserInfo } from '@/lib/oauth';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { generateToken, setAuthCookie } from '@/lib/auth';

/**
 * Google OAuth 回调
 * GET /api/auth/oauth/google/callback?code=xxx&state=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // 详细日志
    console.log('[Google OAuth] Callback received:', {
      url: request.url,
      code: code ? `${code.substring(0, 10)}...` : null,
      state,
      error,
      allParams: Object.fromEntries(searchParams.entries())
    });

    // 用户取消授权
    if (error === 'access_denied') {
      console.log('[Google OAuth] User denied access');
      return NextResponse.redirect(new URL('/?error=access_denied', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
    }

    // 验证参数
    if (!code || !state) {
      console.log('[Google OAuth] Missing code or state');
      return NextResponse.redirect(new URL('/?error=invalid_request', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
    }

    // 验证 state
    const cookieStore = await cookies();
    const savedState = cookieStore.get('oauth_state')?.value;
    const savedRedirectUri = cookieStore.get('oauth_redirect_uri')?.value;

    console.log('[Google OAuth] State validation:', { savedState, receivedState: state, savedRedirectUri });

    if (!savedState || savedState !== state) {
      console.log('[Google OAuth] State mismatch');
      return NextResponse.redirect(new URL('/?error=invalid_state', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
    }

    // 清除 state cookie
    cookieStore.delete('oauth_state');
    cookieStore.delete('oauth_redirect_uri');

    // 获取访问令牌
    console.log('[Google OAuth] Getting access token...');
    const accessToken = await getAccessToken('google', code, savedRedirectUri);
    if (!accessToken) {
      console.log('[Google OAuth] Failed to get access token');
      return NextResponse.redirect(new URL('/?error=token_failed', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
    }
    console.log('[Google OAuth] Access token obtained');

    // 获取用户信息
    console.log('[Google OAuth] Getting user info...');
    const userInfo = await getOAuthUserInfo('google', accessToken);
    console.log('[Google OAuth] User info:', userInfo ? { id: userInfo.id, email: userInfo.email, name: userInfo.name } : null);
    
    if (!userInfo || !userInfo.id) {
      console.log('[Google OAuth] Failed to get user info');
      return NextResponse.redirect(new URL('/?error=user_info_failed', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
    }

    const client = getSupabaseClient();

    // 查找或创建用户
    let user;

    // 先通过 provider + provider_id 查找
    console.log('[Google OAuth] Looking for existing user by provider_id...');
    const { data: existingOAuthUser, error: oauthQueryError } = await client
      .from('users')
      .select('*')
      .eq('provider', 'google')
      .eq('provider_id', userInfo.id)
      .single();

    console.log('[Google OAuth] OAuth user query result:', { found: !!existingOAuthUser, error: oauthQueryError?.message });

    if (existingOAuthUser) {
      console.log('[Google OAuth] Found existing OAuth user:', existingOAuthUser.id);
      user = existingOAuthUser;
    } else if (userInfo.email) {
      // 如果有邮箱，尝试通过邮箱查找已有账户并绑定
      console.log('[Google OAuth] Looking for user by email:', userInfo.email);
      const { data: existingEmailUser, error: emailQueryError } = await client
        .from('users')
        .select('*')
        .eq('email', userInfo.email)
        .single();

      console.log('[Google OAuth] Email user query result:', { found: !!existingEmailUser, error: emailQueryError?.message });

      if (existingEmailUser) {
        // 绑定 Google 账号到已有账户
        console.log('[Google OAuth] Binding Google account to existing user...');
        const { data: updatedUser, error: updateError } = await client
          .from('users')
          .update({
            provider: 'google',
            provider_id: userInfo.id,
            avatar: userInfo.avatar || existingEmailUser.avatar,
          })
          .eq('id', existingEmailUser.id)
          .select()
          .single();

        if (!updateError && updatedUser) {
          console.log('[Google OAuth] Successfully bound Google account');
          user = updatedUser;
        } else {
          console.log('[Google OAuth] Failed to bind, using existing user');
          user = existingEmailUser;
        }
      }
    }

    // 如果用户不存在，创建新用户
    if (!user) {
      console.log('[Google OAuth] Creating new user...');
      const { data: newUser, error: createError } = await client
        .from('users')
        .insert({
          email: userInfo.email,
          name: userInfo.name || `Google用户_${userInfo.id.substring(0, 6)}`,
          avatar: userInfo.avatar,
          provider: 'google',
          provider_id: userInfo.id,
          is_guest: false,
        })
        .select()
        .single();

      if (createError || !newUser) {
        console.error('[Google OAuth] Create user error:', createError);
        return NextResponse.redirect(new URL('/?error=create_user_failed', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
      }

      console.log('[Google OAuth] New user created:', newUser.id);
      user = newUser;
    }

    // 生成 JWT Token
    const token = await generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      isGuest: false,
    });

    // 设置 Cookie
    await setAuthCookie(token);

    // 重定向到首页并显示成功
    return NextResponse.redirect(new URL('/?login=success', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
  } catch (error) {
    console.error('[Google OAuth] Callback error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000';
    return NextResponse.redirect(new URL(`/?error=oauth_failed&details=${encodeURIComponent(error instanceof Error ? error.message : 'unknown')}`, baseUrl));
  }
}
