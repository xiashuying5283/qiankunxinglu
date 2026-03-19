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

    // 用户取消授权
    if (error === 'access_denied') {
      return NextResponse.redirect(new URL('/?error=access_denied', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
    }

    // 验证参数
    if (!code || !state) {
      return NextResponse.redirect(new URL('/?error=invalid_request', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
    }

    // 验证 state
    const cookieStore = await cookies();
    const savedState = cookieStore.get('oauth_state')?.value;

    if (!savedState || savedState !== state) {
      return NextResponse.redirect(new URL('/?error=invalid_state', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
    }

    // 清除 state cookie
    cookieStore.delete('oauth_state');

    // 获取访问令牌
    const accessToken = await getAccessToken('github', code);
    if (!accessToken) {
      return NextResponse.redirect(new URL('/?error=token_failed', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
    }

    // 获取用户信息
    const userInfo = await getOAuthUserInfo('github', accessToken);
    if (!userInfo || !userInfo.id) {
      return NextResponse.redirect(new URL('/?error=user_info_failed', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
    }

    const client = getSupabaseClient();

    // 查找或创建用户
    let user;

    // 先通过 provider + provider_id 查找
    const { data: existingOAuthUser } = await client
      .from('users')
      .select('*')
      .eq('provider', 'github')
      .eq('provider_id', userInfo.id)
      .single();

    if (existingOAuthUser) {
      user = existingOAuthUser;
    } else if (userInfo.email) {
      // 如果有邮箱，尝试通过邮箱查找已有账户并绑定
      const { data: existingEmailUser } = await client
        .from('users')
        .select('*')
        .eq('email', userInfo.email)
        .single();

      if (existingEmailUser) {
        // 绑定 GitHub 账号到已有账户
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
          user = updatedUser;
        } else {
          user = existingEmailUser;
        }
      }
    }

    // 如果用户不存在，创建新用户
    if (!user) {
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
        console.error('Create user error:', createError);
        return NextResponse.redirect(new URL('/?error=create_user_failed', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
      }

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
    console.error('GitHub OAuth callback error:', error);
    return NextResponse.redirect(new URL('/?error=oauth_failed', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
  }
}
