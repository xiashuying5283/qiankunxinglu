import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAccessToken, getOAuthUserInfo } from '@/lib/oauth';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { generateToken, setAuthCookie } from '@/lib/auth';

/**
 * GitHub OAuth 回调
 * GET /api/auth/oauth/github/callback?code=xxx&state=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('[GitHub OAuth] Callback received:', { code: !!code, state, error });

    // 用户取消授权
    if (error === 'access_denied') {
      console.log('[GitHub OAuth] User denied access');
      return NextResponse.redirect(new URL('/?error=access_denied', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
    }

    // 验证参数
    if (!code || !state) {
      console.log('[GitHub OAuth] Missing code or state');
      return NextResponse.redirect(new URL('/?error=invalid_request', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
    }

    // 验证 state
    const cookieStore = await cookies();
    const savedState = cookieStore.get('oauth_state')?.value;

    console.log('[GitHub OAuth] State validation:', { savedState, receivedState: state });

    if (!savedState || savedState !== state) {
      console.log('[GitHub OAuth] State mismatch');
      return NextResponse.redirect(new URL('/?error=invalid_state', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
    }

    // 清除 state cookie
    cookieStore.delete('oauth_state');

    // 获取访问令牌
    console.log('[GitHub OAuth] Getting access token...');
    const accessToken = await getAccessToken('github', code);
    if (!accessToken) {
      console.log('[GitHub OAuth] Failed to get access token');
      return NextResponse.redirect(new URL('/?error=token_failed', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
    }
    console.log('[GitHub OAuth] Access token obtained');

    // 获取用户信息
    console.log('[GitHub OAuth] Getting user info...');
    const userInfo = await getOAuthUserInfo('github', accessToken);
    console.log('[GitHub OAuth] User info:', userInfo ? { id: userInfo.id, email: userInfo.email, name: userInfo.name } : null);
    
    if (!userInfo || !userInfo.id) {
      console.log('[GitHub OAuth] Failed to get user info');
      return NextResponse.redirect(new URL('/?error=user_info_failed', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
    }

    const client = getSupabaseClient();

    // 查找或创建用户
    let user;

    // 先通过 provider + provider_id 查找
    console.log('[GitHub OAuth] Looking for existing user by provider_id...');
    const { data: existingOAuthUser, error: oauthQueryError } = await client
      .from('users')
      .select('*')
      .eq('provider', 'github')
      .eq('provider_id', userInfo.id)
      .single();

    console.log('[GitHub OAuth] OAuth user query result:', { found: !!existingOAuthUser, error: oauthQueryError?.message });

    if (existingOAuthUser) {
      console.log('[GitHub OAuth] Found existing OAuth user:', existingOAuthUser.id);
      user = existingOAuthUser;
    } else if (userInfo.email) {
      // 如果有邮箱，尝试通过邮箱查找已有账户并绑定
      console.log('[GitHub OAuth] Looking for user by email:', userInfo.email);
      const { data: existingEmailUser, error: emailQueryError } = await client
        .from('users')
        .select('*')
        .eq('email', userInfo.email)
        .single();

      console.log('[GitHub OAuth] Email user query result:', { found: !!existingEmailUser, error: emailQueryError?.message });

      if (existingEmailUser) {
        // 绑定 GitHub 账号到已有账户
        console.log('[GitHub OAuth] Binding GitHub account to existing user...');
        const { data: updatedUser, error: updateError } = await client
          .from('users')
          .update({
            provider: 'github',
            provider_id: userInfo.id,
            avatar: userInfo.avatar || existingEmailUser.avatar,
          })
          .eq('id', existingEmailUser.id)
          .select()
          .single();

        if (!updateError && updatedUser) {
          console.log('[GitHub OAuth] Successfully bound GitHub account');
          user = updatedUser;
        } else {
          console.log('[GitHub OAuth] Failed to bind, using existing user');
          user = existingEmailUser;
        }
      }
    }

    // 如果用户不存在，创建新用户
    if (!user) {
      console.log('[GitHub OAuth] Creating new user...');
      const { data: newUser, error: createError } = await client
        .from('users')
        .insert({
          email: userInfo.email,
          name: userInfo.name || `GitHub用户_${userInfo.id.substring(0, 6)}`,
          avatar: userInfo.avatar,
          provider: 'github',
          provider_id: userInfo.id,
          is_guest: false,
        })
        .select()
        .single();

      if (createError || !newUser) {
        console.error('[GitHub OAuth] Create user error:', createError);
        return NextResponse.redirect(new URL('/?error=create_user_failed', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
      }

      console.log('[GitHub OAuth] New user created:', newUser.id);
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

    console.log('[GitHub OAuth] Login successful, redirecting...');

    // 重定向到首页并显示成功
    return NextResponse.redirect(new URL('/?login=success', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
  } catch (error) {
    console.error('[GitHub OAuth] Callback error:', error);
    return NextResponse.redirect(new URL('/?error=oauth_failed', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
  }
}
